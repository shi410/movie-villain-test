"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const ProductContract = require("../../../js/platform/product-contract.js");
const product = require("../product.js");

test("SCL-90 product satisfies Product Contract V1", () => {
  assert.equal(ProductContract.validateProduct(product), product);
  assert.equal(product.test_id, "scl90");
});

test("getResultType stays stable across payload schema versions", () => {
  assert.equal(product.getResultType(product.score(Array(90).fill(1))), "scl90-report");
  assert.equal(
    product.getResultType({ schemaVersion: 2, testId: "scl90", migrated: true }),
    "scl90-report"
  );
});

test("minimal renderer consumes only payload and context", () => {
  const payload = product.score(Array(90).fill(1));
  const context = Object.freeze({ testOnly: true });
  const rendered = product.renderReport(payload, context);
  assert.equal(rendered.kind, "scl90-report");
  assert.equal(rendered.resultPayload, payload);
  assert.equal(rendered.context, context);
});
