(function initializeScl90FactorLevels(global, factory) {
  "use strict";

  const factorLevels = factory();

  if (typeof module !== "undefined" && module.exports) {
    module.exports = factorLevels;
  }

  if (global) {
    global.Scl90FactorLevels = factorLevels;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function createFactorLevels() {
  "use strict";

  const levels = Object.freeze({
    normal: Object.freeze({ level: "normal", label: "正常", statusLabel: "状态平稳" }),
    mild: Object.freeze({ level: "mild", label: "轻度", statusLabel: "有些困扰" }),
    moderate: Object.freeze({ level: "moderate", label: "中度", statusLabel: "困扰较明显" }),
    severe: Object.freeze({ level: "severe", label: "重度", statusLabel: "困扰突出" })
  });

  function classify(mean) {
    if (typeof mean !== "number" || !Number.isFinite(mean)) {
      throw new TypeError("factor mean must be a finite number.");
    }

    if (mean < 2) return levels.normal;
    if (mean < 2.5) return levels.mild;
    if (mean < 3) return levels.moderate;
    return levels.severe;
  }

  return Object.freeze({ levels, classify });
});
