(function initializeAdminConsole() {
  "use strict";

  const elements = Object.fromEntries([
    "loginView", "loginForm", "adminSecretInput", "togglePasswordBtn", "loginBtn", "loginStatus",
    "adminShell", "sidebar", "sidebarBackdrop", "menuBtn", "breadcrumbTitle", "logoutBtn", "toast",
    "refreshTestsBtn", "testStats", "testCards", "testsEmpty", "testSelect", "countInput",
    "decreaseCountBtn", "increaseCountBtn", "generateBtn", "generateStatus", "generationResults",
    "resultSummary", "copyAllBtn", "generatedLinksList", "refreshLinksBtn", "totalLinksStat",
    "unusedLinksStat", "completedLinksStat", "linkFiltersForm", "linkSearchInput", "linkTestFilter",
    "linkStatusFilter", "resetLinkFiltersBtn", "linksTableBody", "linksLoading", "linksEmpty",
    "linksError", "paginationSummary", "previousPageBtn", "currentPageLabel", "nextPageBtn",
    "loadPublicAccessBtn", "publicAccessDot", "publicAccessStatusLabel", "togglePublicAccessBtn",
    "publicAccessCodeInput", "updatePublicAccessCodeBtn", "publicAccessStatusText"
  ].map(id => [id, document.getElementById(id)]));

  const state = {
    tests: [],
    enabledTests: [],
    generatedLinks: [],
    currentView: "tests",
    linksLoaded: false,
    publicAccessLoaded: false,
    publicAccessEnabled: false,
    linkPage: 1,
    linkTotalPages: 1,
    toastTimer: null
  };

  class AdminRequestError extends Error {
    constructor(message, status) {
      super(message);
      this.status = status;
    }
  }

  function setMessage(element, message = "", type = "") {
    element.textContent = message;
    element.classList.toggle("error", type === "error");
    element.classList.toggle("success", type === "success");
  }

  function showToast(message, type = "") {
    clearTimeout(state.toastTimer);
    elements.toast.textContent = message;
    elements.toast.className = `toast show${type === "error" ? " error" : ""}`;
    state.toastTimer = setTimeout(() => { elements.toast.className = "toast"; }, 2600);
  }

  async function readJson(response) {
    try { return await response.json(); } catch (_) { return {}; }
  }

  async function adminFetch(url, options = {}) {
    const headers = new Headers(options.headers || {});
    headers.set("X-Admin-Request", "1");
    const response = await fetch(url, { ...options, headers, credentials: "same-origin" });
    const data = await readJson(response);

    if (!response.ok) {
      if (response.status === 401 && !url.startsWith("/api/admin-session")) showLogin();
      throw new AdminRequestError(data.message || data.error || "请求失败，请稍后重试。", response.status);
    }

    return data;
  }

  function showLogin(message = "") {
    elements.adminShell.hidden = true;
    elements.loginView.hidden = false;
    document.body.classList.remove("sidebar-open");
    elements.adminSecretInput.value = "";
    setMessage(elements.loginStatus, message, message ? "error" : "");
    setTimeout(() => elements.adminSecretInput.focus(), 0);
  }

  function showAdmin() {
    elements.loginView.hidden = true;
    elements.adminShell.hidden = false;
    initializeRegistryViews();
    const requestedView = location.hash.replace(/^#/, "");
    switchView(["tests", "generate", "links", "public-access"].includes(requestedView) ? requestedView : "tests");
  }

  function getRegistryTests() {
    if (!globalThis.TestRegistry || typeof globalThis.TestRegistry.list !== "function") {
      throw new Error("测试 Registry 未正确加载。");
    }
    const tests = globalThis.TestRegistry.list();
    if (!Array.isArray(tests)) throw new Error("测试 Registry 返回了无效数据。");
    return tests;
  }

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function renderTestStats() {
    const items = [
      ["▦", "blue", "已注册测试", state.tests.length],
      ["✓", "green", "当前已启用", state.enabledTests.length],
      ["◇", "purple", "当前已关闭", state.tests.length - state.enabledTests.length]
    ];
    elements.testStats.replaceChildren(...items.map(([icon, color, label, value]) => {
      const card = createElement("article", "stat-card");
      card.append(createElement("span", `stat-icon ${color}`, icon));
      const copy = createElement("div");
      copy.append(createElement("small", "", label), createElement("strong", "", String(value)));
      card.append(copy);
      return card;
    }));
  }

  function renderTestCards() {
    const colors = ["#637fff", "#7c62e8", "#27b99a", "#e99350"];
    const cards = state.tests.map((test, index) => {
      const card = createElement("article", "product-card");
      card.style.setProperty("--product-color", colors[index % colors.length]);

      const head = createElement("div", "product-card-head");
      head.append(createElement("span", "product-index", String(index + 1)));
      const title = createElement("div");
      title.append(createElement("h2", "", test.name), createElement("span", "product-id", test.test_id));
      head.append(title);
      card.append(head, createElement("p", "product-description", test.description));

      const meta = createElement("div", "product-meta");
      const status = createElement("span", `status-tag ${test.enabled ? "enabled" : "disabled"}`, test.enabled ? "● 已启用" : "● 已关闭");
      const link = createElement("a", "entry-link", `打开入口 ${test.entryPath}`);
      link.href = test.entryPath;
      link.target = "_blank";
      link.rel = "noopener";
      meta.append(status);
      if (typeof test.listed === "boolean") meta.append(createElement("span", `status-tag ${test.listed ? "enabled" : "disabled"}`, test.listed ? "目录可见" : "目录隐藏"));
      meta.append(link);
      card.append(meta);
      return card;
    });

    elements.testCards.replaceChildren(...cards);
    elements.testsEmpty.hidden = cards.length > 0;
  }

  function initializeTestSelector() {
    if (!state.enabledTests.length) {
      elements.testSelect.replaceChildren(new Option("没有已启用的测试", ""));
      elements.testSelect.disabled = true;
      elements.generateBtn.disabled = true;
      setMessage(elements.generateStatus, "当前没有已启用的测试，无法生成链接。", "error");
      return;
    }

    elements.testSelect.replaceChildren(
      ...state.enabledTests.map(test => new Option(test.name, test.test_id))
    );
    elements.testSelect.disabled = false;
    elements.generateBtn.disabled = false;
    setMessage(elements.generateStatus);
  }

  function initializeLinkTestFilter() {
    elements.linkTestFilter.replaceChildren(
      new Option("全部测试", ""),
      ...state.tests.map(test => new Option(test.name, test.test_id))
    );
  }

  function initializeRegistryViews() {
    try {
      state.tests = getRegistryTests();
      state.enabledTests = state.tests.filter(test => test?.enabled === true);
      renderTestStats();
      renderTestCards();
      initializeTestSelector();
      initializeLinkTestFilter();
    } catch (error) {
      state.tests = [];
      state.enabledTests = [];
      renderTestStats();
      renderTestCards();
      initializeTestSelector();
      showToast(error.message, "error");
    }
  }

  function switchView(viewName) {
    const view = document.getElementById(`view-${viewName}`);
    if (!view) return;

    document.querySelectorAll(".admin-view").forEach(item => item.classList.toggle("active", item === view));
    document.querySelectorAll(".nav-item").forEach(item => item.classList.toggle("active", item.dataset.view === viewName));
    state.currentView = viewName;
    elements.breadcrumbTitle.textContent = view.dataset.title || "管理后台";
    history.replaceState(null, "", `#${viewName}`);
    document.body.classList.remove("sidebar-open");

    if (viewName === "links" && !state.linksLoaded) loadLinksAndStats();
    if (viewName === "public-access" && !state.publicAccessLoaded) loadPublicAccess();
  }

  async function copyText(text) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const temporary = document.createElement("textarea");
    temporary.value = text;
    temporary.style.position = "fixed";
    temporary.style.opacity = "0";
    document.body.append(temporary);
    temporary.select();
    document.execCommand("copy");
    temporary.remove();
  }

  function normalizeCount(value) {
    const count = Number(value);
    return Number.isInteger(count) ? Math.max(1, Math.min(count, 1000)) : 10;
  }

  function renderGeneratedLinks() {
    const rows = state.generatedLinks.map((link, index) => {
      const row = createElement("div", "generated-row");
      row.append(createElement("span", "generated-index", String(index + 1)), createElement("code", "", link));
      const copyButton = createElement("button", "copy-row-button", "复制");
      copyButton.type = "button";
      copyButton.addEventListener("click", async () => {
        try { await copyText(link); showToast("链接已复制"); } catch (_) { showToast("复制失败，请手动复制。", "error"); }
      });
      row.append(copyButton);
      return row;
    });
    elements.generatedLinksList.replaceChildren(...rows);
    elements.resultSummary.textContent = `已生成 ${state.generatedLinks.length} 条链接`;
    elements.generationResults.hidden = !state.generatedLinks.length;
  }

  async function generateLinks() {
    const testId = elements.testSelect.value;
    const count = normalizeCount(elements.countInput.value);
    elements.countInput.value = String(count);

    if (!testId || !state.enabledTests.some(test => test.test_id === testId)) {
      setMessage(elements.generateStatus, "请选择一个已启用的测试。", "error");
      return;
    }

    elements.generateBtn.disabled = true;
    setMessage(elements.generateStatus, "正在安全生成链接…");
    try {
      const data = await adminFetch("/api/generate-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count, testId })
      });
      state.generatedLinks = Array.isArray(data.links) ? data.links : [];
      renderGeneratedLinks();
      setMessage(elements.generateStatus, `已成功生成 ${data.count} 条链接。`, "success");
      state.linksLoaded = false;
    } catch (error) {
      setMessage(elements.generateStatus, `生成失败：${error.message}`, "error");
    } finally {
      elements.generateBtn.disabled = !state.enabledTests.length;
    }
  }

  function buildLinkQuery({ page = state.linkPage, pageSize = 20, status = elements.linkStatusFilter.value, includeFilters = true } = {}) {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize), status });
    if (includeFilters) {
      const testId = elements.linkTestFilter.value;
      const search = elements.linkSearchInput.value.trim();
      if (testId) params.set("testId", testId);
      if (search) params.set("search", search);
    }
    return `/api/manage-links?${params}`;
  }

  function setLinkTableState(mode, message = "") {
    elements.linksLoading.hidden = mode !== "loading";
    elements.linksEmpty.hidden = mode !== "empty";
    elements.linksError.hidden = mode !== "error";
    elements.linksError.textContent = message;
  }

  function formatDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    return Number.isNaN(date.valueOf()) ? "—" : new Intl.DateTimeFormat("zh-CN", {
      year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false
    }).format(date);
  }

  function shortenToken(token) {
    return token.length <= 20 ? token : `${token.slice(0, 10)}…${token.slice(-7)}`;
  }

  function renderLinkRows(links) {
    const testNames = new Map(state.tests.map(test => [test.test_id, test.name]));
    const rows = links.map(item => {
      const row = document.createElement("tr");
      const tokenCell = createElement("td", "token-cell");
      const token = createElement("code", "", shortenToken(item.token));
      token.title = item.token;
      tokenCell.append(token, createElement("small", "", item.used ? "报告链接" : "一次性测试链接"));
      row.append(tokenCell, createElement("td", "", testNames.get(item.testId) || item.testId));

      const statusCell = document.createElement("td");
      statusCell.append(createElement("span", `status-tag ${item.used ? "completed" : "unused"}`, item.used ? "已完成" : "未使用"));
      row.append(statusCell, createElement("td", "", formatDate(item.createdAt)), createElement("td", "", item.resultType || "—"));

      const actionCell = document.createElement("td");
      const copyButton = createElement("button", "table-action", "复制链接");
      copyButton.type = "button";
      copyButton.addEventListener("click", async () => {
        try { await copyText(item.link); showToast("链接已复制"); } catch (_) { showToast("复制失败，请手动复制。", "error"); }
      });
      actionCell.append(copyButton);
      row.append(actionCell);
      return row;
    });
    elements.linksTableBody.replaceChildren(...rows);
  }

  async function loadLinkStats() {
    try {
      const [all, unused, completed] = await Promise.all([
        adminFetch(buildLinkQuery({ page: 1, pageSize: 1, status: "all", includeFilters: false })),
        adminFetch(buildLinkQuery({ page: 1, pageSize: 1, status: "unused", includeFilters: false })),
        adminFetch(buildLinkQuery({ page: 1, pageSize: 1, status: "completed", includeFilters: false }))
      ]);
      elements.totalLinksStat.textContent = String(all.total);
      elements.unusedLinksStat.textContent = String(unused.total);
      elements.completedLinksStat.textContent = String(completed.total);
    } catch (_) {
      elements.totalLinksStat.textContent = "—";
      elements.unusedLinksStat.textContent = "—";
      elements.completedLinksStat.textContent = "—";
    }
  }

  async function loadLinks() {
    setLinkTableState("loading");
    elements.linksTableBody.replaceChildren();
    try {
      const data = await adminFetch(buildLinkQuery());
      state.linkPage = data.page;
      state.linkTotalPages = data.totalPages;
      renderLinkRows(data.links || []);
      elements.paginationSummary.textContent = `共 ${data.total} 条`;
      elements.currentPageLabel.textContent = `${data.page} / ${data.totalPages}`;
      elements.previousPageBtn.disabled = data.page <= 1;
      elements.nextPageBtn.disabled = data.page >= data.totalPages;
      setLinkTableState(data.links?.length ? "ready" : "empty");
      state.linksLoaded = true;
    } catch (error) {
      setLinkTableState("error", `读取失败：${error.message}`);
    }
  }

  async function loadLinksAndStats() {
    await Promise.all([loadLinks(), loadLinkStats()]);
  }

  function updatePublicAccessView() {
    const enabled = state.publicAccessEnabled;
    elements.publicAccessDot.className = `large-status-dot ${enabled ? "enabled" : "disabled"}`;
    elements.publicAccessStatusLabel.textContent = enabled ? "公共通道已开启" : "公共通道已关闭";
    elements.togglePublicAccessBtn.textContent = enabled ? "关闭公共通道" : "开启公共通道";
    elements.togglePublicAccessBtn.disabled = false;
    elements.publicAccessCodeInput.disabled = false;
    elements.updatePublicAccessCodeBtn.disabled = false;
  }

  async function publicAccessAction(body) {
    return adminFetch("/api/manage-public-access", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
  }

  async function loadPublicAccess() {
    elements.loadPublicAccessBtn.disabled = true;
    setMessage(elements.publicAccessStatusText, "正在读取当前配置…");
    try {
      const data = await publicAccessAction({ action: "get" });
      state.publicAccessEnabled = data.enabled === true;
      state.publicAccessLoaded = true;
      elements.publicAccessCodeInput.value = data.accessCode || "";
      updatePublicAccessView();
      setMessage(elements.publicAccessStatusText, "配置已更新。", "success");
    } catch (error) {
      setMessage(elements.publicAccessStatusText, `读取失败：${error.message}`, "error");
    } finally {
      elements.loadPublicAccessBtn.disabled = false;
    }
  }

  async function updatePublicAccessCode() {
    const accessCode = elements.publicAccessCodeInput.value.trim();
    if (!accessCode) {
      setMessage(elements.publicAccessStatusText, "请输入新的公共授权码。", "error");
      return;
    }
    elements.updatePublicAccessCodeBtn.disabled = true;
    setMessage(elements.publicAccessStatusText, "正在保存新授权码…");
    try {
      const data = await publicAccessAction({ action: "update-code", accessCode });
      state.publicAccessEnabled = data.enabled === true;
      elements.publicAccessCodeInput.value = data.accessCode || accessCode;
      updatePublicAccessView();
      setMessage(elements.publicAccessStatusText, "授权码修改成功。", "success");
    } catch (error) {
      setMessage(elements.publicAccessStatusText, `修改失败：${error.message}`, "error");
    } finally {
      elements.updatePublicAccessCodeBtn.disabled = false;
    }
  }

  async function togglePublicAccess() {
    const nextEnabled = !state.publicAccessEnabled;
    if (!window.confirm(`确认${nextEnabled ? "开启" : "关闭"}全平台公共授权通道吗？`)) return;
    elements.togglePublicAccessBtn.disabled = true;
    setMessage(elements.publicAccessStatusText, nextEnabled ? "正在开启公共通道…" : "正在关闭公共通道…");
    try {
      const data = await publicAccessAction({ action: "set-enabled", enabled: nextEnabled });
      state.publicAccessEnabled = data.enabled === true;
      elements.publicAccessCodeInput.value = data.accessCode || elements.publicAccessCodeInput.value;
      updatePublicAccessView();
      setMessage(elements.publicAccessStatusText, data.message || "状态更新成功。", "success");
    } catch (error) {
      setMessage(elements.publicAccessStatusText, `操作失败：${error.message}`, "error");
    } finally {
      elements.togglePublicAccessBtn.disabled = false;
    }
  }

  async function login(event) {
    event.preventDefault();
    const adminSecret = elements.adminSecretInput.value;
    if (!adminSecret) return;
    elements.loginBtn.disabled = true;
    setMessage(elements.loginStatus, "正在验证身份…");
    try {
      await adminFetch("/api/admin-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", adminSecret })
      });
      elements.adminSecretInput.value = "";
      showAdmin();
    } catch (error) {
      setMessage(elements.loginStatus, error.message, "error");
    } finally {
      elements.loginBtn.disabled = false;
    }
  }

  async function logout() {
    try {
      await adminFetch("/api/admin-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" })
      });
    } catch (_) {
      // The local UI must still clear when the session is already unavailable.
    }
    showLogin("已安全退出后台。" );
    elements.loginStatus.classList.remove("error");
  }

  function bindEvents() {
    elements.loginForm.addEventListener("submit", login);
    elements.togglePasswordBtn.addEventListener("click", () => {
      const show = elements.adminSecretInput.type === "password";
      elements.adminSecretInput.type = show ? "text" : "password";
      elements.togglePasswordBtn.textContent = show ? "隐藏" : "显示";
    });
    elements.logoutBtn.addEventListener("click", logout);
    elements.menuBtn.addEventListener("click", () => document.body.classList.toggle("sidebar-open"));
    elements.sidebarBackdrop.addEventListener("click", () => document.body.classList.remove("sidebar-open"));
    document.querySelectorAll(".nav-item").forEach(item => item.addEventListener("click", () => switchView(item.dataset.view)));

    elements.refreshTestsBtn.addEventListener("click", () => { initializeRegistryViews(); showToast("测试列表已刷新"); });
    elements.decreaseCountBtn.addEventListener("click", () => { elements.countInput.value = String(Math.max(1, normalizeCount(elements.countInput.value) - 1)); });
    elements.increaseCountBtn.addEventListener("click", () => { elements.countInput.value = String(Math.min(1000, normalizeCount(elements.countInput.value) + 1)); });
    elements.countInput.addEventListener("change", () => { elements.countInput.value = String(normalizeCount(elements.countInput.value)); });
    elements.generateBtn.addEventListener("click", generateLinks);
    elements.copyAllBtn.addEventListener("click", async () => {
      try { await copyText(state.generatedLinks.join("\n")); showToast("全部链接已复制"); } catch (_) { showToast("复制失败，请逐条复制。", "error"); }
    });

    elements.refreshLinksBtn.addEventListener("click", loadLinksAndStats);
    elements.linkFiltersForm.addEventListener("submit", event => { event.preventDefault(); state.linkPage = 1; loadLinks(); });
    elements.resetLinkFiltersBtn.addEventListener("click", () => {
      elements.linkSearchInput.value = "";
      elements.linkTestFilter.value = "";
      elements.linkStatusFilter.value = "all";
      state.linkPage = 1;
      loadLinks();
    });
    elements.previousPageBtn.addEventListener("click", () => { if (state.linkPage > 1) { state.linkPage -= 1; loadLinks(); } });
    elements.nextPageBtn.addEventListener("click", () => { if (state.linkPage < state.linkTotalPages) { state.linkPage += 1; loadLinks(); } });

    elements.loadPublicAccessBtn.addEventListener("click", loadPublicAccess);
    elements.updatePublicAccessCodeBtn.addEventListener("click", updatePublicAccessCode);
    elements.togglePublicAccessBtn.addEventListener("click", togglePublicAccess);
  }

  async function bootstrap() {
    bindEvents();
    try {
      await adminFetch("/api/admin-session", { method: "GET" });
      showAdmin();
    } catch (_) {
      showLogin();
    }
  }

  bootstrap();
})();
