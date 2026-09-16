"use strict";
const test=require("node:test");const assert=require("node:assert/strict");const product=require("../product.js");const renderer=require("../report-renderer.js");
function payload(){return product.score(Array(90).fill(1));}
function visual(level){const value=payload();value.total.level=level;value.total.statusLabel={normal:"状态平稳",mild:"有些困扰",moderate:"困扰较明显",severe:"困扰突出"}[level];value.total.classificationStatus="visual-fixture";Object.values(value.factors).concat(value.additional).forEach(f=>{f.level=level;f.statusLabel=value.total.statusLabel;});return value;}
test("renderer creates output without answers or scoring input",()=>{assert.equal(renderer.renderReport(payload()).testId,"scl90");});
test("renderer does not modify its input payload",()=>{const input=payload();const before=JSON.stringify(input);renderer.renderReport(input);assert.equal(JSON.stringify(input),before);});
test("JSON-restored payload remains renderable",()=>{const restored=JSON.parse(JSON.stringify(payload()));assert.equal(renderer.renderReport(restored).factors.length,10);});
test("additional never enters radar data",()=>{const vm=renderer.renderReport(payload());assert.equal(vm.radar.length,9);assert.equal(vm.radar.some(item=>item.id==="additional"),false);});
test("nine radar factors keep their frozen order",()=>{assert.deepEqual(renderer.renderReport(payload()).radar.map(x=>x.id),["somatization","obsessiveCompulsive","interpersonalSensitivity","depression","anxiety","hostility","phobicAnxiety","paranoidIdeation","psychoticism"]);});
test("four severity visual classes stay stable",()=>{["normal","mild","moderate","severe"].forEach(level=>{const vm=renderer.renderReport(visual(level));assert.equal(vm.total.severityClass,`severity-${level}`);assert.ok(vm.factors.every(f=>f.severityClass===`severity-${level}`));});});
test("completed overall renders its stable severity state",()=>{const vm=renderer.renderReport(payload());assert.equal(vm.pendingOverall,false);assert.equal(vm.total.severityClass,"severity-normal");assert.equal(vm.total.levelLabel,"正常");});
test("missing required factor data fails explicitly",()=>{const input=payload();delete input.factors.anxiety;assert.throws(()=>renderer.renderReport(input),/anxiety/);});
