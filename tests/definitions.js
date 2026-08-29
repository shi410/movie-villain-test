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
