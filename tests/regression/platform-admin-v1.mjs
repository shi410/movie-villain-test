import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "../..");
const importFromRoot = path => import(pathToFileURL(resolve(root, path)).href);
const savedEnvironment = {
  ADMIN_SECRET: process.env.ADMIN_SECRET,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  VERCEL_ENV: process.env.VERCEL_ENV
};
const savedFetch = globalThis.fetch;
let passed = 0;

function response() {
  return {
    statusCode: 200,
    body: null,
    headers: new Map(),
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; return this; },
    setHeader(name, value) { this.headers.set(name.toLowerCase(), value); }
  };
}

async function test(name, callback) {
  try {
    await callback();
    passed += 1;
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

try {
  process.env.ADMIN_SECRET = "admin-v1-regression-secret";
  process.env.SUPABASE_URL = "https://supabase.invalid";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-test-only";
  delete process.env.VERCEL_ENV;

  const adminSession = (await importFromRoot("api/admin-session.js")).default;
  const generateLinks = (await importFromRoot("api/generate-links.js")).default;
  const manageLinks = (await importFromRoot("api/manage-links.js")).default;
  const managePublicAccess = (await importFromRoot("api/manage-public-access.js")).default;
  const { adminSessionConfig, createAdminSessionToken, isAdminSessionValid } = await importFromRoot("lib/server/admin-auth.js");

  let authenticatedCookie = "";

  await test("admin login creates an HttpOnly SameSite session without exposing the secret", async () => {
    const res = response();
    await adminSession({
      method: "POST",
      headers: { "x-admin-request": "1" },
      body: { action: "login", adminSecret: process.env.ADMIN_SECRET }
    }, res);
    assert.equal(res.statusCode, 200);
    const setCookie = res.headers.get("set-cookie");
    assert.match(setCookie, /^platform_admin_session=/);
    assert.match(setCookie, /HttpOnly/);
    assert.match(setCookie, /SameSite=Strict/);
    assert.doesNotMatch(setCookie, /admin-v1-regression-secret/);
    authenticatedCookie = setCookie.split(";")[0];
  });

  await test("wrong admin password is rejected and no cookie is issued", async () => {
    const res = response();
    await adminSession({
      method: "POST",
      headers: { "x-admin-request": "1" },
      body: { action: "login", adminSecret: "wrong" }
    }, res);
    assert.equal(res.statusCode, 403);
    assert.equal(res.headers.has("set-cookie"), false);
  });

  await test("session verification rejects missing, expired and forged cookies", () => {
    assert.equal(isAdminSessionValid({ headers: {} }), false);
    const valid = createAdminSessionToken(10_000);
    const validRequest = { headers: { cookie: `${adminSessionConfig.cookieName}=${encodeURIComponent(valid)}` } };
    assert.equal(isAdminSessionValid(validRequest, 11_000), true);
    assert.equal(isAdminSessionValid(validRequest, 40_000_000), false);
    assert.equal(isAdminSessionValid({ headers: { cookie: `${adminSessionConfig.cookieName}=${valid}x` } }, 11_000), false);
  });

  await test("generate-links rejects unauthenticated requests before Supabase access", async () => {
    let called = false;
    globalThis.fetch = async () => { called = true; throw new Error("must not run"); };
    const res = response();
    await generateLinks({ method: "POST", headers: { "x-admin-request": "1" }, body: { count: 1, testId: "villain" } }, res);
    assert.equal(res.statusCode, 401);
    assert.equal(called, false);
  });

  await test("authenticated generation binds test_id and keeps product entry paths", async () => {
    let insertedRows;
    globalThis.fetch = async (_url, options) => {
      insertedRows = JSON.parse(options.body);
      return { ok: true, async json() { return structuredClone(insertedRows); } };
    };
    const res = response();
    await generateLinks({
      method: "POST",
      headers: { "x-admin-request": "1", cookie: authenticatedCookie },
      body: { count: 2, testId: "scl90" }
    }, res);
    assert.equal(res.statusCode, 200);
    assert.equal(insertedRows.length, 2);
    assert.deepEqual(insertedRows.map(row => ({ used: row.used, test_id: row.test_id })), [
      { used: false, test_id: "scl90" },
      { used: false, test_id: "scl90" }
    ]);
    assert.ok(insertedRows.every(row => /^[A-Za-z0-9_-]{32}$/.test(row.token)));
    assert.ok(res.body.links.every(link => link.startsWith("https://filmtest.top/scl90/?token=")));
  });

  await test("link management returns only safe metadata and maps legacy null test_id to villain", async () => {
    let requestedUrl = "";
    globalThis.fetch = async url => {
      requestedUrl = String(url);
      return {
        ok: true,
        headers: { get(name) { return name.toLowerCase() === "content-range" ? "0-1/2" : null; } },
        async json() {
          return [
            { id: 1, token: "legacy-villain-token", used: true, created_at: "2026-09-01T00:00:00Z", result_type: "villain", test_id: null },
            { id: 2, token: "scl90-token", used: false, created_at: "2026-09-02T00:00:00Z", result_type: null, test_id: "scl90" }
          ];
        }
      };
    };
    const res = response();
    await manageLinks({
      method: "GET",
      headers: { "x-admin-request": "1", cookie: authenticatedCookie },
      query: { page: "1", pageSize: "20", status: "all" }
    }, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.total, 2);
    assert.equal(res.body.links[0].testId, "villain");
    assert.match(res.body.links[0].link, /^https:\/\/filmtest\.top\/\?token=/);
    assert.equal("resultData" in res.body.links[0], false);
    assert.match(requestedUrl, /select=id%2Ctoken%2Cused%2Ccreated_at%2Cresult_type%2Ctest_id/);
    assert.doesNotMatch(requestedUrl, /result_data/);
  });

  await test("public access management is protected by the same admin session", async () => {
    let called = false;
    globalThis.fetch = async () => { called = true; return { ok: true, async json() { return [{ access_code: "masked", enabled: false }]; } }; };
    let res = response();
    await managePublicAccess({ method: "POST", headers: { "x-admin-request": "1" }, body: { action: "get" } }, res);
    assert.equal(res.statusCode, 401);
    assert.equal(called, false);

    res = response();
    await managePublicAccess({
      method: "POST",
      headers: { "x-admin-request": "1", cookie: authenticatedCookie },
      body: { action: "get" }
    }, res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.enabled, false);
  });

  await test("Admin V1 exposes exactly the four approved modules and uses Registry products", () => {
    const html = readFileSync(resolve(root, "admin.html"), "utf8");
    const source = readFileSync(resolve(root, "js/admin.js"), "utf8");
    const css = readFileSync(resolve(root, "css/admin.css"), "utf8");
    for (const moduleName of ["测试管理", "生成链接", "链接管理", "公共授权管理"]) assert.match(html, new RegExp(moduleName));
    assert.equal((html.match(/class="nav-item/g) || []).length, 4);
    assert.match(html, /css\/admin\.css/);
    assert.match(source, /TestRegistry\.list\(\)/);
    assert.match(source, /new Option\(test\.name, test\.test_id\)/);
    assert.match(source, /JSON\.stringify\(\{ count, testId \}\)/);
    assert.match(source, /credentials: "same-origin"/);
    assert.doesNotMatch(source, /localStorage|sessionStorage/);
    assert.match(css, /@media \(max-width: 800px\)/);
  });

  await test("Admin V1 does not invent unsafe revoke behavior", () => {
    const apiSource = readFileSync(resolve(root, "api/manage-links.js"), "utf8");
    const adminSource = readFileSync(resolve(root, "js/admin.js"), "utf8");
    assert.doesNotMatch(apiSource, /revoke|revoked/i);
    assert.doesNotMatch(adminSource, /撤销选中|revoke|revoked/i);
  });

  await test("logout clears the signed session cookie", async () => {
    const res = response();
    await adminSession({
      method: "POST",
      headers: { "x-admin-request": "1", cookie: authenticatedCookie },
      body: { action: "logout" }
    }, res);
    assert.equal(res.statusCode, 200);
    assert.match(res.headers.get("set-cookie"), /Max-Age=0/);
  });

  console.log(`Platform Admin V1 regression: ${passed}/${passed} PASS`);
} finally {
  globalThis.fetch = savedFetch;
  for (const [key, value] of Object.entries(savedEnvironment)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}
