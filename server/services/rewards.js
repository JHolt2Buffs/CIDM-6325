"use strict";

const { randomInt, randomUUID } = require("node:crypto");
const { fail } = require("../errors");
const { slug, uuid } = require("../validation");

const equipmentSlot = {
  "digital-avatar": "avatarId",
  "digital-frame": "frameId",
  "digital-title": "titleId"
};

function createRewardService(database) {
  const profiles = database.collection("profiles");
  const products = database.collection("products");

  async function productById(productId) {
    slug(productId, "Product ID");
    const product = await products.findOne({ id: productId, active: true });
    if (!product) fail(404, "PRODUCT_NOT_FOUND", "This reward is unavailable.");
    return product;
  }

  async function profileById(profileId) {
    const profile = await profiles.findOne({ profileId }, { projection: { _id: 0 } });
    if (!profile) fail(404, "PROFILE_NOT_FOUND", "This profile no longer exists.");
    return profile;
  }

  return {
    async equip(profileId, productId) {
      uuid(profileId, "Profile ID");
      const product = await productById(productId);
      const slot = equipmentSlot[product.rewardType];
      if (!slot) fail(400, "NOT_EQUIPPABLE", "This reward cannot be equipped.");
      const updated = await profiles.updateOne(
        { profileId, ownedProductIds: productId },
        { $set: { [`equipped.${slot}`]: productId, updatedAt: new Date() } }
      );
      if (!updated.matchedCount) {
        const profile = await profileById(profileId);
        if (!profile.ownedProductIds.includes(productId)) fail(409, "NOT_OWNED", "Redeem this reward before equipping it.");
      }
      return { profile: await profileById(profileId) };
    },

    async redeem(profileId, productId) {
      uuid(profileId, "Profile ID");
      const product = await productById(productId);
      if (!product.redeemableDirectly || !Number.isInteger(product.price) || product.price < 0) fail(400, "NOT_REDEEMABLE", "This reward cannot be redeemed directly.");

      if (product.rewardType === "mystery-physical") {
        const pool = await products.find({ id: { $in: product.possibleRewardIds || [] }, active: true, rewardType: "physical" }).toArray();
        if (!pool.length) fail(409, "REWARD_UNAVAILABLE", "This box is temporarily unavailable.");
        const reward = pool[randomInt(pool.length)];
        const claim = {
          claimId: randomUUID(), sourceProductId: product.id, rewardId: reward.id,
          claimedAt: new Date(), fulfillmentStatus: "demo-only"
        };
        const updated = await profiles.updateOne(
          { profileId, creditBalance: { $gte: product.price }, "claimedPhysicalRewards.sourceProductId": { $ne: product.id } },
          { $inc: { creditBalance: -product.price }, $push: { claimedPhysicalRewards: claim }, $set: { updatedAt: new Date() } }
        );
        if (!updated.modifiedCount) {
          const profile = await profileById(profileId);
          if (profile.claimedPhysicalRewards.some((item) => item.sourceProductId === product.id)) fail(409, "ALREADY_CLAIMED", "You already claimed this one-time box.");
          fail(409, "INSUFFICIENT_CREDITS", `You need ${product.price - profile.creditBalance} more credits for this reward.`);
        }
        return { profile: await profileById(profileId), reward: { id: reward.id, name: reward.name, image: reward.image, alt: reward.alt }, claim };
      }

      const slot = equipmentSlot[product.rewardType];
      if (!slot) fail(400, "NOT_REDEEMABLE", "This reward cannot be redeemed directly.");
      const updated = await profiles.updateOne(
        { profileId, creditBalance: { $gte: product.price }, ownedProductIds: { $ne: product.id } },
        { $inc: { creditBalance: -product.price }, $addToSet: { ownedProductIds: product.id }, $set: { [`equipped.${slot}`]: product.id, updatedAt: new Date() } }
      );
      if (!updated.modifiedCount) {
        const profile = await profileById(profileId);
        if (profile.ownedProductIds.includes(product.id)) fail(409, "ALREADY_OWNED", "You already own this reward. Equip it from your collection.");
        fail(409, "INSUFFICIENT_CREDITS", `You need ${product.price - profile.creditBalance} more credits for this reward.`);
      }
      return { profile: await profileById(profileId) };
    }
  };
}

module.exports = { createRewardService, equipmentSlot };
