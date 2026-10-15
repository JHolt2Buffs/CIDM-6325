"use strict";

// The store, quiz, and reviews share one browser-local rewards balance.
const RewardsState = (() => {
  const storageKey = "nbaTriviaRewardsState";
  const products = window.NBATriviaRewardData.products;
  const slotTypes = { equippedAvatar: "digital-avatar", equippedFrame: "digital-frame", equippedTitle: "digital-title" };

  function defaultState() {
    return {
      creditBalance: 1000,
      ownedProducts: [],
      equippedAvatar: null,
      equippedFrame: null,
      equippedTitle: null,
      claimedPhysicalRewards: []
    };
  }

  function validateState(value) {
    const state = defaultState();
    if (!value || typeof value !== "object" || Array.isArray(value)) return state;

    if (typeof value.creditBalance === "number" && Number.isFinite(value.creditBalance) && value.creditBalance >= 0) {
      state.creditBalance = value.creditBalance;
    }
    if (Array.isArray(value.ownedProducts)) {
      state.ownedProducts = [...new Set(value.ownedProducts.filter((id) => products.some((product) => product.id === id && product.active && product.rewardType.startsWith("digital-"))))];
    }
    for (const slot of ["equippedAvatar", "equippedFrame", "equippedTitle"]) {
      if (state.ownedProducts.includes(value[slot]) && products.some((product) => product.id === value[slot] && product.rewardType === slotTypes[slot])) {
        state[slot] = value[slot];
      }
    }
    if (Array.isArray(value.claimedPhysicalRewards)) {
      for (const claim of value.claimedPhysicalRewards) {
        if (!claim || typeof claim !== "object") continue;
        const source = products.find((product) => product.id === claim.sourceProductId && product.rewardType === "mystery-physical");
        const validDate = typeof claim.claimedAt === "string" && Number.isFinite(Date.parse(claim.claimedAt));
        if (!source || !source.possibleRewardIds.includes(claim.rewardId) || !products.some((product) => product.id === claim.rewardId && product.rewardType === "physical")) continue;
        if (typeof claim.claimId !== "string" || !claim.claimId.trim() || !validDate || claim.fulfillmentStatus !== "demo-only") continue;
        if (new Date(claim.claimedAt).toISOString() !== claim.claimedAt || state.claimedPhysicalRewards.some((saved) => saved.sourceProductId === source.id)) continue;
        state.claimedPhysicalRewards.push({ claimId: claim.claimId, sourceProductId: source.id, rewardId: claim.rewardId, claimedAt: claim.claimedAt, fulfillmentStatus: "demo-only" });
      }
    }
    return state;
  }

  let currentState = defaultState();
  let storageAvailable = true;

  function load() {
    let saved;
    if (storageAvailable) {
      try {
        saved = localStorage.getItem(storageKey);
      } catch {
        storageAvailable = false;
      }
      if (storageAvailable) {
        try {
          currentState = validateState(JSON.parse(saved));
        } catch {
          currentState = defaultState();
        }
      }
    }
    return validateState(currentState);
  }

  function save(state, { persistent = false } = {}) {
    const nextState = validateState(state);
    if (persistent && !storageAvailable) return null;
    if (storageAvailable) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(nextState));
      } catch {
        // Keep this page usable when the browser blocks storage or it is full.
        storageAvailable = false;
        if (persistent) return null;
      }
    }
    currentState = nextState;
    return validateState(currentState);
  }

  return { storageKey, load, save };
})();
