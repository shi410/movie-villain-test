(function initializeScl90SafetyPolicy(global, factory) {
  "use strict";
  const policy = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = policy;
  if (global) global.Scl90SafetyPolicy = policy;
})(typeof globalThis !== "undefined" ? globalThis : this, function createSafetyPolicy() {
  "use strict";
  const flagDefinitions = Object.freeze([
    Object.freeze({ questionNumber: 15, id: "self_harm_thoughts" }),
    Object.freeze({ questionNumber: 59, id: "death_related_thoughts" }),
    Object.freeze({ questionNumber: 63, id: "harm_to_others_urge" })
  ]);
  function evaluate(input) {
    const answers = input && input.answers;
    if (!Array.isArray(answers) || answers.length !== 90) throw new TypeError("safety requires ninety answers.");
    const flags = flagDefinitions.filter(entry => answers[entry.questionNumber - 1] > 1).map(entry => entry.id);
    return { status: "complete", flags };
  }
  return Object.freeze({ flagDefinitions, evaluate });
});
