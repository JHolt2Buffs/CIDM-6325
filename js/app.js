"use strict";

const products = window.NBATriviaRewardData.products;

function formatCredits(amount) {
  return amount.toLocaleString("en-US");
}

function renderProducts() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  products.filter((product) => product.active && product.redeemableDirectly).forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";
    const mystery = product.rewardType === "mystery-physical";
    card.classList.toggle("is-vault", mystery);
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
        ${mystery ? '<span class="prototype-label">PRIZE VAULT (PROTOTYPE)</span>' : ""}
        <h3 id="${product.id}-name">${product.name}</h3>
        <p class="product-description">${product.description}</p>
        ${mystery ? '<p class="vault-limit">One box per saved browser profile.</p>' : ""}
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
  updateBalance();
  updateProductButtons();
  updateProfilePreview();
  renderMyRewards();
}

function updateProductButtons() {
  document.querySelectorAll("[data-redeem]").forEach((button) => {
    const product = products.find((item) => item.id === button.dataset.redeem);
    const owned = rewardsState.ownedProducts.includes(product.id);
    const equipped = [rewardsState.equippedAvatar, rewardsState.equippedFrame, rewardsState.equippedTitle].includes(product.id);
    const claimed = rewardsState.claimedPhysicalRewards.some((claim) => claim.sourceProductId === product.id);
    button.disabled = equipped || claimed;
    button.classList.toggle("is-claimed", claimed);
    button.classList.toggle("is-owned", owned && !equipped);
    button.classList.toggle("is-equipped", equipped);
    button.closest(".product-card").classList.toggle("is-equipped", equipped);
    button.textContent = claimed ? "Claimed ✓" : equipped ? "Equipped ✓" : owned ? "Equip →" : "Redeem ↗";
    button.setAttribute("aria-label", claimed ? `${product.name} has already been claimed` : equipped ? `${product.name} is equipped` : owned ? `Equip owned ${product.name}` : `Redeem ${product.name} for ${product.price} credits`);
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
  if (!product || !product.rewardType.startsWith("digital-") || !rewardsState.ownedProducts.includes(productId)) {
    displayMessage("storeMessage", "Redeem this reward before equipping it.", "error");
    return;
  }
  if (product.category === "Avatar") rewardsState.equippedAvatar = productId;
  if (product.category === "Profile Frame") rewardsState.equippedFrame = productId;
  if (product.category === "Profile Title") rewardsState.equippedTitle = productId;
  rewardsState = RewardsState.save(rewardsState);
  updateProfilePreview();
  updateProductButtons();
  renderMyRewards();
  displayMessage("storeMessage", `${product.name} is equipped on your profile. You already own it, so no credits were used.`, "success");
}

function redeemProduct(productId) {
  refreshStoreState();
  const product = products.find((item) => item.id === productId);
  if (!product || !product.active || !product.redeemableDirectly) {
    displayMessage("storeMessage", "That reward could not be found. Please choose a reward from the store.", "error");
    return;
  }
  if (rewardsState.claimedPhysicalRewards.some((claim) => claim.sourceProductId === productId)) {
    displayMessage("storeMessage", "You already claimed this one-time box. Find your surprise in My Rewards.", "info");
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
  const mystery = product.rewardType === "mystery-physical";
  document.getElementById("redeemDescription").textContent = mystery
    ? `Open the ${product.name} for ${formatCredits(product.price)} credits and reveal a random piece of physical basketball memorabilia (prototype)?`
    : `Redeem ${product.name} for ${formatCredits(product.price)} credits? It will be added to your collection and equipped on your profile.`;
  document.getElementById("redemptionFootnote").textContent = mystery ? "Virtual credits only. One claim per saved browser profile." : "Virtual credits only. Your reward is equipped instantly.";
  document.getElementById("remainingBalance").textContent = `Current balance: ${formatCredits(rewardsState.creditBalance)} credits. After redeeming: ${formatCredits(rewardsState.creditBalance - product.price)} credits.`;
  dialog.showModal();
}

function confirmRedemption() {
  const productId = pendingProductId;
  const product = products.find((item) => item.id === productId);
  const dialog = document.getElementById("redeemDialog");
  pendingProductId = null;
  dialog.close();
  if (!product || !product.active || !product.redeemableDirectly) return;
  refreshStoreState();

  if (rewardsState.claimedPhysicalRewards.some((claim) => claim.sourceProductId === productId)) {
    displayMessage("storeMessage", "You already claimed this one-time box. Find your surprise in My Rewards.", "info");
    return;
  }
  if (rewardsState.ownedProducts.includes(productId)) {
    equipProduct(productId);
    return;
  }
  if (rewardsState.creditBalance < product.price) {
    displayMessage("storeMessage", `Not enough credits for ${product.name}. Your balance has not changed.`, "error");
    return;
  }
  if (product.rewardType === "mystery-physical") {
    claimMysteryReward(product);
    return;
  }
  rewardsState.creditBalance -= product.price;
  rewardsState.ownedProducts.push(productId);
  equipProduct(productId);
  updateBalance();
  displayMessage("storeMessage", `${product.name} redeemed and equipped! ${formatCredits(product.price)} credits used. You have ${formatCredits(rewardsState.creditBalance)} credits left.`, "success");
}

function getPossibleRewards(product) {
  return product.possibleRewardIds.map((id) => products.find((item) => item.id === id && item.active)).filter(Boolean);
}

function renderMyRewards() {
  const summary = document.getElementById("myRewards");
  if (!summary) return;
  for (const [slot, elementId] of [["equippedAvatar", "myAvatar"], ["equippedFrame", "myFrame"], ["equippedTitle", "myTitle"]]) {
    const product = products.find((item) => item.id === rewardsState[slot]);
    document.getElementById(elementId).textContent = product ? product.name : "Nothing equipped yet";
  }
  const claim = rewardsState.claimedPhysicalRewards[0];
  const reward = claim && products.find((item) => item.id === claim.rewardId);
  document.getElementById("myMysteryReward").textContent = reward ? reward.name : "No box claimed yet";
  document.getElementById("myClaimStatus").textContent = reward ? "Demo only · Nothing will be shipped" : "Your prototype surprise will appear here.";
  const image = document.getElementById("myRewardImage");
  image.hidden = !reward;
  if (reward) { image.src = reward.image; image.alt = reward.alt; }
  else { image.removeAttribute("src"); image.alt = ""; }
}

function claimMysteryReward(product) {
  const pool = getPossibleRewards(product);
  if (!pool.length) {
    displayMessage("storeMessage", "This box is currently unavailable. No credits were used.", "error");
    return;
  }
  const reward = pool[Math.floor(Math.random() * pool.length)];
  const claim = {
    claimId: `claim-${Date.now()}`,
    sourceProductId: product.id,
    rewardId: reward.id,
    claimedAt: new Date().toISOString(),
    fulfillmentStatus: "demo-only"
  };
  const saved = RewardsState.save({ ...rewardsState,
    creditBalance: rewardsState.creditBalance - product.price,
    claimedPhysicalRewards: [...rewardsState.claimedPhysicalRewards, claim]
  }, { persistent: true });
  if (!saved) {
    displayMessage("storeMessage", "Browser storage is unavailable. Enable storage and reload to save a one-time box claim. No credits were used.", "error");
    return;
  }
  refreshStoreState();
  document.getElementById("revealRewardName").textContent = reward.name;
  document.getElementById("revealRewardImage").src = reward.image;
  document.getElementById("revealRewardImage").alt = reward.alt;
  document.getElementById("revealBalance").textContent = `${formatCredits(product.price)} credits used. Your balance is ${formatCredits(rewardsState.creditBalance)} credits.`;
  displayMessage("storeMessage", `${reward.name} added to My Rewards. This is a demo-only claim; no item will be shipped.`, "success");
  document.getElementById("rewardRevealDialog").showModal();
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
  const nameInput = document.getElementById("displayName");
  const ratingInput = document.getElementById("rating");
  const feedbackInput = document.getElementById("feedback");
  const name = nameInput.value.trim();
  const rating = Number(ratingInput.value);
  const feedback = feedbackInput.value.trim();
  const recommendation = new FormData(form).get("recommendation");
  const fields = [
    { element: nameInput, valid: name.length > 0 && name.length <= 60, message: "Please enter a display name (up to 60 characters)." },
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
  const reveal = document.getElementById("rewardRevealDialog");
  document.getElementById("closeRewardReveal").addEventListener("click", () => reveal.close());
  reveal.addEventListener("close", () => document.getElementById("myRewardsHeading").focus());
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
