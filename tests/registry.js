(function initializeTestRegistry(global) {
  "use strict";

  const tests = new Map();
  const requiredFields = [
    "test_id",
    "name",
    "slug",
    "description",
    "enabled",
    "entryPath",
    "publicAccessPath"
  ];

  function register(manifest) {
    if (!manifest || typeof manifest !== "object") {
      throw new TypeError("Test manifest must be an object.");
    }

    requiredFields.forEach(field => {
      if (manifest[field] === undefined || manifest[field] === null || manifest[field] === "") {
        throw new Error(`Test manifest is missing required field: ${field}`);
      }
    });

    if (typeof manifest.enabled !== "boolean") {
      throw new TypeError("Test manifest enabled must be a boolean.");
    }

    if (tests.has(manifest.test_id)) {
      throw new Error(`Test is already registered: ${manifest.test_id}`);
    }

    const registeredManifest = Object.freeze({ ...manifest });
    tests.set(registeredManifest.test_id, registeredManifest);

    return registeredManifest;
  }

  function get(testId) {
    return tests.get(testId) || null;
  }

  function list() {
    return Array.from(tests.values());
  }

  function isEnabled(testId) {
    return get(testId)?.enabled === true;
  }

  if (!global.TestDefinitions) {
    throw new Error("TestDefinitions must be loaded before TestRegistry.");
  }

  global.TestDefinitions.list().forEach(register);

  global.TestRegistry = Object.freeze({
    register,
    get,
    list,
    isEnabled
  });
})(globalThis);
