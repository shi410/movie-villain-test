export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Only POST allowed"
    });
  }

  const {
    adminSecret,
    action,
    accessCode,
    enabled
  } = req.body;

  if (!adminSecret) {
    return res.status(401).json({
      success: false,
      message: "请输入管理员密码"
    });
  }

  if (adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({
      success: false,
      message: "管理员密码错误"
    });
  }

  try {
    if (action === "get") {
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
          message: "读取公共授权配置失败"
        });
      }

      const data = await response.json();

      if (!data.length) {
        return res.status(404).json({
          success: false,
          message: "未找到公共授权配置"
        });
      }

      return res.status(200).json({
        success: true,
        accessCode: data[0].access_code,
        enabled: data[0].enabled
      });
    }

    if (action === "update-code") {
      const newAccessCode = accessCode?.trim();

      if (!newAccessCode) {
        return res.status(400).json({
          success: false,
          message: "请输入新的授权码"
        });
      }

      const response = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/public_access?id=eq.1`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            Prefer: "return=representation"
          },
          body: JSON.stringify({
            access_code: newAccessCode
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        console.error("Supabase update code failed:", errorText);

        return res.status(500).json({
          success: false,
          message: "修改授权码失败"
        });
      }

      const data = await response.json();

      if (!data.length) {
        return res.status(404).json({
          success: false,
          message: "未找到公共授权配置"
        });
      }

      return res.status(200).json({
        success: true,
        message: "授权码修改成功",
        accessCode: data[0].access_code,
        enabled: data[0].enabled
      });
    }

    if (action === "set-enabled") {
      if (typeof enabled !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "enabled 必须是布尔值"
        });
      }

      const response = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/public_access?id=eq.1`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            Prefer: "return=representation"
          },
          body: JSON.stringify({
            enabled: enabled
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        console.error("Supabase update status failed:", errorText);

        return res.status(500).json({
          success: false,
          message: "修改公共通道状态失败"
        });
      }

      const data = await response.json();

      if (!data.length) {
        return res.status(404).json({
          success: false,
          message: "未找到公共授权配置"
        });
      }

      return res.status(200).json({
        success: true,
        message: enabled ? "公共授权通道已开启" : "公共授权通道已关闭",
        accessCode: data[0].access_code,
        enabled: data[0].enabled
      });
    }

    return res.status(400).json({
      success: false,
      message: "未知操作"
    });
  } catch (error) {
    console.error("Manage public access error:", error);

    return res.status(500).json({
      success: false,
      message: "公共授权管理失败，请稍后重试"
    });
  }
}