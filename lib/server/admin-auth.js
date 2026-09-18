import { createHmac, createHash, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "platform_admin_session";
const SESSION_VERSION = "v1";
const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

function getAdminSecret() {
  return process.env.ADMIN_SECRET || "";
}

function safeEqual(left, right) {
  const leftDigest = createHash("sha256").update(String(left)).digest();
  const rightDigest = createHash("sha256").update(String(right)).digest();
  return timingSafeEqual(leftDigest, rightDigest);
}

function sign(payload, secret) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function readCookie(req, name) {
  const header = req.headers?.cookie || req.headers?.Cookie || "";
  const prefix = `${name}=`;
  const item = header.split(";").map(value => value.trim()).find(value => value.startsWith(prefix));
  return item ? decodeURIComponent(item.slice(prefix.length)) : "";
}

function isSecureRequest(req) {
  const forwarded = req.headers?.["x-forwarded-proto"];
  return process.env.VERCEL_ENV === "production" || forwarded === "https";
}

export function isAdminSecretValid(candidate) {
  const secret = getAdminSecret();
  return Boolean(secret && candidate && safeEqual(candidate, secret));
}

export function createAdminSessionToken(now = Date.now()) {
  const secret = getAdminSecret();
  if (!secret) throw new Error("ADMIN_SECRET is not configured.");

  const expiresAt = Math.floor(now / 1000) + SESSION_MAX_AGE_SECONDS;
  const payload = `${SESSION_VERSION}.${expiresAt}`;
  return `${payload}.${sign(payload, secret)}`;
}

export function isAdminSessionValid(req, now = Date.now()) {
  const secret = getAdminSecret();
  const token = readCookie(req, COOKIE_NAME);
  if (!secret || !token) return false;

  const [version, expiresAtText, signature, ...extra] = token.split(".");
  const expiresAt = Number(expiresAtText);
  if (extra.length || version !== SESSION_VERSION || !Number.isInteger(expiresAt)) return false;
  if (expiresAt <= Math.floor(now / 1000)) return false;

  const payload = `${version}.${expiresAt}`;
  return safeEqual(signature, sign(payload, secret));
}

export function setAdminSessionCookie(req, res) {
  const token = createAdminSessionToken();
  const secure = isSecureRequest(req) ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_MAX_AGE_SECONDS}${secure}`
  );
}

export function clearAdminSessionCookie(req, res) {
  const secure = isSecureRequest(req) ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`
  );
}

export function requireAdmin(req, res) {
  res.setHeader?.("Cache-Control", "no-store");

  if (req.headers?.["x-admin-request"] !== "1") {
    res.status(403).json({ success: false, message: "无效的后台请求。" });
    return false;
  }

  if (!isAdminSessionValid(req)) {
    res.status(401).json({ success: false, message: "管理员登录已失效，请重新登录。" });
    return false;
  }

  return true;
}

export const adminSessionConfig = Object.freeze({
  cookieName: COOKIE_NAME,
  maxAgeSeconds: SESSION_MAX_AGE_SECONDS
});
