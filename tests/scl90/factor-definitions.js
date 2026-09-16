(function initializeScl90FactorDefinitions(global, factory) {
  "use strict";
  const definitions = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = definitions;
  if (global) global.Scl90FactorDefinitions = definitions;
})(typeof globalThis !== "undefined" ? globalThis : this, function createFactorDefinitions() {
  "use strict";
  const definitions = [
    ["somatization", "躯体化", [1, 4, 12, 27, 40, 42, 48, 49, 52, 53, 56, 58], true],
    ["obsessiveCompulsive", "强迫症状", [3, 9, 10, 28, 38, 45, 46, 51, 55, 65], true],
    ["interpersonalSensitivity", "人际关系敏感", [6, 21, 34, 36, 37, 41, 61, 69, 73], true],
    ["depression", "抑郁", [5, 14, 15, 20, 22, 26, 29, 30, 31, 32, 54, 71, 79], true],
    ["anxiety", "焦虑", [2, 17, 23, 33, 39, 57, 72, 78, 80, 86], true],
    ["hostility", "敌对", [11, 24, 63, 67, 74, 81], true],
    ["phobicAnxiety", "恐怖", [13, 25, 47, 50, 70, 75, 82], true],
    ["paranoidIdeation", "偏执", [8, 18, 43, 68, 76, 83], true],
    ["psychoticism", "精神病性", [7, 16, 35, 62, 77, 84, 85, 87, 88, 90], true],
    ["additional", "其他", [19, 44, 59, 60, 64, 66, 89], false]
  ].map(([id, displayLabel, itemNumbers, includeInRadar]) => Object.freeze({
    id,
    displayLabel,
    itemNumbers: Object.freeze(itemNumbers),
    itemCount: itemNumbers.length,
    includeInRadar
  }));
  return Object.freeze(definitions);
});
