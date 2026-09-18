(function routeLegacyEntry() {
  "use strict";
  const params = new URLSearchParams(window.location.search);
  // Historical root Token URLs belong to villain, even when empty or invalid.
  // Never infer a different product from a query: Runtime enforces identity.
  if (params.has("token") || params.get("test") === "villain") {
    window.location.replace("/villain.html" + window.location.search + window.location.hash);
  }
})();
