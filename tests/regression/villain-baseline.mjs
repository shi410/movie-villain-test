import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "../..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const hash = value => crypto.createHash("sha256").update(value).digest("hex");
const ids = [
  "homelander", "joker", "makima", "hannibal", "light", "miranda",
  "pain", "anton", "tbag", "harley", "gollum", "plankton"
];
const fixtures = [
  ["single highest", [2,1,1,3,1,0,0,1,2,1,1,3,0,3,0,2,3,1,2,3,0,0,3,1], "hannibal", "40f04429ab81d8b4a657bea9f610105f3d8384e763d558530193c772ab08766c"],
  ["primaryHits tiebreak", [0,3,2,1,2,1,1,2,1,0,1,1,1,1,2,1,3,3,2,3,2,2,1,2], "anton", "ea8021988081d0d014a70b5f6481ccebef1509a848961d9117780cd5c4345367"],
  ["primaryHistory tiebreak", [2,2,0,1,0,2,3,1,1,0,0,2,1,1,1,1,0,2,2,2,0,2,1,0], "light", "7aab7ca13c95f588cb89a62fbf7de59f36c1c06dc0c935255104df2ff48521a1"],
  ["personalityOrder fallback (empty internal state)", Array(24).fill(null), "homelander", "287c70447e29ae6742655c27769eb8b6548b5cbf76c81e8d9cd80f7bf5298fb5"]
];
const resultsLog = [];

async function test(name, fn) {
  try {
    await fn();
    resultsLog.push(["PASS", name]);
  } catch (error) {
    resultsLog.push(["FAIL", name, error.message]);
  }
}

function browserData() {
  const context = {};
  vm.createContext(context);
  vm.runInContext(read("data/questions.js"), context);
  for (const id of ["homelander","joker","anton","gollum","plankton","makima","tbag","hannibal","pain","light","harley","miranda"]) {
    vm.runInContext(read(`data/personalities/${id}.js`), context);
  }
  vm.runInContext(read("data/results.js"), context);
  return context;
}

function extractFunction(source, name) {
  const start = source.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `Missing production function ${name}`);
  const opening = source.indexOf("{", start);
  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let i = opening; i < source.length; i++) {
    const char = source[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = null;
      continue;
    }
    if (char === "\"" || char === "'" || char === "`") { quote = char; continue; }
    if (char === "{") depth++;
    if (char === "}" && --depth === 0) return source.slice(start, i + 1);
  }
  throw new Error(`Unclosed production function ${name}`);
}

function scoringContext(context) {
  const source = read("js/app.js");
  const match = source.match(/const personalityOrder = (\[[\s\S]*?\]);/);
  assert.ok(match);
  const actualIds = Array.from(vm.runInNewContext(match[1]));
  assert.deepEqual(actualIds, ids);
  vm.runInContext(`var personalityOrder=${JSON.stringify(actualIds)};var score={};var primaryHits={};var primaryHistory=[];var userAnswers=[];`, context);
  for (const name of ["resetScores","applyOptionScore","rebuildScoresFromAnswers","getPrimaryLastIndex","getResultPersonality","createVillainResultPayload","restoreVillainResultPayload"]) {
    vm.runInContext(extractFunction(source, name), context);
  }
  return context;
}

function response() {
  return { statusCode: null, body: null, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
}

const context = browserData();
const questions = JSON.parse(vm.runInContext("JSON.stringify(questions)", context));
const personalities = JSON.parse(vm.runInContext("JSON.stringify(results)", context));

await test("definition and formal URL baseline", () => {
  const c = {}; c.globalThis = c; vm.createContext(c);
  vm.runInContext(read("tests/definitions.js"), c);
  const list = c.TestDefinitions.list();
  assert.equal(list.length, 2);
  assert.deepEqual(
    { id: list[0].test_id, enabled: list[0].enabled, entry: list[0].entryPath, access: list[0].publicAccessPath },
    { id: "villain", enabled: true, entry: "/", access: "/access.html" }
  );
  assert.deepEqual(
    {
      id: list[1].test_id,
      enabled: list[1].enabled,
      entry: list[1].entryPath,
      access: list[1].publicAccessPath
    },
    {
      id: "scl90",
      enabled: true,
      entry: "/scl90/",
      access: "/access.html?test=scl90"
    }
  );
  const indexSource = read("villain.html");
  assert.match(indexSource, /<script src="js\/platform\/runtime\.js"><\/script>/);
  assert.match(indexSource, /<script src="js\/app\.js"><\/script>/);
  assert.ok(indexSource.indexOf("js/platform/runtime.js") < indexSource.indexOf("js/app.js"));
  assert.match(read("access.html"), /<script src="js\/access\.js"><\/script>/);
});

await test("24 questions and option scoring snapshot", () => {
  assert.equal(questions.length, 24);
  assert.deepEqual(questions.map(q => q.options.length), Array(24).fill(4));
  assert.equal(hash(JSON.stringify(questions)), "9b7f553a315182929e14ac1c4be42e76de998da526d2dabd234da4f8388ce730");
  const scoring = questions.map(q => q.options.map(o => ({ primary: o.primary, scores: o.scores })));
  assert.equal(hash(JSON.stringify(scoring)), "3c8d6d5c9a503ab00eeb4a107dcd1a74c1325c8c76d642c717e112cd1b689390");
});

await test("12 personality IDs and report snapshot", () => {
  assert.deepEqual(Object.keys(personalities).sort(), ids.slice().sort());
  assert.equal(hash(JSON.stringify(personalities)), "12b393af45b0c76a85f046883211664c3bde366bfd41c0e6e49cf42b3ef277b9");
});

await test("production scoring fixtures and resultPayload", () => {
  const c = scoringContext(context);
  for (const [name, answers, expectedWinner, expectedHash] of fixtures) {
    vm.runInContext(`userAnswers=${JSON.stringify(answers)}`, c);
    vm.runInContext("rebuildScoresFromAnswers()", c);
    const payload = JSON.parse(vm.runInContext("JSON.stringify({score,primaryHits,primaryHistory})", c));
    const contractPayload = JSON.parse(vm.runInContext("JSON.stringify(createVillainResultPayload())", c));
    assert.deepEqual(Object.keys(payload), ["score", "primaryHits", "primaryHistory"]);
    assert.deepEqual(contractPayload, payload, `${name} Contract payload`);
    assert.equal(vm.runInContext("getResultPersonality().id", c), expectedWinner, name);
    assert.equal(hash(JSON.stringify(payload)), expectedHash, name);
    assert.doesNotThrow(() => JSON.stringify(payload));
    vm.runInContext("resetScores()", c);
    vm.runInContext(`restoreVillainResultPayload(${JSON.stringify(payload)})`, c);
    assert.equal(vm.runInContext("getResultPersonality().id", c), expectedWinner, `${name} restore`);
  }
});

await test("validate-token baseline", async () => {
  const handler = (await import(pathToFileURL(path.join(root, "api/validate-token.js")).href)).default;
  const savedFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () => ({ ok: true, json: async () => [{ used: false, test_id: "villain" }] });
    let res = response();
    await handler({ query: { token: "new", expectedTestId: "villain" } }, res);
    assert.deepEqual(res.body, { valid: true, completed: false, testId: "villain" });
    res = response();
    await handler({ query: { token: "new", expectedTestId: "unknown-test" } }, res);
    assert.equal(res.statusCode, 400);
    res = response();
    await handler({ query: { token: "new", expectedTestId: "scl90" } }, res);
    assert.equal(res.statusCode, 403);

    globalThis.fetch = async () => ({ ok: true, json: async () => [{ used: false, test_id: null }] });
    res = response();
    await handler({ query: { token: "old", expectedTestId: "villain" } }, res);
    assert.equal(res.body.testId, "villain");

    const payload = { score: { joker: 8 }, primaryHits: { joker: 3 }, primaryHistory: ["joker"] };
    globalThis.fetch = async () => ({ ok: true, json: async () => [{ used: true, test_id: null, result_type: "joker", result_data: payload }] });
    res = response();
    await handler({ query: { token: "done", expectedTestId: "villain" } }, res);
    assert.deepEqual(res.body, { valid: true, completed: true, testId: "villain", resultType: "joker", resultData: payload });
  } finally { globalThis.fetch = savedFetch; }
});

await test("use-token baseline", async () => {
  const handler = (await import(pathToFileURL(path.join(root, "api/use-token.js")).href)).default;
  const savedFetch = globalThis.fetch;
  const payload = { score: { joker: 8 }, primaryHits: { joker: 3 }, primaryHistory: ["joker"] };
  try {
    let calls = [];
    globalThis.fetch = async (url, options = {}) => {
      calls.push({ url, options });
      return calls.length === 1
        ? { ok: true, json: async () => [{ used: false, test_id: "villain" }] }
        : { ok: true, json: async () => [{}] };
    };
    let res = response();
    await handler({ method: "POST", body: { token: "valid", resultType: "joker", resultData: payload, testId: "villain" } }, res);
    assert.equal(res.statusCode, 200);
    assert.match(calls[1].url, /token=eq\.valid&used=eq\.false$/);
    assert.deepEqual(JSON.parse(calls[1].options.body), { used: true, result_type: "joker", result_data: payload });

    calls = [];
    globalThis.fetch = async (url, options = {}) => { calls.push({ url, options }); return { ok: true, json: async () => [{ used: false, test_id: "unknown-test" }] }; };
    res = response();
    await handler({ method: "POST", body: { token: "wrong", resultType: "joker", resultData: payload, testId: "villain" } }, res);
    assert.equal(res.statusCode, 403);
    assert.equal(calls.length, 1);
  } finally { globalThis.fetch = savedFetch; }
});

await test("historical restore source baseline", () => {
  const appSource = read("js/app.js");
  const runtimeSource = read("js/platform/runtime.js");
  assert.match(runtimeSource, /product\.renderReport\(data\.resultData/);
  assert.match(appSource, /resultPayload\?\.score\?\.\[id\]/);
  assert.match(appSource, /resultPayload\?\.primaryHits\?\.\[id\]/);
  assert.match(appSource, /primaryHistory\.push\(\.\.\.resultPayload\.primaryHistory\)/);
  assert.match(appSource, /const personality = results\[context\?\.resultType\]/);
  assert.match(appSource, /renderResult\(personality\)/);
});

await test("global public-access baseline", async () => {
  const handler = (await import(pathToFileURL(path.join(root, "api/validate-access-code.js")).href)).default;
  const savedFetch = globalThis.fetch;
  const urls = [];
  try {
    globalThis.fetch = async url => { urls.push(url); return { ok: true, json: async () => [{ access_code: "GLOBAL", enabled: false }] }; };
    let res = response();
    await handler({ method: "POST", body: { accessCode: "GLOBAL" } }, res);
    assert.equal(res.statusCode, 403);
    globalThis.fetch = async url => { urls.push(url); return { ok: true, json: async () => [{ access_code: "GLOBAL", enabled: true }] }; };
    res = response();
    await handler({ method: "POST", body: { accessCode: "GLOBAL" } }, res);
    assert.equal(res.statusCode, 200);
    assert.ok(urls.every(url => url.includes("public_access?id=eq.1") && !url.includes("test_id")));
    const appSource = read("js/app.js");
    const runtimeSource = read("js/platform/runtime.js");
    const completeSource = extractFunction(runtimeSource, "complete");
    assert.match(runtimeSource, /if \(!currentToken \|\| tokenUsed\)/);
    assert.equal((runtimeSource.match(/fetchImpl\("\/api\/validate-access-code"/g) || []).length, 1);
    assert.equal((appSource.match(/villainRuntime\.authorizePublicEntry\(\)/g) || []).length, 2);
    assert.doesNotMatch(completeSource, /validate-access-code|validatePublicAccessCode/);
  } finally { globalThis.fetch = savedFetch; }
});

for (const [status, name, message] of resultsLog) console.log(`${status} ${name}${message ? `: ${message}` : ""}`);
const failed = resultsLog.filter(([status]) => status === "FAIL");
console.log(`\n${resultsLog.length - failed.length}/${resultsLog.length} automatic baseline groups passed.`);
if (failed.length) process.exitCode = 1;
