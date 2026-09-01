import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const testDirectory = dirname(fileURLToPath(import.meta.url));
const runtimeModule = require("../../js/platform/runtime.js");
const villainAdapter = require("../villain/product.js");

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
  return {
    ok,
    async json() {
      return data;
    }
  };
}

function createSession(initial = {}) {
  const values = new Map(Object.entries(initial));

  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    }
  };
}

function createHarness({
  search = "?token=unused",
  fetchImpl,
  session = createSession(),
  payload = { opaque: { value: 7 } },
  resultType = "opaque-result"
} = {}) {
  const calls = [];
  const product = villainAdapter.createVillainProduct({
    score(answers) {
      calls.push(["score", answers]);
      return payload;
    },
    getResultType(actualPayload) {
      calls.push(["getResultType", actualPayload]);
      return resultType;
    },
    renderReport(actualPayload, context) {
      calls.push(["renderReport", actualPayload, context]);
    }
  });
  const registry = {
    getProduct(testId) {
      return testId === "villain" ? product : null;
    }
  };
  const errors = [];
  const runtime = runtimeModule.createRuntime({
    testId: "villain",
    productRegistry: registry,
    fetchImpl,
    sessionStore: session,
    getLocationSearch: () => search,
    onError: message => errors.push(message)
  });

  return { runtime, product, calls, errors, session, payload, resultType };
}

await test("villain Product is a valid formally registered implementation", () => {
  const registryPath = require.resolve("../../js/platform/product-registry.js");
  delete require.cache[registryPath];
  const registry = require(registryPath);
  const harness = createHarness({ fetchImpl: async () => response(true, {}) });

  registry.registerProduct(harness.product);
  assert.equal(registry.getProduct("villain"), harness.product);

  const appSource = readFileSync(resolve(testDirectory, "../../js/app.js"), "utf8");
  assert.match(appSource, /VillainProductAdapter\.createVillainProduct/);
  assert.match(appSource, /TestProductRegistry\.registerProduct\(villainProduct\)/);
  assert.match(appSource, /PlatformRuntime\.createRuntime/);
});

await test("Runtime dispatches the requested test_id", async () => {
  const requested = [];
  const product = villainAdapter.createVillainProduct({
    score: () => ({}),
    getResultType: () => "type",
    renderReport: () => undefined
  });
  const runtime = runtimeModule.createRuntime({
    testId: "villain",
    productRegistry: {
      getProduct(testId) {
        requested.push(testId);
        return product;
      }
    },
    fetchImpl: async () => response(true, {
      valid: true,
      completed: false,
      testId: "villain"
    }),
    sessionStore: createSession(),
    getLocationSearch: () => "?token=dispatch"
  });

  assert.equal((await runtime.initialize()).ok, true);
  assert.deepEqual(requested, ["villain"]);
});

await test("wrong response test_id is rejected", async () => {
  const harness = createHarness({
    fetchImpl: async () => response(true, {
      valid: true,
      completed: false,
      testId: "scl90"
    })
  });
  const result = await harness.runtime.initialize();

  assert.equal(result.ok, false);
  assert.deepEqual(harness.errors, ["该链接不适用于当前测试。"]);
});

await test("unused token validates with expectedTestId and remains unconsumed", async () => {
  const requests = [];
  const harness = createHarness({
    fetchImpl: async (url, options) => {
      requests.push({ url, options });
      return response(true, {
        valid: true,
        completed: false,
        testId: "villain"
      });
    }
  });
  const result = await harness.runtime.initialize();

  assert.equal(result.ok, true);
  assert.equal(result.completed, false);
  assert.match(requests[0].url, /expectedTestId=villain/);
  assert.equal(requests.length, 1);
});

await test("completed token restores through current Product renderer", async () => {
  const historicalPayload = { legacy: [1, 2, 3] };
  const harness = createHarness({
    payload: historicalPayload,
    fetchImpl: async () => response(true, {
      valid: true,
      completed: true,
      testId: "villain",
      resultType: "joker",
      resultData: historicalPayload
    })
  });
  const result = await harness.runtime.initialize();

  assert.equal(result.completed, true);
  assert.equal(result.resultPayload, historicalPayload);
  assert.deepEqual(harness.calls, [[
    "renderReport",
    historicalPayload,
    {
      testId: "villain",
      resultType: "joker",
      mode: "token",
      completed: true
    }
  ]]);
});

await test("historical null test_id response remains villain after API normalization", async () => {
  const payload = { historical: true };
  const harness = createHarness({
    payload,
    fetchImpl: async () => response(true, {
      valid: true,
      completed: true,
      testId: "villain",
      resultType: "homelander",
      resultData: payload
    })
  });

  assert.equal((await harness.runtime.initialize()).ok, true);
  assert.equal(harness.calls[0][0], "renderReport");
});

await test("legacy completed result_type without result_data remains renderable", async () => {
  const harness = createHarness({
    payload: null,
    fetchImpl: async () => response(true, {
      valid: true,
      completed: true,
      testId: "villain",
      resultType: "joker",
      resultData: null
    })
  });

  const result = await harness.runtime.initialize();
  assert.equal(result.ok, true);
  assert.equal(result.resultPayload, null);
  assert.equal(harness.calls[0][1], null);
});

await test("completion maps opaque resultPayload to result_data", async () => {
  const requests = [];
  const opaquePayload = { completely: { productOwned: ["x"] } };
  const harness = createHarness({
    payload: opaquePayload,
    resultType: "joker",
    fetchImpl: async (url, options) => {
      requests.push({ url, options });
      return url.startsWith("/api/validate-token")
        ? response(true, { valid: true, completed: false, testId: "villain" })
        : response(true, { success: true });
    }
  });

  await harness.runtime.initialize();
  const result = await harness.runtime.complete([0, 1]);
  const completionBody = JSON.parse(requests[1].options.body);

  assert.equal(result.ok, true);
  assert.deepEqual(completionBody.resultData, opaquePayload);
});

await test("getResultType maps to result_type and completion sends explicit testId", async () => {
  const requests = [];
  const harness = createHarness({
    resultType: "hannibal",
    fetchImpl: async (url, options) => {
      requests.push({ url, options });
      return url.startsWith("/api/validate-token")
        ? response(true, { valid: true, completed: false, testId: "villain" })
        : response(true, { success: true });
    }
  });

  await harness.runtime.initialize();
  await harness.runtime.complete([2]);
  const body = JSON.parse(requests[1].options.body);

  assert.equal(body.resultType, "hannibal");
  assert.equal(body.testId, "villain");
});

await test("public access mode validates entry and never consumes a Token", async () => {
  const requests = [];
  const session = createSession({ publicAccessCode: "OPEN" });
  const harness = createHarness({
    search: "",
    session,
    fetchImpl: async (url, options) => {
      requests.push({ url, options });
      return response(true, { success: true });
    }
  });

  const initialized = await harness.runtime.initialize();
  const authorized = await harness.runtime.authorizePublicEntry();
  const completed = await harness.runtime.complete([0]);

  assert.equal(initialized.mode, "public");
  assert.equal(authorized.ok, true);
  assert.equal(completed.ok, true);
  assert.equal(harness.runtime.isPublicAccessMode(), true);
  assert.equal(requests.filter(request => request.url === "/api/validate-access-code").length, 2);
  assert.equal(requests.some(request => request.url === "/api/use-token"), false);
});

await test("public access rejection clears the stored code", async () => {
  const session = createSession({ publicAccessCode: "CLOSED" });
  const harness = createHarness({
    search: "",
    session,
    fetchImpl: async () => response(false, {
      success: false,
      message: "公共测试入口当前已关闭。"
    })
  });

  assert.equal((await harness.runtime.initialize()).ok, false);
  assert.equal(session.getItem("publicAccessCode"), null);
});

await test("Platform Runtime does not interpret product-private payload fields", () => {
  const source = readFileSync(
    resolve(testDirectory, "../../js/platform/runtime.js"),
    "utf8"
  );

  assert.doesNotMatch(source, /primaryHits|primaryHistory|personality|factorScores|severity/);
  assert.match(source, /resultData: resultPayload/);
});

console.log(`${passed}/12 PASS`);
