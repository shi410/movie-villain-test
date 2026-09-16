(function initializeScl90PlatformBridge(global, factory) {
  "use strict";

  const bridge = factory(global);

  if (typeof module !== "undefined" && module.exports) {
    module.exports = bridge;
  }

  if (global) {
    global.Scl90PlatformBridge = bridge;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function createBridge(global) {
  "use strict";

  const TEST_ID = "scl90";

  function ensureProductRegistered() {
    if (
      !global.TestRegistry ||
      !global.TestProductRegistry ||
      !global.PlatformRuntime ||
      !global.Scl90Product
    ) {
      throw new Error("SCL-90 Platform Runtime 依赖加载失败。");
    }

    const current = global.TestProductRegistry.getProduct(TEST_ID);
    return current || global.TestProductRegistry.registerProduct(global.Scl90Product);
  }

  function createRuntime(options = {}) {
    ensureProductRegistered();
    return global.PlatformRuntime.createRuntime({
      ...options,
      testId: TEST_ID,
      productRegistry: global.TestProductRegistry,
      testRegistry: global.TestRegistry
    });
  }

  function isLocalDevelopment(location = global.location) {
    const hostname = location?.hostname;
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]";
  }

  function pathWithToken(path, search = global.location?.search || "") {
    const token = new URLSearchParams(search).get("token");
    if (!token) return path;

    const separator = path.includes("?") ? "&" : "?";
    return `${path}${separator}token=${encodeURIComponent(token)}`;
  }

  return Object.freeze({
    TEST_ID,
    ensureProductRegistered,
    createRuntime,
    isLocalDevelopment,
    pathWithToken
  });
});
