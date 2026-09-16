import { readFile } from "node:fs/promises";

const envFile = process.env.LIVE_ENV_FILE;

if (process.env.SCL90_LIVE_TEST !== "1" || !envFile) {
  throw new Error("Live database verification requires SCL90_LIVE_TEST=1 and LIVE_ENV_FILE.");
}

function parseEnv(source) {
  const values = {};
  source.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const separator = trimmed.indexOf("=");
    if (separator < 1) return;
    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  });
  return values;
}

const secrets = parseEnv(await readFile(envFile, "utf8"));
const supabaseUrl = secrets.SUPABASE_URL;
const serviceRoleKey = secrets.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Live database environment is incomplete.");
}

const headers = {
  apikey: serviceRoleKey,
  Authorization: `Bearer ${serviceRoleKey}`,
  Prefer: "count=exact",
  Range: "0-0"
};

async function exactCount(filter = "") {
  const response = await fetch(`${supabaseUrl}/rest/v1/test_links?select=test_id${filter}`, { headers });
  if (!response.ok) throw new Error(`Count query failed with HTTP ${response.status}.`);
  const range = response.headers.get("content-range") || "";
  const match = range.match(/\/(\d+)$/);
  if (!match) throw new Error("Count query did not return an exact content range.");
  return Number(match[1]);
}

async function readScl90Rows() {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/test_links?select=test_id,used,result_type,result_data&test_id=eq.scl90`,
    { headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` } }
  );
  if (!response.ok) throw new Error(`SCL-90 verification query failed with HTTP ${response.status}.`);
  return response.json();
}

async function readPublicAccess() {
  const response = await fetch(`${supabaseUrl}/rest/v1/public_access?select=enabled`, {
    headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` }
  });
  if (!response.ok) throw new Error(`Public-access query failed with HTTP ${response.status}.`);
  return response.json();
}

const [totalRows, nullRows, villainRows, scl90Rows, scl90Records, publicAccessRows] = await Promise.all([
  exactCount(),
  exactCount("&test_id=is.null"),
  exactCount("&test_id=eq.villain"),
  exactCount("&test_id=eq.scl90"),
  readScl90Rows(),
  readPublicAccess()
]);

const validScl90Records = scl90Records.filter(row =>
  row?.test_id === "scl90" &&
  row?.used === true &&
  row?.result_type === "scl90-report" &&
  row?.result_data?.testId === "scl90" &&
  row?.result_data?.schemaVersion === 1
);
const stableContextRecords = scl90Records.filter(row =>
  typeof row?.result_data?.reportContext?.generatedAt === "string" &&
  typeof row?.result_data?.reportContext?.generatedLabel === "string"
);

console.log(JSON.stringify({
  totalRows,
  nullRows,
  villainRows,
  scl90Rows,
  scl90UsedRows: scl90Records.filter(row => row?.used === true).length,
  validScl90ResultRows: validScl90Records.length,
  stableContextRows: stableContextRecords.length,
  publicAccessRows: publicAccessRows.length,
  publicAccessEnabled: publicAccessRows.length === 1 ? publicAccessRows[0]?.enabled : null
}));

if (
  scl90Records.length !== scl90Rows ||
  validScl90Records.length !== scl90Rows ||
  stableContextRecords.length < 1 ||
  publicAccessRows.length !== 1
) {
  process.exitCode = 1;
}
