"use strict";

const express = require("express");
const path = require("node:path");

function createApp({ database }) {
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
  app.use("/api", (req, res) => res.status(404).json({ error: { code: "NOT_FOUND", message: "API route not found." } }));
  app.use(express.static(path.join(__dirname, "..", "public"), { extensions: ["html"] }));
  app.use((req, res) => res.status(404).send("Page not found."));
  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error.type === "entity.parse.failed" || error.type === "entity.too.large") {
      return res.status(400).json({ error: { code: "INVALID_REQUEST", message: "Invalid JSON request body." } });
    }
    console.error("Request failed:", error);
    res.status(500).json({ error: { code: "SERVER_ERROR", message: "Something went wrong. Please try again." } });
  });
  return app;
}

module.exports = { createApp };
