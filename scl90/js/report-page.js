(async function initializeScl90ReportPage() {
  "use strict";

  const params = new URLSearchParams(location.search);
  const fixture = params.get("fixture");
  const localDevelopment = Scl90PlatformBridge.isLocalDevelopment();
  const shell = document.getElementById("report-root");
  const toast = document.getElementById("preview-toast");

  function showEmpty(title, message, href = "test.html") {
    shell.innerHTML = `<section class="state-message"><h1>${title}</h1><p>${message}</p><a href="${href}">返回答题</a></section>`;
  }

  function showToast(message) {
    toast.textContent = message;
    toast.hidden = false;
    setTimeout(() => {
      toast.hidden = true;
    }, 2400);
  }

  function installExport() {
    const exportRoot = document.getElementById("scl90-report-export-root");
    const button = exportRoot?.querySelector('[data-preview-action="save"]');
    if (!exportRoot || !button) return;

    Scl90ReportExport.install({
      root: exportRoot,
      button,
      document,
      window,
      html2canvas,
      preferredScale: Math.min(window.devicePixelRatio || 1, 2),
      onSuccess: result => showToast(`报告图片已生成：${result.canvasWidth} × ${result.canvasHeight}`),
      onError: error => {
        console.error("SCL-90 report export failed", error);
        showToast("生成失败，请重试");
      }
    });
  }

  function render(payload, context) {
    Scl90Product.renderReport(payload, {
      document,
      reportRoot: shell,
      reportContent: Scl90ReportContent,
      staticCopy: Scl90StaticCopy,
      generatedLabel: new Date().toLocaleString("zh-CN"),
      ...context
    });
    installExport();
  }

  if (localDevelopment && ["normal", "mild", "moderate", "severe"].includes(fixture)) {
    render(Scl90VisualPayloads[fixture], {
      visualCopy: Scl90VisualReportCopy,
      generatedLabel: "开发视觉预览",
      source: "visual-fixture"
    });
    return;
  }

  if (localDevelopment && params.get("source") === "dev-result") {
    let payload = null;
    try {
      payload = Scl90DevResultStore.load(sessionStorage);
    } catch (error) {
      payload = null;
    }

    if (!payload) {
      showEmpty("没有可恢复的开发报告", "请先完成全部90题，或使用明确的视觉 fixture。");
      return;
    }

    render(payload, { source: "dev-result-restore" });
    return;
  }

  if (params.get("token")) {
    const runtime = Scl90PlatformBridge.createRuntime({
      reportContext: {
        document,
        reportRoot: shell,
        reportContent: Scl90ReportContent,
        staticCopy: Scl90StaticCopy,
        generatedLabel: new Date().toLocaleString("zh-CN"),
        source: "token-restore"
      }
    });
    const state = await runtime.initialize();

    if (!state.ok) {
      showEmpty("报告恢复失败", state.message, Scl90PlatformBridge.pathWithToken("test.html"));
      return;
    }

    if (!state.completed) {
      location.replace(Scl90PlatformBridge.pathWithToken("test.html"));
      return;
    }

    installExport();
    return;
  }

  let payload = null;
  try {
    payload = Scl90SessionResultStore.load(sessionStorage);
  } catch (error) {
    payload = null;
  }

  if (!payload) {
    showEmpty("没有可恢复的测评报告", "请先完成全部90题。", "/access.html?test=scl90");
    return;
  }

  render(payload, { source: "public-session-restore" });
})().catch(error => {
  const shell = document.getElementById("report-root");
  if (shell) {
    shell.innerHTML = `<section class="state-message"><h1>报告载入失败</h1><p>${error.message}</p></section>`;
  }
});
