/* DEV VISUAL FIXTURE ONLY — NOT PRODUCTION SCORING DATA */
(function (global) {
  "use strict";
  const factors = [
    ["somatization", 12], ["obsessiveCompulsive", 10], ["interpersonalSensitivity", 9],
    ["depression", 13], ["anxiety", 10], ["hostility", 6], ["phobicAnxiety", 7],
    ["paranoidIdeation", 6], ["psychoticism", 10], ["additional", 7]
  ];
  const config = {
    normal: { score: 118, mean: 1.31, label: "正常", status: "状态平稳" },
    mild: { score: 197, mean: 2.19, label: "轻度", status: "有些困扰" },
    moderate: { score: 287, mean: 2.78, label: "中度", status: "困扰较明显" },
    severe: { score: 377, mean: 3.62, label: "重度", status: "困扰突出" }
  };
  function make(level) {
    const c = config[level];
    const factorResults = {};
    let additional;
    factors.forEach(([id, itemCount], index) => {
      const mean = Math.min(5, c.mean + ((index % 3) - 1) * 0.08);
      const rawScore = Math.round(mean * itemCount);
      const value = { rawScore, itemCount, mean: rawScore / itemCount, level, statusLabel: c.status };
      if (id === "additional") additional = value; else factorResults[id] = value;
    });
    return {
      schemaVersion: 1, testId: "scl90",
      total: { score: c.score, mean: c.score / 90, level, statusLabel: c.status, classificationStatus: "visual-fixture" },
      symptoms: { positiveItemCount: 0, negativeItemCount: 90, positiveSymptomMean: null },
      screening: { overallPositive: false, triggeredRules: [], status: "complete" },
      factors: factorResults, additional,
      report: { highlightFactorIds: level === "normal" ? [] : ["somatization", "obsessiveCompulsive", "interpersonalSensitivity"], highlightStatus: "complete", closingVariant: `closing-${level}` },
      safety: { status: "complete", flags: [] }
    };
  }
  global.Scl90VisualPayloads = Object.freeze({ fixtureOnly: true, normal: make("normal"), mild: make("mild"), moderate: make("moderate"), severe: make("severe") });
})(globalThis);
