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

function withJavaScriptExtension(fromFile, specifier) {
  if (loadableExtension.test(specifier)) return specifier;
  const target = path.resolve(path.dirname(fromFile), specifier);
  if (existsSync(`${target}.js`)) return `${specifier}.js`;
  if (existsSync(path.join(target, "index.js"))) {
    return `${specifier.replace(/\/$/, "")}/index.js`;
  }
  return `${specifier}.js`;
}

function rewriteImports(file, source) {
  const rewrite = (specifier) => withJavaScriptExtension(file, specifier);
  return source
    .replace(/\bfrom\s+(["'])(\.{1,2}\/[^"']+)\1/g, (_, quote, specifier) => {
      return `from ${quote}${rewrite(specifier)}${quote}`;
    })
    .replace(/\bimport\s*\(\s*(["'])(\.{1,2}\/[^"']+)\1/g, (_, quote, specifier) => {
      return `import(${quote}${rewrite(specifier)}${quote}`;
    })
    .replace(/\bimport\s+(["'])(\.{1,2}\/[^"']+)\1/g, (_, quote, specifier) => {
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

    tsc.on("exit", (code) => process.exit(code ?? 0));
  } else {
    fixExtensions();
  }
}
