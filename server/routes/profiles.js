"use strict";

const express = require("express");

function createProfileRoutes(service) {
  const router = express.Router();
  router.post("/profiles", async (req, res) => res.status(201).json({ profile: await service.createProfile() }));
  router.get("/profiles/:profileId", async (req, res) => res.json({ profile: await service.getProfile(req.params.profileId) }));
  return router;
}

module.exports = { createProfileRoutes };
