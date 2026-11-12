"use strict";

const { fail } = require("../errors");
const { slug } = require("../validation");

function createCatalogService(database) {
  return {
    async listQuizzes(query = {}) {
      const filter = { active: true };
      for (const [key, allowed] of [["type", ["general", "team"]], ["category", ["Rules", "NBA History", "Team History"]], ["difficulty", ["Easy", "Medium"]]]) {
        if (query[key] === undefined) continue;
        if (typeof query[key] !== "string" || !allowed.includes(query[key])) fail(400, "INVALID_FILTER", `Invalid ${key} filter.`);
        filter[key === "type" ? "quizType" : key] = query[key];
      }
      return database.collection("quizzes").find(filter, { projection: { _id: 0 } }).sort({ _id: 1 }).toArray();
    },
    async getQuiz(quizId) {
      slug(quizId, "Quiz ID");
      const quiz = await database.collection("quizzes").findOne({ quizId, active: true }, { projection: { _id: 0 } });
      if (!quiz) fail(404, "QUIZ_NOT_FOUND", "This quiz is unavailable.");
      return quiz;
    },
    async listProducts() {
      return database.collection("products").find({ active: true }, { projection: { _id: 0 } }).sort({ _id: 1 }).toArray();
    }
  };
}

module.exports = { createCatalogService };
