(function initializeTestProductRegistry(global, factory) {
  "use strict";

  const contract =
    typeof module !== "undefined" && module.exports
      ? require("./product-contract.js")
      : global.ProductContract;
  const registry = factory(contract);

  if (typeof module !== "undefined" && module.exports) {
    module.exports = registry;
  }

  if (global) {
    global.TestProductRegistry = registry;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function createTestProductRegistry(contract) {
  "use strict";

  if (!contract) {
    throw new Error("ProductContract must be loaded before TestProductRegistry.");
  }

  const products = new Map();

  function registerProduct(product) {
    contract.validateProduct(product);

    if (products.has(product.test_id)) {
      throw new Error(`Product is already registered: ${product.test_id}`);
    }

    const registeredProduct = Object.freeze(product);
    products.set(registeredProduct.test_id, registeredProduct);
    return registeredProduct;
  }

  function getProduct(testId) {
    if (typeof testId !== "string") {
      return null;
    }

    return products.get(testId) || null;
  }

  function listProducts() {
    return Array.from(products.values());
  }

  return Object.freeze({
    registerProduct,
    getProduct,
    listProducts
  });
});
