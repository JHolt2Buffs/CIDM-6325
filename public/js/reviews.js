"use strict";

(() => {
  const list = document.getElementById("reviewList");
  const status = document.getElementById("reviewStatus");
  const retry = document.getElementById("reviewRetry");
  const form = document.getElementById("reviewForm");
  const submit = form.querySelector("[type=submit]");
  let reviews = [];

  function node(tag, className, value) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (value !== undefined) element.textContent = value;
    return element;
  }

  function updateBalance() {
    const balance = ProfileSession.profile?.creditBalance;
    if (balance === undefined) return;
    document.querySelector("[data-credit-balance]").textContent = balance.toLocaleString("en-US");
    document.querySelector(".header-balance").setAttribute("aria-label", `Visit the rewards store. ${balance.toLocaleString("en-US")} available credits`);
    document.getElementById("sessionNotice").hidden = !ProfileSession.temporary;
  }

  function card(review) {
    const article = node("article", "review-card");
    const top = node("div", "review-card-top");
    const author = node("div", "review-author");
    const initials = node("span", "review-initials", review.displayName.split(/\s+/).slice(0, 2).map((word) => Array.from(word)[0]).join("").toUpperCase());
    initials.setAttribute("aria-hidden", "true");
    const authorText = node("div");
    authorText.append(node("h3", "", review.displayName), node("span", "small-muted", review.source === "sample" ? "Sample review" : "Community review"));
    author.append(initials, authorText);
    const stars = node("span", "stars", "★".repeat(review.rating) + "☆".repeat(5 - review.rating));
    stars.setAttribute("role", "img");
    stars.setAttribute("aria-label", `${review.rating} out of 5 stars`);
    top.append(author, stars);
    const recommendation = node("p", "recommendation", review.recommends ? "✓ Recommends NBA Trivia Rewards" : "− Does not recommend NBA Trivia Rewards yet");
    recommendation.classList.toggle("not-recommended", !review.recommends);
    article.append(top, node("p", "review-feedback", review.feedback), recommendation);
    return article;
  }

  function render() {
    list.replaceChildren(...reviews.map(card));
    const total = reviews.length;
    const average = total ? reviews.reduce((sum, review) => sum + review.rating, 0) / total : 0;
    const percent = total ? Math.round(reviews.filter((review) => review.recommends).length / total * 100) : 0;
    document.getElementById("averageRating").textContent = average.toFixed(1);
    document.getElementById("reviewCount").textContent = `Based on ${total} ${total === 1 ? "review" : "reviews"}`;
    document.getElementById("recommendPercent").textContent = `${percent}%`;
    const stars = document.getElementById("summaryStars");
    stars.setAttribute("aria-label", `Average rating: ${average.toFixed(1)} out of 5 stars`);
    stars.style.backgroundImage = `linear-gradient(to right, var(--gold) ${average / 5 * 100}%, #8893a8 ${average / 5 * 100}%)`;
  }

  async function load() {
    retry.hidden = true;
    status.textContent = "Loading reviews…";
    try {
      const [result] = await Promise.all([NBATriviaApi.get("/reviews"), ProfileSession.ensure()]);
      reviews = result.reviews;
      render();
      updateBalance();
      status.textContent = "";
    } catch (error) {
      status.textContent = error.message;
      retry.hidden = false;
    }
  }

  function formMessage(value, kind) {
    const target = document.getElementById("reviewMessage");
    target.textContent = value;
    target.className = `status-message ${kind}`;
  }

  async function post(event) {
    event.preventDefault();
    const nameInput = document.getElementById("displayName");
    const ratingInput = document.getElementById("rating");
    const feedbackInput = document.getElementById("feedback");
    const displayName = nameInput.value.trim();
    const rating = Number(ratingInput.value);
    const feedback = feedbackInput.value.trim();
    const recommendation = new FormData(form).get("recommendation");
    const fields = [
      { element: nameInput, valid: displayName.length > 0 && displayName.length <= 60, message: "Please enter a display name (up to 60 characters)." },
      { element: ratingInput, valid: Number.isInteger(rating) && rating >= 1 && rating <= 5, message: "Please select a rating from 1 to 5 stars." },
      { element: feedbackInput, valid: feedback.length > 0 && feedback.length <= 1000, message: "Please share your feedback (up to 1,000 characters)." }
    ];
    fields.forEach(({ element, valid }) => element.setAttribute("aria-invalid", String(!valid)));
    const invalid = fields.find((field) => !field.valid);
    if (invalid) { formMessage(invalid.message, "error"); invalid.element.focus(); return; }
    if (recommendation !== "Yes" && recommendation !== "No") { formMessage("Please choose whether you would recommend NBA Trivia Rewards.", "error"); return; }
    submit.disabled = true;
    formMessage("Posting your review…", "info");
    try {
      const result = await NBATriviaApi.post("/reviews", { displayName, rating, feedback, recommends: recommendation === "Yes" });
      reviews.unshift(result.review);
      render();
      form.reset();
      fields.forEach(({ element }) => element.removeAttribute("aria-invalid"));
      formMessage(`Thanks, ${displayName}! Your review is now at the top of the community reviews.`, "success");
    } catch (error) { formMessage(error.message, "error"); }
    finally { submit.disabled = false; }
  }

  form.addEventListener("submit", post);
  form.addEventListener("input", (event) => event.target.removeAttribute("aria-invalid"));
  retry.addEventListener("click", load);
  window.addEventListener("profilechange", updateBalance);
  window.addEventListener("pageshow", () => ProfileSession.refresh().catch(() => {}));
  load();
})();
