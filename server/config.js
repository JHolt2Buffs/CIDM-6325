"use strict";

function readConfig(env = process.env) {
  const port = Number(env.PORT ?? 3000);
  const uri = env.MONGODB_URI ?? "mongodb://127.0.0.1:27017";
  const database = env.MONGODB_DATABASE ?? "nba_trivia_rewards";
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("PORT must be an integer from 1 to 65535.");
  if (!/^mongodb(\+srv)?:\/\//.test(uri)) throw new Error("MONGODB_URI must be a MongoDB connection string.");
  if (!/^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(database)) throw new Error("MONGODB_DATABASE must start with a letter and contain only letters, numbers, underscores, or hyphens.");
  return { port, uri, database };
}

module.exports = { readConfig };
