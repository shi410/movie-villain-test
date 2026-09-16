import testDefinitions from "../tests/definitions.js";

export default async function handler(req, res) {
  const { token, expectedTestId } = req.query;

  if (!token) {
    return res.status(400).json({ valid: false, message: "请使用购买后获得的专属链接进入测试。" });
  }

  const hasExpectedTestId = expectedTestId !== undefined && expectedTestId !== null;

  if (
    hasExpectedTestId &&
    (typeof expectedTestId !== "string" || !testDefinitions.get(expectedTestId))
  ) {
    return res.status(400).json({ valid: false, message: "未知的测试类型。" });
  }

  const response = await fetch(
    `${process.env.SUPABASE_URL}/rest/v1/test_links?token=eq.${encodeURIComponent(token)}&select=*`,
    {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      }
    }
  );

  const data = await response.json();

  if (!data.length) {
    return res.status(404).json({ valid: false, message: "链接无效。" });
  }

  const tokenRow = data[0];
  const effectiveTestId = tokenRow.test_id ?? "villain";

  if (!testDefinitions.get(effectiveTestId)) {
    return res.status(403).json({ valid: false, message: "该链接所属的测试不存在。" });
  }

  if (hasExpectedTestId && effectiveTestId !== expectedTestId) {
    return res.status(403).json({ valid: false, message: "该链接不适用于当前测试。" });
  }

  if (tokenRow.used) {
    if (tokenRow.result_type) {
      return res.status(200).json({
        valid: true,
        completed: true,
        testId: effectiveTestId,
        resultType: tokenRow.result_type,
        resultData: tokenRow.result_data
      });
    }

    return res.status(403).json({
      valid: false,
      message: "该链接已使用，但未找到历史测试结果。"
    });
  }

  return res.status(200).json({
    valid: true,
    completed: false,
    testId: effectiveTestId
  });
}
