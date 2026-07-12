let currentQuestion = 0;
let currentToken = null;
let tokenUsed = false;

const score = {
  joker: 0,
  anton: 0,
  tbag: 0,
  tyler: 0
};

const homePage = document.getElementById("homePage");
const introPage = document.getElementById("introPage");
const questionPage = document.getElementById("questionPage");
const resultPage = document.getElementById("resultPage");

const startBtn = document.getElementById("startBtn");
const enterBtn = document.getElementById("enterBtn");

const questionText = document.getElementById("questionText");
const options = document.getElementById("options");
const progressBar = document.getElementById("progressBar");
const countText = document.getElementById("countText");

const resultNumber = document.getElementById("resultNumber");
const resultSource = document.getElementById("resultSource");
const resultTitle = document.getElementById("resultTitle");
const resultRole = document.getElementById("resultRole");
const resultActor = document.getElementById("resultActor");
const resultQuote = document.getElementById("resultQuote");
const resultImage = document.getElementById("resultImage");
const resultKeywords = document.getElementById("resultKeywords");
const resultVerdict = document.getElementById("resultVerdict");
const resultDimensions = document.getElementById("resultDimensions");
const resultRadar = document.getElementById("resultRadar");
const resultDimensionSummary = document.getElementById("resultDimensionSummary");
const resultSections = document.getElementById("resultSections");
const resultSimilar = document.getElementById("resultSimilar");
const resultHiddenLine = document.getElementById("resultHiddenLine");

function showPage(page) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });

  page.classList.add("active");
}

function showError(message) {
  homePage.innerHTML = `
    <h1>链接不可用</h1>
    <p class="subtitle">${message}</p>
  `;
  showPage(homePage);
}

async function validateToken() {
  const params = new URLSearchParams(window.location.search);
  currentToken = params.get("token");

  if (!currentToken) {
    showError("请使用购买后获得的专属链接进入测试。");
    return;
  }

  try {
    const res = await fetch(`/api/validate-token?token=${encodeURIComponent(currentToken)}`);
    const data = await res.json();

    if (!res.ok || !data.valid) {
      showError(data.message || "链接无效或已使用。");
      return;
    }
  } catch (err) {
    showError("链接验证失败，请稍后重试。");
  }
}

function loadQuestion() {
  const q = questions[currentQuestion];

  questionText.textContent = q.text;
  countText.textContent = `${currentQuestion + 1} / ${questions.length}`;
  progressBar.style.width = ((currentQuestion + 1) / questions.length * 100) + "%";

  options.innerHTML = "";

  q.options.forEach(option => {
    const btn = document.createElement("button");

    btn.className = "option";
    btn.textContent = option.text;

    btn.onclick = () => {
      score[option.type]++;
      currentQuestion++;

      if (currentQuestion >= questions.length) {
        showResult();
      } else {
        loadQuestion();
      }
    };

    options.appendChild(btn);
  });
}

async function markTokenUsed() {
  if (!currentToken || tokenUsed) return;

  const res = await fetch("/api/use-token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ token: currentToken })
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    showError(data.message || "链接核销失败，请联系客服。");
    return;
  }

  tokenUsed = true;
}

function textToParagraphs(text) {
  return text
    .trim()
    .split(/\n+/)
    .map(paragraph => `<p>${paragraph}</p>`)
    .join("");
}

function renderRadarChart(dimensions) {
  const size = 300;
  const center = size / 2;
  const maxRadius = 92;
  const levels = 4;
  const count = dimensions.length;
  const angleOffset = -Math.PI / 2;

  function pointAt(index, radius) {
    const angle = angleOffset + (Math.PI * 2 * index) / count;
    return {
      x: center + Math.cos(angle) * radius,
      y: center + Math.sin(angle) * radius
    };
  }

  const grid = [];

  for (let level = 1; level <= levels; level++) {
    const radius = (maxRadius * level) / levels;
    const points = dimensions
      .map((_, index) => {
        const point = pointAt(index, radius);
        return `${point.x},${point.y}`;
      })
      .join(" ");

    grid.push(`<polygon points="${points}" class="radar-grid-shape" />`);
  }

  const axes = dimensions
    .map((_, index) => {
      const point = pointAt(index, maxRadius);
      return `<line x1="${center}" y1="${center}" x2="${point.x}" y2="${point.y}" class="radar-axis" />`;
    })
    .join("");

  const dataPoints = dimensions.map((item, index) => {
    const value = Array.isArray(item) ? item[1] : item.value;
    const radius = maxRadius * (value / 100);
    return pointAt(index, radius);
  });

  const polygonPoints = dataPoints
    .map(point => `${point.x},${point.y}`)
    .join(" ");

  const dots = dataPoints
    .map(point => `<circle cx="${point.x}" cy="${point.y}" r="3.8" class="radar-dot" />`)
    .join("");

  const labels = dimensions
    .map((item, index) => {
      const name = Array.isArray(item) ? item[0] : item.name;
      const value = Array.isArray(item) ? item[1] : item.value;
      const point = pointAt(index, maxRadius + 28);

      return `
        <text x="${point.x}" y="${point.y}" class="radar-label" text-anchor="middle">
          <tspan x="${point.x}" dy="0">${name}</tspan>
          <tspan x="${point.x}" dy="16">${value}</tspan>
        </text>
      `;
    })
    .join("");

  resultRadar.innerHTML = `
    <div class="radar-title">人格因子雷达图</div>
    <svg viewBox="0 0 ${size} ${size}" role="img" aria-label="人格因子雷达图">
      ${grid.join("")}
      ${axes}
      <polygon points="${polygonPoints}" class="radar-area" />
      <polyline points="${polygonPoints} ${polygonPoints.split(" ")[0]}" class="radar-line" />
      ${dots}
      ${labels}
    </svg>
  `;
}

function renderResult(personality) {
  resultNumber.textContent = `NO.${personality.number}`;
  resultSource.textContent = personality.source;
  resultTitle.textContent = personality.title;
  resultRole.textContent = `${personality.role}｜${personality.source}`;
  resultActor.textContent = `演员：${personality.actor}`;
  resultQuote.textContent = personality.quote;
  if (personality.image) {
    resultImage.src = personality.image;
    resultImage.alt = personality.role;
    resultImage.style.display = "block";
  } else {
    resultImage.style.display = "none";
  }

  resultKeywords.innerHTML = personality.keywords
    .map(keyword => `<span>${keyword}</span>`)
    .join("");

  resultVerdict.innerHTML = textToParagraphs(personality.verdict);
  renderRadarChart(personality.dimensions);

  resultDimensions.innerHTML = personality.dimensions
    .map(item => `
      <div class="dimension-item">
        <div class="dimension-head">
          <span>${item.name}</span>
          <strong>${item.value}</strong>
        </div>
        <div class="dimension-track">
          <div style="width: ${item.value}%"></div>
        </div>
        <p>${item.desc}</p>
      </div>
    `)
    .join("");
  resultDimensionSummary.innerHTML = personality.dimensionSummary
  ? textToParagraphs(personality.dimensionSummary)
  : "";

resultSections.innerHTML = personality.sections
  .map((section, index) => {
    const sectionNumber = String(index + 3).padStart(2, "0");
    const body = section.items
      ? section.items
          .map(item => `
            <div class="report-item">
              <h4>${item.label}</h4>
              <div class="report-text">${textToParagraphs(item.content)}</div>
            </div>
          `)
          .join("")
      : `<div class="report-text">${textToParagraphs(section.content)}</div>`;

    const note = section.note
      ? `<div class="section-note">${section.note}</div>`
      : "";

    return `
      <section class="report-block">
        <div class="section-kicker">${sectionNumber}</div>
        <h3>${section.title}</h3>
        ${body}
        ${note}
      </section>
    `;
  })
  .join("");

resultSimilar.innerHTML = personality.similar
  .map(item => `
    <div class="similar-item">
      <strong>${item.name}</strong>
      <span>${item.source}</span>
      <p>${item.desc}</p>
    </div>
  `)
  .join("");

  resultHiddenLine.textContent = personality.hiddenLine;
}

async function showResult() {
  let maxType = "joker";
  let maxScore = -1;

  for (const key in score) {
    if (score[key] > maxScore) {
      maxScore = score[key];
      maxType = key;
    }
  }

  renderResult(results[maxType]);

  await markTokenUsed();

  showPage(resultPage);
}

startBtn.onclick = () => {
  showPage(introPage);
};

enterBtn.onclick = () => {
  currentQuestion = 0;

  score.joker = 0;
  score.anton = 0;
  score.tbag = 0;
  score.tyler = 0;

  loadQuestion();
  showPage(questionPage);
};

validateToken();