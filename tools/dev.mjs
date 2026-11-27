// Local dev server: serves the static site and runs the functions in api/ the way Vercel does.
//   npm run dev            -> http://localhost:4321
// No dependencies. /api/<name> loads api/<name>.js and calls its default export with (req, res).
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const PORT = Number(process.env.PORT || process.argv[2] || 4321);
const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8", ".json": "application/json", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon",
};

// A small slice of Vercel's response helpers.
function vercelRes(res) {
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(data)); return res; };
  res.send = (data) => { res.end(data); return res; };
  return res;
}

async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return undefined;
  try { return JSON.parse(raw); } catch { return raw; }
}

// Local secrets for the api/ functions (e.g. AIRTABLE_PAT=...) go in .env.local, which is gitignored.
// Read on every API call, so adding a key needs no restart. Real env vars win over the file.
// Never put SMTP credentials here: a local server must not be able to send real email.
const fromEnvLocal = new Set();   // keys this file set, so edits to .env.local take effect
async function loadEnvLocal() {
  let text = "";
  try { text = await readFile(join(ROOT, ".env.local"), "utf8"); } catch { return; }
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*(?:export\s+)?([A-Za-z_]\w*)\s*=\s*(.*?)\s*$/);
    if (!m || /^SMTP_/.test(m[1])) continue;
    if (process.env[m[1]] !== undefined && !fromEnvLocal.has(m[1])) continue;
    process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, "$2");
    fromEnvLocal.add(m[1]);
  }
}

async function handleApi(req, res, name) {
  if (!/^[\w-]+$/.test(name) || name.startsWith("_")) return vercelRes(res).status(404).json({ error: "not found" });
  const file = join(ROOT, "api", `${name}.js`);
  try { await stat(file); } catch { return vercelRes(res).status(404).json({ error: "not found" }); }
  const mod = await import(`${pathToFileURL(file).href}?t=${Date.now()}`); // re-import so edits apply without restart
  await loadEnvLocal();
  req.body = await readBody(req);
  await mod.default(req, vercelRes(res));
}

async function serveFile(res, urlPath, search = "") {
  let p = normalize(decodeURIComponent(urlPath)).replace(/^[\\/]+/, "");
  let file = resolve(ROOT, p);
  if (file !== ROOT && !file.startsWith(ROOT + sep)) { res.statusCode = 403; return res.end("forbidden"); }
  try {
    const s = await stat(file);
    if (s.isDirectory()) {
      if (!urlPath.endsWith("/")) { res.statusCode = 301; res.setHeader("Location", urlPath + "/" + search); return res.end(); }
      file = join(file, "index.html");
    }
    const body = await readFile(file);
    res.setHeader("Content-Type", TYPES[extname(file).toLowerCase()] || "application/octet-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.end(body);
  } catch {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("Not found");
  }
}

createServer(async (req, res) => {
  const { pathname, search } = new URL(req.url, "http://localhost");
  try {
    if (pathname.startsWith("/api/")) await handleApi(req, res, pathname.slice(5).replace(/\/$/, ""));
    else await serveFile(res, pathname, search);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) vercelRes(res).status(500).json({ error: String(err) });
  }
  console.log(`${req.method} ${pathname} ${res.statusCode}`);
}).listen(PORT, "127.0.0.1", () => console.log(`TAISI dev server on http://localhost:${PORT}`));
