export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Only POST allowed"
    });
  }

  const { accessCode } = req.body;

  if (!accessCode) {
    return res.status(400).json({
      success: false,
      message: "请输入授权码"
    });
  }

  try {
    const response = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/public_access?id=eq.1&select=access_code,enabled`,
      {
        headers: {
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
        }
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error("Supabase query failed:", errorText);

      return res.status(500).json({
        success: false,
        message: "授权服务暂时不可用"
      });
    }

    const data = await response.json();

    if (!data.length) {
      return res.status(500).json({
        success: false,
        message: "未找到公共授权配置"
      });
    }

    const config = data[0];

    if (!config.enabled) {
      return res.status(403).json({
        success: false,
        message: "当前公共测试通道已关闭"
      });
    }

    if (accessCode.trim() !== config.access_code) {
      return res.status(401).json({
        success: false,
        message: "授权码错误"
      });
    }

    return res.status(200).json({
      success: true
    });
  } catch (error) {
    console.error("Validate access code error:", error);

    return res.status(500).json({
      success: false,
      message: "授权验证失败，请稍后重试"
    });
  }
}