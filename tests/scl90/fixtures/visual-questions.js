/* DEV VISUAL FIXTURE ONLY — NOT PRODUCTION QUESTION DATA */
(function (global) {
  "use strict";
  const items = [
    { number: 1, text: "这是用于检查短题目排版的示例。" },
    { number: 11, text: "这是用于检查中等长度题目在手机页面中换行和选中状态的视觉示例。" },
    { number: 41, text: "当题目文字明显更长时，页面应当自然增高，同时保持选项、进度和底部操作区清晰可读。" },
    { number: 90, text: "这是第90题的视觉占位内容，只用于验证提交按钮、题号和进度状态。" }
  ];
  global.Scl90VisualQuestions = Object.freeze({ fixtureOnly: true, items: Object.freeze(items) });
})(globalThis);
