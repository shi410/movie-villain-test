(function initializeScl90OverallPolicy(global, factory) {
  "use strict";
  const policy = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = policy;
  if (global) global.Scl90OverallPolicy = policy;
})(typeof globalThis !== "undefined" ? globalThis : this, function createOverallPolicy() {
  "use strict";
  const levels = Object.freeze({
    normal: Object.freeze({ level: "normal", label: "正常", statusLabel: "状态平稳" }),
    mild: Object.freeze({ level: "mild", label: "轻度", statusLabel: "有些困扰" }),
    moderate: Object.freeze({ level: "moderate", label: "中度", statusLabel: "困扰较明显" }),
    severe: Object.freeze({ level: "severe", label: "重度", statusLabel: "困扰突出" })
  });
  function resolveMean(input) {
    const mean = typeof input === "number" ? input : input && (
      Number.isFinite(input.globalMean) ? input.globalMean :
        Array.isArray(input.answers) ? input.totalScore / input.answers.length : Number.NaN
    );
    if (!Number.isFinite(mean)) throw new TypeError("overall globalMean must be a finite number.");
    return mean;
  }
  function classify(input) {
    const mean = resolveMean(input);
    const result = mean < 1.5 ? levels.normal : mean < 2.5 ? levels.mild : mean < 3.5 ? levels.moderate : levels.severe;
    return { ...result, classificationStatus: "complete" };
  }
  return Object.freeze({ levels, classify });
});
