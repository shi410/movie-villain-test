"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const scoring = require("../scoring.js");
const factorDefinitions = require("../factor-definitions.js");
const validators = require("../validators.js");

test("accepts exactly ninety integer answers from 1 through 5", () => {
  assert.doesNotThrow(() => scoring.score(Array(90).fill(1)));
  const invalidCases = [
    Array(89).fill(1),
    Array(91).fill(1),
    Object.assign(Array(90).fill(1), { 0: "1" }),
    Object.assign(Array(90).fill(1), { 0: 0 }),
    Object.assign(Array(90).fill(1), { 0: 6 }),
    Object.assign(Array(90).fill(1), { 0: 1.5 }),
    Object.assign(Array(90).fill(1), { 0: Number.NaN })
  ];
  invalidCases.forEach(answers => assert.throws(() => scoring.score(answers)));
  assert.throws(() => scoring.score(undefined));
  assert.throws(() => scoring.score(null));
});

test("computes minimum total and empty positive symptom mean", () => {
  const result = scoring.score(Array(90).fill(1));
  assert.equal(result.total.score, 90);
  assert.equal(result.total.mean, 1);
  assert.equal(result.symptoms.positiveItemCount, 0);
  assert.equal(result.symptoms.negativeItemCount, 90);
  assert.equal(result.symptoms.positiveSymptomMean, null);
});

test("computes maximum total and positive symptom counts", () => {
  const result = scoring.score(Array(90).fill(5));
  assert.equal(result.total.score, 450);
  assert.equal(result.total.mean, 5);
  assert.equal(result.symptoms.positiveItemCount, 90);
  assert.equal(result.symptoms.negativeItemCount, 0);
  assert.equal(result.symptoms.positiveSymptomMean, 5);
});

test("uses the frozen positive symptom mean formula", () => {
  const answers = Array(90).fill(1);
  answers[0] = 2;
  answers[1] = 5;
  const result = scoring.score(answers);
  assert.equal(result.total.score, 95);
  assert.equal(result.symptoms.positiveItemCount, 2);
  assert.equal(result.symptoms.negativeItemCount, 88);
  assert.equal(result.symptoms.positiveSymptomMean, 3.5);
});

test("validates all ten frozen factor mappings", () => {
  const expectedMappings = {
    somatization: [1, 4, 12, 27, 40, 42, 48, 49, 52, 53, 56, 58],
    obsessiveCompulsive: [3, 9, 10, 28, 38, 45, 46, 51, 55, 65],
    interpersonalSensitivity: [6, 21, 34, 36, 37, 41, 61, 69, 73],
    depression: [5, 14, 15, 20, 22, 26, 29, 30, 31, 32, 54, 71, 79],
    anxiety: [2, 17, 23, 33, 39, 57, 72, 78, 80, 86],
    hostility: [11, 24, 63, 67, 74, 81],
    phobicAnxiety: [13, 25, 47, 50, 70, 75, 82],
    paranoidIdeation: [8, 18, 43, 68, 76, 83],
    psychoticism: [7, 16, 35, 62, 77, 84, 85, 87, 88, 90],
    additional: [19, 44, 59, 60, 64, 66, 89]
  };
  assert.equal(validators.validateFactorDefinitions(factorDefinitions), factorDefinitions);
  factorDefinitions.forEach(definition => {
    assert.deepEqual(definition.itemNumbers, expectedMappings[definition.id]);
    assert.equal(definition.itemCount, expectedMappings[definition.id].length);
    assert.ok(definition.itemNumbers.every(number => number >= 1 && number <= 90));
  });
  const core = factorDefinitions.filter(definition => definition.id !== "additional");
  const additional = factorDefinitions.find(definition => definition.id === "additional");
  assert.equal(core.length, 9);
  assert.ok(core.every(definition => definition.includeInRadar === true));
  assert.equal(additional.includeInRadar, false);
});

test("factor scoring explicitly uses questionNumber minus one", () => {
  const answers = Array(90).fill(1);
  answers[0] = 5;
  const result = scoring.score(answers);
  assert.equal(result.factors.somatization.rawScore, 16);
  assert.equal(result.factors.somatization.mean, 16 / 12);
  assert.equal(result.factors.anxiety.rawScore, 10);
});
