"use strict";

// Local prototype data. MongoDB setup files use the same fields independently.
const quizQuestions = [
  {
    questionId: "question-001",
    questionText: "How many points is a successful free throw worth?",
    category: "Rules",
    difficulty: "Easy",
    choices: [
      "1 point",
      "2 points",
      "3 points",
      "4 points"
    ],
    correctAnswerIndex: 0,
    explanation: "A successful free throw adds one point to the team's score.",
    creditReward: 25,
    active: true,
    imagePath: null
  },
  {
    questionId: "question-002",
    questionText: "How many players from one team are normally on the court at one time?",
    category: "Rules",
    difficulty: "Easy",
    choices: [
      "4 players",
      "5 players",
      "6 players",
      "7 players"
    ],
    correctAnswerIndex: 1,
    explanation: "Each team normally has five active players on the court.",
    creditReward: 25,
    active: true,
    imagePath: null
  },
  {
    questionId: "question-003",
    questionText: "Which team won the 1996 NBA Finals?",
    category: "NBA History",
    difficulty: "Medium",
    choices: [
      "Utah Jazz",
      "Phoenix Suns",
      "Chicago Bulls",
      "Houston Rockets"
    ],
    correctAnswerIndex: 2,
    explanation: "The Chicago Bulls defeated the Seattle SuperSonics in the 1996 NBA Finals.",
    creditReward: 25,
    active: true,
    imagePath: null
  }
];

let currentQuestionIndex = 0;
let score = 0;
let earnedCredits = 0;
let answered = false;
let quizStarted = false;
let creditsAwarded = false;

const quizIntro = document.getElementById("quizIntro");
const quizPanel = document.getElementById("quizPanel");
const quizResults = document.getElementById("quizResults");
const questionText = document.getElementById("questionText");
const quizProgress = document.getElementById("quizProgress");
const answerList = document.getElementById("answerList");
const quizFeedback = document.getElementById("quizFeedback");
const startQuizButton = document.getElementById("startQuizButton");
const nextQuestionButton = document.getElementById("nextQuestionButton");
const restartQuizButton = document.getElementById("restartQuizButton");

function resetQuizState() {
  currentQuestionIndex = 0;
  score = 0;
  earnedCredits = 0;
  answered = false;
  quizStarted = false;
  creditsAwarded = false;
}

function updateQuizBalance() {
  const balance = RewardsState.load().creditBalance.toLocaleString("en-US");
  document.querySelectorAll("[data-credit-balance]").forEach((element) => {
    element.textContent = balance;
  });
  document.querySelector(".header-balance").setAttribute("aria-label", `Visit the rewards store. ${balance} available credits`);
  if (creditsAwarded) {
    document.getElementById("resultBalanceMessage").textContent = `You earned ${earnedCredits.toLocaleString("en-US")} credits. Your rewards balance is now ${balance} credits.`;
  }
}

function updateQuizProgress(completedQuestions) {
  quizProgress.setAttribute("aria-valuemax", String(quizQuestions.length));
  quizProgress.setAttribute("aria-valuenow", String(completedQuestions));
  quizProgress.setAttribute("aria-valuetext", `${completedQuestions} of ${quizQuestions.length} questions answered`);
  quizProgress.querySelector(".quiz-progress-bar").style.width = `${completedQuestions / quizQuestions.length * 100}%`;
}

function startQuiz() {
  resetQuizState();
  quizStarted = true;
  quizIntro.hidden = true;
  quizResults.hidden = true;
  quizPanel.hidden = false;
  renderQuestion();
}

function renderQuestion() {
  if (!quizStarted || currentQuestionIndex >= quizQuestions.length) return;

  const question = quizQuestions[currentQuestionIndex];
  document.getElementById("questionNumber").textContent = `Question ${currentQuestionIndex + 1} of ${quizQuestions.length}`;
  document.getElementById("questionCategory").textContent = question.category;
  document.getElementById("questionDifficulty").textContent = question.difficulty;
  questionText.textContent = question.questionText;
  updateQuizProgress(currentQuestionIndex);
  answerList.replaceChildren();

  question.choices.forEach((choice, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "answer-button";
    button.dataset.answerIndex = String(index);

    const letter = document.createElement("span");
    letter.className = "answer-letter";
    letter.setAttribute("aria-hidden", "true");
    letter.textContent = String.fromCharCode(65 + index);
    const label = document.createElement("span");
    label.className = "answer-label";
    label.textContent = choice;
    button.append(letter, label);
    answerList.appendChild(button);
  });

  quizFeedback.replaceChildren();
  quizFeedback.classList.remove("is-correct", "is-incorrect");
  nextQuestionButton.disabled = true;
  nextQuestionButton.textContent = currentQuestionIndex === quizQuestions.length - 1 ? "See Results" : "Next Question";
  answered = false;
  questionText.focus();
}

function selectAnswer(selectedIndex) {
  if (!quizStarted || answered) return;

  const question = quizQuestions[currentQuestionIndex];
  if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex >= question.choices.length) return;

  answered = true;
  const correct = selectedIndex === question.correctAnswerIndex;
  if (correct) {
    score += 1;
    earnedCredits += question.creditReward;
  }

  answerList.querySelectorAll("[data-answer-index]").forEach((button) => {
    const index = Number(button.dataset.answerIndex);
    button.disabled = true;
    if (index === question.correctAnswerIndex || index === selectedIndex) {
      const isCorrect = index === question.correctAnswerIndex;
      button.classList.add(isCorrect ? "is-correct" : "is-incorrect");
      const status = document.createElement("span");
      status.className = "answer-status";
      status.textContent = isCorrect
        ? index === selectedIndex ? "✓ Your answer · Correct" : "✓ Correct answer"
        : "✕ Your answer · Incorrect";
      button.appendChild(status);
    }
  });

  const feedbackHeading = document.createElement("strong");
  feedbackHeading.textContent = correct ? `Correct! +${question.creditReward} credits.` : "Incorrect. No credits this time.";
  const explanation = document.createElement("p");
  explanation.textContent = question.explanation;
  quizFeedback.classList.add(correct ? "is-correct" : "is-incorrect");
  quizFeedback.replaceChildren(feedbackHeading, explanation);
  updateQuizProgress(currentQuestionIndex + 1);
  nextQuestionButton.disabled = false;
  nextQuestionButton.focus();
}

function nextQuestion() {
  if (!quizStarted || !answered) return;

  currentQuestionIndex += 1;
  if (currentQuestionIndex < quizQuestions.length) {
    renderQuestion();
  } else {
    showResults();
  }
}

function showResults() {
  if (!quizStarted || currentQuestionIndex < quizQuestions.length) return;

  quizStarted = false;
  if (!creditsAwarded) {
    const state = RewardsState.load();
    state.creditBalance += earnedCredits;
    RewardsState.save(state);
    creditsAwarded = true;
  }
  quizIntro.hidden = true;
  quizPanel.hidden = true;
  quizResults.hidden = false;
  const accuracy = Math.round(score / quizQuestions.length * 100);
  const messages = {
    100: "Perfect game! You mastered today's warmup.",
    67: "Strong performance! One more correct answer would have made it perfect.",
    33: "Good start. Keep practicing and try again.",
    0: "Tough round. Review the explanations and take another shot."
  };
  document.getElementById("resultScore").textContent = `${score} / ${quizQuestions.length}`;
  document.getElementById("resultAccuracy").textContent = `${accuracy}%`;
  document.getElementById("resultCredits").textContent = earnedCredits;
  document.getElementById("resultMessage").textContent = messages[accuracy];
  updateQuizBalance();
  document.getElementById("resultsHeading").focus();
}

function restartQuiz() {
  resetQuizState();
  quizPanel.hidden = true;
  quizResults.hidden = true;
  quizIntro.hidden = false;
  answerList.replaceChildren();
  quizFeedback.replaceChildren();
  quizFeedback.classList.remove("is-correct", "is-incorrect");
  nextQuestionButton.disabled = true;
  nextQuestionButton.textContent = "Next Question";
  updateQuizProgress(0);
  startQuizButton.focus();
  updateQuizBalance();
}

updateQuizBalance();
window.addEventListener("pageshow", updateQuizBalance);
window.addEventListener("storage", (event) => {
  if (event.key === RewardsState.storageKey || event.key === null) updateQuizBalance();
});

startQuizButton.addEventListener("click", startQuiz);
nextQuestionButton.addEventListener("click", nextQuestion);
restartQuizButton.addEventListener("click", restartQuiz);

answerList.addEventListener("click", function (event) {
  const button = event.target.closest("[data-answer-index]");
  if (!button) return;
  selectAnswer(Number(button.dataset.answerIndex));
});
