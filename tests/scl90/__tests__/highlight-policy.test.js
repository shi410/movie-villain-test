"use strict";
const test=require("node:test");const assert=require("node:assert/strict");const policy=require("../highlight-policy.js");
function factors(mean=2){return Object.fromEntries(policy.factorOrder.map(id=>[id,{mean}]));}function select(level,values=factors()){return policy.select({overall:{level},factors:values,additional:{mean:5}});}
test("normal has no highlighted factors",()=>{assert.deepEqual(select("normal"),{highlightFactorIds:[],highlightStatus:"complete",closingVariant:"closing-normal"});});
test("non-normal returns no more than three core factors",()=>{assert.equal(select("mild").highlightFactorIds.length,3);});
test("additional never enters highlighted factors",()=>{assert.equal(select("severe").highlightFactorIds.includes("additional"),false);});
test("factor means sort descending",()=>{const x=factors();x.anxiety.mean=4;x.depression.mean=3;x.hostility.mean=2.5;assert.deepEqual(select("moderate",x).highlightFactorIds,["anxiety","depression","hostility"]);});
test("ties keep frozen report order",()=>{assert.deepEqual(select("mild").highlightFactorIds,["somatization","obsessiveCompulsive","interpersonalSensitivity"]);});
