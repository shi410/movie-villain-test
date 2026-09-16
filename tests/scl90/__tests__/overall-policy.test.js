"use strict";
const test=require("node:test");const assert=require("node:assert/strict");const policy=require("../overall-policy.js");
[[1.49,"normal","正常","状态平稳"],[1.50,"mild","轻度","有些困扰"],[2.49,"mild","轻度","有些困扰"],[2.50,"moderate","中度","困扰较明显"],[3.49,"moderate","中度","困扰较明显"],[3.50,"severe","重度","困扰突出"]].forEach(([mean,level,label,status])=>test(`overall boundary ${mean} is ${level}`,()=>{assert.deepEqual(policy.classify({globalMean:mean}),{level,label,statusLabel:status,classificationStatus:"complete"});}));
test("overall rejects invalid means",()=>{assert.throws(()=>policy.classify({globalMean:Number.NaN}));assert.throws(()=>policy.classify(null));});
