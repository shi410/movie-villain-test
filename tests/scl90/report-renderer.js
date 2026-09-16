(function initializeScl90ReportRenderer(global, factory) {
  "use strict";
  const commonJs = typeof module !== "undefined" && module.exports;
  const renderer = factory(
    commonJs ? require("./validators.js") : global.Scl90Validators,
    commonJs ? require("./factor-definitions.js") : global.Scl90FactorDefinitions,
    commonJs ? require("./content/report-content.js") : global.Scl90ReportContent,
    commonJs ? require("./content/static-copy.js") : global.Scl90StaticCopy,
    commonJs ? require("../../scl90/js/radar-chart.js") : global.Scl90RadarChart
  );
  if (commonJs) module.exports = renderer;
  if (global) global.Scl90ReportRenderer = renderer;
})(typeof globalThis !== "undefined" ? globalThis : this, function createReportRenderer(validators, definitions, defaultContent, defaultStaticCopy, radarChart) {
  "use strict";
  const levelLabels = Object.freeze({ normal: "正常", mild: "轻度", moderate: "中度", severe: "重度" });
  function assertFactor(id, value) {
    if (!value || !Number.isFinite(value.rawScore) || !Number.isFinite(value.mean) || !Number.isInteger(value.itemCount) || !levelLabels[value.level]) {
      throw new TypeError(`SCL-90 report requires valid factor data for ${id}.`);
    }
  }
  function createViewModel(resultPayload, context) {
    validators.validateCurrentResultPayload(resultPayload);
    const content = context && context.reportContent ? context.reportContent : defaultContent;
    const staticCopy = context && context.staticCopy ? context.staticCopy : defaultStaticCopy;
    const visualCopy = context && context.visualCopy ? context.visualCopy : null;
    const factors = definitions.map(definition => {
      const value = definition.id === "additional" ? resultPayload.additional : resultPayload.factors[definition.id];
      assertFactor(definition.id, value);
      const meta = content.factorMeta[definition.id];
      const levelCopy = visualCopy && visualCopy[definition.id] ? visualCopy[definition.id] : content.factorCopy[definition.id][value.level];
      return Object.freeze({
        id: definition.id, label: meta.name, friendlyName: meta.friendlyName,
        definition: levelCopy.definition || meta.definition, rawScore: value.rawScore, itemCount: value.itemCount,
        mean: value.mean, level: value.level, levelLabel: levelLabels[value.level], statusLabel: value.statusLabel,
        severityClass: `severity-${value.level}`, includeInRadar: definition.includeInRadar,
        recentState: levelCopy.recentState, suggestion: levelCopy.suggestion
      });
    });
    const level = resultPayload.total.level;
    const highlighted = resultPayload.report.highlightFactorIds.map(id => factors.find(factor => factor.id === id)).filter(Boolean);
    const overallSummary = highlighted.length
      ? `相对明显的体验主要集中在${highlighted.map(factor => factor.friendlyName).join("、")}。`
      : "本次作答未设置突出维度，请继续结合近期生活情境观察自己的状态。";
    const urgentSafety = resultPayload.safety.flags.includes("self_harm_thoughts") || resultPayload.safety.flags.includes("harm_to_others_urge");
    const closing = content.closingCopy[resultPayload.report.closingVariant];
    return Object.freeze({
      kind: "scl90-report", resultPayload, context,
      testId: "scl90", total: Object.freeze({ ...resultPayload.total, levelLabel: levelLabels[level], severityClass: `severity-${level}` }),
      symptoms: resultPayload.symptoms, screening: resultPayload.screening, report: resultPayload.report, safety: resultPayload.safety,
      factors: Object.freeze(factors), highlighted: Object.freeze(highlighted), overallSummary,
      radar: Object.freeze(factors.filter(factor => factor.includeInRadar).map(factor => Object.freeze({ id: factor.id, label: factor.label, mean: factor.mean }))),
      generatedLabel: context && context.generatedLabel ? context.generatedLabel : "生成时间未提供",
      source: context && context.source ? context.source : "payload", staticCopy, closing, urgentSafety, pendingOverall: false
    });
  }
  function element(document, tag, className, text) { const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node; }
  function badge(document, factor) { return element(document,"span",`severity-badge ${factor.severityClass}`,factor.levelLabel); }
  function buildDom(document, vm) {
    const root=element(document,"article","report-document");root.id="scl90-report-export-root";
    const header=element(document,"header","report-hero");header.append(element(document,"div","report-heart","♡"),element(document,"h1","",vm.staticCopy.report.title),element(document,"p","",`测评完成时间：${vm.generatedLabel}`));root.appendChild(header);
    if(vm.urgentSafety){const alert=element(document,"section","report-section safety-alert");alert.append(element(document,"h2","section-title","请优先关注此刻的安全"),element(document,"p","","你在与生命或人身安全有关的条目上选择了非“没有”。单个条目不能判断风险程度，但这一回答值得认真对待。"),element(document,"p","","如果此刻已有伤害自己或他人的具体打算、正在准备实施，或感觉难以控制冲动，请优先联系身边可信任的人、120、110、就近急诊或12356心理援助热线。"));root.appendChild(alert);}
    const summary=element(document,"section","report-section report-summary");summary.appendChild(element(document,"h2","section-title","总体评估结果"));const sg=element(document,"div","summary-grid");const score=element(document,"div","summary-metric");score.append(element(document,"span","metric-label","SCL-90 总分"),element(document,"strong",`metric-value ${vm.total.severityClass}`,String(vm.total.score)),element(document,"span","metric-note","满分 450 分"));const level=element(document,"div","summary-metric");level.append(element(document,"span","metric-label","近期心理困扰程度"),element(document,"strong",`overall-badge ${vm.total.severityClass}`,vm.total.levelLabel),element(document,"span",`metric-status ${vm.total.severityClass}`,vm.total.statusLabel));sg.append(score,level);summary.append(sg,element(document,"p","summary-copy",vm.overallSummary),element(document,"p","screening-copy",vm.staticCopy.report.screeningNote));root.appendChild(summary);
    const overview=element(document,"section","report-section factor-overview");overview.appendChild(element(document,"h2","section-title","因子维度详情"));const legend=element(document,"div","severity-legend");legend.append(element(document,"strong","","评估标准"));[["normal","正常 (< 2.0)"],["mild","轻度 (2.0–2.49)"],["moderate","中度 (2.5–2.99)"],["severe","重度 (≥ 3.0)"]].forEach(([key,text])=>{const item=element(document,"span","legend-item");item.append(element(document,"i",`severity-dot severity-${key}`),document.createTextNode(text));legend.appendChild(item);});overview.appendChild(legend);const table=element(document,"div","factor-table");const head=element(document,"div","factor-row factor-head");["维度","原始分","均分","水平"].forEach(text=>head.appendChild(element(document,"span","",text)));table.appendChild(head);const grid=element(document,"div","overview-grid");vm.factors.forEach(f=>{const row=element(document,"div","factor-row");row.append(element(document,"strong","",f.label),element(document,"span","",String(f.rawScore)),element(document,"span",f.severityClass,f.mean.toFixed(2)),badge(document,f));table.appendChild(row);const card=element(document,"div",`overview-card ${f.severityClass}`);card.append(element(document,"strong","",f.label),element(document,"b",f.severityClass,f.mean.toFixed(2)),badge(document,f));grid.appendChild(card);});overview.append(table,grid);root.appendChild(overview);
    const radar=element(document,"section","report-section radar-section");radar.append(element(document,"h2","section-title","因子雷达图"),radarChart.render(document,vm.radar));root.appendChild(radar);
    const details=element(document,"section","factor-details");vm.factors.forEach(f=>{const card=element(document,"article",`factor-card ${f.severityClass}`);const title=element(document,"div","factor-title");title.append(element(document,"i",`severity-dot ${f.severityClass}`),element(document,"h3","",f.label),element(document,"em","",f.definition));const fs=element(document,"div","factor-score");fs.append(element(document,"strong",f.severityClass,f.mean.toFixed(2)),badge(document,f));const copy=element(document,"div","factor-copy-grid");[["特","近期状态",f.recentState],["建","可以尝试",f.suggestion]].forEach(([mark,label,text])=>{const box=element(document,"div","copy-box");const h=element(document,"h4","");h.append(element(document,"i","copy-mark",mark),document.createTextNode(label));box.append(h,element(document,"p","",text));copy.appendChild(box);});const stats=element(document,"div","factor-stats");[[f.rawScore,"原始总分"],[f.itemCount,"题目数量"],[f.mean.toFixed(2),"因子均分"],[f.statusLabel,"状态提示"]].forEach(([value,label])=>{const s=element(document,"div","stat");s.append(element(document,"strong",f.severityClass,String(value)),element(document,"span","",label));stats.appendChild(s);});card.append(title,fs,copy,stats);details.appendChild(card);});root.appendChild(details);
    const note=element(document,"section","report-section report-note");note.append(element(document,"h2","section-title","报告说明"),element(document,"p","",vm.staticCopy.report.disclaimer));root.appendChild(note);const closing=element(document,"section","report-section report-closing");closing.append(element(document,"h2","section-title","写在报告最后"),element(document,"h3","",vm.closing.title),element(document,"p","",vm.closing.body),element(document,"aside","resource-box","如感受持续困扰，可拨打全国统一心理援助热线 12356，或向专业心理健康服务人员求助。"));root.appendChild(closing);
    const footer=element(document,"footer","report-footer");const versionLabel=element(document,"p","export-exclude","PRODUCT CONTENT V1.0 · FROZEN");versionLabel.dataset.exportExclude="true";footer.append(element(document,"p","",`报告生成时间：${vm.generatedLabel}`),versionLabel);root.appendChild(footer);const actions=element(document,"div","report-actions");actions.dataset.exportExclude="true";const save=element(document,"button","primary-button","保存报告图片");save.type="button";save.dataset.previewAction="save";const cta=element(document,"button","secondary-button","了解更多测评");cta.type="button";cta.disabled=true;actions.append(save,cta);root.appendChild(actions);return root;
  }
  function renderReport(resultPayload,context){const vm=createViewModel(resultPayload,context);const document=context&&context.document;return document?buildDom(document,vm):vm;}
  return Object.freeze({ createViewModel, buildDom, renderReport, levelLabels });
});
