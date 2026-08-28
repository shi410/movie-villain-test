const countInput = document.getElementById("countInput");
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

generateBtn.onclick = async () => {
  const count = Number(countInput.value || 10);

  statusText.textContent = "正在生成链接...";
  linksOutput.value = "";

  try {
    const res = await fetch("/api/generate-links", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ count })
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