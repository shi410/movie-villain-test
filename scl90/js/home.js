(async function initializeScl90Home() {
  "use strict";

  const copy = Scl90StaticCopy.home;
  const root = document.getElementById("home-root");
  const params = new URLSearchParams(location.search);
  const fixture =
    params.get("fixture") === "1" && Scl90PlatformBridge.isLocalDevelopment();

  function renderHome() {
    const testHref = fixture
      ? "test.html?fixture=1&question=1"
      : Scl90PlatformBridge.pathWithToken("test.html");

    root.innerHTML = `<section class="home-card"><div class="home-kicker">${copy.kicker}</div><header class="home-hero"><div class="product-mark">▤</div><div><h1>${copy.title}</h1><p>${copy.subtitle}</p></div></header><p class="home-subtitle">${copy.englishTitle}</p><div class="facts">${copy.facts.map(x => `<div><b>${x.value}</b><span>${x.unit}</span><small>${x.label}</small></div>`).join("")}</div><section class="home-section"><h2>${copy.aboutTitle}</h2><p>${copy.aboutBody}</p><div class="info-panel"><h3>${copy.purposeTitle}</h3><ul>${copy.purposes.map(x => `<li>${x}</li>`).join("")}</ul></div><div class="info-panel"><h3>${copy.dimensionsTitle}</h3><div class="dimension-tags">${copy.dimensions.map(x => `<span>${x}</span>`).join("")}</div></div></section><section class="notice-panel"><h2>${copy.noticeTitle}</h2><ol>${copy.notices.map(x => `<li>${x}</li>`).join("")}</ol></section><a class="primary-button start-button" id="start-test" href="${testHref}">${copy.start} <span>→</span></a><p class="content-status">PRODUCT CONTENT V${Scl90StaticCopy.contentVersion} · ${Scl90StaticCopy.contentStatus}</p></section><footer class="home-footer">${copy.footer}<br><small>${copy.footerNote}</small></footer>`;
  }

  if (fixture) {
    renderHome();
    return;
  }

  try {
    const runtime = Scl90PlatformBridge.createRuntime();
    const state = await runtime.initialize();

    if (!state.ok) {
      root.innerHTML = `<section class="state-message"><h1>暂时无法进入测评</h1><p>${state.message}</p><a href="/access.html?test=scl90">前往公共授权入口</a></section>`;
      return;
    }

    if (state.completed) {
      location.replace(Scl90PlatformBridge.pathWithToken("report.html"));
      return;
    }

    renderHome();
  } catch (error) {
    root.innerHTML = `<section class="state-message"><h1>测评载入失败</h1><p>${error.message}</p></section>`;
  }
})();
