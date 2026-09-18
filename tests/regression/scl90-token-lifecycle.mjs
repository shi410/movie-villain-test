import assert from "node:assert/strict";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const root = resolve(import.meta.dirname, "../..");
const product = require("../scl90/product.js");
const generateLinks = (await import(pathToFileURL(resolve(root, "api/generate-links.js")).href)).default;
const validateToken = (await import(pathToFileURL(resolve(root, "api/validate-token.js")).href)).default;
const useToken = (await import(pathToFileURL(resolve(root, "api/use-token.js")).href)).default;
const { createAdminSessionToken, adminSessionConfig } = await import(pathToFileURL(resolve(root, "lib/server/admin-auth.js")).href);

const rows = [];
let successfulPatches = 0;
const savedFetch = globalThis.fetch;
const savedUrl = process.env.SUPABASE_URL;
const savedKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const savedAdminSecret = process.env.ADMIN_SECRET;

function response() {
  return {
    statusCode: null,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };
}

function supabaseResponse(ok, data) {
  return {
    ok,
    async json() { return structuredClone(data); },
    async text() { return JSON.stringify(data); }
  };
}

function tokenFromUrl(url) {
  const value = new URL(url).searchParams.get("token");
  assert.ok(value);
  return value;
}

function matchingToken(url) {
  const value = new URL(url).searchParams.get("token");
  return value?.startsWith("eq.") ? decodeURIComponent(value.slice(3)) : null;
}

try {
  process.env.SUPABASE_URL = "https://supabase.invalid";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-only";
  process.env.ADMIN_SECRET = "token-lifecycle-test-secret";
  globalThis.fetch = async (url, options = {}) => {
    const parsed = new URL(url);
    const token = matchingToken(url);

    if (options.method === "POST" && parsed.pathname.endsWith("/test_links")) {
      const inserted = JSON.parse(options.body).map(row => ({ ...row }));
      rows.push(...inserted);
      return supabaseResponse(true, inserted);
    }

    if (options.method === "PATCH") {
      const updates = JSON.parse(options.body);
      const row = rows.find(candidate => candidate.token === token && candidate.used === false);
      if (!row) return supabaseResponse(true, []);
      Object.assign(row, updates);
      successfulPatches += 1;
      return supabaseResponse(true, [row]);
    }

    if (options.method === undefined || options.method === "GET") {
      const row = rows.find(candidate => candidate.token === token);
      return supabaseResponse(true, row ? [row] : []);
    }

    throw new Error(`Unexpected Supabase request: ${options.method} ${url}`);
  };

  let res = response();
  const sessionToken = createAdminSessionToken();
  await generateLinks({
    method: "POST",
    headers: {
      "x-admin-request": "1",
      cookie: `${adminSessionConfig.cookieName}=${encodeURIComponent(sessionToken)}`
    },
    body: { count: 1, testId: "scl90" }
  }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.count, 1);
  assert.equal(new URL(res.body.links[0]).pathname, "/scl90/");
  const scl90Token = tokenFromUrl(res.body.links[0]);
  assert.deepEqual(rows.map(row => ({ test_id: row.test_id, used: row.used })), [
    { test_id: "scl90", used: false }
  ]);

  res = response();
  await validateToken({ query: { token: scl90Token, expectedTestId: "scl90" } }, res);
  assert.deepEqual(res.body, {
    valid: true,
    completed: false,
    testId: "scl90"
  });

  res = response();
  await validateToken({ query: { token: scl90Token, expectedTestId: "villain" } }, res);
  assert.equal(res.statusCode, 403);

  rows.push({ token: "villain-control", used: false, test_id: "villain" });
  res = response();
  await validateToken({ query: { token: "villain-control", expectedTestId: "scl90" } }, res);
  assert.equal(res.statusCode, 403);

  const resultData = product.score(Array(90).fill(2));
  const resultType = product.getResultType(resultData);
  res = response();
  await useToken({
    method: "POST",
    body: { token: scl90Token, resultType, resultData, testId: "scl90" }
  }, res);
  assert.deepEqual(res.body, { success: true });
  assert.equal(successfulPatches, 1);

  const persisted = rows.find(row => row.token === scl90Token);
  assert.equal(persisted.used, true);
  assert.equal(persisted.result_type, "scl90-report");
  assert.deepEqual(persisted.result_data, resultData);

  for (let attempt = 0; attempt < 2; attempt += 1) {
    res = response();
    await validateToken({ query: { token: scl90Token, expectedTestId: "scl90" } }, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.completed, true);
    assert.equal(res.body.testId, "scl90");
    assert.equal(res.body.resultType, "scl90-report");
    assert.deepEqual(res.body.resultData, resultData);
  }

  res = response();
  await useToken({
    method: "POST",
    body: { token: scl90Token, resultType, resultData, testId: "scl90" }
  }, res);
  assert.equal(res.statusCode, 400);
  assert.equal(successfulPatches, 1);
  assert.equal(rows.filter(row => row.token === scl90Token).length, 1);

  res = response();
  await validateToken({ query: { token: "villain-control", expectedTestId: "villain" } }, res);
  assert.deepEqual(res.body, {
    valid: true,
    completed: false,
    testId: "villain"
  });

  console.log("PASS SCL-90 generated Token, completion, repeat restore, duplicate protection and bidirectional isolation");
} finally {
  globalThis.fetch = savedFetch;
  if (savedUrl === undefined) delete process.env.SUPABASE_URL;
  else process.env.SUPABASE_URL = savedUrl;
  if (savedKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  else process.env.SUPABASE_SERVICE_ROLE_KEY = savedKey;
  if (savedAdminSecret === undefined) delete process.env.ADMIN_SECRET;
  else process.env.ADMIN_SECRET = savedAdminSecret;
}
