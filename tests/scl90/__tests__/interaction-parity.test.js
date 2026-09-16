"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const questions = require("../content/questions-content.js");
const definitions = require("../factor-definitions.js");
const flow = require("../../../scl90/js/test-flow.js");

function setup(questionNumber = 1) {
  const session = flow.createSession(questions.items);
  session.go(questionNumber);
  const pending = [];
  let selected = 0;
  let advanced = 0;
  const transition = flow.createAnswerTransition({
    session,
    lastQuestion: 90,
    schedule(callback, delay) { pending.push({ callback, delay }); },
    onSelected() { selected += 1; },
    onAdvance() { advanced += 1; }
  });
  return { session, transition, pending, selected: () => selected, advanced: () => advanced };
}

test("Q1 selection records feedback then automatically advances to Q2", () => {
  const state = setup(1);
  assert.equal(state.transition.select(2), true);
  assert.equal(state.session.current, 1);
  assert.equal(state.session.answers[0], 2);
  assert.equal(state.selected(), 1);
  assert.equal(state.pending[0].delay, 280);
  state.pending[0].callback();
  assert.equal(state.session.current, 2);
  assert.equal(state.advanced(), 1);
});

test("Q89 selection automatically advances to Q90", () => {
  const state = setup(89);
  state.transition.select(3);
  state.pending[0].callback();
  assert.equal(state.session.current, 90);
  assert.equal(state.session.answers[88], 3);
});

test("Q90 selection records the answer without scheduling advance or submit", () => {
  const state = setup(90);
  state.transition.select(4);
  assert.equal(state.session.current, 90);
  assert.equal(state.session.answers[89], 4);
  assert.equal(state.pending.length, 0);
  assert.equal(state.transition.locked, false);
});

test("rapid repeated selection is transition-locked and cannot skip a question", () => {
  const state = setup(1);
  assert.equal(state.transition.select(2), true);
  assert.equal(state.transition.select(5), false);
  assert.equal(state.pending.length, 1);
  state.pending[0].callback();
  assert.equal(state.session.current, 2);
  assert.equal(state.session.answers[0], 2);
});

test("returning to an old question updates its answer and advances only once", () => {
  const state = setup(12);
  state.session.answer(1);
  state.session.go(11);
  state.session.answer(2);
  state.session.go(12);
  state.transition.select(5);
  state.pending[0].callback();
  assert.equal(state.session.answers[11], 5);
  assert.equal(state.session.current, 13);
});

test("direct navigation resolves the synchronized current factor label", () => {
  const session = flow.createSession(questions.items);
  session.go(69);
  assert.equal(flow.getFactorDefinition(definitions, session.current).displayLabel, "人际关系敏感");
  session.go(70);
  assert.equal(flow.getFactorDefinition(definitions, session.current).displayLabel, "恐怖");
});

test("every Q1-Q90 maps to exactly one factor definition and display label", () => {
  for (let number = 1; number <= 90; number += 1) {
    const matches = definitions.filter((definition) => definition.itemNumbers.includes(number));
    assert.equal(matches.length, 1, `Q${number}`);
    assert.equal(flow.getFactorDefinition(definitions, number), matches[0]);
    assert.match(matches[0].displayLabel, /\S/);
  }
});

test("all seven additional items use the 其他 label", () => {
  const expected = [19, 44, 59, 60, 64, 66, 89];
  assert.deepEqual(definitions.find((definition) => definition.id === "additional").itemNumbers, expected);
  expected.forEach((number) => assert.equal(flow.getFactorDefinition(definitions, number).displayLabel, "其他"));
});

test("auto advance keeps numerical progress synchronized", () => {
  const state = setup(37);
  state.transition.select(1);
  state.pending[0].callback();
  assert.equal(state.session.current, 38);
  assert.equal(`${state.session.current} / 90`, "38 / 90");
});

test("auto advance keeps the answered navigation state synchronized", () => {
  const state = setup(37);
  state.transition.select(1);
  state.pending[0].callback();
  assert.equal(state.session.isAnswered(37), true);
  assert.equal(state.session.isAnswered(38), false);
});

test("transition lock releases exactly when the scheduled advance completes", () => {
  const state = setup(4);
  state.transition.select(3);
  assert.equal(state.transition.locked, true);
  state.pending[0].callback();
  assert.equal(state.transition.locked, false);
});

test("session reports the precise unanswered count for last-question warning", () => {
  const session = flow.createSession(questions.items);
  for (let number = 1; number <= 90; number += 1) {
    if (number !== 42) {
      session.go(number);
      session.answer(1);
    }
  }
  assert.equal(session.current, 90);
  assert.equal(session.unansweredCount(), 1);
  assert.equal(session.firstUnanswered(), 42);
});

test("automatic timing constants stay within the reviewed experience windows", () => {
  assert.ok(flow.AUTO_ADVANCE_DELAY_MS >= 200 && flow.AUTO_ADVANCE_DELAY_MS <= 350);
  assert.ok(flow.LOADING_STAGE_DELAY_MS >= 500);
});
