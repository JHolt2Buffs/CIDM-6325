"use strict";

// The catalog is the single source of truth for product content and prices.
const products = [
  {
    id: "avatar-hoop-scholar", name: "Hoop Scholar", category: "Avatar", price: 200, rarity: "Rare",
    image: "images/avatar-hoop-scholar.png",
    alt: "Orange basketball with a silver question mark and gold laurel leaves",
    description: "A basketball-and-question-mark avatar created for fans who treat every trivia question like a championship challenge."
  },
  {
    id: "avatar-neon-hoop", name: "Neon Hoop", category: "Avatar", price: 250, rarity: "Rare",
    image: "images/avatar-neon-hoop.png",
    alt: "Basketball and hoop surrounded by an electric-blue glow",
    description: "An electric-blue hoop and basketball avatar that gives any profile an energetic arena look."
  },
  {
    id: "frame-courtside-gold", name: "Courtside Gold", category: "Profile Frame", price: 450, rarity: "Epic",
    image: "images/frame-courtside-gold.png",
    alt: "Gold square profile frame with basketball corners and electric-blue accents",
    description: "A premium gold profile frame with basketball details and electric-blue lighting."
  },
  {
    id: "frame-hardwood-classic", name: "Hardwood Classic", category: "Profile Frame", price: 300, rarity: "Rare",
    image: "images/frame-hardwood-classic.png",
    alt: "Polished hardwood profile frame with basketball court line details",
    description: "A polished hardwood frame inspired by the painted lines and warm colors of a classic basketball court."
  },
  {
    id: "title-hardwood-historian", name: "Hardwood Historian", category: "Profile Title", price: 150, rarity: "Uncommon",
    titleText: "Hardwood Historian",
    description: "A profile title for fans who know the players, teams, and moments that shaped basketball history."
  },
  {
    id: "title-trivia-all-star", name: "Trivia All-Star", category: "Profile Title", price: 300, rarity: "Rare",
    titleText: "Trivia All-Star",
    description: "A premium title for users who want their basketball knowledge recognized."
  }
];

function formatCredits(amount) {
  return amount.toLocaleString("en-US");
}

function renderProducts() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  products.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.dataset.productId = product.id;
    card.dataset.category = product.category;
    card.setAttribute("aria-labelledby", `${product.id}-name`);
    const previewClass = product.rarity === "Epic" ? "preview-epic" : product.id === "frame-hardwood-classic" ? "preview-hardwood" : "";
    // This HTML contains only the fixed catalog data. Submitted reviews use textContent.
    const preview = product.image
      ? `<img src="${product.image}" alt="${product.alt}" width="180" height="180">`
      : `<div class="product-title-preview"><span class="preview-initials" aria-hidden="true">JF</span><span class="preview-player-name">JordanFan23</span><span class="title-pill ${product.id === "title-trivia-all-star" ? "title-blue" : ""}">${product.titleText}</span></div>`;
    card.innerHTML = `
      <div class="product-preview ${previewClass}">
        <div class="preview-topline"><span class="product-category">${product.category}</span><span class="rarity rarity-${product.rarity.toLowerCase()}">${product.rarity}</span></div>
        ${preview}
      </div>
      <div class="product-details">
        <h3 id="${product.id}-name">${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <div class="product-footer">
          <span class="product-price"><span class="coin coin-small" aria-hidden="true">C</span><span><strong>${formatCredits(product.price)}</strong><small> credits</small></span></span>
          <button type="button" class="button button-primary redeem-button" data-redeem="${product.id}" aria-label="Redeem ${product.name} for ${product.price} credits">Redeem <span aria-hidden="true">↗</span></button>
        </div>
      </div>`;
    grid.appendChild(card);
  });
}

let rewardsState = RewardsState.load();
let pendingProductId = null;
const reviewRatings = [5, 4];
let recommendations = 2;

function displayMessage(elementId, message, type = "info") {
  const element = document.getElementById(elementId);
  if (!element) return;
  element.textContent = message;
  element.classList.remove("success", "error", "info");
  element.classList.add(type);
}

function updateBalance() {
  document.querySelectorAll("[data-credit-balance]").forEach((element) => {
    element.textContent = formatCredits(rewardsState.creditBalance);
  });
  const headerBalance = document.querySelector(".header-balance");
  if (headerBalance) {
    headerBalance.setAttribute("aria-label", `${headerBalance.matches("a") ? "Visit the rewards store. " : ""}${formatCredits(rewardsState.creditBalance)} available credits`);
  }
  const ownedCount = document.getElementById("ownedCount");
  if (ownedCount) ownedCount.textContent = rewardsState.ownedProducts.length;
}

function refreshStoreState() {
  rewardsState = RewardsState.load();
  rewardsState.ownedProducts = rewardsState.ownedProducts.filter((id) => products.some((product) => product.id === id));
  const slots = { equippedAvatar: "Avatar", equippedFrame: "Profile Frame", equippedTitle: "Profile Title" };
  for (const [slot, category] of Object.entries(slots)) {
    if (!rewardsState.ownedProducts.includes(rewardsState[slot]) || !products.some((product) => product.id === rewardsState[slot] && product.category === category)) {
      rewardsState[slot] = null;
    }
  }
  updateBalance();
  updateProductButtons();
  updateProfilePreview();
}

function updateProductButtons() {
  document.querySelectorAll("[data-redeem]").forEach((button) => {
    const product = products.find((item) => item.id === button.dataset.redeem);
    const owned = rewardsState.ownedProducts.includes(product.id);
    const equipped = [rewardsState.equippedAvatar, rewardsState.equippedFrame, rewardsState.equippedTitle].includes(product.id);
    button.disabled = equipped;
    button.classList.toggle("is-owned", owned && !equipped);
    button.classList.toggle("is-equipped", equipped);
    button.closest(".product-card").classList.toggle("is-equipped", equipped);
    button.textContent = equipped ? "Equipped ✓" : owned ? "Equip →" : "Redeem ↗";
    button.setAttribute("aria-label", equipped ? `${product.name} is equipped` : owned ? `Equip owned ${product.name}` : `Redeem ${product.name} for ${product.price} credits`);
  });
}

function updateProfilePreview() {
  const avatar = document.getElementById("profileAvatar");
  if (!avatar) return;
  const avatarProduct = products.find((product) => product.id === rewardsState.equippedAvatar);
  avatar.src = avatarProduct ? avatarProduct.image : "images/default-avatar.svg";
  avatar.alt = avatarProduct ? `JordanFan23’s ${avatarProduct.name} avatar: ${avatarProduct.alt}` : "JordanFan23’s default basketball avatar";

  const frame = document.getElementById("profileFrame");
  const frameProduct = products.find((product) => product.id === rewardsState.equippedFrame);
  frame.hidden = !frameProduct;
  document.getElementById("profileAvatarLayers").classList.toggle("has-frame", Boolean(frameProduct));
  if (frameProduct) {
    frame.src = frameProduct.image;
    frame.alt = `${frameProduct.name} profile frame`;
  } else {
    frame.removeAttribute("src");
    frame.alt = "";
  }

  const title = document.getElementById("profileTitle");
  const titleProduct = products.find((product) => product.id === rewardsState.equippedTitle);
  title.hidden = !titleProduct;
  title.textContent = titleProduct ? titleProduct.titleText : "";
  title.classList.toggle("title-blue", rewardsState.equippedTitle === "title-trivia-all-star");
  document.getElementById("defaultProfileTitle").hidden = Boolean(titleProduct);
}

function equipProduct(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product || !rewardsState.ownedProducts.includes(productId)) {
    displayMessage("storeMessage", "Redeem this reward before equipping it.", "error");
    return;
  }
  // Separate slots ensure exactly one avatar, frame, and title can be equipped.
  if (product.category === "Avatar") rewardsState.equippedAvatar = productId;
  if (product.category === "Profile Frame") rewardsState.equippedFrame = productId;
  if (product.category === "Profile Title") rewardsState.equippedTitle = productId;
  rewardsState = RewardsState.save(rewardsState);
  updateProfilePreview();
  updateProductButtons();
  displayMessage("storeMessage", `${product.name} is equipped on your profile. You already own it, so no credits were used.`, "success");
}

function redeemProduct(productId) {
  refreshStoreState();
  const product = products.find((item) => item.id === productId);
  if (!product) {
    displayMessage("storeMessage", "That reward could not be found. Please choose a reward from the store.", "error");
    return;
  }
  if (rewardsState.ownedProducts.includes(productId)) {
    equipProduct(productId);
    return;
  }
  if (rewardsState.creditBalance < product.price) {
    displayMessage("storeMessage", `Not enough credits for ${product.name}. You need ${formatCredits(product.price - rewardsState.creditBalance)} more credits; your balance is ${formatCredits(rewardsState.creditBalance)}.`, "error");
    return;
  }

  const dialog = document.getElementById("redeemDialog");
  if (!dialog || dialog.open) return;
  pendingProductId = productId;
  document.getElementById("redeemDescription").textContent = `Redeem ${product.name} for ${formatCredits(product.price)} credits? It will be added to your collection and equipped on your profile.`;
  document.getElementById("remainingBalance").textContent = `Your balance after redeeming: ${formatCredits(rewardsState.creditBalance - product.price)} credits`;
  dialog.showModal();
}

function confirmRedemption() {
  const productId = pendingProductId;
  const product = products.find((item) => item.id === productId);
  const dialog = document.getElementById("redeemDialog");
  pendingProductId = null;
  dialog.close();
  if (!product) return;
  refreshStoreState();

  // Recheck before spending so a repeat event can never charge twice or overdraw.
  if (rewardsState.ownedProducts.includes(productId)) {
    equipProduct(productId);
    return;
  }
  if (rewardsState.creditBalance < product.price) {
    displayMessage("storeMessage", `Not enough credits for ${product.name}. Your balance has not changed.`, "error");
    return;
  }
  rewardsState.creditBalance -= product.price;
  rewardsState.ownedProducts.push(productId);
  equipProduct(productId);
  updateBalance();
  displayMessage("storeMessage", `${product.name} redeemed and equipped! ${formatCredits(product.price)} credits used. You have ${formatCredits(rewardsState.creditBalance)} credits left.`, "success");
}

function filterProducts(category) {
  let visibleCount = 0;
  document.querySelectorAll(".product-card").forEach((card) => {
    card.hidden = category !== "all" && card.dataset.category !== category;
    if (!card.hidden) visibleCount += 1;
  });
  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.filter === category));
  });
  document.getElementById("catalogCount").textContent = `${visibleCount} rewards to make your own`;
}

function createReviewCard(name, rating, feedback, recommendation) {
  const card = document.createElement("article");
  card.className = "review-card";
  card.innerHTML = `<div class="review-card-top"><div class="review-author"><span class="review-initials" aria-hidden="true"></span><div><h3></h3><span class="small-muted">Just posted</span></div></div><span class="stars" role="img"></span></div><p class="review-feedback"></p><p class="recommendation"></p>`;
  card.querySelector("h3").textContent = name;
  card.querySelector(".review-initials").textContent = name.split(/\s+/).slice(0, 2).map((part) => Array.from(part)[0]).join("").toUpperCase();
  card.querySelector(".review-feedback").textContent = feedback;
  const stars = card.querySelector(".stars");
  stars.textContent = "★".repeat(rating) + "☆".repeat(5 - rating);
  stars.setAttribute("aria-label", `${rating} out of 5 stars`);
  const recommendationLabel = card.querySelector(".recommendation");
  recommendationLabel.textContent = recommendation === "Yes" ? "✓ Recommends NBA Trivia Rewards" : "− Does not recommend NBA Trivia Rewards yet";
  recommendationLabel.classList.toggle("not-recommended", recommendation === "No");
  return card;
}

function updateReviewSummary() {
  const average = reviewRatings.reduce((total, rating) => total + rating, 0) / reviewRatings.length;
  document.getElementById("averageRating").textContent = average.toFixed(1);
  document.getElementById("reviewCount").textContent = `Based on ${reviewRatings.length} reviews`;
  document.getElementById("recommendPercent").textContent = `${Math.round(recommendations / reviewRatings.length * 100)}%`;
  const stars = document.getElementById("summaryStars");
  stars.setAttribute("aria-label", `Average rating: ${average.toFixed(1)} out of 5 stars`);
  stars.style.backgroundImage = `linear-gradient(to right, var(--gold) ${average / 5 * 100}%, #8893a8 ${average / 5 * 100}%)`;
}

function submitReview(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const nameInput = document.getElementById("customerName");
  const ratingInput = document.getElementById("rating");
  const feedbackInput = document.getElementById("feedback");
  const name = nameInput.value.trim();
  const rating = Number(ratingInput.value);
  const feedback = feedbackInput.value.trim();
  const recommendation = new FormData(form).get("recommendation");
  const fields = [
    { element: nameInput, valid: name.length > 0 && name.length <= 60, message: "Please enter your name (up to 60 characters)." },
    { element: ratingInput, valid: Number.isInteger(rating) && rating >= 1 && rating <= 5, message: "Please select a rating from 1 to 5 stars." },
    { element: feedbackInput, valid: feedback.length > 0 && feedback.length <= 1000, message: "Please share your feedback (up to 1,000 characters)." }
  ];

  fields.forEach(({ element, valid }) => {
    element.setAttribute("aria-invalid", String(!valid));
  });
  const invalidField = fields.find((field) => !field.valid);
  if (invalidField) {
    displayMessage("reviewMessage", invalidField.message, "error");
    invalidField.element.focus();
    return;
  }
  if (recommendation !== "Yes" && recommendation !== "No") {
    displayMessage("reviewMessage", "Please choose whether you would recommend NBA Trivia Rewards.", "error");
    return;
  }

  document.getElementById("reviewList").prepend(createReviewCard(name, rating, feedback, recommendation));
  reviewRatings.push(rating);
  if (recommendation === "Yes") recommendations += 1;
  updateReviewSummary();
  form.reset();
  fields.forEach(({ element }) => element.removeAttribute("aria-invalid"));
  displayMessage("reviewMessage", `Thanks, ${name}! Your review is now at the top of the community reviews.`, "success");
}

// Each page only initializes the behavior for the elements it contains.
if (document.getElementById("productGrid")) {
  renderProducts();
  document.getElementById("productGrid").addEventListener("click", (event) => {
    const button = event.target.closest("[data-redeem]");
    if (button) redeemProduct(button.dataset.redeem);
  });
  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => filterProducts(button.dataset.filter));
  });
  const dialog = document.getElementById("redeemDialog");
  document.getElementById("confirmRedeem").addEventListener("click", confirmRedemption);
  document.getElementById("cancelRedeem").addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => { pendingProductId = null; });
}

refreshStoreState();
window.addEventListener("pageshow", refreshStoreState);
window.addEventListener("storage", (event) => {
  if (event.key === RewardsState.storageKey || event.key === null) refreshStoreState();
});

const reviewForm = document.getElementById("reviewForm");
if (reviewForm) {
  reviewForm.addEventListener("submit", submitReview);
  reviewForm.addEventListener("input", (event) => {
    event.target.removeAttribute("aria-invalid");
  });
}
