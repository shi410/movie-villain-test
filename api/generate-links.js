import testDefinitions from "../tests/definitions.js";
import { randomBytes } from "node:crypto";
import { requireAdmin } from "../lib/server/admin-auth.js";

function createToken(length = 32) {
  return randomBytes(Math.ceil(length * 0.75)).toString("base64url").slice(0, length);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  if (!requireAdmin(req, res)) return;

  const { count = 10, testId } = req.body || {};

  const requestTestId = testId ?? "villain";
  const testDefinition = typeof requestTestId === "string"
    ? testDefinitions.get(requestTestId)
    : null;

  if (!testDefinition) {
    return res.status(400).json({ error: "未知的测试类型。" });
  }

  if (testDefinition.enabled !== true) {
    return res.status(403).json({ error: "该测试当前已关闭。" });
  }

  const requestedCount = Number(count);
  if (!Number.isInteger(requestedCount) || requestedCount < 1) {
    return res.status(400).json({ error: "生成数量必须是 1 到 1000 的整数。" });
  }

  const safeCount = Math.min(requestedCount, 1000);

  const rows = Array.from({ length: safeCount }, () => ({
    token: createToken(),
    used: false,
    test_id: requestTestId
  }));

  const response = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/test_links`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": process.env.SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Prefer": "return=representation"
      },
      body: JSON.stringify(rows)
    }
  );

  if (!response.ok) {
    console.error("Supabase link creation failed:", response.status);
    return res.status(500).json({ error: "链接生成失败，请稍后重试。" });
  }

  const data = await response.json();

  const baseUrl = "https://filmtest.top";

  const links = data.map(item => {
    const entryUrl = new URL(testDefinition.entryPath, baseUrl);
    entryUrl.searchParams.set("token", item.token);
    return entryUrl.toString();
  });

  return res.status(200).json({
    count: links.length,
    links
  });
}
