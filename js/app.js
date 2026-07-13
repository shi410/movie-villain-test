let currentQuestion = 0;
let currentToken = null;
let tokenUsed = false;
let currentPersonality = null;

const personalityOrder = [
  "homelander",
  "joker",
  "makima",
  "hannibal",
  "light",
  "miranda",
  "pain",
  "anton",
  "tbag",
  "harley",
  "gollum",
  "plankton"
];

const score = {};
const primaryHits = {};
const primaryHistory = [];

const personalityTiers = {
  homelander: {
    label: "常规反派",
    className: "regular"
  },
  joker: {
    label: "常规反派",
    className: "regular"
  },
  makima: {
    label: "常规反派",
    className: "regular"
  },
  hannibal: {
    label: "常规反派",
    className: "regular"
  },
  light: {
    label: "常规反派",
    className: "regular"
  },
  miranda: {
    label: "常规反派",
    className: "regular"
  },
  pain: {
    label: "稀有反派",
    className: "rare"
  },
  anton: {
    label: "稀有反派",
    className: "rare"
  },
  tbag: {
    label: "稀有反派",
    className: "rare"
  },
  harley: {
    label: "稀有反派",
    className: "rare"
  },
  plankton: {
    label: "隐藏反派",
    className: "hidden"
  },
  gollum: {
    label: "隐藏反派",
    className: "hidden"
  }
};

const archiveGroups = [
  {
    title: "常规反派",
    className: "regular",
    ids: [
      "homelander",
      "hannibal",
      "makima",
      "joker",
      "miranda",
      "light"
    ]
  },
  {
    title: "稀有反派",
    className: "rare",
    ids: [
      "pain",
      "anton",
      "tbag",
      "harley"
    ]
  },
  {
    title: "隐藏反派",
    className: "hidden",
    ids: [
      "plankton",
      "gollum"
    ]
  }
];

const questionTitles = [
  "被夺走功劳",
  "新团队站位",
  "关系冷淡",
  "错误被原谅",
  "翻身机会",
  "放不下的执念",
  "低效新人",
  "混乱房间",
  "无人制约的力量",
  "没痛过的人",
  "喜欢一个人",
  "资源不公的竞争",
  "被依赖的影响力",
  "公开羞辱",
  "最害怕的评价",
  "有毒关系",
  "腐烂系统",
  "被说太冷",
  "赢了之后",
  "亲密关系边界",
  "秘密计划",
  "窥见真实内心",
  "人生低谷",
  "镜子前的黑暗面"
];

const sceneNames = [
  "第一幕",
  "第二幕",
  "第三幕",
  "第四幕",
  "第五幕",
  "第六幕",
  "第七幕",
  "第八幕",
  "第九幕",
  "第十幕",
  "第十一幕",
  "第十二幕",
  "第十三幕",
  "第十四幕",
  "第十五幕",
  "第十六幕",
  "第十七幕",
  "第十八幕",
  "第十九幕",
  "第二十幕",
  "第二十一幕",
  "第二十二幕",
  "第二十三幕",
  "第二十四幕"
];

const questionStageText = Array.from(questionPage.querySelectorAll("*")).find(item => {
  return item.textContent.trim() === "第一幕";
});

const homePage = document.getElementById("homePage");
const introPage = document.getElementById("introPage");
const questionPage = document.getElementById("questionPage");
const loadingPage = document.getElementById("loadingPage");
const resultPage = document.getElementById("resultPage");

const startBtn = document.getElementById("startBtn");
const enterBtn = document.getElementById("enterBtn");
const archiveBtn = document.getElementById("archiveBtn");

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
const archiveModal = document.getElementById("archiveModal");
const closeRebateBtn = document.getElementById("closeRebateBtn");
const closeShareBtn = document.getElementById("closeShareBtn");
const closeArchiveBtn = document.getElementById("closeArchiveBtn");
const sharePreview = document.getElementById("sharePreview");
const archiveList = document.getElementById("archiveList");

function resetScores() {
  personalityOrder.forEach(id => {
    score[id] = 0;
    primaryHits[id] = 0;
  });

  primaryHistory.length = 0;
}

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

function applyOptionScore(option) {
  if (option.scores) {
    Object.keys(option.scores).forEach(id => {
      if (typeof score[id] !== "number") {
        score[id] = 0;
      }

      score[id] += option.scores[id];
    });
  } else if (option.type) {
    if (typeof score[option.type] !== "number") {
      score[option.type] = 0;
    }

    score[option.type] += 1;
  }

  if (option.primary) {
    if (typeof primaryHits[option.primary] !== "number") {
      primaryHits[option.primary] = 0;
    }

    primaryHits[option.primary] += 1;
    primaryHistory.push(option.primary);
  } else if (option.type) {
    if (typeof primaryHits[option.type] !== "number") {
      primaryHits[option.type] = 0;
    }

    primaryHits[option.type] += 1;
    primaryHistory.push(option.type);
  }
}

function loadQuestion() {
  const q = questions[currentQuestion];

  questionText.textContent = q.text;
  const sceneName = sceneNames[currentQuestion] || `第${currentQuestion + 1}幕`;
  const questionTitle = q.title || questionTitles[currentQuestion] || "";

  if (questionStageText) {
    questionStageText.textContent = questionTitle
      ? `${sceneName}｜${questionTitle}`
      : sceneName;
  }

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
      applyOptionScore(option);

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

function getResonanceList() {
  const sortedItems = personalityOrder
    .map(id => {
      const personality = results[id];
      const rawScore = score[id] || 0;
      const hitCount = primaryHits[id] || 0;

      return {
        id,
        personality,
        rawScore,
        hitCount
      };
    })
    .filter(item => item.personality)
    .sort((a, b) => {
      if (b.rawScore !== a.rawScore) {
        return b.rawScore - a.rawScore;
      }

      if (b.hitCount !== a.hitCount) {
        return b.hitCount - a.hitCount;
      }

      return personalityOrder.indexOf(a.id) - personalityOrder.indexOf(b.id);
    });

  const topScore = sortedItems[0] ? sortedItems[0].rawScore : 0;

  return sortedItems
    .slice(0, 3)
    .map((item, index) => {
      let percent = 0;

      if (topScore > 0) {
        const relative = item.rawScore / topScore;
        const hitBonus = Math.min(4, item.hitCount);
        const rankPenalty = index * 5;

        percent = Math.round(68 + relative * 24 + hitBonus - rankPenalty);
        percent = Math.max(62, Math.min(96, percent));
      }

      return {
        ...item,
        percent
      };
    });
}

function renderResonance(sectionNumber) {
  const resonanceList = getResonanceList();

  const cards = resonanceList
    .map(item => {
      const tier = personalityTiers[item.id] || {
        label: "常规反派",
        className: "regular"
      };

      const isHidden = tier.className === "hidden";
      const displayName = isHidden ? "？？？" : item.personality.role;
      const displaySource = isHidden ? "《？？？》" : item.personality.source;
      const quote = item.personality.quote || "";

      return `
        <div class="resonance-item">
          <div class="resonance-main">
            <div class="resonance-name-wrap">
              <div class="resonance-name">
                <span class="villain-tier ${tier.className}">${tier.label}</span>
                <span>${displayName}—${item.personality.title}</span>
              </div>
              <div class="resonance-source">${displaySource}</div>
            </div>
            <div class="resonance-score">
              <span>契合度</span>
              <strong>${item.percent}%</strong>
            </div>
          </div>
          <div class="resonance-track">
            <div style="width: ${item.percent}%"></div>
          </div>
          <p>${quote}</p>
        </div>
      `;
    })
    .join("");

  return `
    <section id="resonanceBlock" class="report-block resonance-block">
      <div class="section-kicker">${sectionNumber}</div>
      ${renderHeading("共振人格", "radar")}
      <div class="resonance-list">
        ${cards}
      </div>
    </section>
  `;
}

function renderResult(personality) {
  const tier = personalityTiers[personality.id] || {
    label: "常规反派",
    className: "regular"
  };

  currentPersonality = personality;
  hydrateStaticIcons();

  resultNumber.textContent = `NO.${personality.number}`;
  resultSource.textContent = personality.source;
  resultTitle.textContent = personality.title;

  resultRole.innerHTML = `
    <span class="villain-tier ${tier.className}">${tier.label}</span>${personality.role}｜${personality.source}
  `;

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

  const oldResonanceBlock = document.getElementById("resonanceBlock");

  if (oldResonanceBlock) {
    oldResonanceBlock.remove();
  }

  const resonanceNumber = String(personality.sections.length + 3).padStart(2, "0");
  const similarBlock = resultSimilar.closest(".report-block");

  if (similarBlock) {
    similarBlock.insertAdjacentHTML("beforebegin", renderResonance(resonanceNumber));
  }

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

function getPrimaryLastIndex(id) {
  for (let i = primaryHistory.length - 1; i >= 0; i--) {
    if (primaryHistory[i] === id) {
      return i;
    }
  }

  return -1;
}

function getResultPersonality() {
  const sortedIds = personalityOrder.slice().sort((a, b) => {
    const scoreDiff = (score[b] || 0) - (score[a] || 0);

    if (scoreDiff !== 0) {
      return scoreDiff;
    }

    const primaryDiff = (primaryHits[b] || 0) - (primaryHits[a] || 0);

    if (primaryDiff !== 0) {
      return primaryDiff;
    }

    const lastDiff = getPrimaryLastIndex(b) - getPrimaryLastIndex(a);

    if (lastDiff !== 0) {
      return lastDiff;
    }

    return personalityOrder.indexOf(a) - personalityOrder.indexOf(b);
  });

  return results[sortedIds[0]];
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

function renderArchive() {
  archiveList.innerHTML = archiveGroups
    .map(group => {
      const cards = group.ids
        .map(id => {
          const personality = results[id];
          const isHidden = group.className === "hidden";

          if (!personality) return "";

          if (isHidden) {
            return `
              <div class="archive-card">
                <div class="archive-avatar unknown">?</div>
                <div class="archive-name">？？？</div>
              </div>
            `;
          }

          return `
            <div class="archive-card">
              <div class="archive-avatar">
                <img src="${personality.image}" alt="${personality.role}" />
              </div>
              <div class="archive-name">${personality.role}</div>
            </div>
          `;
        })
        .join("");

      return `
        <section class="archive-group">
          <div class="villain-tier ${group.className}">${group.title}</div>
          <div class="archive-grid">
            ${cards}
          </div>
        </section>
      `;
    })
    .join("");
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
  resetScores();

  loadQuestion();
  showPage(questionPage);
};

if (archiveBtn) {
  archiveBtn.onclick = () => {
    renderArchive();
    openModal(archiveModal);
  };
}

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

if (closeArchiveBtn) {
  closeArchiveBtn.onclick = () => {
    closeModal(archiveModal);
  };
}

rebateModal.querySelector(".modal-backdrop").onclick = () => {
  closeModal(rebateModal);
};

shareModal.querySelector(".modal-backdrop").onclick = () => {
  closeModal(shareModal);
};

if (archiveModal) {
  archiveModal.querySelector(".modal-backdrop").onclick = () => {
    closeModal(archiveModal);
  };
}

resetScores();
validateToken();