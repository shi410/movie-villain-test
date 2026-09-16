"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const factorLevels = require("../factor-levels.js");

const cases = [
  [1.99, "normal", "状态平稳"],
  [2.0, "mild", "有些困扰"],
  [2.49, "mild", "有些困扰"],
  [2.5, "moderate", "困扰较明显"],
  [2.99, "moderate", "困扰较明显"],
  [3.0, "severe", "困扰突出"]
];

cases.forEach(([mean, expectedLevel, expectedStatus]) => {
  test(`classifies factor mean ${mean} as ${expectedLevel}`, () => {
    const classification = factorLevels.classify(mean);
    assert.equal(classification.level, expectedLevel);
    assert.equal(classification.statusLabel, expectedStatus);
  });
});

test("rejects non-finite factor means", () => {
  assert.throws(() => factorLevels.classify(Number.NaN));
  assert.throws(() => factorLevels.classify(Number.POSITIVE_INFINITY));
  assert.throws(() => factorLevels.classify("2.5"));
});
