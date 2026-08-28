const accessCodeInput = document.getElementById("accessCodeInput");
const enterTestBtn = document.getElementById("enterTestBtn");
const accessStatusText = document.getElementById("accessStatusText");

enterTestBtn.onclick = async () => {
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

    window.location.href = "/";
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