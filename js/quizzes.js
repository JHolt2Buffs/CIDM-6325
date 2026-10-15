"use strict";

const activeQuizzes = window.NBATriviaQuizData.quizzes.filter((quiz) => quiz.active);
let selectedQuizFilter = "all";

function updateSelectionBalance() {
  const balance = RewardsState.load().creditBalance.toLocaleString("en-US");
  document.querySelector("[data-credit-balance]").textContent = balance;
  document.querySelector(".header-balance").setAttribute("aria-label", `${balance} available credits`);
}

function filterQuizzes() {
  const difficulty = document.getElementById("quizDifficulty").value;
  let count = 0;
  document.querySelectorAll(".quiz-option-card").forEach((card) => {
    const matchesCategory = selectedQuizFilter === "all" || card.dataset.type === selectedQuizFilter || card.dataset.category === selectedQuizFilter;
    card.hidden = !matchesCategory || (difficulty !== "all" && card.dataset.difficulty !== difficulty);
    if (!card.hidden) count++;
  });
  document.querySelectorAll("[data-quiz-filter]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.quizFilter === selectedQuizFilter));
  });
  document.getElementById("quizCount").textContent = `${count} ${count === 1 ? "quiz" : "quizzes"} ready to play`;
  document.getElementById("quizEmpty").hidden = count !== 0;
}

function renderQuizCards() {
  const grid = document.getElementById("quizGrid");
  activeQuizzes.forEach((quiz) => {
    const card = document.createElement("article");
    card.className = "quiz-option-card";
    card.dataset.quizId = quiz.quizId;
    card.dataset.type = quiz.quizType;
    card.dataset.category = quiz.category;
    card.dataset.difficulty = quiz.difficulty;
    // Only fixed application catalog data is rendered here.
    card.innerHTML = `
      <div class="quiz-card-badges"><span class="quiz-type-badge">${quiz.quizType === "team" ? "Team" : "General"}</span><span class="difficulty-badge">${quiz.difficulty}</span></div>
      <p class="eyebrow quiz-team-name">${quiz.teamName || "ALL FANS WELCOME"}</p>
      <h2>${quiz.title}</h2>
      <p class="quiz-description">${quiz.description}</p>
      <p class="quiz-card-category">${quiz.category}</p>
      <ul class="quiz-meta"><li>${quiz.questionCount} questions</li><li class="text-gold">Up to ${quiz.maxCredits} credits</li></ul>
      <a class="button button-primary" href="quiz.html?quiz=${encodeURIComponent(quiz.quizId)}" aria-label="Play ${quiz.title}">Play Quiz <span aria-hidden="true">→</span></a>`;
    grid.appendChild(card);
  });
  filterQuizzes();
}

renderQuizCards();
updateSelectionBalance();
document.querySelectorAll("[data-quiz-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    selectedQuizFilter = button.dataset.quizFilter;
    filterQuizzes();
  });
});
document.getElementById("quizDifficulty").addEventListener("change", filterQuizzes);
window.addEventListener("pageshow", updateSelectionBalance);
window.addEventListener("storage", (event) => {
  if (event.key === RewardsState.storageKey || event.key === null) updateSelectionBalance();
});
