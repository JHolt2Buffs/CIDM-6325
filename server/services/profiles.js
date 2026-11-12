"use strict";

const { randomUUID } = require("node:crypto");
const { fail } = require("../errors");
const { uuid } = require("../validation");

function createProfileService(database) {
  const profiles = database.collection("profiles");
  return {
    async createProfile() {
      const now = new Date();
      const profile = {
        profileId: randomUUID(),
        creditBalance: 1000,
        ownedProductIds: [],
        equipped: { avatarId: null, frameId: null, titleId: null },
        claimedPhysicalRewards: [],
        awardedAttemptIds: [],
        createdAt: now,
        updatedAt: now
      };
      await profiles.insertOne(profile);
      const { _id, ...publicProfile } = profile;
      return publicProfile;
    },
    async getProfile(profileId) {
      uuid(profileId, "Profile ID");
      const profile = await profiles.findOne({ profileId }, { projection: { _id: 0 } });
      if (!profile) fail(404, "PROFILE_NOT_FOUND", "This profile no longer exists.");
      return profile;
    }
  };
}

module.exports = { createProfileService };
