export default async function handler(req, res) {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ valid: false, message: "请使用购买后获得的专属链接进入测试。" });
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

  if (data[0].used) {
    return res.status(403).json({ valid: false, message: "该链接已使用。" });
  }

  return res.status(200).json({ valid: true });
}