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
      publicAccessPath: "/access.html"
    },
    {
      test_id: "scl90",
      name: "SCL-90 症状自评量表",
      slug: "scl90",
      description: "通过 90 个项目了解近期心理症状体验，并生成结构化自评报告。",
      enabled: true,
      entryPath: "/scl90/",
      publicAccessPath: "/access.html?test=scl90"
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
