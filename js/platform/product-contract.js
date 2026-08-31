(function initializeProductContract(global, factory) {
  "use strict";

  const contract = factory();

  if (typeof module !== "undefined" && module.exports) {
    module.exports = contract;
  }

  if (global) {
    global.ProductContract = contract;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function createProductContract() {
  "use strict";

  const TEST_ID_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
  const REQUIRED_METHODS = Object.freeze([
    "score",
    "getResultType",
    "renderReport"
  ]);

  function assertTestId(testId) {
    if (typeof testId !== "string" || !TEST_ID_PATTERN.test(testId)) {
      throw new TypeError(
        "Product test_id must be a stable lowercase identifier using letters, numbers, and single hyphens."
      );
    }

    return testId;
  }

  function validateProduct(product) {
    if (!product || typeof product !== "object" || Array.isArray(product)) {
      throw new TypeError("Product must be an object.");
    }

    assertTestId(product.test_id);

    REQUIRED_METHODS.forEach(methodName => {
      if (typeof product[methodName] !== "function") {
        throw new TypeError(`Product ${product.test_id} must implement ${methodName}().`);
      }
    });

    return product;
  }

  function assertSerializableResultPayload(resultPayload) {
    if (resultPayload === undefined) {
      throw new TypeError("resultPayload must not be undefined.");
    }

    let serialized;

    try {
      serialized = JSON.stringify(resultPayload);
    } catch (error) {
      throw new TypeError(`resultPayload must be JSON serializable: ${error.message}`);
    }

    if (serialized === undefined) {
      throw new TypeError("resultPayload must be JSON serializable.");
    }

    return resultPayload;
  }

  return Object.freeze({
    version: 1,
    requiredMethods: REQUIRED_METHODS,
    assertTestId,
    validateProduct,
    assertSerializableResultPayload
  });
});
