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

const resultName = document.getElementById("resultName");
const resultDesc = document.getElementById("resultDesc");

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

async function showResult() {
  let maxType = "joker";
  let maxScore = -1;

  for (const key in score) {
    if (score[key] > maxScore) {
      maxScore = score[key];
      maxType = key;
    }
  }

  resultName.textContent = results[maxType].name;
  resultDesc.textContent = results[maxType].desc;

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