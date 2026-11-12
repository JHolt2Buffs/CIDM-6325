"use strict";

window.ProfileSession = (() => {
  const storageKey = "nbaTriviaProfileId";
  let profileId = null;
  let profile = null;
  let initialization = null;
  let storageAvailable = true;

  function notify() {
    window.dispatchEvent(new CustomEvent("profilechange", { detail: { profile } }));
  }

  function readId() {
    try { return localStorage.getItem(storageKey); }
    catch { storageAvailable = false; return null; }
  }

  function saveId(id) {
    if (!storageAvailable) return;
    try { localStorage.setItem(storageKey, id); }
    catch { storageAvailable = false; }
  }

  async function create() {
    const result = await NBATriviaApi.post("/profiles");
    profileId = result.profile.profileId;
    profile = result.profile;
    saveId(profileId);
    notify();
    return profile;
  }

  async function load() {
    profileId = readId();
    if (profileId) {
      try {
        profile = (await NBATriviaApi.get(`/profiles/${encodeURIComponent(profileId)}`)).profile;
        notify();
        return profile;
      } catch (error) {
        if (error.code !== "PROFILE_NOT_FOUND" && error.code !== "INVALID_REQUEST") throw error;
      }
    }
    return create();
  }

  function ensure() {
    if (!initialization) initialization = load().catch((error) => { initialization = null; throw error; });
    return initialization;
  }

  async function refresh() {
    await ensure();
    try {
      profile = (await NBATriviaApi.get(`/profiles/${encodeURIComponent(profileId)}`)).profile;
      notify();
      return profile;
    } catch (error) {
      if (error.code !== "PROFILE_NOT_FOUND") throw error;
      initialization = null;
      return ensure();
    }
  }

  function replace(updated) {
    if (!updated || updated.profileId !== profileId) throw new Error("Profile response does not match this session.");
    profile = updated;
    notify();
    return profile;
  }

  return {
    storageKey,
    ensure,
    refresh,
    replace,
    get profileId() { return profileId; },
    get profile() { return profile; },
    get temporary() { return !storageAvailable; }
  };
})();
