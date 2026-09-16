/* DEV VISUAL FIXTURE ONLY — NOT PRODUCTION REPORT CONTENT */
(function (global) {
  "use strict";
  const copy = {};
  const ids = ["somatization", "obsessiveCompulsive", "interpersonalSensitivity", "depression", "anxiety", "hostility", "phobicAnxiety", "paranoidIdeation", "psychoticism", "additional"];
  ids.forEach((id, index) => {
    copy[id] = {
      definition: "用于观察这一维度近期自我感受变化的展示说明。",
      recentState: `这是第${index + 1}个维度的开发期视觉文案。它只用于检查长文本换行、段落高度与阅读节奏，不构成正式评估结论。`,
      suggestion: "可以从规律作息、记录感受和寻求可信支持开始，给自己留出逐步调整的空间。本段仅用于视觉排版测试。"
    };
  });
  global.Scl90VisualReportCopy = Object.freeze(copy);
})(globalThis);
