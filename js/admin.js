const countInput = document.getElementById("countInput");
const generateBtn = document.getElementById("generateBtn");
const copyBtn = document.getElementById("copyBtn");
const statusText = document.getElementById("statusText");
const linksOutput = document.getElementById("linksOutput");

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