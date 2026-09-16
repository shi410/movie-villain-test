"use strict";
const test=require("node:test");const assert=require("node:assert/strict");const policy=require("../screening-policy.js");
function input(){return{totalScore:160,globalMean:2,positiveItemCount:43,negativeItemCount:47,positiveSymptomMean:2,dimensions:Object.fromEntries(policy.displayFactorOrder.map(id=>[id,{mean:2}]))};}
test("all exact screening boundaries remain negative",()=>{assert.deepEqual(policy.evaluate(input()),{overallPositive:false,triggeredRules:[],status:"complete"});});
test("totalScore 161 triggers while 160 does not",()=>{const x=input();x.totalScore=161;assert.deepEqual(policy.evaluate(x).triggeredRules,["total_score_gt_160"]);});
test("globalMean above 2 triggers while 2 does not",()=>{const x=input();x.globalMean=2.01;assert.deepEqual(policy.evaluate(x).triggeredRules,["global_mean_gt_2"]);});
test("positiveItemCount 44 triggers while 43 does not",()=>{const x=input();x.positiveItemCount=44;assert.deepEqual(policy.evaluate(x).triggeredRules,["positive_items_gt_43"]);});
test("negativeItemCount 46 triggers while 47 does not",()=>{const x=input();x.negativeItemCount=46;assert.deepEqual(policy.evaluate(x).triggeredRules,["negative_items_lt_47"]);});
test("positiveSymptomMean above 2 triggers while 2 and null do not",()=>{const x=input();x.positiveSymptomMean=2.01;assert.deepEqual(policy.evaluate(x).triggeredRules,["positive_symptom_mean_gt_2"]);x.positiveSymptomMean=null;assert.equal(policy.evaluate(x).overallPositive,false);});
test("all ten display dimensions use stable factor rule ids and order",()=>{const x=input();x.dimensions.anxiety.mean=2.01;x.dimensions.somatization.mean=3;x.dimensions.additional.mean=2.1;assert.deepEqual(policy.evaluate(x).triggeredRules,["factor_mean_gt_2:somatization","factor_mean_gt_2:anxiety","factor_mean_gt_2:additional"]);});
