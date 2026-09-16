import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const root = path.resolve(import.meta.dirname, "../..");
const port = Number(process.env.PORT || 4173);
const historicalPayload = {
  score: { joker: 8 },
  primaryHits: { joker: 3 },
  primaryHistory: ["joker", "joker", "joker"]
};
const testDefinitions = require("../definitions.js");
const scl90Product = require("../scl90/product.js");
const scl90HistoricalPayload = scl90Product.score(Array(90).fill(2));

const state = {
  publicAccessEnabled: true,
  publicAccessCode: "OPEN",
  lastUseTokenBody: null,
  useTokenRequestCount: 0,
  successfulCompletionCount: 0,
  accessValidationCount: 0,
  tokens: new Map()
};

function resetState() {
  state.publicAccessEnabled = true;
  state.publicAccessCode = "OPEN";
  state.lastUseTokenBody = null;
  state.useTokenRequestCount = 0;
  state.successfulCompletionCount = 0;
  state.accessValidationCount = 0;
  state.tokens = new Map([
    ["valid-unused", { used: false, testId: "villain" }],
    ["wrong-test", { used: false, testId: "scl90" }],
    ["completed", {
      used: true,
      testId: "villain",
      resultType: "joker",
      resultData: historicalPayload
    }],
    ["legacy-completed", {
      used: true,
      testId: "villain",
      resultType: "joker",
      resultData: historicalPayload,
      sourceTestId: null
    }],
    ["scl-valid-unused", { used: false, testId: "scl90" }],
    ["scl-completed", {
      used: true,
      testId: "scl90",
      resultType: "scl90-report",
      resultData: scl90HistoricalPayload
    }]
  ]);
}

resetState();

function sendJson(response, status, body) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(body));
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {};
}

function publicState() {
  return {
    publicAccessEnabled: state.publicAccessEnabled,
    accessValidationCount: state.accessValidationCount,
    lastUseTokenBody: state.lastUseTokenBody,
    useTokenRequestCount: state.useTokenRequestCount,
    successfulCompletionCount: state.successfulCompletionCount,
    tokens: Object.fromEntries(state.tokens)
  };
}

async function handleApi(request, response, url) {
  if (url.pathname === "/__test-state") {
    sendJson(response, 200, publicState());
    return true;
  }

  if (url.pathname === "/__test-control" && request.method === "POST") {
    const body = await readJson(request);
    if (body.action === "reset") resetState();
    if (body.action === "set-public-enabled") state.publicAccessEnabled = body.enabled === true;
    sendJson(response, 200, publicState());
    return true;
  }

  if (url.pathname === "/api/validate-token") {
    const token = url.searchParams.get("token");
    const expectedTestId = url.searchParams.get("expectedTestId");
    const tokenState = state.tokens.get(token);

    if (!tokenState) {
      sendJson(response, 404, { valid: false, message: "链接无效。" });
      return true;
    }

    if (tokenState.testId !== expectedTestId) {
      sendJson(response, 403, { valid: false, message: "该链接不适用于当前测试。" });
      return true;
    }

    if (tokenState.used) {
      sendJson(response, 200, {
        valid: true,
        completed: true,
        testId: tokenState.testId,
        resultType: tokenState.resultType,
        resultData: tokenState.resultData
      });
      return true;
    }

    sendJson(response, 200, {
      valid: true,
      completed: false,
      testId: tokenState.testId
    });
    return true;
  }

  if (url.pathname === "/api/use-token" && request.method === "POST") {
    const body = await readJson(request);
    const tokenState = state.tokens.get(body.token);
    state.useTokenRequestCount += 1;

    if (!tokenState || tokenState.used || tokenState.testId !== body.testId) {
      sendJson(response, 400, { success: false, message: "链接无效或已使用" });
      return true;
    }

    state.lastUseTokenBody = body;
    state.successfulCompletionCount += 1;
    state.tokens.set(body.token, {
      used: true,
      testId: body.testId,
      resultType: body.resultType,
      resultData: body.resultData
    });
    sendJson(response, 200, { success: true });
    return true;
  }

  if (url.pathname === "/api/validate-access-code" && request.method === "POST") {
    const body = await readJson(request);
    state.accessValidationCount += 1;

    if (!state.publicAccessEnabled) {
      sendJson(response, 403, { success: false, message: "公共测试入口当前已关闭。" });
      return true;
    }

    if (body.accessCode !== state.publicAccessCode) {
      sendJson(response, 401, { success: false, message: "授权码错误。" });
      return true;
    }

    sendJson(response, 200, { success: true });
    return true;
  }

  if (url.pathname === "/api/generate-links" && request.method === "POST") {
    const body = await readJson(request);
    const count = Math.max(1, Math.min(Number(body.count) || 1, 1000));
    const definition = testDefinitions.get(body.testId);

    if (!definition) {
      sendJson(response, 400, { error: "未知测试" });
      return true;
    }

    if (definition.enabled !== true) {
      sendJson(response, 403, { error: "该测试当前已关闭。" });
      return true;
    }

    const links = Array.from({ length: count }, (_, index) => {
      const token = `generated-${body.testId}-${index + 1}`;
      state.tokens.set(token, { used: false, testId: body.testId });
      const entry = new URL(definition.entryPath, `http://127.0.0.1:${port}`);
      entry.searchParams.set("token", token);
      return entry.toString();
    });
    sendJson(response, 200, { count, testId: body.testId, links });
    return true;
  }

  return false;
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

    if (await handleApi(request, response, url)) return;

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
    response.writeHead(error.code === "ENOENT" ? 404 : 500);
    response.end(error.code === "ENOENT" ? "Not found" : error.message);
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Runtime regression server listening on http://127.0.0.1:${port}`);
});
