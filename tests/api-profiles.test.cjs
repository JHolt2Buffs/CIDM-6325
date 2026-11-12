"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const { createApp } = require("../server/app");
const { createProfileService } = require("../server/services/profiles");

test("a new anonymous profile starts with server credits and can be retrieved", async () => {
  const records = new Map();
  const database = {
    db: { command: async () => ({ ok: 1 }) },
    collection: () => ({
      insertOne: async (document) => { records.set(document.profileId, document); },
      findOne: async ({ profileId }) => records.get(profileId) ?? null
    })
  };
  const app = createApp({ database, services: { catalog: {} } });
  const created = await request(app).post("/api/profiles").send({ creditBalance: 999999 });
  assert.equal(created.status, 201);
  assert.equal(created.body.profile.creditBalance, 1000);
  assert.deepEqual(created.body.profile.ownedProductIds, []);
  const loaded = await request(app).get(`/api/profiles/${created.body.profile.profileId}`);
  assert.equal(loaded.status, 200);
  assert.equal(loaded.body.profile.profileId, created.body.profile.profileId);
  assert.equal((await request(app).get("/api/profiles/bad-id")).status, 400);
  const missing = await request(app).get("/api/profiles/5c4a7e8d-702b-45b0-88fd-e01cfad5cde3");
  assert.equal(missing.status, 404);
});
