export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Only POST allowed" });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: "缺少 token" });
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
      body: JSON.stringify({ used: true })
    }
  );

  const data = await response.json();

  if (!data.length) {
    return res.status(400).json({ success: false, message: "链接无效或已使用" });
  }

  return res.status(200).json({ success: true });
}