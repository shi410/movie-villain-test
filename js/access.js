const accessCodeInput = document.getElementById("accessCodeInput");
const enterTestBtn = document.getElementById("enterTestBtn");
const accessStatusText = document.getElementById("accessStatusText");
const accessTitle = document.getElementById("accessTitle");

const requestedTestId = new URLSearchParams(window.location.search).get("test") || "villain";
const testDefinition = globalThis.TestRegistry?.get(requestedTestId);

if (!testDefinition) {
  accessTitle.textContent = "测试授权入口";
  accessStatusText.textContent = "未找到对应的测试";
  accessCodeInput.disabled = true;
  enterTestBtn.disabled = true;
} else {
  accessTitle.textContent = testDefinition.name;
  document.title = `${testDefinition.name} - 授权入口`;

  if (testDefinition.enabled !== true) {
    accessStatusText.textContent = "该测试当前尚未开放";
    accessCodeInput.disabled = true;
    enterTestBtn.disabled = true;
  }
}

enterTestBtn.onclick = async () => {
  if (!testDefinition || testDefinition.enabled !== true) {
    accessStatusText.textContent = "该测试当前无法通过公共授权进入";
    return;
  }

  const accessCode = accessCodeInput.value.trim();

  if (!accessCode) {
    accessStatusText.textContent = "请输入授权码";
    return;
  }

  enterTestBtn.disabled = true;
  accessStatusText.textContent = "正在验证授权码...";

  try {
    const res = await fetch("/api/validate-access-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        accessCode
      })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || "授权验证失败");
    }

    sessionStorage.setItem("publicAccessCode", accessCode);

    window.location.href = testDefinition.entryPath;
  } catch (err) {
    accessStatusText.textContent = err.message;
    enterTestBtn.disabled = false;
  }
};

accessCodeInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    enterTestBtn.click();
  }
});
