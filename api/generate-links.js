import testDefinitions from "../tests/definitions.js";

function createToken(length = 32) {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let token = "";

  for (let i = 0; i < length; i++) {
    token += chars[Math.floor(Math.random() * chars.length)];
  }

  return token;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { count = 10, testId } = req.body;

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

  const safeCount = Math.min(Number(count), 1000);

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
    const errorText = await response.text();
    return res.status(500).json({ error: errorText });
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
