"use strict";

const express = require("express");
const { objectBody } = require("../validation");

function createRewardRoutes(service) {
  const router = express.Router();
  router.patch("/profiles/:profileId/equipment", async (req, res) => {
    const { productId } = objectBody(req.body);
    res.json(await service.equip(req.params.profileId, productId));
  });
  router.post("/profiles/:profileId/redemptions", async (req, res) => {
    const { productId } = objectBody(req.body);
    res.json(await service.redeem(req.params.profileId, productId));
  });
  return router;
}

module.exports = { createRewardRoutes };
