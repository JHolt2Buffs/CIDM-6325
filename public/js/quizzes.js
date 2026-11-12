"use strict";

(() => {
  let quizzes = [];
  let selectedFilter = "all";
  const grid = document.getElementById("quizGrid");
  const status = document.getElementById("quizCount");
  const retry = document.getElementById("quizRetry");

  function updateBalance() {
    const balance = ProfileSession.profile?.creditBalance;
    if (balance === undefined) return;
    document.querySelector("[data-credit-balance]").textContent = balance.toLocaleString("en-US");
    document.querySelector(".header-balance").setAttribute("aria-label", `${balance.toLocaleString("en-US")} available credits`);
    document.getElementById("sessionNotice").hidden = !ProfileSession.temporary;
  }

  function filterQuizzes() {
    const difficulty = document.getElementById("quizDifficulty").value;
    let visible = 0;
    grid.querySelectorAll(".quiz-option-card").forEach((card) => {
      const matches = selectedFilter === "all" || card.dataset.type === selectedFilter || card.dataset.category === selectedFilter;
      card.hidden = !matches || (difficulty !== "all" && card.dataset.difficulty !== difficulty);
      if (!card.hidden) visible++;
    });
    document.querySelectorAll("[data-quiz-filter]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.quizFilter === selectedFilter));
    });
    status.textContent = `${visible} ${visible === 1 ? "quiz" : "quizzes"} ready to play`;
    document.getElementById("quizEmpty").hidden = visible !== 0 || !quizzes.length;
  }

  function element(tag, className, value) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    node.textContent = value;
    return node;
  }

  function renderCards() {
    grid.replaceChildren();
    quizzes.forEach((quiz) => {
      const card = element("article", "quiz-option-card", "");
      card.dataset.type = quiz.quizType;
      card.dataset.category = quiz.category;
      card.dataset.difficulty = quiz.difficulty;
      const badges = element("div", "quiz-card-badges", "");
      badges.append(element("span", "quiz-type-badge", quiz.quizType === "team" ? "Team" : "General"), element("span", "difficulty-badge", quiz.difficulty));
      const meta = element("ul", "quiz-meta", "");
      meta.append(element("li", "", `${quiz.questionCount} questions`), element("li", "text-gold", `Up to ${quiz.maxCredits} credits`));
      const link = element("a", "button button-primary", "Play Quiz →");
      link.href = `quiz.html?quiz=${encodeURIComponent(quiz.quizId)}`;
      link.setAttribute("aria-label", `Play ${quiz.title}`);
      card.append(badges, element("p", "eyebrow quiz-team-name", quiz.teamName || "ALL FANS WELCOME"), element("h2", "", quiz.title), element("p", "quiz-description", quiz.description), element("p", "quiz-card-category", quiz.category), meta, link);
      grid.appendChild(card);
    });
    filterQuizzes();
  }

  async function load() {
    retry.hidden = true;
    status.textContent = "Loading quizzes…";
    try {
      const [response] = await Promise.all([NBATriviaApi.get("/quizzes"), ProfileSession.ensure()]);
      quizzes = response.quizzes;
      renderCards();
      updateBalance();
    } catch (error) {
      status.textContent = error.message;
      retry.hidden = false;
    }
  }

  document.querySelectorAll("[data-quiz-filter]").forEach((button) => button.addEventListener("click", () => {
    selectedFilter = button.dataset.quizFilter;
    filterQuizzes();
  }));
  document.getElementById("quizDifficulty").addEventListener("change", filterQuizzes);
  retry.addEventListener("click", load);
  window.addEventListener("profilechange", updateBalance);
  window.addEventListener("pageshow", () => ProfileSession.refresh().catch(() => {}));
  load();
})();
