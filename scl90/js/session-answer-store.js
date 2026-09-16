(function initializeScl90SessionAnswerStore(global, factory) {
  "use strict";

  const store = factory();

  if (typeof module !== "undefined" && module.exports) {
    module.exports = store;
  }

  if (global) {
    global.Scl90SessionAnswerStore = store;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function createSessionAnswerStore() {
  "use strict";

  const KEY_PREFIX = "scl90.session.answers.v1";
  const ANSWER_COUNT = 90;

  function keyFor(scope) {
    if (typeof scope !== "string" || !scope) {
      throw new TypeError("SCL-90 answer draft requires a non-empty scope.");
    }

    return `${KEY_PREFIX}:${encodeURIComponent(scope)}`;
  }

  function validateSnapshot(snapshot) {
    if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) {
      throw new TypeError("SCL-90 answer draft must be an object.");
    }

    if (!Array.isArray(snapshot.answers) || snapshot.answers.length !== ANSWER_COUNT) {
      throw new TypeError("SCL-90 answer draft must contain 90 answer positions.");
    }

    snapshot.answers.forEach((answer, index) => {
      if (answer !== null && (!Number.isInteger(answer) || answer < 1 || answer > 5)) {
        throw new TypeError(`SCL-90 answer draft Q${index + 1} is invalid.`);
      }
    });

    if (!Number.isInteger(snapshot.current) || snapshot.current < 1 || snapshot.current > ANSWER_COUNT) {
      throw new TypeError("SCL-90 answer draft current question is invalid.");
    }

    return {
      answers: snapshot.answers.slice(),
      current: snapshot.current
    };
  }

  function save(storage, scope, snapshot) {
    const value = validateSnapshot(snapshot);
    storage.setItem(keyFor(scope), JSON.stringify(value));
    return value;
  }

  function load(storage, scope) {
    const raw = storage.getItem(keyFor(scope));
    if (!raw) return null;
    return validateSnapshot(JSON.parse(raw));
  }

  function clear(storage, scope) {
    storage.removeItem(keyFor(scope));
  }

  return Object.freeze({
    KEY_PREFIX,
    keyFor,
    save,
    load,
    clear
  });
});
