"use strict";

const express = require("express");

function createReviewRoutes(service) {
  const router = express.Router();
  router.get("/reviews", async (req, res) => res.json({ reviews: await service.list() }));
  router.post("/reviews", async (req, res) => res.status(201).json({ review: await service.create(req.body) }));
  return router;
}

module.exports = { createReviewRoutes };
