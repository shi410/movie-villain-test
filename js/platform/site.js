(function initializePlatformSite() {
  "use strict";
  const menu = document.querySelector(".menu-button");
  const nav = document.getElementById("site-nav");
  function closeMenu() { menu?.setAttribute("aria-expanded", "false"); nav?.classList.remove("is-open"); }
  menu?.addEventListener("click", () => {
    const open = menu.getAttribute("aria-expanded") !== "true";
    menu.setAttribute("aria-expanded", String(open)); nav.classList.toggle("is-open", open);
  });
  nav?.addEventListener("click", closeMenu);
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeMenu(); });

  const list = document.getElementById("product-list");
  const detail = document.getElementById("product-detail");
  const registry = globalThis.TestRegistry;
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };
  function link(text, href, className) {
    const node = element("a", className, text); node.href = href; return node;
  }
  function facts(product) {
    const node = element("div", "product-facts");
    if (product.questionCount) node.append(element("span", "", `${product.questionCount} 题`));
    if (product.durationLabel) node.append(element("span", "", product.durationLabel));
    node.append(element("span", "", product.enabled ? "可使用专属链接" : "暂未开放"));
    return node;
  }
  function state(target, message) { target.replaceChildren(element("p", "state", message)); }
  if (!registry || typeof registry.list !== "function") {
    if (list) state(list, "测试目录暂时无法加载，请刷新重试。已有专属链接仍可直接使用。");
    if (detail) state(detail, "产品信息暂时无法加载，请刷新重试。");
    return;
  }
  if (list) {
    const products = registry.list().filter(product => product.listed !== false && product.enabled === true);
    list.replaceChildren();
    if (!products.length) state(list, "当前暂无开放的测试，请稍后再来。");
    products.forEach((product, index) => {
      const card = element("article", "product-card");
      const visual = element("div", `product-visual ${product.coverPath ? "has-cover" : "abstract-cover"}`);
      if (product.coverPath) {
        const img = element("img"); img.src = product.coverPath; img.alt = ""; img.loading = "lazy"; visual.append(img);
      } else {
        visual.append(element("span", "visual-symbol", "◎"), element("span", "visual-word", "SELF REFLECTION"));
      }
      visual.append(element("span", "visual-index", String(index + 1).padStart(2, "0")));
      const body = element("div", "product-body");
      body.append(element("p", "eyebrow", product.category || "自我探索"), element("h3", "", product.name), element("p", "product-description", product.description), facts(product), link("了解这个测试 ↗", `/test.html?test=${encodeURIComponent(product.test_id)}`, "card-link"));
      card.append(visual, body); list.append(card);
    });
  }
  if (detail) {
    const id = new URLSearchParams(window.location.search).get("test");
    const product = registry.get(id);
    if (!product || product.listed === false) { state(detail, "没有找到这个测试。请返回目录选择可用产品，或直接打开已有专属链接。"); return; }
    document.title = `${product.name} · Filmtest`;
    const panel = element("article", "detail-panel");
    const info = element("div", "detail-copy");
    info.append(element("p", "eyebrow", product.category || "自我探索"), element("h1", "", product.name), element("p", "detail-description", product.description), facts(product));
    info.append(element("h2", "", "你会获得什么"), element("p", "", product.reportSummary || "完成后查看该测试的完整结果报告。"));
    if (product.usageNote) info.append(element("p", "usage-note", product.usageNote));
    const entry = element("aside", "entry-panel");
    entry.append(element("p", "eyebrow", "READY WHEN YOU ARE"), element("h2", "", "准备好，开始探索"), element("p", "", "已有专属链接？直接打开收到的完整链接即可进入，完成后用同一个链接查看报告。"));
    if (product.enabled === true) {
      entry.append(link("使用公共授权码 →", product.publicAccessPath, "button primary"), element("p", "muted", "此入口需要有效授权码，且公共通道处于开放状态。"));
    } else entry.append(element("p", "state", "该测试暂未开放新一轮测试；已有专属链接请直接打开。"));
    entry.append(link("查看使用帮助", "/#help", "text-link"));
    panel.append(info, entry); detail.replaceChildren(panel);
  }
})();
