"use strict";

const express = require("express");

function createCatalogRoutes(service) {
  const router = express.Router();
  router.get("/quizzes", async (req, res) => res.json({ quizzes: await service.listQuizzes(req.query) }));
  router.get("/quizzes/:quizId", async (req, res) => res.json({ quiz: await service.getQuiz(req.params.quizId) }));
  router.get("/products", async (req, res) => res.json({ products: await service.listProducts() }));
  return router;
}

module.exports = { createCatalogRoutes };
