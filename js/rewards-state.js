"use strict";

// The store, quiz, and reviews share one browser-local rewards balance.
const RewardsState = (() => {
  const storageKey = "nbaTriviaRewardsState";

  function defaultState() {
    return {
      creditBalance: 1000,
      ownedProducts: [],
      equippedAvatar: null,
      equippedFrame: null,
      equippedTitle: null
    };
  }

  function validateState(value) {
    const state = defaultState();
    if (!value || typeof value !== "object" || Array.isArray(value)) return state;

    if (typeof value.creditBalance === "number" && Number.isFinite(value.creditBalance) && value.creditBalance >= 0) {
      state.creditBalance = value.creditBalance;
    }
    if (Array.isArray(value.ownedProducts)) {
      state.ownedProducts = [...new Set(value.ownedProducts.filter((id) => typeof id === "string" && id.trim() !== ""))];
    }
    for (const slot of ["equippedAvatar", "equippedFrame", "equippedTitle"]) {
      if (typeof value[slot] === "string" && state.ownedProducts.includes(value[slot])) {
        state[slot] = value[slot];
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

  function save(state) {
    currentState = validateState(state);
    if (storageAvailable) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(currentState));
      } catch {
        // Keep this page usable when the browser blocks storage or it is full.
        storageAvailable = false;
      }
    }
    return validateState(currentState);
  }

  return { storageKey, load, save };
})();
