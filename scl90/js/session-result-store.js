(function initializeScl90SessionResultStore(global, factory) {
  "use strict";

  const store = factory();

  if (typeof module !== "undefined" && module.exports) {
    module.exports = store;
  }

  if (global) {
    global.Scl90SessionResultStore = store;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function createStore() {
  "use strict";

  const KEY = "scl90.session.result.v1";

  function save(storage, payload) {
    const json = JSON.stringify(payload);
    storage.setItem(KEY, json);
    return json;
  }

  function load(storage) {
    const json = storage.getItem(KEY);
    return json ? JSON.parse(json) : null;
  }

  function clear(storage) {
    storage.removeItem(KEY);
  }

  return Object.freeze({ KEY, save, load, clear });
});
