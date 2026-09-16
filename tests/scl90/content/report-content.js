/* SCL-90 REPORT CONTENT V1.0 — FROZEN — COMMERCIAL RIGHTS GATE OPEN */
(function initializeScl90ReportContent(global, factory) {
  "use strict";
  const content = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = content;
  if (global) global.Scl90ReportContent = content;
})(typeof globalThis !== "undefined" ? globalThis : this, function createReportContent() {
  "use strict";
  const factorMeta = Object.freeze({
    somatization: Object.freeze({ name: "躯体化", friendlyName: "身体不适与身体感受", definition: "留意近期身体不适及其对日常生活的影响。" }),
    obsessiveCompulsive: Object.freeze({ name: "强迫症状", friendlyName: "重复想法与行为", definition: "留意反复出现的想法、检查或固定行为。" }),
    interpersonalSensitivity: Object.freeze({ name: "人际关系敏感", friendlyName: "人际互动中的敏感体验", definition: "留意与他人相处时的紧张、自我比较和受伤感。" }),
    depression: Object.freeze({ name: "抑郁", friendlyName: "低落情绪与行动力", definition: "留意心情、兴趣、希望感与行动能量的变化。" }),
    anxiety: Object.freeze({ name: "焦虑", friendlyName: "紧张、担忧与不安", definition: "留意紧张、惊慌以及身体警觉反应。" }),
    hostility: Object.freeze({ name: "敌对", friendlyName: "烦躁、愤怒与冲动", definition: "留意烦躁、争执和冲动体验。" }),
    phobicAnxiety: Object.freeze({ name: "恐怖", friendlyName: "特定情境中的恐惧", definition: "留意特定地点、交通或独处情境中的回避和害怕。" }),
    paranoidIdeation: Object.freeze({ name: "偏执", friendlyName: "警觉、怀疑与不信任", definition: "留意对他人意图的警觉和不信任体验。" }),
    psychoticism: Object.freeze({ name: "精神病性", friendlyName: "疏离感与异常体验", definition: "留意疏离、不真实或较少见的主观体验。" }),
    additional: Object.freeze({ name: "其他（睡眠、饮食）", friendlyName: "睡眠、饮食及其他体验", definition: "补充观察睡眠、饮食和相关感受。" })
  });
  const levels = Object.freeze({
    normal: Object.freeze({ state: "本维度的作答整体较低，近期相关体验相对平稳。", suggestion: "继续保持适合自己的生活节奏，并在状态变化时及时留意。" }),
    mild: Object.freeze({ state: "本维度出现了一些可感知的体验，但目前程度相对有限。", suggestion: "可以记录容易出现这些体验的情境，并尝试从休息、运动或沟通中获得支持。" }),
    moderate: Object.freeze({ state: "本维度的相关体验较为明显，可能已经给日常感受带来一定负担。", suggestion: "建议减少持续消耗，主动安排恢复时间；若影响延续，可考虑与心理健康专业人员沟通。" }),
    severe: Object.freeze({ state: "本维度的相关体验较为突出，值得认真关注它对生活、学习或工作的影响。", suggestion: "建议尽快寻求可信任者和专业服务的支持，以获得更具体、个体化的评估与帮助。" })
  });
  const factorCopy = {};
  Object.keys(factorMeta).forEach(id => {
    const byLevel = {};
    Object.keys(levels).forEach(level => {
      byLevel[level] = Object.freeze({ recentState: `${factorMeta[id].friendlyName}方面，${levels[level].state}`, suggestion: levels[level].suggestion });
    });
    factorCopy[id] = Object.freeze(byLevel);
  });
  const closingCopy = Object.freeze({
    "closing-normal": Object.freeze({ title: "保持觉察，也保留日常弹性", body: "当前结果相对平稳。分数只是一次状态记录，继续照顾睡眠、活动和关系中的真实需要。" }),
    "closing-mild": Object.freeze({ title: "给近期的困扰一点空间", body: "一些体验已经值得留意。可以从小而具体的调整开始，并观察它们是否持续或加重。" }),
    "closing-moderate": Object.freeze({ title: "不必独自承担持续的消耗", body: "当困扰较为明显时，主动寻求支持是一种务实选择。你可以把这份结果作为沟通的起点。" }),
    "closing-severe": Object.freeze({ title: "优先照顾当下的安全与支持", body: "突出困扰需要被认真对待。请尽快联系可信任的人或专业服务，让支持更具体地来到身边。" })
  });
  return Object.freeze({
    contentVersion: "1.0",
    contentStatus: "FROZEN",
    frozenAt: "2026-09-15",
    commercialRelease: false,
    commercialRightsGate: "OPEN",
    factorMeta,
    factorCopy: Object.freeze(factorCopy),
    closingCopy
  });
});
