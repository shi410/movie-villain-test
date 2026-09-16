const test = require("node:test");
const assert = require("node:assert/strict");
const store = require("../../../scl90/js/session-answer-store.js");

function memoryStorage() {
  const values = new Map();
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); }
  };
}

function snapshot(answer, current) {
  const answers = Array(90).fill(null);
  answers[current - 1] = answer;
  return { answers, current };
}

test("answer drafts round-trip within one Token scope", () => {
  const storage = memoryStorage();
  const value = snapshot(3, 18);
  store.save(storage, "token:scl-a", value);
  assert.deepEqual(store.load(storage, "token:scl-a"), value);
});

test("different Tokens cannot read each other's drafts", () => {
  const storage = memoryStorage();
  store.save(storage, "token:scl-a", snapshot(2, 7));
  assert.equal(store.load(storage, "token:scl-b"), null);
});

test("completed flow can clear its Token draft", () => {
  const storage = memoryStorage();
  store.save(storage, "token:scl-a", snapshot(5, 90));
  store.clear(storage, "token:scl-a");
  assert.equal(store.load(storage, "token:scl-a"), null);
});

test("invalid or incomplete answer drafts are rejected", () => {
  const storage = memoryStorage();
  assert.throws(() => store.save(storage, "token:scl-a", { answers: [1], current: 1 }));
  assert.throws(() => store.save(storage, "token:scl-a", {
    answers: Array(90).fill(6),
    current: 1
  }));
  assert.throws(() => store.keyFor(""));
});
