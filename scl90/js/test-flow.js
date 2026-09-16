(function initializeScl90TestFlow(global, factory) {
  "use strict";
  const flow = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = flow;
  if (global) global.Scl90TestFlow = flow;
  if (global && global.document && global.location) {
    flow.startBrowser().catch(error => {
      const root = global.document.getElementById("test-app");
      if (root) {
        root.innerHTML = `<section class="state-message"><h1>测评载入失败</h1><p>${error.message}</p></section>`;
      }
    });
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function createScl90TestFlow() {
  "use strict";

  const AUTO_ADVANCE_DELAY_MS = 280;
  const LOADING_STAGE_DELAY_MS = 620;

  function createSession(items, initial = null) {
    if (!Array.isArray(items) || items.length < 1) throw new TypeError("question items are required.");
    const answers = Array(90).fill(null);
    if (initial?.answers) {
      initial.answers.forEach((answer, index) => {
        answers[index] = answer;
      });
    }
    let current = items.some(item => item.number === initial?.current)
      ? initial.current
      : items[0].number;
    return Object.freeze({
      get current() { return current; },
      get answers() { return answers.slice(); },
      answer(value) {
        if (!Number.isInteger(value) || value < 1 || value > 5) throw new TypeError("answer must be 1-5.");
        answers[current - 1] = value;
      },
      go(number) {
        if (!items.some((item) => item.number === number)) throw new RangeError("question is unavailable.");
        current = number;
      },
      previous() {
        const index = items.findIndex((item) => item.number === current);
        if (index > 0) current = items[index - 1].number;
      },
      next() {
        const index = items.findIndex((item) => item.number === current);
        if (index < items.length - 1) current = items[index + 1].number;
      },
      isAnswered(number) { return answers[number - 1] !== null; },
      isComplete() { return items.length === 90 && answers.every(Number.isInteger); },
      firstUnanswered() {
        const index = answers.findIndex((answer) => !Number.isInteger(answer));
        return index < 0 ? null : index + 1;
      },
      unansweredCount() { return answers.filter((answer) => !Number.isInteger(answer)).length; }
    });
  }

  function getFactorDefinition(definitions, questionNumber) {
    const matches = definitions.filter((definition) => definition.itemNumbers.includes(questionNumber));
    if (matches.length !== 1) throw new Error(`Question ${questionNumber} must map to exactly one factor.`);
    return matches[0];
  }

  function createAnswerTransition(options) {
    const session = options.session;
    const lastQuestion = options.lastQuestion;
    const schedule = options.schedule || ((callback, delay) => setTimeout(callback, delay));
    const onSelected = options.onSelected || (() => {});
    const onAdvance = options.onAdvance || (() => {});
    const delay = Number.isFinite(options.delay) ? options.delay : AUTO_ADVANCE_DELAY_MS;
    let locked = false;
    return Object.freeze({
      get locked() { return locked; },
      select(value) {
        if (locked) return false;
        session.answer(value);
        const shouldAdvance = session.current !== lastQuestion;
        locked = shouldAdvance;
        onSelected();
        if (!shouldAdvance) return true;
        schedule(() => {
          session.next();
          locked = false;
          onAdvance();
        }, delay);
        return true;
      }
    });
  }

  async function startBrowser() {
    const params = new URLSearchParams(location.search);
    const fixture =
      params.get("fixture") === "1" && Scl90PlatformBridge.isLocalDevelopment();
    const root = document.getElementById("test-app");
    const items = fixture ? Scl90VisualQuestions.items : Scl90QuestionsContent.items;
    const copy = Scl90StaticCopy.test;
    const token = params.get("token");
    const draftScope = token ? `token:${token}` : "public";
    let draft = null;

    if (!fixture) {
      try {
        draft = Scl90SessionAnswerStore.load(sessionStorage, draftScope);
      } catch (error) {
        Scl90SessionAnswerStore.clear(sessionStorage, draftScope);
      }
    }

    const session = createSession(items, draft);
    const lastQuestion = items[items.length - 1].number;
    const requested = Number(params.get("question"));
    let navOpen = false;
    let message = "";
    let submitting = false;
    let runtime = null;

    if (!fixture) {
      runtime = Scl90PlatformBridge.createRuntime();
      const state = await runtime.initialize();

      if (!state.ok) {
        root.innerHTML = `<section class="state-message"><h1>暂时无法进入测评</h1><p>${state.message}</p><a href="/access.html?test=scl90">前往公共授权入口</a></section>`;
        return;
      }

      if (state.completed) {
        Scl90SessionAnswerStore.clear(sessionStorage, draftScope);
        location.replace(Scl90PlatformBridge.pathWithToken("report.html"));
        return;
      }
    }

    if (items.some((item) => item.number === requested)) session.go(requested);
    if (params.get("view") === "loading") {
      Scl90UiState.renderLoading(root, params.get("stage"));
      return;
    }

    const optionPairs = copy.options.map((label, index) => [index + 1, label]);
    let transition;

    function persistDraft() {
      if (fixture) return;
      Scl90SessionAnswerStore.save(sessionStorage, draftScope, {
        answers: session.answers,
        current: session.current
      });
    }

    function focusQuestion() {
      window.scrollTo({ top: 0, behavior: "auto" });
      requestAnimationFrame(() => {
        const heading = root.querySelector(".question-body h2");
        if (heading) {
          heading.tabIndex = -1;
          heading.focus({ preventScroll: true });
        }
      });
    }

    function render(nextMessage) {
      if (typeof nextMessage === "string") message = nextMessage;
      const current = session.current;
      const item = items.find((candidate) => candidate.number === current);
      const answers = session.answers;
      const factor = getFactorDefinition(Scl90FactorDefinitions, current);
      const card = document.createElement("section");
      card.className = `question-card${transition && transition.locked ? " is-transitioning" : ""}`;
      card.setAttribute("aria-busy", transition && transition.locked ? "true" : "false");
      card.innerHTML = `<header class="question-header"><div class="question-title-row"><div class="question-title-lockup"><i></i><div><h1>${copy.title}</h1><span class="fixture-badge">${fixture ? "DEV VISUAL FIXTURE" : "PRODUCT CONTENT V1.0"}</span></div></div><span class="question-factor-badge" data-factor-id="${factor.id}" aria-label="当前维度：${factor.displayLabel}">${factor.displayLabel}</span></div><div class="progress-label"><span>答题进度</span><b>${current} / 90</b></div><div class="progress-track" role="progressbar" aria-valuemin="1" aria-valuemax="90" aria-valuenow="${current}"><i style="width:${current / 90 * 100}%"></i></div></header><div class="question-body"><p class="week-tip">${copy.instruction}</p><h2>${current}. ${item.text}</h2><div class="answer-list">${optionPairs.map(([value, label]) => `<button class="answer-option ${answers[current - 1] === value ? "selected" : ""}" data-answer="${value}" aria-pressed="${answers[current - 1] === value}"><i></i>${label}</button>`).join("")}</div>${message ? `<p class="flow-warning" role="alert">${message}</p>` : ""}</div><div class="question-nav-panel" ${navOpen ? "" : "hidden"}><div class="question-nav-heading"><h3>题目导航</h3><span>点击题号快速跳转</span></div><div class="question-grid">${Array.from({ length: 90 }, (_, index) => {
        const number = index + 1;
        const enabled = items.some((candidate) => candidate.number === number);
        return `<button ${enabled ? "" : "disabled"} class="${number === current ? "current" : answers[number - 1] !== null ? "answered" : ""}" data-question="${number}" aria-label="第${number}题${answers[number - 1] !== null ? "，已答" : "，未答"}" ${number === current ? 'aria-current="step"' : ""}>${number}</button>`;
      }).join("")}</div>${fixture ? "<p>仅亮起题号属于开发视觉 fixture。</p>" : ""}</div><footer class="test-actions"><button data-action="back" ${current === items[0].number ? "disabled" : ""}>上一题</button><button data-action="nav" aria-expanded="${navOpen}">${navOpen ? "隐藏导航" : "题目导航"}</button><button class="primary-button" data-action="next">${current === lastQuestion ? "提交答案" : "下一题"}</button></footer>`;
      root.replaceChildren(card);
    }

    async function submit() {
      if (!session.isComplete()) {
        message = `还有 ${session.unansweredCount()} 道题未回答，请完成所有题目后再提交。`;
        render();
        return;
      }

      if (submitting) return;
      submitting = true;

      let reportHref = "report.html?source=dev-result";

      if (fixture) {
        const payload = Scl90Product.score(session.answers);
        Scl90DevResultStore.save(sessionStorage, payload);
      } else {
        const completion = await runtime.complete(session.answers);

        if (!completion.ok) {
          submitting = false;
          message = completion.message;
          render();
          return;
        }

        if (runtime.isPublicAccessMode()) {
          Scl90SessionResultStore.save(sessionStorage, completion.resultPayload);
        } else {
          Scl90SessionResultStore.clear(sessionStorage);
        }

        Scl90SessionAnswerStore.clear(sessionStorage, draftScope);

        reportHref = Scl90PlatformBridge.pathWithToken("report.html");
      }

      let stage = 1;
      Scl90UiState.renderLoading(root, stage, {
        production: !fixture,
        reportHref
      });
      const timer = setInterval(() => {
        stage += 1;
        Scl90UiState.renderLoading(root, stage, {
          production: !fixture,
          reportHref
        });
        if (stage === 5) clearInterval(timer);
      }, LOADING_STAGE_DELAY_MS);
    }

    transition = createAnswerTransition({
      session,
      lastQuestion,
      delay: AUTO_ADVANCE_DELAY_MS,
      onSelected() {
        message = "";
        persistDraft();
        render();
      },
      onAdvance() {
        message = "";
        navOpen = false;
        persistDraft();
        render();
        focusQuestion();
      }
    });

    root.addEventListener("click", (event) => {
      const answer = event.target.closest("[data-answer]");
      if (answer) {
        transition.select(Number(answer.dataset.answer));
        return;
      }
      if (transition.locked || submitting) return;
      const question = event.target.closest("[data-question]");
      if (question && !question.disabled) {
        session.go(Number(question.dataset.question));
        navOpen = false;
        message = "";
        persistDraft();
        render();
        focusQuestion();
        return;
      }
      const action = event.target.closest("[data-action]");
      if (!action) return;
      if (action.dataset.action === "nav") {
        navOpen = !navOpen;
        render();
        return;
      }
      if (action.dataset.action === "back") {
        session.previous();
        navOpen = false;
        message = "";
        persistDraft();
        render();
        focusQuestion();
        return;
      }
      if (action.dataset.action === "next") {
        if (!session.isAnswered(session.current)) {
          message = copy.unanswered;
          render();
          return;
        }
        if (session.current === lastQuestion) void submit();
        else {
          session.next();
          navOpen = false;
          message = "";
          persistDraft();
          render();
          focusQuestion();
        }
      }
    });
    render();
  }

  return Object.freeze({
    AUTO_ADVANCE_DELAY_MS,
    LOADING_STAGE_DELAY_MS,
    createSession,
    getFactorDefinition,
    createAnswerTransition,
    startBrowser
  });
});
