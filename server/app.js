"use strict";

const express = require("express");
const path = require("node:path");
const { AppError } = require("./errors");
const { createCatalogService } = require("./services/catalog");
const { createCatalogRoutes } = require("./routes/catalog");
const { createProfileService } = require("./services/profiles");
const { createProfileRoutes } = require("./routes/profiles");
const { createAttemptService } = require("./services/attempts");
const { createAttemptRoutes } = require("./routes/attempts");

function createApp({ database, services = {} }) {
  if (!database) throw new Error("A database connection is required.");
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "32kb" }));
  app.get("/api/health", async (req, res) => {
    try {
      await database.db.command({ ping: 1 });
      res.json({ status: "ok", database: "available" });
    } catch {
      res.status(503).json({ error: { code: "DATABASE_UNAVAILABLE", message: "Database is unavailable." } });
    }
  });
  app.use("/api", createCatalogRoutes(services.catalog ?? createCatalogService(database)));
  app.use("/api", createProfileRoutes(services.profiles ?? createProfileService(database)));
  app.use("/api", createAttemptRoutes(services.attempts ?? createAttemptService(database)));
  app.use("/api", (req, res) => res.status(404).json({ error: { code: "NOT_FOUND", message: "API route not found." } }));
  app.use(express.static(path.join(__dirname, "..", "public"), { extensions: ["html"] }));
  app.use((req, res) => res.status(404).send("Page not found."));
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error.type === "entity.parse.failed" || error.type === "entity.too.large") {
      return res.status(400).json({ error: { code: "INVALID_REQUEST", message: "Invalid JSON request body." } });
    }
    if (error instanceof AppError) return res.status(error.status).json({ error: { code: error.code, message: error.message } });
    if (["MongoNetworkError", "MongoServerSelectionError"].includes(error.name)) {
      return res.status(503).json({ error: { code: "DATABASE_UNAVAILABLE", message: "Database is unavailable." } });
    }
    console.error("Request failed:", error);
    res.status(500).json({ error: { code: "SERVER_ERROR", message: "Something went wrong. Please try again." } });
  });
  return app;
}

module.exports = { createApp };
