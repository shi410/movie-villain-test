import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const require = createRequire(import.meta.url);
const testDirectory = dirname(fileURLToPath(import.meta.url));
const contract = require("../../js/platform/product-contract.js");

function freshRegistry() {
  const registryPath = require.resolve("../../js/platform/product-registry.js");
  delete require.cache[registryPath];
  return require(registryPath);
}

const villainAdapter = require("../villain/product.js");

let passed = 0;

function test(name, callback) {
  try {
    callback();
    passed += 1;
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

function createValidProduct(testId = "example-test") {
  return {
    test_id: testId,
    score: answers => ({ answers }),
    getResultType: () => "example-result",
    renderReport: () => undefined
  };
}

test("valid Product passes Contract V1", () => {
  const product = createValidProduct();
  assert.equal(contract.validateProduct(product), product);
});

test("missing test_id fails", () => {
  const product = createValidProduct();
  delete product.test_id;
  assert.throws(() => contract.validateProduct(product), /test_id/);
});

test("unstable test_id fails", () => {
  assert.throws(
    () => contract.validateProduct(createValidProduct("SCL_90")),
    /stable lowercase identifier/
  );
});

test("missing score fails", () => {
  const product = createValidProduct();
  delete product.score;
  assert.throws(() => contract.validateProduct(product), /score/);
});

test("missing getResultType fails", () => {
  const product = createValidProduct();
  delete product.getResultType;
  assert.throws(() => contract.validateProduct(product), /getResultType/);
});

test("missing renderReport fails", () => {
  const product = createValidProduct();
  delete product.renderReport;
  assert.throws(() => contract.validateProduct(product), /renderReport/);
});

test("serializable resultPayload passes and circular payload fails", () => {
  const payload = { score: { villain: 2 } };
  assert.equal(contract.assertSerializableResultPayload(payload), payload);

  const circular = {};
  circular.self = circular;
  assert.throws(
    () => contract.assertSerializableResultPayload(circular),
    /JSON serializable/
  );
});

test("registry retrieves products by test_id without product-specific branches", () => {
  const registry = freshRegistry();
  const alpha = createValidProduct("alpha");
  const beta = createValidProduct("beta");

  const registeredAlpha = registry.registerProduct(alpha);
  registry.registerProduct(beta);

  assert.equal(Object.isFrozen(registeredAlpha), true);
  assert.equal(registry.getProduct("alpha"), alpha);
  assert.equal(registry.getProduct("beta"), beta);
  assert.equal(registry.getProduct("missing"), null);
  assert.deepEqual(registry.listProducts(), [alpha, beta]);
  assert.throws(() => registry.registerProduct(alpha), /already registered/);
});

test("Contract and registry load as classic browser scripts", () => {
  const context = vm.createContext({});
  const contractSource = readFileSync(
    resolve(testDirectory, "../../js/platform/product-contract.js"),
    "utf8"
  );
  const registrySource = readFileSync(
    resolve(testDirectory, "../../js/platform/product-registry.js"),
    "utf8"
  );

  vm.runInContext(contractSource, context);
  vm.runInContext(registrySource, context);

  assert.equal(context.ProductContract.version, 1);
  assert.equal(typeof context.TestProductRegistry.getProduct, "function");
});

test("villain adapter delegates without changing opaque payload", () => {
  const historicalPayload = {
    score: { joker: 10 },
    primaryHits: { joker: 4 },
    primaryHistory: ["joker"]
  };
  const calls = [];
  const product = villainAdapter.createVillainProduct({
    score(answers) {
      calls.push(["score", answers]);
      return historicalPayload;
    },
    getResultType(payload) {
      calls.push(["getResultType", payload]);
      return "joker";
    },
    renderReport(payload, context) {
      calls.push(["renderReport", payload, context]);
      return "rendered";
    }
  });

  const answers = [1, 2, 3];
  const context = { resultType: "joker" };

  assert.equal(product.test_id, "villain");
  assert.equal(product.score(answers), historicalPayload);
  assert.equal(product.getResultType(historicalPayload), "joker");
  assert.equal(product.renderReport(historicalPayload, context), "rendered");
  assert.deepEqual(calls, [
    ["score", answers],
    ["getResultType", historicalPayload],
    ["renderReport", historicalPayload, context]
  ]);
  assert.deepEqual(Object.keys(historicalPayload), [
    "score",
    "primaryHits",
    "primaryHistory"
  ]);
});

console.log(`${passed}/10 PASS`);
