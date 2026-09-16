(function initializeScl90RadarChart(global, factory) {
  "use strict";
  const chart = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = chart;
  if (global) global.Scl90RadarChart = chart;
})(typeof globalThis !== "undefined" ? globalThis : this, function createRadarChart() {
  "use strict";
  const NS = "http://www.w3.org/2000/svg";
  function point(index, radius, center, count) {
    const angle = -Math.PI / 2 + index * Math.PI * 2 / count;
    return [center + Math.cos(angle) * radius, center + Math.sin(angle) * radius];
  }
  function polygonPoints(count, radius, center) {
    return Array.from({ length: count }, (_, index) => point(index, radius, center, count).join(",")).join(" ");
  }
  function createModel(entries) {
    if (!Array.isArray(entries) || entries.length !== 9) throw new Error("SCL-90 radar requires exactly nine core factors.");
    return entries.map(entry => ({ id: entry.id, label: entry.label, mean: entry.mean }));
  }
  function render(document, entries) {
    const data = createModel(entries);
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 360 340");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "九因子雷达图");
    const center = 180, radius = 112;
    [0.25, 0.5, 0.75, 1].forEach(scale => {
      const polygon = document.createElementNS(NS, "polygon");
      polygon.setAttribute("points", polygonPoints(9, radius * scale, center));
      polygon.setAttribute("class", "radar-grid");
      svg.appendChild(polygon);
    });
    data.forEach((entry, index) => {
      const axis = document.createElementNS(NS, "line");
      const [x, y] = point(index, radius, center, 9);
      axis.setAttribute("x1", center); axis.setAttribute("y1", center); axis.setAttribute("x2", x); axis.setAttribute("y2", y);
      axis.setAttribute("class", "radar-axis"); svg.appendChild(axis);
      const [lx, ly] = point(index, radius + 28, center, 9);
      const label = document.createElementNS(NS, "text");
      label.setAttribute("x", lx); label.setAttribute("y", ly); label.setAttribute("class", "radar-label");
      label.textContent = entry.label; svg.appendChild(label);
    });
    const values = data.map((entry, index) => point(index, radius * Math.max(0, Math.min(5, entry.mean)) / 5, center, 9));
    const area = document.createElementNS(NS, "polygon");
    area.setAttribute("points", values.map(value => value.join(",")).join(" ")); area.setAttribute("class", "radar-area"); svg.appendChild(area);
    values.forEach(([x, y]) => { const node = document.createElementNS(NS, "circle"); node.setAttribute("cx", x); node.setAttribute("cy", y); node.setAttribute("r", 4); node.setAttribute("class", "radar-node"); svg.appendChild(node); });
    return svg;
  }
  return Object.freeze({ createModel, render });
});
