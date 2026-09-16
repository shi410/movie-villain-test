"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const ProductContract = require("../../../js/platform/product-contract.js");
const product = require("../product.js");
const validators = require("../validators.js");

test("score returns the approved serializable payload shape", () => {
  const payload = product.score(Array(90).fill(1));
  const restored = JSON.parse(JSON.stringify(payload));
  assert.equal(ProductContract.assertSerializableResultPayload(payload), payload);
  assert.equal(validators.validateCurrentResultPayload(restored), restored);
  assert.equal(restored.schemaVersion, 1);
  assert.equal(restored.testId, "scl90");
  assert.deepEqual(Object.keys(restored.factors), [
    "somatization",
    "obsessiveCompulsive",
    "interpersonalSensitivity",
    "depression",
    "anxiety",
    "hostility",
    "phobicAnxiety",
    "paranoidIdeation",
    "psychoticism"
  ]);
  assert.ok(restored.additional);
  assert.equal("answers" in restored, false);
  assert.equal("profile" in restored, false);
});

test("returns all Step 03 policies as complete", () => {
  const payload = product.score(Array(90).fill(5));
  assert.deepEqual(payload.total, {
    score: 450,
    mean: 5,
    level: "severe",
    statusLabel: "困扰突出",
    classificationStatus: "complete"
  });
  assert.deepEqual(payload.screening, {
    overallPositive: true,
    triggeredRules: [
      "total_score_gt_160", "global_mean_gt_2", "positive_items_gt_43", "negative_items_lt_47",
      "positive_symptom_mean_gt_2", "factor_mean_gt_2:somatization", "factor_mean_gt_2:obsessiveCompulsive",
      "factor_mean_gt_2:interpersonalSensitivity", "factor_mean_gt_2:depression", "factor_mean_gt_2:anxiety",
      "factor_mean_gt_2:hostility", "factor_mean_gt_2:phobicAnxiety", "factor_mean_gt_2:paranoidIdeation",
      "factor_mean_gt_2:psychoticism", "factor_mean_gt_2:additional"
    ],
    status: "complete"
  });
  assert.deepEqual(payload.report, {
    highlightFactorIds: ["somatization", "obsessiveCompulsive", "interpersonalSensitivity"],
    highlightStatus: "complete",
    closingVariant: "closing-severe"
  });
  assert.deepEqual(payload.safety, { status: "complete", flags: ["self_harm_thoughts", "death_related_thoughts", "harm_to_others_urge"] });
});

test("private payload validation rejects unsupported JSON values", () => {
  assert.throws(() => validators.validateResultPayloadIdentity({ testId: "scl90", invalid: undefined }));
  assert.throws(() => validators.validateResultPayloadIdentity({ testId: "scl90", invalid: () => true }));
  assert.throws(() => validators.validateResultPayloadIdentity({ testId: "scl90", invalid: new Date() }));
  const circular = { testId: "scl90" };
  circular.self = circular;
  assert.throws(() => validators.validateResultPayloadIdentity(circular));
});
