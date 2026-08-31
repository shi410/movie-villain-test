(function initializeVillainProductAdapter(global, factory) {
  "use strict";

  const contract =
    typeof module !== "undefined" && module.exports
      ? require("../../js/platform/product-contract.js")
      : global.ProductContract;
  const adapter = factory(contract);

  if (typeof module !== "undefined" && module.exports) {
    module.exports = adapter;
  }

  if (global) {
    global.VillainProductAdapter = adapter;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function createVillainAdapterModule(contract) {
  "use strict";

  if (!contract) {
    throw new Error("ProductContract must be loaded before VillainProductAdapter.");
  }

  const REQUIRED_BRIDGE_METHODS = Object.freeze([
    "score",
    "getResultType",
    "renderReport"
  ]);

  function createVillainProduct(legacyBridge) {
    if (!legacyBridge || typeof legacyBridge !== "object") {
      throw new TypeError("Villain legacy bridge must be an object.");
    }

    REQUIRED_BRIDGE_METHODS.forEach(methodName => {
      if (typeof legacyBridge[methodName] !== "function") {
        throw new TypeError(`Villain legacy bridge must implement ${methodName}().`);
      }
    });

    const product = Object.freeze({
      test_id: "villain",

      score(answers) {
        const resultPayload = legacyBridge.score(answers);
        return contract.assertSerializableResultPayload(resultPayload);
      },

      getResultType(resultPayload) {
        return legacyBridge.getResultType(resultPayload);
      },

      renderReport(resultPayload, context) {
        return legacyBridge.renderReport(resultPayload, context);
      }
    });

    contract.validateProduct(product);
    return product;
  }

  return Object.freeze({
    createVillainProduct
  });
});
