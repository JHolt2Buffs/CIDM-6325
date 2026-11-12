"use strict";

const fs = require("node:fs");
const path = require("node:path");

const expectedCounts = { quizzes: 8, questions: 24, products: 10, reviews: 2 };
const idFields = { quizzes: "quizId", questions: "questionId", products: "id", reviews: "reviewId" };

function readSeedData(root = path.join(__dirname, "..")) {
  const data = {};
  for (const [name, count] of Object.entries(expectedCounts)) {
    const file = path.join(root, "database", `${name}.json`);
    const documents = JSON.parse(fs.readFileSync(file, "utf8"));
    if (!Array.isArray(documents) || documents.length !== count) throw new Error(`${name}.json must contain ${count} documents.`);
    const ids = documents.map((document) => document[idFields[name]]);
    if (ids.some((id) => typeof id !== "string" || !id) || new Set(ids).size !== count) throw new Error(`${name}.json has missing or duplicate IDs.`);
    data[name] = documents;
  }
  for (const quiz of data.quizzes) {
    const assigned = data.questions.filter((question) => question.quizId === quiz.quizId);
    if (assigned.length !== quiz.questionCount || assigned.reduce((total, question) => total + question.creditReward, 0) !== quiz.maxCredits) {
      throw new Error(`Question count or credits do not match ${quiz.quizId}.`);
    }
  }
  for (const question of data.questions) {
    const quiz = data.quizzes.find((item) => item.quizId === question.quizId);
    if (!quiz || question.teamId !== quiz.teamId || !Array.isArray(question.choices) || !Number.isInteger(question.correctAnswerIndex) || question.correctAnswerIndex < 0 || question.correctAnswerIndex >= question.choices.length) {
      throw new Error(`Invalid question ${question.questionId}.`);
    }
  }
  for (const product of data.products) {
    if (product.image && !fs.existsSync(path.join(root, "public", product.image))) throw new Error(`Missing image for ${product.id}.`);
    if (product.possibleRewardIds?.some((id) => !data.products.some((item) => item.id === id && item.rewardType === "physical"))) {
      throw new Error(`Invalid reward pool for ${product.id}.`);
    }
  }
  for (const review of data.reviews) {
    if (!review.displayName || !Number.isInteger(review.rating) || review.rating < 1 || review.rating > 5 || !review.feedback || typeof review.recommends !== "boolean") throw new Error(`Invalid sample review ${review.reviewId}.`);
  }
  return data;
}

module.exports = { readSeedData, expectedCounts };
