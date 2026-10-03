import { spawn } from "node:child_process";
import { existsSync, readdirSync, readFileSync, watch, writeFileSync } from "node:fs";
import path from "node:path";

const distDir = path.resolve("dist");

function javascriptFiles(dir) {
  if (!existsSync(dir)) return [];
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...javascriptFiles(fullPath));
    else if (entry.name.endsWith(".js")) files.push(fullPath);
  }
  return files;
}

const loadableExtension = /\.(?:js|mjs|cjs|json|css|wasm)$/;

const aliasPrefixes = [
  ["@core/", "core/"],
  ["@engine/", "engine/"],
  ["@entities/", "entities/"],
  ["@scenes/", "scenes/"],
  ["@ui/", "ui/"],
];

function aliasToRelative(fromFile, specifier) {
  let mapped = null;
  for (const [prefix, folder] of aliasPrefixes) {
    if (specifier.startsWith(prefix)) {
      mapped = folder + specifier.slice(prefix.length);
      break;
    }
  }
  if (mapped === null) return specifier;
  mapped = mapped.replace(/\.tsx?$/, "");
  const absoluteTarget = path.join(distDir, mapped);
  let relative = path.relative(path.dirname(fromFile), absoluteTarget);
  relative = relative.split(path.sep).join("/");
  if (!relative.startsWith(".")) relative = `./${relative}`;
  return relative;
}

function withJavaScriptExtension(fromFile, specifier) {
  if (loadableExtension.test(specifier)) return specifier;
  const relative = aliasToRelative(fromFile, specifier);
  const target = path.resolve(path.dirname(fromFile), relative);
  if (existsSync(`${target}.js`)) return `${relative}.js`;
  if (existsSync(path.join(target, "index.js"))) {
    return `${relative.replace(/\/$/, "")}/index.js`;
  }
  return `${relative}.js`;
}

const localSpecifier = String.raw`((?:\.{1,2}\/|@(?:core|engine|entities|scenes|ui)\/)[^"']+)`;

function rewriteImports(file, source) {
  const rewrite = (specifier) => withJavaScriptExtension(file, specifier);
  return source
    .replace(new RegExp(String.raw`\bfrom\s+(["'])${localSpecifier}\1`, "g"), (_, quote, specifier) => {
      return `from ${quote}${rewrite(specifier)}${quote}`;
    })
    .replace(new RegExp(String.raw`\bimport\s*\(\s*(["'])${localSpecifier}\1`, "g"), (_, quote, specifier) => {
      return `import(${quote}${rewrite(specifier)}${quote}`;
    })
    .replace(new RegExp(String.raw`\bimport\s+(["'])${localSpecifier}\1`, "g"), (_, quote, specifier) => {
      return `import ${quote}${rewrite(specifier)}${quote}`;
    });
}

export function fixExtensions() {
  for (const file of javascriptFiles(distDir)) {
    const source = readFileSync(file, "utf8");
    const rewritten = rewriteImports(file, source);
    if (rewritten !== source) writeFileSync(file, rewritten);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  if (process.argv.includes("--watch")) {
    const tsc = spawn("pnpm", ["exec", "tsc", "--watch", "--preserveWatchOutput", "--pretty", "false"], {
      stdio: ["inherit", "pipe", "inherit"],
    });

    const schedule = () => {
      setTimeout(() => fixExtensions(), 30);
    };

    tsc.stdout.on("data", (chunk) => {
      process.stdout.write(chunk);
      if (chunk.toString().includes("Watching for file changes")) schedule();
    });

    const server = spawn(process.execPath, ["--watch", path.resolve("dist/server/dev-server.js")], {
      stdio: "inherit",
    });

    const stop = () => {
      tsc.kill("SIGTERM");
      server.kill("SIGTERM");
    };

    process.on("SIGINT", () => {
      stop();
      process.exit(0);
    });
    process.on("SIGTERM", () => {
      stop();
      process.exit(0);
    });

    tsc.on("exit", (code) => {
      server.kill("SIGTERM");
      process.exit(code ?? 0);
    });
    server.on("exit", (code) => {
      tsc.kill("SIGTERM");
      process.exit(code ?? 0);
    });
  } else {
    fixExtensions();
  }
}
