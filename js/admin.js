const countInput = document.getElementById("countInput");
const testSelect = document.getElementById("testSelect");
const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");
const statusText = document.getElementById("statusText");
const linksOutput = document.getElementById("linksOutput");

const adminSecretInput = document.getElementById("adminSecretInput");
const publicAccessCodeInput = document.getElementById("publicAccessCodeInput");
const loadPublicAccessBtn = document.getElementById("loadPublicAccessBtn");
const updatePublicAccessCodeBtn = document.getElementById("updatePublicAccessCodeBtn");
const togglePublicAccessBtn = document.getElementById("togglePublicAccessBtn");
const publicAccessStatusText = document.getElementById("publicAccessStatusText");

let publicAccessEnabled = false;
let testRegistryReady = false;

function showTestRegistryError(message) {
  testRegistryReady = false;
  testSelect.disabled = true;
  generateBtn.disabled = true;
  testSelect.replaceChildren(new Option("无可用测试", ""));
  statusText.textContent = message;
}

function initializeTestSelector() {
  if (!globalThis.TestRegistry || typeof globalThis.TestRegistry.list !== "function") {
    showTestRegistryError("测试列表加载失败，请刷新页面后重试");
    return;
  }

  try {
    const tests = globalThis.TestRegistry.list();

    if (!Array.isArray(tests) || tests.length === 0) {
      showTestRegistryError("当前没有已注册的测试，无法生成链接");
      return;
    }

    const enabledTests = tests.filter(test => test?.enabled === true);

    if (enabledTests.length === 0) {
      showTestRegistryError("当前没有已启用的测试，无法生成链接");
      return;
    }

    testSelect.replaceChildren(
      ...enabledTests.map(test => new Option(test.name, test.test_id))
    );
    testSelect.disabled = false;
    generateBtn.disabled = false;
    testRegistryReady = true;
    statusText.textContent = "";
  } catch (err) {
    showTestRegistryError("测试列表加载失败：" + err.message);
  }
}

initializeTestSelector();

generateBtn.onclick = async () => {
  if (!testRegistryReady || testSelect.disabled) {
    statusText.textContent = "测试列表不可用，无法生成链接";
    return;
  }

  const testId = testSelect.value;

  if (!testId) {
    statusText.textContent = "请选择测试后再生成链接";
    return;
  }

  const count = Number(countInput.value || 10);

  statusText.textContent = "正在生成链接...";
  linksOutput.value = "";

  try {
    const res = await fetch("/api/generate-links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ count, testId })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "生成失败");
    }

    linksOutput.value = data.links.join("\n");
    statusText.textContent = `已生成 ${data.count} 条链接`;
  } catch (err) {
    statusText.textContent = "生成失败：" + err.message;
  }
};

copyBtn.onclick = async () => {
  if (!linksOutput.value) {
    statusText.textContent = "还没有可复制的链接";
    return;
  }

  await navigator.clipboard.writeText(linksOutput.value);
  statusText.textContent = "已复制全部链接";
};

loadPublicAccessBtn.onclick = async () => {
  const adminSecret = adminSecretInput.value;

  if (!adminSecret) {
    publicAccessStatusText.textContent = "请输入管理员密码";
    return;
  }

  publicAccessStatusText.textContent = "正在读取当前配置...";

  try {
    const res = await fetch("/api/manage-public-access", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        adminSecret,
        action: "get"
      })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || "读取失败");
    }

    publicAccessEnabled = data.enabled;
    publicAccessCodeInput.value = data.accessCode;

    if (publicAccessEnabled) {
      publicAccessStatusText.textContent = "当前状态：已开启";
      togglePublicAccessBtn.textContent = "关闭公共通道";
    } else {
      publicAccessStatusText.textContent = "当前状态：已关闭";
      togglePublicAccessBtn.textContent = "开启公共通道";
    }
  } catch (err) {
    publicAccessStatusText.textContent = "读取失败：" + err.message;
  }
};

updatePublicAccessCodeBtn.onclick = async () => {
  const adminSecret = adminSecretInput.value;
  const accessCode = publicAccessCodeInput.value.trim();

  if (!adminSecret) {
    publicAccessStatusText.textContent = "请输入管理员密码";
    return;
  }

  if (!accessCode) {
    publicAccessStatusText.textContent = "请输入新的授权码";
    return;
  }

  publicAccessStatusText.textContent = "正在修改授权码...";

  try {
    const res = await fetch("/api/manage-public-access", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        adminSecret,
        action: "update-code",
        accessCode
      })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || "修改失败");
    }

    publicAccessCodeInput.value = data.accessCode;
    publicAccessEnabled = data.enabled;

    publicAccessStatusText.textContent =
      "授权码修改成功，当前状态：" +
      (publicAccessEnabled ? "已开启" : "已关闭");

    togglePublicAccessBtn.textContent =
      publicAccessEnabled ? "关闭公共通道" : "开启公共通道";
  } catch (err) {
    publicAccessStatusText.textContent = "修改失败：" + err.message;
  }
};

togglePublicAccessBtn.onclick = async () => {
  const adminSecret = adminSecretInput.value;

  if (!adminSecret) {
    publicAccessStatusText.textContent = "请输入管理员密码";
    return;
  }

  const nextEnabled = !publicAccessEnabled;

  publicAccessStatusText.textContent =
    nextEnabled ? "正在开启公共通道..." : "正在关闭公共通道...";

  try {
    const res = await fetch("/api/manage-public-access", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        adminSecret,
        action: "set-enabled",
        enabled: nextEnabled
      })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || "操作失败");
    }

    publicAccessEnabled = data.enabled;
    publicAccessCodeInput.value = data.accessCode;

    if (publicAccessEnabled) {
      publicAccessStatusText.textContent = "当前状态：已开启";
      togglePublicAccessBtn.textContent = "关闭公共通道";
    } else {
      publicAccessStatusText.textContent = "当前状态：已关闭";
      togglePublicAccessBtn.textContent = "开启公共通道";
    }
  } catch (err) {
    publicAccessStatusText.textContent = "操作失败：" + err.message;
  }
};
