"use strict";

require("dotenv").config();
const { readConfig } = require("./server/config");
const { connectDatabase } = require("./server/db");
const { createApp } = require("./server/app");

async function main() {
  const config = readConfig();
  const database = await connectDatabase(config);
  const server = createApp({ database }).listen(config.port, () => {
    console.log(`NBA Trivia Rewards ready at http://localhost:${config.port}`);
  });
  let closing = false;
  async function shutdown() {
    if (closing) return;
    closing = true;
    await new Promise((resolve) => server.close(resolve));
    await database.close();
  }
  process.once("SIGINT", () => shutdown().then(() => process.exit(0)).catch(() => process.exit(1)));
  process.once("SIGTERM", () => shutdown().then(() => process.exit(0)).catch(() => process.exit(1)));
}

main().catch((error) => {
  console.error(`Startup failed: ${error.message}`);
  process.exitCode = 1;
});
