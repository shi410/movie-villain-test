import testDefinitions from "../tests/definitions.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Only POST allowed" });
  }

  const { token, resultType, resultData, testId } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: "缺少 token" });
  }

  if (!resultType) {
    return res.status(400).json({ success: false, message: "缺少测试结果" });
  }

  if (!resultData) {
    return res.status(400).json({ success: false, message: "缺少测试数据" });
  }

  const requestTestId = testId ?? "villain";

  if (typeof requestTestId !== "string" || !testDefinitions.get(requestTestId)) {
    return res.status(400).json({ success: false, message: "未知的测试类型。" });
  }

  const tokenResponse = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/test_links?token=eq.${encodeURIComponent(token)}&select=token,used,test_id`,
    {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      }
    }
  );

  if (!tokenResponse.ok) {
    return res.status(500).json({ success: false, message: "链接验证失败" });
  }

  const tokenRows = await tokenResponse.json();

  if (!tokenRows.length) {
    return res.status(400).json({ success: false, message: "链接无效" });
  }

  const tokenRow = tokenRows[0];
  const effectiveTokenTestId = tokenRow.test_id ?? "villain";

  if (!testDefinitions.get(effectiveTokenTestId)) {
    return res.status(403).json({ success: false, message: "该链接所属的测试不存在。" });
  }

  if (effectiveTokenTestId !== requestTestId) {
    return res.status(403).json({ success: false, message: "该链接不适用于当前测试。" });
  }

  if (tokenRow.used) {
    return res.status(400).json({ success: false, message: "链接无效或已使用" });
  }

  const response = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/test_links?token=eq.${encodeURIComponent(token)}&used=eq.false`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        Prefer: "return=representation"
      },
      body: JSON.stringify({
        used: true,
        result_type: resultType,
        result_data: resultData
      })
    }
  );

  const data = await response.json();

  if (!data.length) {
    return res.status(400).json({ success: false, message: "链接无效或已使用" });
  }

  return res.status(200).json({ success: true });
}
