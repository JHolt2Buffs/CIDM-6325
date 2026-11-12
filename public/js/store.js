"use strict";

(() => {
  let products = [];
  let pendingId = null;
  let saving = false;
  let filter = "all";
  const grid = document.getElementById("productGrid");
  const dialog = document.getElementById("redeemDialog");
  const reveal = document.getElementById("rewardRevealDialog");
  const retry = document.getElementById("storeRetry");
  const money = (amount) => Number(amount).toLocaleString("en-US");
  const productById = (id) => products.find((product) => product.id === id);
  const profile = () => ProfileSession.profile;

  function node(tag, className, value) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (value !== undefined) element.textContent = value;
    return element;
  }

  function message(value, kind = "info") {
    const target = document.getElementById("storeMessage");
    target.textContent = value;
    target.className = `status-message ${kind}`;
  }

  function earnMessage(value) {
    message(value, "error");
    const link = node("a", "", "Play a quiz to earn more credits →");
    link.href = "quizzes.html";
    document.getElementById("storeMessage").append(" ", link);
  }

  function renderCard(product) {
    const card = node("article", `product-card${product.rewardType === "mystery-physical" ? " is-vault" : ""}`);
    card.dataset.category = product.category;
    card.dataset.productId = product.id;
    card.setAttribute("aria-labelledby", `${product.id}-name`);
    const preview = node("div", `product-preview ${product.rarity === "Epic" ? "preview-epic" : product.id === "frame-hardwood-classic" ? "preview-hardwood" : ""}`);
    const topline = node("div", "preview-topline");
    topline.append(node("span", "product-category", product.category), node("span", `rarity rarity-${product.rarity.toLowerCase()}`, product.rarity));
    preview.appendChild(topline);
    if (product.image) {
      const image = node("img");
      image.src = product.image;
      image.alt = product.alt || "";
      image.width = 180;
      image.height = 180;
      preview.appendChild(image);
    } else {
      const titlePreview = node("div", "product-title-preview");
      const initials = node("span", "preview-initials", "JF");
      initials.setAttribute("aria-hidden", "true");
      titlePreview.append(initials, node("span", "preview-player-name", "JordanFan23"), node("span", `title-pill ${product.id === "title-trivia-all-star" ? "title-blue" : ""}`, product.titleText));
      preview.appendChild(titlePreview);
    }
    const details = node("div", "product-details");
    const heading = node("h3", "", product.name);
    heading.id = `${product.id}-name`;
    if (product.rewardType === "mystery-physical") heading.tabIndex = -1;
    details.append(heading, node("p", "product-description", product.description));
    if (product.rewardType === "mystery-physical") details.appendChild(node("p", "vault-limit", "One box per profile."));
    const footer = node("div", "product-footer");
    const price = node("span", "product-price");
    const coin = node("span", "coin coin-small", "C");
    coin.setAttribute("aria-hidden", "true");
    const amount = node("span");
    amount.append(node("strong", "", money(product.price)), node("small", "", " credits"));
    price.append(coin, amount);
    const button = node("button", "button button-primary redeem-button", "Redeem ↗");
    button.type = "button";
    button.dataset.redeem = product.id;
    footer.append(price, button);
    details.appendChild(footer);
    card.append(preview, details);
    return card;
  }

  function applyFilter() {
    let visible = 0;
    grid.querySelectorAll(".product-card").forEach((card) => {
      card.hidden = filter !== "all" && card.dataset.category !== filter;
      if (!card.hidden) visible++;
    });
    document.querySelectorAll("[data-filter]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.filter === filter)));
    document.getElementById("catalogCount").textContent = `${visible} rewards to make your own`;
  }

  function refreshDisplay() {
    if (!profile()) return;
    const current = profile();
    document.querySelectorAll("[data-credit-balance]").forEach((element) => { element.textContent = money(current.creditBalance); });
    document.querySelector(".header-balance").setAttribute("aria-label", `${money(current.creditBalance)} available credits`);
    document.getElementById("sessionNotice").hidden = !ProfileSession.temporary;
    const avatar = productById(current.equipped.avatarId);
    const avatarImage = document.getElementById("profileAvatar");
    avatarImage.src = avatar?.image || "images/default-avatar.svg";
    avatarImage.alt = avatar ? `JordanFan23’s ${avatar.name} avatar: ${avatar.alt}` : "JordanFan23’s default basketball avatar";
    const frame = productById(current.equipped.frameId);
    const frameImage = document.getElementById("profileFrame");
    frameImage.hidden = !frame;
    document.getElementById("profileAvatarLayers").classList.toggle("has-frame", Boolean(frame));
    if (frame) { frameImage.src = frame.image; frameImage.alt = `${frame.name} profile frame`; }
    else { frameImage.removeAttribute("src"); frameImage.alt = ""; }
    const title = productById(current.equipped.titleId);
    const titleNode = document.getElementById("profileTitle");
    titleNode.hidden = !title;
    titleNode.textContent = title?.titleText || "";
    titleNode.classList.toggle("title-blue", title?.id === "title-trivia-all-star");
    document.getElementById("defaultProfileTitle").hidden = Boolean(title);

    const box = products.find((item) => item.rewardType === "mystery-physical");
    if (box) {
      const claimed = current.claimedPhysicalRewards.some((item) => item.sourceProductId === box.id);
      const progress = document.getElementById("vaultProgress");
      progress.max = box.price;
      progress.value = claimed ? box.price : Math.min(current.creditBalance, box.price);
      document.getElementById("vaultPrice").textContent = `${money(box.price)} credits · Your balance: ${money(current.creditBalance)} credits`;
      document.getElementById("vaultProgressMessage").textContent = claimed ? "Mystery box claimed on this profile." : current.creditBalance >= box.price ? "You have enough credits to open the box." : `${money(box.price - current.creditBalance)} more credits to reach the box.`;
    }
    grid.querySelectorAll("[data-redeem]").forEach((button) => {
      const product = productById(button.dataset.redeem);
      const owned = current.ownedProductIds.includes(product.id);
      const equipped = Object.values(current.equipped).includes(product.id);
      const claimed = current.claimedPhysicalRewards.some((item) => item.sourceProductId === product.id);
      button.disabled = saving || equipped || claimed;
      button.classList.toggle("is-claimed", claimed);
      button.classList.toggle("is-owned", owned && !equipped);
      button.classList.toggle("is-equipped", equipped);
      button.closest(".product-card").classList.toggle("is-equipped", equipped);
      button.textContent = claimed ? "Claimed ✓" : equipped ? "Equipped ✓" : owned ? "Equip →" : "Redeem ↗";
      button.setAttribute("aria-label", claimed ? `${product.name} has already been claimed` : equipped ? `${product.name} is equipped` : owned ? `Equip owned ${product.name}` : `Redeem ${product.name} for ${product.price} credits`);
    });
  }

  async function load() {
    retry.hidden = true;
    message("Loading rewards…");
    try {
      const [catalog, quizzes] = await Promise.all([NBATriviaApi.get("/products"), NBATriviaApi.get("/quizzes"), ProfileSession.ensure()]);
      products = catalog.products;
      grid.replaceChildren(...products.filter((item) => item.redeemableDirectly).map(renderCard));
      const sample = quizzes.quizzes[0];
      document.getElementById("creditEconomy").textContent = `A ${sample.questionCount}-question quiz offers up to ${money(sample.maxCredits)} credits. Your first server-backed visit starts a fresh 1,000-credit profile. Spend credits on digital profile rewards or save for the Mystery Memorabilia Box (prototype).`;
      document.querySelector("[data-credits-per-answer]").textContent = money(Math.round(sample.maxCredits / sample.questionCount));
      document.querySelector("[data-starting-credits]").textContent = "1,000";
      applyFilter();
      refreshDisplay();
      message("");
    } catch (error) {
      message(error.message, "error");
      retry.hidden = false;
    }
  }

  async function equip(product) {
    if (saving) return;
    saving = true;
    refreshDisplay();
    try {
      const result = await NBATriviaApi.patch(`/profiles/${ProfileSession.profileId}/equipment`, { productId: product.id });
      ProfileSession.replace(result.profile);
      message(`${product.name} is equipped on your profile. No credits were used.`, "success");
    } catch (error) { message(error.message, "error"); }
    finally { saving = false; refreshDisplay(); }
  }

  function offer(product) {
    if (saving || dialog.open) return;
    if (profile().claimedPhysicalRewards.some((claim) => claim.sourceProductId === product.id)) return message("You already claimed this one-time box.");
    if (profile().ownedProductIds.includes(product.id)) return equip(product);
    if (profile().creditBalance < product.price) return earnMessage(`Not enough credits for ${product.name}. You need ${money(product.price - profile().creditBalance)} more credits.`);
    pendingId = product.id;
    const mystery = product.rewardType === "mystery-physical";
    document.getElementById("mysteryDetails").hidden = !mystery;
    document.getElementById("redeemDescription").textContent = mystery ? `Open the ${product.name} for ${money(product.price)} credits and reveal random physical basketball memorabilia (prototype)?` : `Redeem ${product.name} for ${money(product.price)} credits? It will be added to your collection and equipped on your profile.`;
    document.getElementById("redemptionFootnote").textContent = mystery ? "Virtual credits only. One claim per profile." : "Virtual credits only. Your reward is equipped instantly.";
    document.getElementById("remainingBalance").textContent = `Current balance: ${money(profile().creditBalance)} credits. After redeeming: ${money(profile().creditBalance - product.price)} credits.`;
    dialog.showModal();
  }

  async function confirm() {
    if (saving || !pendingId) return;
    const product = productById(pendingId);
    saving = true;
    document.getElementById("confirmRedeem").disabled = true;
    document.getElementById("cancelRedeem").disabled = true;
    refreshDisplay();
    try {
      const result = await NBATriviaApi.post(`/profiles/${ProfileSession.profileId}/redemptions`, { productId: product.id });
      ProfileSession.replace(result.profile);
      dialog.close();
      message(`${product.name} redeemed. ${money(product.price)} credits used.`, "success");
      if (result.reward) {
        document.getElementById("revealRewardName").textContent = result.reward.name;
        const image = document.getElementById("revealRewardImage");
        image.src = result.reward.image;
        image.alt = result.reward.alt;
        document.getElementById("revealBalance").textContent = `${money(product.price)} credits used. Your balance is ${money(result.profile.creditBalance)} credits.`;
        reveal.showModal();
      }
    } catch (error) {
      dialog.close();
      message(error.message, "error");
      await ProfileSession.refresh().catch(() => {});
    } finally {
      saving = false;
      pendingId = null;
      document.getElementById("confirmRedeem").disabled = false;
      document.getElementById("cancelRedeem").disabled = false;
      refreshDisplay();
    }
  }

  document.querySelectorAll("[data-filter]").forEach((button) => button.addEventListener("click", () => { filter = button.dataset.filter; applyFilter(); }));
  document.getElementById("viewVaultRewards").addEventListener("click", () => { filter = "Physical Reward"; applyFilter(); });
  grid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-redeem]");
    if (button) offer(productById(button.dataset.redeem));
  });
  document.getElementById("confirmRedeem").addEventListener("click", confirm);
  document.getElementById("cancelRedeem").addEventListener("click", () => dialog.close());
  document.getElementById("closeRewardReveal").addEventListener("click", () => reveal.close());
  reveal.addEventListener("close", () => document.getElementById("mystery-memorabilia-box-name")?.focus());
  retry.addEventListener("click", load);
  window.addEventListener("profilechange", refreshDisplay);
  window.addEventListener("pageshow", () => ProfileSession.refresh().catch((error) => message(error.message, "error")));
  load();
})();
