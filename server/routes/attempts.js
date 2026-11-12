"use strict";

const express = require("express");
const { objectBody } = require("../validation");

function createAttemptRoutes(service) {
  const router = express.Router();
  router.post("/quiz-attempts", async (req, res) => {
    const { profileId, quizId } = objectBody(req.body);
    res.status(201).json(await service.start(profileId, quizId));
  });
  router.post("/quiz-attempts/:attemptId/answers", async (req, res) => {
    const { profileId, questionId, selectedIndex } = objectBody(req.body);
    res.json(await service.answer(req.params.attemptId, profileId, questionId, selectedIndex));
  });
  router.post("/quiz-attempts/:attemptId/complete", async (req, res) => {
    const { profileId } = objectBody(req.body);
    res.json(await service.complete(req.params.attemptId, profileId));
  });
  return router;
}

module.exports = { createAttemptRoutes };
