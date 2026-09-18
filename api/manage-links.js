import testDefinitions from "../tests/definitions.js";
import { requireAdmin } from "../lib/server/admin-auth.js";

const BASE_URL = "https://filmtest.top";
const ALLOWED_STATUSES = new Set(["all", "unused", "completed"]);

function parsePositiveInteger(value, fallback, maximum) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, maximum);
}

function getTotalCount(response, fallback) {
  const contentRange = response.headers?.get?.("content-range") || "";
  const total = Number(contentRange.split("/")[1]);
  return Number.isFinite(total) ? total : fallback;
}

function createLink(testId, token) {
  const definition = testDefinitions.get(testId) || testDefinitions.get("villain");
  const entryUrl = new URL(definition.entryPath, BASE_URL);
  entryUrl.searchParams.set("token", token);
  return entryUrl.toString();
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Only GET allowed" });
  }

  if (!requireAdmin(req, res)) return;

  const page = parsePositiveInteger(req.query?.page, 1, 100000);
  const pageSize = parsePositiveInteger(req.query?.pageSize, 20, 100);
  const status = typeof req.query?.status === "string" ? req.query.status : "all";
  const testId = typeof req.query?.testId === "string" ? req.query.testId.trim() : "";
  const search = typeof req.query?.search === "string" ? req.query.search.trim() : "";

  if (!ALLOWED_STATUSES.has(status)) {
    return res.status(400).json({ success: false, message: "无效的链接状态。" });
  }

  if (testId && !testDefinitions.get(testId)) {
    return res.status(400).json({ success: false, message: "未知的测试类型。" });
  }

  if (search && (!/^[A-Za-z0-9_-]+$/.test(search) || search.length > 64)) {
    return res.status(400).json({ success: false, message: "Token 搜索内容格式无效。" });
  }

  const params = new URLSearchParams({
    select: "id,token,used,created_at,result_type,test_id",
    order: "created_at.desc",
    offset: String((page - 1) * pageSize),
    limit: String(pageSize)
  });

  if (testId === "villain") {
    params.set("or", "(test_id.eq.villain,test_id.is.null)");
  } else if (testId) {
    params.set("test_id", `eq.${testId}`);
  }

  if (status !== "all") params.set("used", status === "completed" ? "eq.true" : "eq.false");
  if (search) params.set("token", `ilike.*${search}*`);

  try {
    const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/test_links?${params}`, {
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        Prefer: "count=exact"
      }
    });

    if (!response.ok) {
      console.error("Supabase link query failed:", response.status);
      return res.status(500).json({ success: false, message: "读取链接记录失败。" });
    }

    const data = await response.json();
    const total = getTotalCount(response, data.length);
    const links = data.map(row => {
      const effectiveTestId = row.test_id || "villain";
      return {
        id: row.id,
        token: row.token,
        testId: effectiveTestId,
        used: row.used === true,
        createdAt: row.created_at,
        resultType: row.result_type || null,
        link: createLink(effectiveTestId, row.token)
      };
    });

    return res.status(200).json({
      success: true,
      links,
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize))
    });
  } catch (error) {
    console.error("Manage links error:", error?.message || error);
    return res.status(500).json({ success: false, message: "读取链接记录失败，请稍后重试。" });
  }
}
