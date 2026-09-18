# Platform 前台 V1 · 本地验收

基线：`684b851294371f6dffa4c3373d2af60c77cf0bbf`。开发分支：`codex/platform-frontend-v1`。
本阶段仅本地实现与验收，未 push、merge、部署或访问真实数据库。

## 页面与兼容边界

- `/`：平台首页、Registry 动态目录、使用步骤与帮助。
- `/test.html?test=<test_id>`：Registry 驱动的产品介绍；未知/未展示产品显示不可用状态，disabled 产品没有公共开始按钮。
- `/access.html`：统一平台视觉的全局公共授权入口，默认仍为 villain；`?test=scl90` 保持 SCL-90。
- `/?token=...`：保留 query/hash 并通过 replace 进入 `/villain.html`。无效/空 Token 仍交给原 Runtime 拒绝，绝不降级为公共访问。
- 原 `index.html` 移至 `villain.html`，正文及脚本加载顺序相同（仅换行格式变化）。`entryPath=/` 不变，Admin 仍生成兼容的旧式根路径 Token URL。
- `launchPath` 是公共授权成功后使用的实际产品入口，villain 为 `/villain.html`；其他产品缺省沿用 `entryPath`。
- SCL-90 产品页面、题库、计分、报告、Runtime、Token API、Admin 不变。
- 新增可选展示字段 `listed/category/questionCount/durationLabel/coverPath/reportSummary/usageNote`；目录只展示 enabled 且 listed 不为 false 的产品。listed 不参与授权。
- 目录不提供价格、购买或商业推广流程；SCL-90 使用范围仍为本人及家人非商业自用，Commercial Rights Gate OPEN。

## 自动验证

依次运行：

```powershell
node --test tests/regression/platform-frontend-v1.mjs
node tests/regression/villain-baseline.mjs
node tests/regression/platform-runtime-villain.mjs
node tests/regression/platform-runtime-scl90.mjs
node tests/regression/product-contract-v1.mjs
node tests/regression/platform-admin-v1.mjs
node tests/regression/scl90-token-lifecycle.mjs
node --test tests/scl90/__tests__/*.test.*
```

2026-09-18：156/156 PASS；全仓库 JS/ESM 89/89 语法检查 PASS。
原测试只调整 villain HTML 所在路径和公共授权目的地断言，不改变既有计分/报告预期。

## 浏览器核验

运行 `node tests/regression/local-runtime-server.mjs`，仅绑定 `127.0.0.1:4173`，使用内存假数据。

1. `/`：桌面双卡片、390px 单列、无横向溢出、导航展开/点击收起、产品介绍链接。
2. 产品介绍 → 公共授权输入 `OPEN` → villain 原首页。
3. `/?token=legacy-completed`：直接恢复历史小丑报告。
4. `/?token=wrong-test`：SCL-90 Token 进入 villain 拒绝。
5. `/scl90/?token=valid-unused`：villain Token 进入 SCL-90 拒绝。
6. `/scl90/?token=scl-completed`：恢复 SCL-90 报告。
7. `/?token=valid-unused`：完成 24 题、报告生成、重开同一链接、一次核销。
8. 浏览器日志区分预期 403 与 JavaScript 产品错误。

本地视觉不是 CEO 视觉定稿，Production 仍保持原版本；发布前以本候选完整文件集合部署，不能仅替换根首页而遗漏 `villain.html` 或 `frontdoor.js`。
