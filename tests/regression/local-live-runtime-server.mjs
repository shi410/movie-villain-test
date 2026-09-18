import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const port = Number(process.env.PORT || 4174);
const envFile = process.env.LIVE_ENV_FILE;

if (process.env.SCL90_LIVE_TEST !== "1" || !envFile) {
  throw new Error("Live Runtime server requires SCL90_LIVE_TEST=1 and LIVE_ENV_FILE.");
}

function parseEnv(source) {
  const values = {};
  source.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const separator = trimmed.indexOf("=");
    if (separator < 1) return;
    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  });
  return values;
}

const secrets = parseEnv(await readFile(envFile, "utf8"));
for (const key of ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "ADMIN_SECRET"]) {
  if (!secrets[key]) throw new Error(`Live Runtime environment is missing ${key}.`);
  process.env[key] = secrets[key];
}

const handlers = {
  "/api/admin-session": (await import("../../api/admin-session.js")).default,
  "/api/generate-links": (await import("../../api/generate-links.js")).default,
  "/api/manage-links": (await import("../../api/manage-links.js")).default,
  "/api/manage-public-access": (await import("../../api/manage-public-access.js")).default,
  "/api/validate-token": (await import("../../api/validate-token.js")).default,
  "/api/use-token": (await import("../../api/use-token.js")).default,
  "/api/validate-access-code": (await import("../../api/validate-access-code.js")).default
};

const state = {
  generated: 0,
  useTokenRequests: 0,
  successfulCompletions: 0,
  lastGeneratedTestId: null,
  lastCompletedTestId: null
};

function sendJson(response, status, body, extraHeaders = {}) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...extraHeaders
  });
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
  let responseBody;
  const responseHeaders = {};
  const adapter = {
    status(code) { statusCode = code; return this; },
    json(value) { responseBody = value; return this; },
    setHeader(name, value) { responseHeaders[name] = value; }
  };

  await handler({ method: request.method, body, query, headers: request.headers }, adapter);

  if (url.pathname === "/api/generate-links" && statusCode === 200) {
    state.generated += responseBody.count;
    state.lastGeneratedTestId = body.testId;
    responseBody = {
      ...responseBody,
      links: responseBody.links.map(link => {
        const target = new URL(link);
        target.protocol = "http:";
        target.hostname = "127.0.0.1";
        target.port = String(port);
        return target.toString();
      })
    };
  }

  if (url.pathname === "/api/use-token") {
    state.useTokenRequests += 1;
    if (statusCode === 200 && responseBody?.success === true) {
      state.successfulCompletions += 1;
      state.lastCompletedTestId = body.testId;
    }
  }

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

    if (url.pathname === "/__live-test-state") {
      sendJson(response, 200, state);
      return;
    }

    if (handlers[url.pathname]) {
      await runHandler(handlers[url.pathname], request, response, url);
      return;
    }

    const pathname = url.pathname === "/"
      ? "/index.html"
      : url.pathname.endsWith("/")
        ? `${url.pathname}index.html`
        : url.pathname;
    const relativePath = decodeURIComponent(pathname).replace(/^\/+/, "");
    const filePath = path.resolve(root, relativePath);

    if (!filePath.startsWith(root + path.sep)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    const data = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": contentTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    response.end(data);
  } catch (error) {
    console.error("Live Runtime request error:", error?.message || error?.name || "unknown error");
    response.writeHead(error.code === "ENOENT" ? 404 : 500);
    response.end(error.code === "ENOENT" ? "Not found" : "Live Runtime request failed");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Private live Runtime server listening on http://127.0.0.1:${port}`);
});
