"use strict";

(() => {
  const quizId = new URLSearchParams(location.search).get("quiz") || "basketball-basics";
  const intro = document.getElementById("quizIntro");
  const panel = document.getElementById("quizPanel");
  const results = document.getElementById("quizResults");
  const status = document.getElementById("quizStatus");
  const retry = document.getElementById("quizRetry");
  const answerList = document.getElementById("answerList");
  const feedback = document.getElementById("quizFeedback");
  const next = document.getElementById("nextQuestionButton");
  const start = document.getElementById("startQuizButton");
  let quiz = null;
  let attempt = null;
  let index = 0;
  let answered = false;
  let busy = false;

  function balance() {
    const value = ProfileSession.profile?.creditBalance;
    if (value === undefined) return;
    document.querySelectorAll("[data-credit-balance]").forEach((node) => { node.textContent = value.toLocaleString("en-US"); });
    document.querySelector(".header-balance").setAttribute("aria-label", `Visit the rewards store. ${value.toLocaleString("en-US")} available credits`);
    document.getElementById("sessionNotice").hidden = !ProfileSession.temporary;
  }

  function errorState(error) {
    status.textContent = error.message;
    status.hidden = false;
    retry.hidden = false;
  }

  async function load() {
    retry.hidden = true;
    status.hidden = false;
    status.textContent = "Loading quiz…";
    try {
      const [response] = await Promise.all([NBATriviaApi.get(`/quizzes/${encodeURIComponent(quizId)}`), ProfileSession.ensure()]);
      quiz = response.quiz;
      document.title = `${quiz.title} | NBA Trivia Rewards`;
      document.getElementById("introHeading").textContent = quiz.title;
      document.getElementById("quizIntroDescription").textContent = quiz.description;
      document.getElementById("introQuestionCount").textContent = `${quiz.questionCount} Questions`;
      document.getElementById("introCategory").textContent = quiz.category;
      document.getElementById("introDifficulty").textContent = quiz.difficulty;
      document.getElementById("introMaxCredits").textContent = `Up to ${quiz.maxCredits} Credits`;
      document.getElementById("quizArtCount").textContent = String(quiz.questionCount).padStart(2, "0");
      document.getElementById("quizArtReward").textContent = `Up to ${quiz.maxCredits} credits`;
      balance();
      status.hidden = true;
      intro.hidden = false;
    } catch (error) {
      if (error.code === "QUIZ_NOT_FOUND" || error.code === "INVALID_REQUEST") {
        status.hidden = true;
        intro.hidden = true;
        document.getElementById("quizNotFound").hidden = false;
        document.title = "Quiz Not Found | NBA Trivia Rewards";
      } else errorState(error);
    }
  }

  function progress(done) {
    const bar = document.getElementById("quizProgress");
    bar.setAttribute("aria-valuemax", String(attempt.questions.length));
    bar.setAttribute("aria-valuenow", String(done));
    bar.setAttribute("aria-valuetext", `${done} of ${attempt.questions.length} questions answered`);
    bar.querySelector(".quiz-progress-bar").style.width = `${done / attempt.questions.length * 100}%`;
  }

  function renderQuestion() {
    const question = attempt.questions[index];
    document.getElementById("questionReward").textContent = `${question.creditReward} credits for a correct answer`;
    document.getElementById("questionNumber").textContent = `Question ${index + 1} of ${attempt.questions.length}`;
    document.getElementById("questionCategory").textContent = question.category;
    document.getElementById("questionDifficulty").textContent = question.difficulty;
    document.getElementById("questionText").textContent = question.questionText;
    answerList.replaceChildren();
    question.choices.forEach((choice, choiceIndex) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "answer-button";
      button.dataset.answerIndex = String(choiceIndex);
      const letter = document.createElement("span");
      letter.className = "answer-letter";
      letter.setAttribute("aria-hidden", "true");
      letter.textContent = String.fromCharCode(65 + choiceIndex);
      const label = document.createElement("span");
      label.className = "answer-label";
      label.textContent = choice;
      button.append(letter, label);
      answerList.appendChild(button);
    });
    feedback.replaceChildren();
    feedback.classList.remove("is-correct", "is-incorrect");
    answered = false;
    next.disabled = true;
    next.textContent = index === attempt.questions.length - 1 ? "See Results" : "Next Question";
    progress(index);
    document.getElementById("questionText").focus();
  }

  async function startAttempt() {
    if (busy) return;
    busy = true;
    start.disabled = true;
    status.hidden = false;
    status.textContent = "Starting quiz…";
    try {
      attempt = await NBATriviaApi.post("/quiz-attempts", { profileId: ProfileSession.profileId, quizId });
      index = 0;
      intro.hidden = true;
      results.hidden = true;
      panel.hidden = false;
      status.hidden = true;
      renderQuestion();
    } catch (error) { errorState(error); }
    finally { busy = false; start.disabled = false; }
  }

  async function selectAnswer(choice) {
    if (busy || answered || !attempt) return;
    const question = attempt.questions[index];
    if (!Number.isInteger(choice) || choice < 0 || choice >= question.choices.length) return;
    busy = true;
    answerList.querySelectorAll("button").forEach((button) => { button.disabled = true; });
    try {
      const response = await NBATriviaApi.post(`/quiz-attempts/${attempt.attemptId}/answers`, {
        profileId: ProfileSession.profileId, questionId: question.questionId, selectedIndex: choice
      });
      answered = true;
      answerList.querySelectorAll("[data-answer-index]").forEach((button) => {
        const value = Number(button.dataset.answerIndex);
        if (value !== choice && value !== response.correctAnswerIndex) return;
        const correct = value === response.correctAnswerIndex;
        button.classList.add(correct ? "is-correct" : "is-incorrect");
        const text = document.createElement("span");
        text.className = "answer-status";
        text.textContent = correct ? value === choice ? "✓ Your answer · Correct" : "✓ Correct answer" : "✕ Your answer · Incorrect";
        button.appendChild(text);
      });
      const heading = document.createElement("strong");
      heading.textContent = response.correct ? `Correct! +${response.earnedCredits} credits.` : "Incorrect. No credits this time.";
      const explanation = document.createElement("p");
      explanation.textContent = response.explanation;
      feedback.classList.add(response.correct ? "is-correct" : "is-incorrect");
      feedback.replaceChildren(heading, explanation);
      progress(index + 1);
      next.disabled = false;
      next.focus();
    } catch (error) {
      errorState(error);
      if (error.code !== "ANSWER_ALREADY_SUBMITTED") answerList.querySelectorAll("button").forEach((button) => { button.disabled = false; });
    } finally { busy = false; }
  }

  async function advance() {
    if (!answered || busy) return;
    index++;
    if (index < attempt.questions.length) return renderQuestion();
    busy = true;
    next.disabled = true;
    status.hidden = false;
    status.textContent = "Saving your result…";
    try {
      const result = await NBATriviaApi.post(`/quiz-attempts/${attempt.attemptId}/complete`, { profileId: ProfileSession.profileId });
      ProfileSession.replace(result.profile);
      panel.hidden = true;
      results.hidden = false;
      status.hidden = true;
      document.getElementById("resultScore").textContent = `${result.score} / ${result.totalQuestions}`;
      document.getElementById("resultAccuracy").textContent = `${result.accuracy}%`;
      document.getElementById("resultCredits").textContent = result.earnedCredits;
      document.getElementById("resultMessage").textContent = result.score === result.totalQuestions ? "Perfect game! You mastered this challenge." : result.accuracy >= 50 ? "Strong performance! Review the explanations and aim for a perfect score." : result.score ? "Good start. Keep practicing and try again." : "Tough round. Review the explanations and take another shot.";
      document.getElementById("resultBalanceMessage").textContent = `You earned ${result.earnedCredits.toLocaleString("en-US")} credits. Your rewards balance is now ${result.balance.toLocaleString("en-US")} credits. Spend them on digital profile rewards or save for the Prize Vault.`;
      document.getElementById("resultsHeading").focus();
    } catch (error) {
      index--;
      errorState(error);
      next.disabled = false;
    } finally { busy = false; }
  }

  start.addEventListener("click", startAttempt);
  next.addEventListener("click", advance);
  document.getElementById("restartQuizButton").addEventListener("click", () => {
    attempt = null;
    results.hidden = true;
    intro.hidden = false;
    start.focus();
  });
  answerList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-answer-index]");
    if (button) selectAnswer(Number(button.dataset.answerIndex));
  });
  retry.addEventListener("click", () => {
    retry.hidden = true;
    if (!quiz) load();
    else if (attempt && index === attempt.questions.length) advance();
    else if (!attempt) startAttempt();
    else status.hidden = true;
  });
  window.addEventListener("profilechange", balance);
  load();
})();
