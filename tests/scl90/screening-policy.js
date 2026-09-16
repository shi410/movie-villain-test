(function initializeScl90ScreeningPolicy(global, factory) {
  "use strict";
  const policy = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = policy;
  if (global) global.Scl90ScreeningPolicy = policy;
})(typeof globalThis !== "undefined" ? globalThis : this, function createScreeningPolicy() {
  "use strict";
  const displayFactorOrder = Object.freeze([
    "somatization", "obsessiveCompulsive", "interpersonalSensitivity", "depression", "anxiety",
    "hostility", "phobicAnxiety", "paranoidIdeation", "psychoticism", "additional"
  ]);
  function evaluate(input) {
    if (!input || typeof input !== "object") throw new TypeError("screening input is required.");
    const rules = [];
    if (input.totalScore > 160) rules.push("total_score_gt_160");
    if (input.globalMean > 2) rules.push("global_mean_gt_2");
    if (input.positiveItemCount > 43) rules.push("positive_items_gt_43");
    if (input.negativeItemCount < 47) rules.push("negative_items_lt_47");
    if (input.positiveSymptomMean !== null && input.positiveSymptomMean > 2) rules.push("positive_symptom_mean_gt_2");
    displayFactorOrder.forEach(id => {
      if (input.dimensions && input.dimensions[id] && input.dimensions[id].mean > 2) rules.push(`factor_mean_gt_2:${id}`);
    });
    return { overallPositive: rules.length > 0, triggeredRules: rules, status: "complete" };
  }
  return Object.freeze({ displayFactorOrder, evaluate });
});
