(function initializeScl90HighlightPolicy(global, factory) {
  "use strict";
  const policy = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = policy;
  if (global) global.Scl90HighlightPolicy = policy;
})(typeof globalThis !== "undefined" ? globalThis : this, function createHighlightPolicy() {
  "use strict";
  const factorOrder = Object.freeze([
    "somatization", "obsessiveCompulsive", "interpersonalSensitivity", "depression", "anxiety",
    "hostility", "phobicAnxiety", "paranoidIdeation", "psychoticism"
  ]);
  function select(input) {
    if (!input || !input.overall || !input.factors) throw new TypeError("highlight input is required.");
    const level = input.overall.level;
    const highlightFactorIds = level === "normal" ? [] : factorOrder
      .map((id, order) => ({ id, order, mean: input.factors[id].mean }))
      .sort((a, b) => b.mean - a.mean || a.order - b.order)
      .slice(0, 3)
      .map(entry => entry.id);
    return { highlightFactorIds, highlightStatus: "complete", closingVariant: `closing-${level}` };
  }
  return Object.freeze({ factorOrder, select });
});
