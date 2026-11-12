"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const request = require("supertest");
const { connectDatabase } = require("../server/db");
const { createApp } = require("../server/app");
const { seedDatabase } = require("../scripts/seed-database");
const { readSeedData } = require("../scripts/seed-data");

test("MongoDB API flow persists profiles, attempts, rewards, and reviews", { skip: !process.env.MONGODB_TEST_URI }, async () => {
  const name = `nba_trivia_rewards_test_${randomUUID().replaceAll("-", "")}`;
  const database = await connectDatabase({ uri: process.env.MONGODB_TEST_URI, database: name });
  try {
    const data = readSeedData();
    assert.deepEqual(await seedDatabase(database), { quizzes: 8, questions: 24, products: 10, reviews: 2, profiles: 0, quizAttempts: 0 });
    assert.deepEqual(await seedDatabase(database), { quizzes: 8, questions: 24, products: 10, reviews: 2, profiles: 0, quizAttempts: 0 });
    const app = createApp({ database });
    assert.equal((await request(app).get("/api/health")).status, 200);
    assert.equal((await request(app).get("/api/quizzes")).body.quizzes.length, 8);
    assert.equal((await request(app).get("/api/quizzes?type=team")).body.quizzes.length, 4);
    assert.equal((await request(app).get("/api/products")).body.products.length, 10);
    assert.equal((await request(app).get("/database/questions.json")).status, 404);

    const created = await request(app).post("/api/profiles").send({ creditBalance: 999999 });
    assert.equal(created.status, 201);
    const profileId = created.body.profile.profileId;
    assert.equal(created.body.profile.creditBalance, 1000);
    assert.equal((await request(app).get(`/api/profiles/${profileId}`)).body.profile.creditBalance, 1000);
    assert.equal((await request(app).get(`/api/profiles/${randomUUID()}`)).status, 404);

    const started = await request(app).post("/api/quiz-attempts").send({ profileId, quizId: "basketball-basics" });
    assert.equal(started.status, 201);
    const { attemptId, questions } = started.body;
    assert.equal(questions.length, 3);
    assert.ok(questions.every((question) => !Object.hasOwn(question, "correctAnswerIndex") && !Object.hasOwn(question, "explanation")));
    assert.equal((await request(app).post(`/api/quiz-attempts/${attemptId}/complete`).send({ profileId })).status, 409);
    const answers = data.questions.filter((question) => question.quizId === "basketball-basics");
    for (let index = 0; index < questions.length; index++) {
      const question = answers.find((item) => item.questionId === questions[index].questionId);
      const selectedIndex = index === 1 ? (question.correctAnswerIndex + 1) % question.choices.length : question.correctAnswerIndex;
      const response = await request(app).post(`/api/quiz-attempts/${attemptId}/answers`).send({ profileId, questionId: question.questionId, selectedIndex });
      assert.equal(response.status, 200);
      assert.equal(response.body.correct, index !== 1);
      assert.equal(response.body.explanation, question.explanation);
      if (index === 0) assert.equal((await request(app).post(`/api/quiz-attempts/${attemptId}/answers`).send({ profileId, questionId: question.questionId, selectedIndex })).status, 409);
    }
    const completed = await request(app).post(`/api/quiz-attempts/${attemptId}/complete`).send({ profileId });
    assert.equal(completed.body.score, 2);
    assert.equal(completed.body.earnedCredits, 50);
    assert.equal(completed.body.balance, 1050);
    assert.equal((await request(app).post(`/api/quiz-attempts/${attemptId}/complete`).send({ profileId })).body.balance, 1050);

    assert.equal((await request(app).patch(`/api/profiles/${profileId}/equipment`).send({ productId: "avatar-hoop-scholar" })).body.error.code, "NOT_OWNED");
    const digital = await request(app).post(`/api/profiles/${profileId}/redemptions`).send({ productId: "avatar-hoop-scholar" });
    assert.equal(digital.body.profile.creditBalance, 850);
    assert.equal(digital.body.profile.equipped.avatarId, "avatar-hoop-scholar");
    assert.equal((await request(app).post(`/api/profiles/${profileId}/redemptions`).send({ productId: "avatar-hoop-scholar" })).body.error.code, "ALREADY_OWNED");
    assert.equal((await request(app).patch(`/api/profiles/${profileId}/equipment`).send({ productId: "avatar-hoop-scholar" })).body.profile.creditBalance, 850);
    assert.equal((await request(app).post(`/api/profiles/${profileId}/redemptions`).send({ productId: "mystery-memorabilia-box" })).body.error.code, "INSUFFICIENT_CREDITS");

    await database.collection("profiles").updateOne({ profileId }, { $set: { creditBalance: 3000 } });
    const claimed = await request(app).post(`/api/profiles/${profileId}/redemptions`).send({ productId: "mystery-memorabilia-box" });
    assert.equal(claimed.status, 200);
    assert.equal(claimed.body.profile.creditBalance, 500);
    assert.ok(data.products.find((product) => product.id === "mystery-memorabilia-box").possibleRewardIds.includes(claimed.body.reward.id));
    assert.equal(claimed.body.claim.fulfillmentStatus, "demo-only");
    assert.equal((await request(app).post(`/api/profiles/${profileId}/redemptions`).send({ productId: "mystery-memorabilia-box" })).body.error.code, "ALREADY_CLAIMED");
    assert.equal((await request(app).get(`/api/profiles/${profileId}`)).body.profile.claimedPhysicalRewards.length, 1);

    const raceProfile = (await request(app).post("/api/profiles").send({})).body.profile.profileId;
    await database.collection("profiles").updateOne({ profileId: raceProfile }, { $set: { creditBalance: 300 } });
    const purchases = await Promise.all(["avatar-hoop-scholar", "avatar-neon-hoop"].map((productId) =>
      request(app).post(`/api/profiles/${raceProfile}/redemptions`).send({ productId })));
    assert.deepEqual(purchases.map((result) => result.status).sort(), [200, 409]);
    const raceBalance = (await request(app).get(`/api/profiles/${raceProfile}`)).body.profile.creditBalance;
    assert.ok(raceBalance === 100 || raceBalance === 50);
    await database.collection("profiles").updateOne({ profileId: raceProfile }, { $set: { creditBalance: 5000 } });
    const boxClaims = await Promise.all([0, 1].map(() =>
      request(app).post(`/api/profiles/${raceProfile}/redemptions`).send({ productId: "mystery-memorabilia-box" })));
    assert.deepEqual(boxClaims.map((result) => result.status).sort(), [200, 409]);
    assert.equal((await request(app).get(`/api/profiles/${raceProfile}`)).body.profile.creditBalance, 2500);

    assert.equal((await request(app).get("/api/reviews")).body.reviews.length, 2);
    assert.equal((await request(app).post("/api/reviews").send({ displayName: "Fan", rating: 7, feedback: "Good", recommends: true })).status, 400);
    assert.equal((await request(app).post("/api/reviews").send({ displayName: "Fan", rating: 5, recommends: true })).status, 400);
    const review = await request(app).post("/api/reviews").send({ displayName: "Fan", rating: 5, feedback: "Great quizzes", recommends: true });
    assert.equal(review.status, 201);
    const listed = (await request(app).get("/api/reviews")).body.reviews;
    assert.equal(listed.length, 3);
    assert.equal(listed[0].reviewId, review.body.review.reviewId);
    assert.equal(listed.reduce((sum, item) => sum + item.rating, 0), 14);
  } finally {
    await database.db.dropDatabase();
    await database.close();
  }
});
