import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const directory = dirname(fileURLToPath(import.meta.url));
const root = resolve(directory, "../..");
const ProductContract = require("../../js/platform/product-contract.js");
const PlatformRuntime = require("../../js/platform/runtime.js");
const Scl90Product = require("../scl90/product.js");
const Scl90SessionResultStore = require("../../scl90/js/session-result-store.js");
const TestDefinitions = require("../definitions.js");

let passed = 0;

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

function response(ok, data) {
  return { ok, async json() { return data; } };
}

function session(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); }
  };
}

function registryWithScl90() {
  return {
    getProduct(testId) {
      return testId === "scl90" ? Scl90Product : null;
    }
  };
}

function registryWithDefinition(enabled) {
  const definition = { test_id: "scl90", enabled };
  return {
    get(testId) {
      return testId === "scl90" ? definition : null;
    },
    isEnabled(testId) {
      return testId === "scl90" && enabled;
    }
  };
}

await test("scl90 definition is enabled in the private capability candidate", () => {
  const definition = TestDefinitions.get("scl90");
  assert.deepEqual(
    {
      testId: definition.test_id,
      enabled: definition.enabled,
      entryPath: definition.entryPath,
      publicAccessPath: definition.publicAccessPath
    },
    {
      testId: "scl90",
      enabled: true,
      entryPath: "/scl90/",
      publicAccessPath: "/access.html?test=scl90"
    }
  );
});

await test("scl90 Product satisfies Contract V1", () => {
  assert.equal(ProductContract.validateProduct(Scl90Product), Scl90Product);
  assert.equal(Scl90Product.test_id, "scl90");
});

await test("unused scl90 Token completes with isolated testId and opaque payload", async () => {
  const requests = [];
  const runtime = PlatformRuntime.createRuntime({
    testId: "scl90",
    productRegistry: registryWithScl90(),
    testRegistry: registryWithDefinition(false),
    sessionStore: session(),
    getLocationSearch: () => "?token=scl-unused",
    fetchImpl: async (url, options) => {
      requests.push({ url, options });
      return url.startsWith("/api/validate-token")
        ? response(true, { valid: true, completed: false, testId: "scl90" })
        : response(true, { success: true });
    }
  });

  const initialized = await runtime.initialize();
  const completed = await runtime.complete(Array(90).fill(1));
  const body = JSON.parse(requests[1].options.body);

  assert.equal(initialized.testId, "scl90");
  assert.equal(completed.resultType, "scl90-report");
  assert.equal(completed.resultPayload.testId, "scl90");
  assert.equal(body.testId, "scl90");
  assert.equal(body.resultType, "scl90-report");
  assert.deepEqual(body.resultData, completed.resultPayload);
});

await test("completed scl90 Token restores through the scl90 renderer", async () => {
  const payload = Scl90Product.score(Array(90).fill(2));
  const runtime = PlatformRuntime.createRuntime({
    testId: "scl90",
    productRegistry: registryWithScl90(),
    testRegistry: registryWithDefinition(false),
    sessionStore: session(),
    getLocationSearch: () => "?token=scl-completed",
    fetchImpl: async () => response(true, {
      valid: true,
      completed: true,
      testId: "scl90",
      resultType: "scl90-report",
      resultData: payload
    })
  });

  const restored = await runtime.initialize();
  assert.equal(restored.ok, true);
  assert.equal(restored.completed, true);
  assert.deepEqual(restored.resultPayload, payload);
});

await test("villain Token is rejected by the scl90 Runtime", async () => {
  const runtime = PlatformRuntime.createRuntime({
    testId: "scl90",
    productRegistry: registryWithScl90(),
    testRegistry: registryWithDefinition(false),
    sessionStore: session(),
    getLocationSearch: () => "?token=villain-token",
    fetchImpl: async () => response(true, {
      valid: true,
      completed: false,
      testId: "villain"
    })
  });

  const result = await runtime.initialize();
  assert.equal(result.ok, false);
  assert.equal(result.message, "该链接不适用于当前测试。");
});

await test("enabled public scl90 completion stays session-only and never consumes a Token", async () => {
  const requests = [];
  const runtime = PlatformRuntime.createRuntime({
    testId: "scl90",
    productRegistry: registryWithScl90(),
    testRegistry: registryWithDefinition(true),
    sessionStore: session({ publicAccessCode: "OPEN" }),
    getLocationSearch: () => "",
    fetchImpl: async (url, options) => {
      requests.push({ url, options });
      return response(true, { success: true });
    }
  });

  assert.equal((await runtime.initialize()).mode, "public");
  const completed = await runtime.complete(Array(90).fill(1));
  assert.equal(completed.ok, true);
  assert.equal(requests.some(request => request.url === "/api/use-token"), false);
});

await test("a disabled scl90 definition rejects a carried global public-access session", async () => {
  const requests = [];
  const runtime = PlatformRuntime.createRuntime({
    testId: "scl90",
    productRegistry: registryWithScl90(),
    testRegistry: registryWithDefinition(false),
    sessionStore: session({ publicAccessCode: "OPEN" }),
    getLocationSearch: () => "",
    fetchImpl: async (url, options) => {
      requests.push({ url, options });
      return response(true, { success: true });
    }
  });

  const initialized = await runtime.initialize();
  assert.equal(initialized.ok, false);
  assert.equal(initialized.message, "该测试当前尚未开放。");
  assert.equal(requests.length, 0);
});

await test("public session result storage round-trips the opaque payload", () => {
  const storage = session();
  const payload = Scl90Product.score(Array(90).fill(3));
  Scl90SessionResultStore.save(storage, payload);
  assert.deepEqual(Scl90SessionResultStore.load(storage), payload);
  Scl90SessionResultStore.clear(storage);
  assert.equal(Scl90SessionResultStore.load(storage), null);
});

await test("enabled scl90 generates a Token bound to its entry path", async () => {
  const handler = (await import(pathToFileURL(resolve(root, "api/generate-links.js")).href)).default;
  const savedFetch = globalThis.fetch;
  let insertedRows = null;
  const res = {
    statusCode: null,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };
  try {
    globalThis.fetch = async (url, options) => {
      insertedRows = JSON.parse(options.body);
      return {
        ok: true,
        async json() { return insertedRows; }
      };
    };
    await handler({ method: "POST", body: { count: 1, testId: "scl90" } }, res);
    assert.equal(res.statusCode, 200);
    assert.deepEqual(insertedRows.map(row => ({ used: row.used, test_id: row.test_id })), [
      { used: false, test_id: "scl90" }
    ]);
    assert.equal(res.body.count, 1);
    assert.match(res.body.links[0], /^https:\/\/filmtest\.top\/scl90\/\?token=/);
  } finally {
    globalThis.fetch = savedFetch;
  }
});

await test("Admin derives both enabled products from TestRegistry and submits testId", () => {
  const enabled = TestDefinitions.list().filter(definition => definition.enabled === true);
  assert.deepEqual(enabled.map(definition => definition.test_id), ["villain", "scl90"]);
  const source = readFileSync(resolve(root, "js/admin.js"), "utf8");
  assert.match(source, /TestRegistry\.list\(\)/);
  assert.match(source, /new Option\(test\.name, test\.test_id\)/);
  assert.match(source, /JSON\.stringify\(\{ count, testId \}\)/);
});

await test("scl90 pages load Contract, Product Registry and Runtime in order", () => {
  for (const page of ["scl90/index.html", "scl90/test.html", "scl90/report.html"]) {
    const source = readFileSync(resolve(root, page), "utf8");
    const definitions = source.indexOf("../tests/definitions.js");
    const testRegistry = source.indexOf("../tests/registry.js");
    const contract = source.indexOf("../js/platform/product-contract.js");
    const registry = source.indexOf("../js/platform/product-registry.js");
    const runtime = source.indexOf("../js/platform/runtime.js");
    const product = source.indexOf("../tests/scl90/product.js");
    const bridge = source.indexOf("js/platform-bridge.js");
    assert.ok(definitions >= 0 && definitions < testRegistry && testRegistry < contract, page);
    assert.ok(contract < registry && registry < runtime, page);
    assert.ok(runtime < product && product < bridge, page);
    if (page !== "scl90/index.html") {
      const answerStore = source.indexOf("js/session-answer-store.js");
      assert.ok(bridge < answerStore, page);
    }
  }
});

await test("development fixture bypass is limited to localhost", () => {
  const bridge = require("../../scl90/js/platform-bridge.js");
  assert.equal(bridge.isLocalDevelopment({ hostname: "127.0.0.1" }), true);
  assert.equal(bridge.isLocalDevelopment({ hostname: "localhost" }), true);
  assert.equal(bridge.isLocalDevelopment({ hostname: "filmtest.top" }), false);

  const bridgeSource = readFileSync(resolve(root, "scl90/js/platform-bridge.js"), "utf8");
  assert.match(bridgeSource, /testRegistry: global\.TestRegistry/);

  for (const page of ["scl90/js/home.js", "scl90/js/test-flow.js", "scl90/js/report-page.js"]) {
    const source = readFileSync(resolve(root, page), "utf8");
    assert.match(source, /isLocalDevelopment\(\)/, page);
  }
});

await test("scl90 navigation preserves only the current Token", () => {
  const bridge = require("../../scl90/js/platform-bridge.js");
  assert.equal(bridge.pathWithToken("test.html", "?token=scl-123"), "test.html?token=scl-123");
  assert.equal(
    bridge.pathWithToken("report.html?view=full", "?token=a%20b&ignored=1"),
    "report.html?view=full&token=a%20b"
  );
  assert.equal(bridge.pathWithToken("test.html", "?ignored=1"), "test.html");
});

await test("public access routing is definition-driven and preserves villain default", () => {
  const source = readFileSync(resolve(root, "js/access.js"), "utf8");
  assert.match(source, /get\("test"\) \|\| "villain"/);
  assert.match(source, /TestRegistry\?\.get\(requestedTestId\)/);
  assert.match(source, /window\.location\.href = testDefinition\.entryPath/);
  assert.doesNotMatch(source, /window\.location\.href = "\/"/);
});

console.log(`${passed}/14 PASS`);
