"use strict";

const { randomUUID } = require("node:crypto");
const { fail } = require("../errors");
const { objectBody } = require("../validation");

function createReviewService(database) {
  const reviews = database.collection("reviews");
  return {
    async list() {
      return reviews.find({}, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
    },
    async create(value) {
      const body = objectBody(value);
      const { displayName, rating, feedback, recommends } = body;
      if (typeof displayName !== "string" || !displayName.trim() || displayName.trim().length > 60) fail(400, "INVALID_REVIEW", "Enter a display name up to 60 characters.");
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) fail(400, "INVALID_REVIEW", "Select a rating from 1 to 5 stars.");
      if (typeof feedback !== "string" || !feedback.trim() || feedback.trim().length > 1000) fail(400, "INVALID_REVIEW", "Enter feedback up to 1,000 characters.");
      if (typeof recommends !== "boolean") fail(400, "INVALID_REVIEW", "Choose whether you recommend this experience.");
      const review = {
        reviewId: randomUUID(), displayName: displayName.trim(), rating,
        feedback: feedback.trim(), recommends, source: "user", createdAt: new Date()
      };
      await reviews.insertOne(review);
      const { _id, ...publicReview } = review;
      return publicReview;
    }
  };
}

module.exports = { createReviewService };
