/* SCL-90 STATIC COPY V1.0 — FROZEN — COMMERCIAL RIGHTS GATE OPEN */
(function initializeScl90StaticCopy(global, factory) {
  "use strict";
  const copy = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = copy;
  if (global) global.Scl90StaticCopy = copy;
})(typeof globalThis !== "undefined" ? globalThis : this, function createStaticCopy() {
  "use strict";
  return Object.freeze({
    contentVersion: "1.0", contentStatus: "FROZEN", frozenAt: "2026-09-15",
    commercialRelease: false, commercialRightsGate: "OPEN",
    home: Object.freeze({
      kicker: "SCL-90 · 自我状态观察", title: "SCL-90", subtitle: "症状自评量表", englishTitle: "Symptom Checklist 90",
      facts: Object.freeze([Object.freeze({ value: "15–20", unit: "分钟", label: "预计时长" }), Object.freeze({ value: "90", unit: "道题", label: "题目数量" }), Object.freeze({ value: "9", unit: "个维度", label: "核心因子" })]),
      dimensions: Object.freeze(["躯体化", "强迫症状", "人际敏感", "抑郁", "焦虑", "敌对", "恐怖", "偏执", "精神病性"]),
      aboutTitle: "关于本测评", aboutBody: "这份测评帮助你有条理地回顾最近一周的身心感受。结果用于自我观察，不构成医学诊断。",
      purposeTitle: "测评目的", purposes: Object.freeze(["整理近期身心体验", "观察不同维度的相对变化", "为后续沟通提供结构化参考"]),
      dimensionsTitle: "九大评估维度", noticeTitle: "测评须知",
      notices: Object.freeze(["请依据最近一周的实际体验作答。", "每题选择最接近当前情况的程度。", "建议在相对安静、不受打扰的环境中完成。", "测评结果不能替代专业评估或诊断。"]),
      start: "开始测试", footer: "关注心理健康，从认真感受自己开始", footerNote: "内容版本 V1.0 · 非诊断工具"
    }),
    test: Object.freeze({
      title: "SCL-90 症状自评量表", instruction: "请根据您最近一周内的实际感受选择最符合的选项。",
      options: Object.freeze(["没有", "很轻", "中等", "偏重", "严重"]), unanswered: "请选择一个选项后继续",
      incomplete: "还有题目尚未作答，请通过题目导航补充完成。"
    }),
    report: Object.freeze({
      title: "SCL-90 心理健康测评报告", disclaimer: "本报告展示近期自我感受，仅供了解状态变化，不作为诊断结论。",
      screeningNote: "筛查参考指标仅表示某些数值条件被触发，不能用于确诊疾病或判断医学风险等级。"
    })
  });
});
