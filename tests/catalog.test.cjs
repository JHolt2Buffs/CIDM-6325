"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, `database/${name}.json`), "utf8"));
const quizzes = read("quizzes");
const questions = read("questions");
const products = read("products");
for (const [documents, idField, count] of [[quizzes, "quizId", 8], [questions, "questionId", 24], [products, "id", 10]]) {
  assert.equal(documents.length, count);
  assert.equal(new Set(documents.map(document => document[idField])).size, count);
}
assert.equal(quizzes.filter(quiz => quiz.quizType === "team").length, 4);
assert.equal(quizzes.filter(quiz => quiz.quizType === "general").length, 4);
assert.equal(quizzes.filter(quiz => quiz.category === "Rules").length, 2);
assert.equal(quizzes.filter(quiz => quiz.category === "NBA History").length, 2);
assert.equal(quizzes.filter(quiz => quiz.difficulty === "Easy").length, 2);
assert.equal(quizzes.filter(quiz => quiz.difficulty === "Medium").length, 6);
assert.ok(quizzes.every(quiz => quiz.active));
for (const id of ["nba-legends", "basketball-strategy", "oklahoma-city-thunder"]) {
  assert.ok(quizzes.some(quiz => quiz.quizId === id));
}
for (const quiz of quizzes) {
  const assigned = questions.filter(question => question.quizId === quiz.quizId && question.active);
  assert.equal(assigned.length, 3);
  assert.equal(quiz.questionCount, assigned.length);
  assert.equal(quiz.maxCredits, 75);
  assert.equal(assigned.reduce((sum, question) => sum + question.creditReward, 0), 75);
}
for (const question of questions) {
  const quiz = quizzes.find(quiz => quiz.quizId === question.quizId);
  assert.ok(quiz);
  assert.equal(question.teamId, quiz.teamId);
  assert.equal(question.category, quiz.category);
  assert.equal(question.difficulty, quiz.difficulty);
  assert.equal(question.active, true);
  assert.equal(question.imagePath, null);
  assert.ok(Number.isInteger(question.correctAnswerIndex) && question.correctAnswerIndex >= 0 && question.correctAnswerIndex < question.choices.length);
  assert.equal(question.creditReward, 25);
}
const fields = ["id", "name", "category", "rewardType", "price", "rarity", "description", "image", "alt", "titleText", "shippingRequired", "stockQuantity", "redeemableDirectly", "possibleRewardIds", "claimLimit", "active"].sort();
for (const product of products) {
  assert.deepEqual(Object.keys(product).sort(), fields);
  if (product.redeemableDirectly) assert.ok(Number.isFinite(product.price) && product.price >= 0);
  if (product.image) assert.ok(fs.existsSync(path.join(root, "public", product.image)));
}
assert.equal(products.filter(product => product.redeemableDirectly).length, 7);
const box = products.find(product => product.rewardType === "mystery-physical");
assert.equal(box.price, 2500);
assert.equal(box.claimLimit, 1);
assert.equal(box.possibleRewardIds.length, 3);
for (const id of box.possibleRewardIds) {
  const reward = products.find(product => product.id === id);
  assert.ok(reward && reward.active && !reward.redeemableDirectly && reward.rewardType === "physical");
}
console.log("PASS JSON parsing, IDs, quiz relationships, reward schema, and asset paths.");
