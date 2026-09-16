(function initializeScl90Product(global, factory) {
  "use strict";
  const commonJs = typeof module !== "undefined" && module.exports;
  const product = factory(
    commonJs ? require("../../js/platform/product-contract.js") : global.ProductContract,
    commonJs ? require("./validators.js") : global.Scl90Validators,
    commonJs ? require("./scoring.js") : global.Scl90Scoring,
    commonJs ? require("./report-renderer.js") : global.Scl90ReportRenderer
  );
  if (commonJs) module.exports = product;
  if (global) global.Scl90Product = product;
})(typeof globalThis !== "undefined" ? globalThis : this, function createProduct(
  ProductContract,
  validators,
  scoring,
  reportRenderer
) {
  "use strict";
  function score(answers) {
    const resultPayload = scoring.score(answers);
    ProductContract.assertSerializableResultPayload(resultPayload);
    return resultPayload;
  }
  function getResultType(resultPayload) {
    validators.validateResultPayloadIdentity(resultPayload);
    ProductContract.assertSerializableResultPayload(resultPayload);
    return "scl90-report";
  }
  const product = Object.freeze({
    test_id: "scl90",
    score,
    getResultType,
    renderReport(resultPayload, context = {}) {
      const rendered = reportRenderer.renderReport(resultPayload, context);

      if (
        context.reportRoot &&
        typeof context.reportRoot.replaceChildren === "function" &&
        rendered &&
        typeof rendered === "object"
      ) {
        context.reportRoot.replaceChildren(rendered);
      }

      return rendered;
    }
  });
  return ProductContract.validateProduct(product);
});
