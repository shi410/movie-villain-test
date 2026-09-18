import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const port = Number(process.env.PORT || 4176);

process.env.ADMIN_SECRET = "admin-demo";
process.env.SUPABASE_URL = "https://admin-regression.invalid";
process.env.SUPABASE_SERVICE_ROLE_KEY = "local-regression-only";

const handlers = {
  "/api/admin-session": (await import("../../api/admin-session.js")).default,
  "/api/generate-links": (await import("../../api/generate-links.js")).default,
  "/api/manage-links": (await import("../../api/manage-links.js")).default,
  "/api/manage-public-access": (await import("../../api/manage-public-access.js")).default
};

const rows = [
  { id: 1, token: "legacy-villain-completed", used: true, created_at: "2026-09-18T08:12:00Z", result_type: "villain", test_id: null },
  { id: 2, token: "villain-unused-sample", used: false, created_at: "2026-09-18T09:20:00Z", result_type: null, test_id: "villain" },
  { id: 3, token: "scl90-completed-sample", used: true, created_at: "2026-09-18T10:25:00Z", result_type: "scl90-report", test_id: "scl90" },
  { id: 4, token: "scl90-unused-sample", used: false, created_at: "2026-09-18T11:40:00Z", result_type: null, test_id: "scl90" }
];
const publicAccess = { access_code: "FAMILY2026", enabled: false };

function mockResponse(data, total = data.length) {
  return {
    ok: true,
    status: 200,
    headers: { get(name) { return name.toLowerCase() === "content-range" ? `0-${Math.max(0, data.length - 1)}/${total}` : null; } },
    async json() { return structuredClone(data); },
    async text() { return JSON.stringify(data); }
  };
}

globalThis.fetch = async (input, options = {}) => {
  const url = new URL(input);
  const method = options.method || "GET";

  if (url.pathname.endsWith("/test_links") && method === "POST") {
    const inserted = JSON.parse(options.body).map((row, index) => ({
      id: rows.length + index + 1,
      created_at: new Date().toISOString(),
      result_type: null,
      ...row
    }));
    rows.push(...inserted);
    return mockResponse(inserted);
  }

  if (url.pathname.endsWith("/test_links") && method === "GET") {
    let filtered = rows.slice();
    const testId = url.searchParams.get("test_id")?.replace(/^eq\./, "");
    const or = url.searchParams.get("or");
    const used = url.searchParams.get("used")?.replace(/^eq\./, "");
    const search = url.searchParams.get("token")?.replace(/^ilike\.\*/, "").replace(/\*$/, "");
    if (or) filtered = filtered.filter(row => row.test_id === "villain" || row.test_id === null);
    else if (testId) filtered = filtered.filter(row => row.test_id === testId);
    if (used) filtered = filtered.filter(row => row.used === (used === "true"));
    if (search) filtered = filtered.filter(row => row.token.toLowerCase().includes(search.toLowerCase()));
    filtered.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
    const total = filtered.length;
    const offset = Number(url.searchParams.get("offset") || 0);
    const limit = Number(url.searchParams.get("limit") || 20);
    return mockResponse(filtered.slice(offset, offset + limit), total);
  }

  if (url.pathname.endsWith("/public_access") && method === "GET") {
    return mockResponse([{ ...publicAccess }]);
  }

  if (url.pathname.endsWith("/public_access") && method === "PATCH") {
    Object.assign(publicAccess, JSON.parse(options.body));
    return mockResponse([{ ...publicAccess }]);
  }

  throw new Error(`Unexpected local Admin request: ${method} ${input}`);
};

function sendJson(response, status, body, extraHeaders = {}) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...extraHeaders });
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {};
}

async function runHandler(handler, request, response, url) {
  const body = request.method === "POST" ? await readJson(request) : {};
  const query = Object.fromEntries(url.searchParams.entries());
  let statusCode = 200;
  let responseBody = {};
  const responseHeaders = {};
  const adapter = {
    status(code) { statusCode = code; return this; },
    json(value) { responseBody = value; return this; },
    setHeader(name, value) { responseHeaders[name] = value; }
  };
  await handler({ method: request.method, body, query, headers: request.headers }, adapter);
  sendJson(response, statusCode, responseBody, responseHeaders);
}

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png"
};

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://127.0.0.1:${port}`);
    if (handlers[url.pathname]) return await runHandler(handlers[url.pathname], request, response, url);
    if (url.pathname === "/__admin-test-state") return sendJson(response, 200, { rowCount: rows.length, publicAccess: { ...publicAccess } });
    if (url.pathname === "/favicon.ico") { response.writeHead(204); response.end(); return; }

    const pathname = url.pathname === "/" ? "/admin.html" : url.pathname;
    const relativePath = decodeURIComponent(pathname).replace(/^\/+/, "");
    const filePath = path.resolve(root, relativePath);
    if (!filePath.startsWith(root + path.sep)) {
      response.writeHead(403); response.end("Forbidden"); return;
    }
    const data = await readFile(filePath);
    response.writeHead(200, { "Content-Type": contentTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-store" });
    response.end(data);
  } catch (error) {
    console.error("Local Admin server error:", error?.message || error);
    response.writeHead(error.code === "ENOENT" ? 404 : 500);
    response.end(error.code === "ENOENT" ? "Not found" : "Local Admin server failed");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Local Admin V1 server: http://127.0.0.1:${port}/admin.html`);
  console.log("Local-only password: admin-demo");
});
