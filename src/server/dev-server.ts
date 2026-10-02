import { spawn } from "node:child_process";
import { existsSync, readFileSync, statSync, watch, writeFileSync } from "node:fs";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { tmpdir } from "node:os";
import * as path from "node:path";
import process from "node:process";

const root = process.cwd();
const port = Number(process.env["PORT"]) || 3001;
const distRoot = path.resolve(root, "dist");

const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".map", "application/json; charset=utf-8"],
]);

const logScript = `
(() => {
  for (const level of ["log", "info", "warn", "error", "debug"]) {
    const original = console[level].bind(console);
    console[level] = (...args) => {
      original(...args);
      const text = args.map((arg) => {
        if (typeof arg === "string") return arg;
        if (arg instanceof Error) return arg.stack || arg.message;
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }).join(" ");
      fetch("/log", {
        method: "POST",
        headers: { "Content-Type": "text/plain; charset=utf-8" },
        body: level + " " + text,
      }).catch(() => {});
    };
  }

  const follow = () => {
    const events = new EventSource("/events");
    events.onmessage = () => location.reload();
    events.onerror = () => {
      events.close();
      setTimeout(follow, 300);
    };
  };
  follow();
})();
`;

function indexHtml() {
  return readFileSync(path.join(root, "src/index.html"), "utf8").replace(
    '<script type="module" src="../dist/main.js"></script>',
    `<script>${logScript}</script>\n    <script type="module" src="/dist/main.js"></script>`,
  );
}

function distFile(pathname: string) {
  const relative = decodeURIComponent(pathname.slice("/dist/".length));
  const filePath = path.resolve(distRoot, relative);
  if (filePath !== distRoot && !filePath.startsWith(distRoot + path.sep)) return null;
  if (!existsSync(filePath) || !statSync(filePath).isFile()) return null;
  return filePath;
}

function send(response: ServerResponse, status: number, body: string | Buffer, type: string) {
  response.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-cache",
  });
  response.end(body);
}

function readBody(request: IncomingMessage) {
  return new Promise<string>((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) request.destroy();
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function printBrowserLog(body: string) {
  const space = body.indexOf(" ");
  const level = space === -1 ? "log" : body.slice(0, space);
  const message = space === -1 ? "" : body.slice(space + 1);
  const label = level === "log" ? "[browser]" : `[browser ${level}]`;
  const write = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
  write(`${label} ${message}`);
}

const clients = new Set<ServerResponse>();
let reloadTimer: ReturnType<typeof setTimeout> | undefined;
let watchingGame = false;

function isGameScript(filename: string) {
  const normalized = filename.split(path.sep).join("/");
  return normalized.endsWith(".js") && !normalized.startsWith("server/") && !normalized.includes("/server/");
}

function scheduleReload() {
  if (reloadTimer !== undefined) clearTimeout(reloadTimer);
  reloadTimer = setTimeout(() => {
    reloadTimer = undefined;
    for (const client of clients) client.write("data: reload\n\n");
  }, 150);
}

function watchGameScripts() {
  if (watchingGame || !existsSync(distRoot)) return;
  watchingGame = true;
  watch(distRoot, { recursive: true }, (_event, filename) => {
    if (!filename || !isGameScript(filename)) return;
    scheduleReload();
  });
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://127.0.0.1:${port}`);

  if (request.method === "GET" && url.pathname === "/events") {
    response.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    response.write("\n");
    clients.add(response);
    request.on("close", () => clients.delete(response));
    return;
  }

  if (request.method === "POST" && url.pathname === "/log") {
    printBrowserLog(await readBody(request));
    response.writeHead(204);
    response.end();
    return;
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    send(response, 405, "Method not allowed", "text/plain; charset=utf-8");
    return;
  }

  if (url.pathname === "/" || url.pathname === "/index.html") {
    send(response, 200, indexHtml(), "text/html; charset=utf-8");
    return;
  }

  if (url.pathname.startsWith("/dist/")) {
    const filePath = distFile(url.pathname);
    if (!filePath) {
      send(response, 404, "Not found", "text/plain; charset=utf-8");
      return;
    }
    const type = contentTypes.get(path.extname(filePath)) ?? "application/octet-stream";
    send(response, 200, readFileSync(filePath), type);
    return;
  }

  send(response, 404, "Not found", "text/plain; charset=utf-8");
});

function openBrowser(url: string) {
  if (process.env["DEV_OPEN"] === "0") return;
  const marker = path.join(tmpdir(), "game-01-dev-browser");
  const parent = String(process.ppid);
  if (existsSync(marker) && readFileSync(marker, "utf8") === parent) return;
  writeFileSync(marker, parent);
  const command = process.platform === "darwin" ? "open" : process.platform === "win32" ? "cmd" : "xdg-open";
  const args = process.platform === "win32" ? ["/c", "start", "", url] : [url];
  spawn(command, args, { stdio: "ignore", detached: true }).unref();
}

async function waitForBuild() {
  const target = path.join(distRoot, "main.js");
  for (let attempt = 0; attempt < 50 && !existsSync(target); attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

let listenAttempts = 0;

server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE" && listenAttempts < 20) {
    listenAttempts += 1;
    setTimeout(() => server.listen(port, "127.0.0.1"), 50);
    return;
  }
  throw error;
});

server.on("listening", async () => {
  const url = `http://127.0.0.1:${port}`;
  console.log(`Jogo em ${url}`);
  await waitForBuild();
  watchGameScripts();
  openBrowser(url);
});

server.listen(port, "127.0.0.1");

function shutdown() {
  for (const client of clients) client.end();
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 500).unref();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
