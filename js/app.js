let currentQuestion = 0;

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
const restartBtn = document.getElementById("restartBtn");

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

function loadQuestion() {

    const q = questions[currentQuestion];

    questionText.textContent = q.text;

    countText.textContent = `${currentQuestion + 1} / ${questions.length}`;

    progressBar.style.width =
        ((currentQuestion + 1) / questions.length * 100) + "%";

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

function showResult() {

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

restartBtn.onclick = () => {

    showPage(homePage);

};