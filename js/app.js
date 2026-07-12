let currentQuestion = 0;
let currentToken = null;
let tokenUsed = false;
let currentPersonality = null;

const score = {
  joker: 0,
  anton: 0,
  tbag: 0,
  tyler: 0
};

const homePage = document.getElementById("homePage");
const introPage = document.getElementById("introPage");
const questionPage = document.getElementById("questionPage");
const loadingPage = document.getElementById("loadingPage");
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
const resultRadar = document.getElementById("resultRadar");
const resultDimensions = document.getElementById("resultDimensions");
const resultDimensionSummary = document.getElementById("resultDimensionSummary");
const resultSections = document.getElementById("resultSections");
const resultSimilar = document.getElementById("resultSimilar");
const resultHiddenLine = document.getElementById("resultHiddenLine");

const rebateBtn = document.getElementById("rebateBtn");
const shareBtn = document.getElementById("shareBtn");
const rebateModal = document.getElementById("rebateModal");
const shareModal = document.getElementById("shareModal");
const closeRebateBtn = document.getElementById("closeRebateBtn");
const closeShareBtn = document.getElementById("closeShareBtn");
const sharePreview = document.getElementById("sharePreview");

function showPage(page) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });

  page.classList.add("active");
  window.scrollTo(0, 0);
}

function showError(message) {
  homePage.innerHTML = `
    <div class="error-state">
      <h1>链接不可用</h1>
      <p class="subtitle">${message}</p>
    </div>
  `;
  showPage(homePage);
}

function wait(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
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

function getOptionLabel(index) {
  return ["A", "B", "C", "D"][index] || "";
}

function loadQuestion() {
  const q = questions[currentQuestion];

  questionText.textContent = q.text;
  countText.textContent = `${currentQuestion + 1} / ${questions.length}`;
  progressBar.style.width = ((currentQuestion + 1) / questions.length * 100) + "%";

  options.innerHTML = "";

  q.options.forEach((option, index) => {
    const btn = document.createElement("button");

    btn.className = "option";
    btn.innerHTML = `
      <span class="option-letter">${getOptionLabel(index)}.</span>
      <span class="option-text">${option.text}</span>
    `;

    btn.onclick = () => {
      score[option.type]++;
      currentQuestion++;

      if (currentQuestion >= questions.length) {
        showLoadingThenResult();
      } else {
        loadQuestion();
      }
    };

    options.appendChild(btn);
  });
}

async function markTokenUsed() {
  if (!currentToken || tokenUsed) return true;

  try {
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
      return false;
    }

    tokenUsed = true;
    return true;
  } catch (err) {
    showError("链接核销失败，请联系客服。");
    return false;
  }
}

function iconSvg(type) {
  const icons = {
    file: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 3h7l4 4v14H7z"></path>
        <path d="M14 3v5h5"></path>
        <path d="M10 12h6"></path>
        <path d="M10 16h5"></path>
      </svg>
    `,
    radar: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3l8 5v8l-8 5-8-5V8z"></path>
        <path d="M12 3v18"></path>
        <path d="M4 8l16 8"></path>
        <path d="M20 8L4 16"></path>
        <path d="M12 8l4 3v4l-4 2-4-2v-4z"></path>
      </svg>
    `,
    mask: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 7c2-2 5-2 8 0 3-2 6-2 8 0v5c0 5-4 8-8 8s-8-3-8-8z"></path>
        <path d="M8 12h3"></path>
        <path d="M13 12h3"></path>
        <path d="M9 16c2 1 4 1 6 0"></path>
      </svg>
    `,
    film: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="5" width="16" height="14" rx="2"></rect>
        <path d="M8 5v14"></path>
        <path d="M16 5v14"></path>
        <path d="M4 9h4"></path>
        <path d="M16 9h4"></path>
        <path d="M4 15h4"></path>
        <path d="M16 15h4"></path>
      </svg>
    `,
    clash: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 18L18 6"></path>
        <path d="M6 6l12 12"></path>
        <path d="M4 12h4"></path>
        <path d="M16 12h4"></path>
      </svg>
    `,
    crack: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3l3 6-4 3 3 9-6-10 4-3z"></path>
      </svg>
    `,
    balance: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 4v17"></path>
        <path d="M6 7h12"></path>
        <path d="M8 7l-4 7h8z"></path>
        <path d="M16 7l-4 7h8z"></path>
      </svg>
    `,
    road: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 21l3-18"></path>
        <path d="M17 21L14 3"></path>
        <path d="M9 9h6"></path>
        <path d="M8 15h8"></path>
      </svg>
    `,
    pen: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 20l4-1 11-11-3-3L5 16z"></path>
        <path d="M13 6l3 3"></path>
      </svg>
    `,
    mirror: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="9" cy="10" r="4"></circle>
        <circle cx="15" cy="14" r="4"></circle>
        <path d="M12 4v16"></path>
      </svg>
    `
  };

  return icons[type] || icons.file;
}

function getSectionIcon(title) {
  const map = {
    "你的黑暗面与魅力": "mask",
    "剧情回顾": "film",
    "冲突与对抗": "clash",
    "黑暗来源": "crack",
    "亦正亦邪": "balance",
    "救赎之路": "road",
    "选角笔记": "pen"
  };

  return map[title] || "file";
}

function renderHeading(title, iconType) {
  return `
    <div class="report-heading">
      <span class="heading-icon">${iconSvg(iconType)}</span>
      <h3>${title}</h3>
    </div>
  `;
}

function hydrateStaticIcons() {
  document.querySelectorAll(".heading-icon[data-icon]").forEach(icon => {
    icon.innerHTML = iconSvg(icon.dataset.icon);
  });
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
  const maxRadius = 86;
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
      const point = pointAt(index, maxRadius + 34);

      return `
        <text x="${point.x}" y="${point.y}" class="radar-label" text-anchor="middle">
          <tspan x="${point.x}" dy="0">${name}</tspan>
          <tspan x="${point.x}" dy="17">${value}</tspan>
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
  currentPersonality = personality;
  hydrateStaticIcons();
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
          ${renderHeading(section.title, getSectionIcon(section.title))}
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

function getResultPersonality() {
  let maxType = "joker";
  let maxScore = -1;

  for (const key in score) {
    if (score[key] > maxScore) {
      maxScore = score[key];
      maxType = key;
    }
  }

  return results[maxType];
}

async function showLoadingThenResult() {
  const personality = getResultPersonality();

  showPage(loadingPage);

  renderResult(personality);

  const used = await Promise.all([
    markTokenUsed(),
    wait(1000)
  ]).then(([success]) => success);

  if (!used) return;

  showPage(resultPage);
}

function openModal(modal) {
  modal.classList.add("active");
  document.body.classList.add("modal-open");
}

function closeModal(modal) {
  modal.classList.remove("active");
  document.body.classList.remove("modal-open");
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

rebateBtn.onclick = () => {
  openModal(rebateModal);
};

shareBtn.onclick = () => {
  if (!currentPersonality || !currentPersonality.shareImage) {
    alert("结果长图暂未准备好。");
    return;
  }

  sharePreview.src = currentPersonality.shareImage;
  openModal(shareModal);
};

closeRebateBtn.onclick = () => {
  closeModal(rebateModal);
};

closeShareBtn.onclick = () => {
  closeModal(shareModal);
};

rebateModal.querySelector(".modal-backdrop").onclick = () => {
  closeModal(rebateModal);
};

shareModal.querySelector(".modal-backdrop").onclick = () => {
  closeModal(shareModal);
};

validateToken();