"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const root = path.join(__dirname, "..");

function createState(raw = null, failure = null) {
  let stored = raw;
  const context = vm.createContext({ window: {}, localStorage: {
    getItem() { if (failure === "read") throw new Error("Storage blocked"); return stored; },
    setItem(key, value) { if (failure === "write") throw new Error("Storage full"); stored = value; }
  }});
  for (const file of ["js/reward-data.js", "js/rewards-state.js"]) {
    vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context);
  }
  return vm.runInContext("RewardsState", context);
}

const original = { creditBalance: 800, ownedProducts: ["avatar-hoop-scholar"], equippedAvatar: "avatar-hoop-scholar", equippedFrame: null, equippedTitle: null };
const migrated = createState(JSON.stringify(original)).load();
assert.equal(migrated.creditBalance, 800);
assert.equal(migrated.equippedAvatar, original.equippedAvatar);
assert.equal(migrated.ownedProducts.length, 1);
assert.equal(migrated.claimedPhysicalRewards.length, 0);

for (const value of [null, "{broken", "null", "[]", "false", '{"creditBalance":-1}', '{"creditBalance":1e309}', '{"creditBalance":"800"}']) {
  const state = createState(value).load();
  assert.equal(state.creditBalance, 1000);
  assert.equal(state.claimedPhysicalRewards.length, 0);
}
assert.equal(createState('{"creditBalance":0}').load().creditBalance, 0);
const normalized = createState(JSON.stringify({ ...original,
  ownedProducts: ["avatar-hoop-scholar", "avatar-hoop-scholar", "unknown", null, "mini-basketball"],
  equippedAvatar: "avatar-neon-hoop", equippedFrame: "avatar-hoop-scholar"
})).load();
assert.equal(normalized.ownedProducts.length, 1);
assert.equal(normalized.equippedAvatar, null);
assert.equal(normalized.equippedFrame, null);

const claim = { claimId: "claim-test", sourceProductId: "mystery-memorabilia-box", rewardId: "mini-basketball", claimedAt: "2026-10-14T12:00:00.000Z", fulfillmentStatus: "demo-only" };
const saved = createState(JSON.stringify({ ...original, claimedPhysicalRewards: [claim, {...claim, claimId:"duplicate", rewardId:"hardwood-legends-poster"}] })).load();
assert.equal(saved.claimedPhysicalRewards.length, 1);
assert.equal(saved.claimedPhysicalRewards[0].rewardId, "mini-basketball");
for (const bad of [null, {}, {...claim, sourceProductId:"avatar-hoop-scholar"}, {...claim, rewardId:"avatar-neon-hoop"}, {...claim, fulfillmentStatus:"shipped"}, {...claim, claimedAt:"invalid"}, {...claim, claimId:""}]) {
  assert.equal(createState(JSON.stringify({...original, claimedPhysicalRewards:[bad]})).load().claimedPhysicalRewards.length, 0);
}
for (const failure of ["read", "write"]) {
  const state = createState(null, failure);
  const before = state.load();
  assert.equal(state.save({...before, creditBalance:100, claimedPhysicalRewards:[claim]}, {persistent:true}), null);
  assert.equal(state.load().creditBalance, 1000);
  assert.equal(state.load().claimedPhysicalRewards.length, 0);
  state.save({...before, creditBalance:800, ownedProducts:["avatar-hoop-scholar"]});
  assert.equal(state.load().creditBalance, 800);
}
const state = createState();
state.save({...original, claimedPhysicalRewards:[claim]}, {persistent:true});
const copy = state.load();
copy.claimedPhysicalRewards[0].rewardId = "tampered";
assert.equal(state.load().claimedPhysicalRewards[0].rewardId, "mini-basketball");
console.log("PASS saved-state migration, validation, claim deduplication, and storage failure recovery.");
