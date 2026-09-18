(function initializeTestDefinitions(global, factory) {
  "use strict";

  const definitions = factory();

  if (typeof module !== "undefined" && module.exports) {
    module.exports = definitions;
  }

  if (global) {
    global.TestDefinitions = definitions;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function createTestDefinitions() {
  "use strict";

  const definitions = [
    {
      test_id: "villain",
      name: "反派电影人格测试",
      slug: "villain",
      description: "通过情境选择匹配电影与影视作品中的反派人格，并生成完整人格报告。",
      enabled: true,
      entryPath: "/",
      publicAccessPath: "/access.html",
      launchPath: "/villain.html",
      listed: true,
      category: "电影人格 · 趣味探索",
      questionCount: 24,
      durationLabel: "约 3 分钟",
      coverPath: "/images/home-cover.jpg",
      reportSummary: "一份电影反派人格档案，认识你的性格倾向与故事中的另一面。",
      usageNote: "本测试用于娱乐与自我探索，不作为心理诊断或现实人格判断依据。"
    },
    {
      test_id: "scl90",
      name: "SCL-90 症状自评量表",
      slug: "scl90",
      description: "通过 90 个项目了解近期心理症状体验，并生成结构化自评报告。",
      enabled: true,
      entryPath: "/scl90/",
      publicAccessPath: "/access.html?test=scl90",
      listed: true,
      category: "心理自评",
      questionCount: 90,
      reportSummary: "近期心理症状体验的结构化自评报告，包含各维度的结果与阅读说明。",
      usageNote: "当前用于本人及家人非商业自用。请依据产品内的使用说明理解报告。"
    }
  ].map(definition => Object.freeze({ ...definition }));

  const definitionsById = new Map(
    definitions.map(definition => [definition.test_id, definition])
  );

  function get(testId) {
    return definitionsById.get(testId) || null;
  }

  function list() {
    return definitions.slice();
  }

  return Object.freeze({
    get,
    list
  });
});
