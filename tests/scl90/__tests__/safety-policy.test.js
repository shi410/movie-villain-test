"use strict";
const test=require("node:test");const assert=require("node:assert/strict");const safety=require("../safety-policy.js");const scoring=require("../scoring.js");
function answers(){return Array(90).fill(1);}function flags(question){const x=answers();x[question-1]=2;return safety.evaluate({answers:x}).flags;}
test("Q15 flags only when answer is above 1",()=>{assert.deepEqual(safety.evaluate({answers:answers()}).flags,[]);assert.deepEqual(flags(15),["self_harm_thoughts"]);});
test("Q59 flags only when answer is above 1",()=>{assert.deepEqual(flags(59),["death_related_thoughts"]);});
test("Q63 flags only when answer is above 1",()=>{assert.deepEqual(flags(63),["harm_to_others_urge"]);});
test("safety returns event flags without clinical risk levels",()=>{const x=answers();x[14]=x[58]=x[62]=5;assert.deepEqual(safety.evaluate({answers:x}),{status:"complete",flags:["self_harm_thoughts","death_related_thoughts","harm_to_others_urge"]});assert.equal("riskLevel" in safety.evaluate({answers:x}),false);});
test("safety evaluation does not mutate answers or change frozen scoring",()=>{const x=answers();x[14]=2;const before=JSON.stringify(x);safety.evaluate({answers:x});const result=scoring.score(x);assert.equal(JSON.stringify(x),before);assert.equal(result.total.score,91);assert.equal(result.factors.depression.rawScore,14);});
