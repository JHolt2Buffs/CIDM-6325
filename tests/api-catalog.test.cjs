"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const { createApp } = require("../server/app");
const { createCatalogService } = require("../server/services/catalog");
const { AppError } = require("../server/errors");

const database = { db: { command: async () => ({ ok: 1 }) }, collection: () => { throw new Error("Unexpected database call"); } };

test("catalog endpoints return their service data", async () => {
  const services = { catalog: {
    listQuizzes: async () => [{ quizId: "basketball-basics", title: "Basketball Basics" }],
    getQuiz: async (id) => ({ quizId: id, title: "Basketball Basics" }),
    listProducts: async () => [{ id: "avatar-hoop-scholar", price: 200 }]
  } };
  const app = createApp({ database, services });
  assert.equal((await request(app).get("/api/health")).status, 200);
  assert.equal((await request(app).get("/api/quizzes")).body.quizzes.length, 1);
  assert.equal((await request(app).get("/api/quizzes/basketball-basics")).body.quiz.quizId, "basketball-basics");
  assert.equal((await request(app).get("/api/products")).body.products[0].price, 200);
});

test("catalog validation and missing routes use JSON errors", async () => {
  const app = createApp({ database, services: { catalog: createCatalogService(database) } });
  const badFilter = await request(app).get("/api/quizzes?difficulty=Expert");
  assert.equal(badFilter.status, 400);
  assert.equal(badFilter.body.error.code, "INVALID_FILTER");
  const badId = await request(app).get("/api/quizzes/Not-A-Slug");
  assert.equal(badId.status, 400);
  assert.equal(badId.body.error.code, "INVALID_REQUEST");
  assert.equal((await request(app).get("/api/unknown")).status, 404);
});

test("service errors do not expose internal details", async () => {
  const app = createApp({ database, services: { catalog: {
    listQuizzes: async () => { throw new AppError(404, "QUIZ_NOT_FOUND", "This quiz is unavailable."); },
    getQuiz: async () => null,
    listProducts: async () => []
  } } });
  const result = await request(app).get("/api/quizzes");
  assert.equal(result.status, 404);
  assert.deepEqual(result.body, { error: { code: "QUIZ_NOT_FOUND", message: "This quiz is unavailable." } });
});
