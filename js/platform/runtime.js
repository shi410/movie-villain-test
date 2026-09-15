(function initializePlatformRuntime(global, factory) {
  "use strict";

  const contract =
    typeof module !== "undefined" && module.exports
      ? require("./product-contract.js")
      : global.ProductContract;
  const runtimeModule = factory(contract);

  if (typeof module !== "undefined" && module.exports) {
    module.exports = runtimeModule;
  }

  if (global) {
    global.PlatformRuntime = runtimeModule;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function createRuntimeModule(contract) {
  "use strict";

  if (!contract) {
    throw new Error("ProductContract must be loaded before PlatformRuntime.");
  }

  function createRuntime(options) {
    if (!options || typeof options !== "object") {
      throw new TypeError("Platform Runtime options are required.");
    }

    const testId = contract.assertTestId(options.testId);
    const registry = options.productRegistry;
    const testRegistry = options.testRegistry;
    const fetchImpl = options.fetchImpl || globalThis.fetch?.bind(globalThis);
    const sessionStore = options.sessionStore || globalThis.sessionStorage;
    const getLocationSearch = options.getLocationSearch || (() => globalThis.location?.search || "");
    const onError = typeof options.onError === "function" ? options.onError : () => {};
    const reportContext = options.reportContext && typeof options.reportContext === "object"
      ? options.reportContext
      : {};

    if (!registry || typeof registry.getProduct !== "function") {
      throw new TypeError("Platform Runtime requires a Product Registry.");
    }

    if (
      !testRegistry ||
      typeof testRegistry.get !== "function" ||
      typeof testRegistry.isEnabled !== "function"
    ) {
      throw new TypeError("Platform Runtime requires a Test Registry.");
    }

    if (typeof fetchImpl !== "function") {
      throw new TypeError("Platform Runtime requires fetch().");
    }

    if (!sessionStore || typeof sessionStore.getItem !== "function") {
      throw new TypeError("Platform Runtime requires session storage.");
    }

    const product = registry.getProduct(testId);

    if (!product) {
      throw new Error(`Product is not registered: ${testId}`);
    }

    contract.validateProduct(product);

    if (product.test_id !== testId) {
      throw new Error("Registered Product identity does not match Runtime test_id.");
    }

    let currentToken = null;
    let tokenUsed = false;
    let publicAccessMode = false;

    function fail(message) {
      onError(message);
      return Object.freeze({ ok: false, message });
    }

    async function readJson(response) {
      try {
        return await response.json();
      } catch (error) {
        throw new Error("服务器返回了无法读取的数据。");
      }
    }

    async function validatePublicAccessCode(accessCode) {
      try {
        const response = await fetchImpl("/api/validate-access-code", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ accessCode })
        });
        const data = await readJson(response);

        if (!response.ok || !data.success) {
          sessionStore.removeItem("publicAccessCode");
          return fail(data.message || "公共授权已失效。");
        }

        return Object.freeze({ ok: true });
      } catch (error) {
        return fail("公共授权验证失败，请稍后重试。");
      }
    }

    async function initialize() {
      const params = new URLSearchParams(getLocationSearch());
      currentToken = params.get("token");

      if (!currentToken) {
        const testDefinition = testRegistry.get(testId);

        if (!testDefinition || testRegistry.isEnabled(testId) !== true) {
          return fail("该测试当前尚未开放。");
        }

        const publicAccessCode = sessionStore.getItem("publicAccessCode");

        if (!publicAccessCode) {
          return fail("请使用购买后获得的专属链接，或通过公共授权入口进入测试。");
        }

        const accessResult = await validatePublicAccessCode(publicAccessCode);

        if (!accessResult.ok) {
          return accessResult;
        }

        publicAccessMode = true;

        return Object.freeze({
          ok: true,
          completed: false,
          mode: "public",
          testId
        });
      }

      try {
        const params = new URLSearchParams({
          token: currentToken,
          expectedTestId: testId
        });
        const response = await fetchImpl(`/api/validate-token?${params.toString()}`);
        const data = await readJson(response);

        if (!response.ok || !data.valid) {
          return fail(data.message || "链接无效或已使用。");
        }

        if (data.testId !== testId) {
          return fail("该链接不适用于当前测试。");
        }

        if (!data.completed) {
          return Object.freeze({
            ok: true,
            completed: false,
            mode: "token",
            testId
          });
        }

        if (!data.resultType || data.resultData === undefined) {
          return fail("历史测试结果读取失败，请联系客服。");
        }

        try {
          contract.assertSerializableResultPayload(data.resultData);
          product.renderReport(data.resultData, {
            ...reportContext,
            testId,
            resultType: data.resultType,
            mode: "token",
            completed: true
          });
        } catch (error) {
          return fail("历史测试结果读取失败，请联系客服。");
        }
        tokenUsed = true;

        return Object.freeze({
          ok: true,
          completed: true,
          mode: "token",
          testId,
          resultType: data.resultType,
          resultPayload: data.resultData
        });
      } catch (error) {
        return fail("链接验证失败，请稍后重试。");
      }
    }

    async function authorizePublicEntry() {
      if (!publicAccessMode) {
        return Object.freeze({ ok: true });
      }

      const publicAccessCode = sessionStore.getItem("publicAccessCode");

      if (!publicAccessCode) {
        return fail("公共授权已失效，请重新通过授权入口进入测试。");
      }

      return validatePublicAccessCode(publicAccessCode);
    }

    async function complete(answers, context = {}) {
      let resultPayload;
      let resultType;

      try {
        resultPayload = product.score(answers);
        contract.assertSerializableResultPayload(resultPayload);
        resultType = product.getResultType(resultPayload);

        if (typeof resultType !== "string" || !resultType) {
          throw new TypeError("Product getResultType() must return a non-empty string.");
        }

        product.renderReport(resultPayload, {
          ...reportContext,
          ...context,
          testId,
          resultType,
          mode: publicAccessMode ? "public" : "token",
          completed: false
        });
      } catch (error) {
        return fail("测试结果生成失败，请联系客服。");
      }

      if (!currentToken || tokenUsed) {
        return Object.freeze({
          ok: true,
          testId,
          resultType,
          resultPayload
        });
      }

      try {
        const response = await fetchImpl("/api/use-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            token: currentToken,
            resultType,
            resultData: resultPayload,
            testId
          })
        });
        const data = await readJson(response);

        if (!response.ok || !data.success) {
          return fail(data.message || "链接核销失败，请联系客服。");
        }

        tokenUsed = true;

        return Object.freeze({
          ok: true,
          testId,
          resultType,
          resultPayload
        });
      } catch (error) {
        return fail("链接核销失败，请联系客服。");
      }
    }

    function isPublicAccessMode() {
      return publicAccessMode;
    }

    return Object.freeze({
      initialize,
      authorizePublicEntry,
      complete,
      isPublicAccessMode
    });
  }

  return Object.freeze({
    createRuntime
  });
});
