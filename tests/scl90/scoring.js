(function initializeScl90Scoring(global, factory) {
  "use strict";
  const commonJs = typeof module !== "undefined" && module.exports;
  const scoring = factory(
    commonJs ? require("./validators.js") : global.Scl90Validators,
    commonJs ? require("./factor-definitions.js") : global.Scl90FactorDefinitions,
    commonJs ? require("./factor-levels.js") : global.Scl90FactorLevels,
    commonJs ? require("./overall-policy.js") : global.Scl90OverallPolicy,
    commonJs ? require("./screening-policy.js") : global.Scl90ScreeningPolicy,
    commonJs ? require("./highlight-policy.js") : global.Scl90HighlightPolicy,
    commonJs ? require("./safety-policy.js") : global.Scl90SafetyPolicy
  );
  if (commonJs) module.exports = scoring;
  if (global) global.Scl90Scoring = scoring;
})(typeof globalThis !== "undefined" ? globalThis : this, function createScoring(
  validators,
  factorDefinitions,
  factorLevels,
  overallPolicy,
  screeningPolicy,
  highlightPolicy,
  safetyPolicy
) {
  "use strict";
  validators.validateFactorDefinitions(factorDefinitions);

  function scoreFactor(answers, definition) {
    const rawScore = definition.itemNumbers.reduce(
      (sum, questionNumber) => sum + answers[questionNumber - 1],
      0
    );
    const mean = rawScore / definition.itemCount;
    const classification = factorLevels.classify(mean);
    return {
      rawScore,
      itemCount: definition.itemCount,
      mean,
      level: classification.level,
      statusLabel: classification.statusLabel
    };
  }

  function score(answers) {
    validators.validateAnswers(answers);
    const totalScore = answers.reduce((sum, answer) => sum + answer, 0);
    const positiveItemCount = answers.filter(answer => answer > 1).length;
    const negativeItemCount = answers.filter(answer => answer === 1).length;
    if (positiveItemCount + negativeItemCount !== validators.ANSWER_COUNT) {
      throw new Error("SCL-90 positive and negative item counts must total 90.");
    }

    const factors = {};
    let additional = null;
    factorDefinitions.forEach(definition => {
      const factorResult = scoreFactor(answers, definition);
      if (definition.id === "additional") additional = factorResult;
      else factors[definition.id] = factorResult;
    });

    const globalMean = totalScore / validators.ANSWER_COUNT;
    const positiveSymptomMean = positiveItemCount > 0
      ? (totalScore - negativeItemCount) / positiveItemCount
      : null;
    const overall = overallPolicy.classify({ globalMean });
    const screening = screeningPolicy.evaluate({
      totalScore, globalMean, positiveItemCount, negativeItemCount, positiveSymptomMean,
      dimensions: { ...factors, additional }
    });
    const resultPayload = {
      schemaVersion: 1,
      testId: "scl90",
      total: {
        score: totalScore,
        mean: globalMean,
        level: overall.level,
        statusLabel: overall.statusLabel,
        classificationStatus: overall.classificationStatus
      },
      symptoms: {
        positiveItemCount,
        negativeItemCount,
        positiveSymptomMean
      },
      screening,
      factors,
      additional,
      report: highlightPolicy.select({ overall, factors, additional }),
      safety: safetyPolicy.evaluate({ answers })
    };
    validators.validateCurrentResultPayload(resultPayload);
    return resultPayload;
  }

  return Object.freeze({ score });
});
