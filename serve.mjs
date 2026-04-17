import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const root = __dirname;
const port = Number(process.argv[2] || 5500);

const MIME = new Map([
  [".html", "text/html; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".ico", "image/x-icon"],
  [".txt", "text/plain; charset=utf-8"]
]);

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    "Cache-Control": "no-store",
    ...headers
  });
  res.end(body);
}

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0] || "/");
  const clean = decoded.replaceAll("\\", "/");
  const resolved = path.resolve(root, "." + clean);
  if (!resolved.startsWith(root)) return null;
  return resolved;
}

const server = http.createServer((req, res) => {
  const method = req.method || "GET";
  if (method !== "GET" && method !== "HEAD") {
    return send(res, 405, "Method Not Allowed", { "Content-Type": "text/plain; charset=utf-8" });
  }

  const filePath = safePath(req.url || "/");
  if (!filePath) return send(res, 400, "Bad Request", { "Content-Type": "text/plain; charset=utf-8" });

  let target = filePath;
  try {
    const stat = fs.statSync(target);
    if (stat.isDirectory()) target = path.join(target, "index.html");
  } catch {
    // continue to 404
  }

  if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
    return send(res, 404, "Not Found", { "Content-Type": "text/plain; charset=utf-8" });
  }

  const ext = path.extname(target).toLowerCase();
  const type = MIME.get(ext) || "application/octet-stream";

  try {
    const data = fs.readFileSync(target);
    if (method === "HEAD") return send(res, 200, "", { "Content-Type": type });
    return send(res, 200, data, { "Content-Type": type });
  } catch {
    return send(res, 500, "Server Error", { "Content-Type": "text/plain; charset=utf-8" });
  }
});

server.listen(port, "127.0.0.1", () => {
  // eslint-disable-next-line no-console
  console.log(`Shinseikan dev server: http://localhost:${port}/`);
  // eslint-disable-next-line no-console
  console.log(`Admin: http://localhost:${port}/admin/`);
});

