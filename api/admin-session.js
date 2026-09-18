import {
  clearAdminSessionCookie,
  isAdminSecretValid,
  isAdminSessionValid,
  setAdminSessionCookie
} from "../lib/server/admin-auth.js";

export default async function handler(req, res) {
  res.setHeader?.("Cache-Control", "no-store");

  if (req.headers?.["x-admin-request"] !== "1") {
    return res.status(403).json({ success: false, message: "无效的后台请求。" });
  }

  if (req.method === "GET") {
    const authenticated = isAdminSessionValid(req);
    return res.status(authenticated ? 200 : 401).json({ success: authenticated, authenticated });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Only GET or POST allowed" });
  }

  const { action, adminSecret } = req.body || {};

  if (action === "logout") {
    clearAdminSessionCookie(req, res);
    return res.status(200).json({ success: true });
  }

  if (action !== "login") {
    return res.status(400).json({ success: false, message: "未知操作。" });
  }

  if (!process.env.ADMIN_SECRET) {
    return res.status(503).json({ success: false, message: "后台登录尚未配置。" });
  }

  if (!isAdminSecretValid(adminSecret)) {
    return res.status(403).json({ success: false, message: "管理员密码错误。" });
  }

  setAdminSessionCookie(req, res);
  return res.status(200).json({ success: true, authenticated: true });
}
