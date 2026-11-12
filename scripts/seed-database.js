"use strict";

require("dotenv").config();
const { readConfig } = require("../server/config");
const { connectDatabase } = require("../server/db");
const { readSeedData } = require("./seed-data");

async function createIndexes(database) {
  await Promise.all([
    database.collection("quizzes").createIndex({ quizId: 1 }, { unique: true }),
    database.collection("questions").createIndex({ questionId: 1 }, { unique: true }),
    database.collection("questions").createIndex({ quizId: 1 }),
    database.collection("questions").createIndex({ teamId: 1 }),
    database.collection("products").createIndex({ id: 1 }, { unique: true }),
    database.collection("reviews").createIndex({ reviewId: 1 }, { unique: true }),
    database.collection("reviews").createIndex({ createdAt: -1 }),
    database.collection("profiles").createIndex({ profileId: 1 }, { unique: true }),
    database.collection("quizAttempts").createIndex({ attemptId: 1 }, { unique: true }),
    database.collection("quizAttempts").createIndex({ profileId: 1 }),
    database.collection("quizAttempts").createIndex({ quizId: 1 })
  ]);
}

async function seedDatabase(database, data = readSeedData()) {
  await createIndexes(database);
  for (const [name, idField] of [["quizzes", "quizId"], ["questions", "questionId"], ["products", "id"], ["reviews", "reviewId"]]) {
    const operations = data[name].map((document) => ({
      updateOne: {
        filter: { [idField]: document[idField] },
        update: { $set: name === "reviews" ? { ...document, createdAt: new Date(document.createdAt) } : document },
        upsert: true
      }
    }));
    await database.collection(name).bulkWrite(operations, { ordered: false });
  }
  const counts = {};
  for (const name of ["quizzes", "questions", "products", "reviews", "profiles", "quizAttempts"]) {
    counts[name] = await database.collection(name).countDocuments({});
  }
  return counts;
}

async function main() {
  const data = readSeedData();
  const database = await connectDatabase(readConfig());
  try {
    const counts = await seedDatabase(database, data);
    for (const [name, count] of Object.entries(counts)) console.log(`${name}: ${count}`);
  } finally {
    await database.close();
  }
}

if (require.main === module) main().catch((error) => { console.error(`Seeding failed: ${error.message}`); process.exitCode = 1; });

module.exports = { createIndexes, seedDatabase };
