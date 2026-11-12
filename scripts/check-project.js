"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { readSeedData } = require("./seed-data");

const root = path.join(__dirname, "..");
const files = execFileSync("git", ["ls-files"], { cwd: root, encoding: "utf8" }).trim().split("\n");

function check(condition, message) {
  if (!condition) throw new Error(message);
}

function main() {
  const data = readSeedData(root);
  for (const file of files) {
    const absolute = path.join(root, file);
    if (!fs.existsSync(absolute)) continue;
    if (/\.(?:js|cjs)$/.test(file)) execFileSync(process.execPath, ["--check", absolute], { stdio: "pipe" });
    if (/\.json$/.test(file)) JSON.parse(fs.readFileSync(absolute, "utf8"));
    if (/^(?:public|server|scripts|database)\//.test(file) && /\.(?:js|cjs|html|json)$/.test(file)) {
      const source = fs.readFileSync(absolute, "utf8");
      check(!/-----BEGIN (?:RSA |OPENSSH )?PRIVATE KEY-----/.test(source), `${file} contains a private key.`);
      check(!/mongodb(?:\+srv)?:\/\/[^\s@/]+:[^\s@/]+@/.test(source), `${file} contains MongoDB credentials.`);
      check(!/\bsk-[A-Za-z0-9_-]{20,}/.test(source), `${file} contains a possible API key.`);
    }
    if (!/^public\/[^/]+\.html$/.test(file)) continue;
    const html = fs.readFileSync(absolute, "utf8");
    for (const match of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) {
      const target = match[1];
      if (/^(?:https?:|mailto:|tel:|#|data:)/.test(target)) continue;
      const relative = target.split(/[?#]/, 1)[0];
      if (relative) check(fs.existsSync(path.resolve(path.dirname(absolute), relative)), `${file} references missing ${relative}.`);
    }
  }
  const box = data.products.find((product) => product.id === "mystery-memorabilia-box");
  check(box?.price === 2500 && box.claimLimit === 1 && box.possibleRewardIds.length === 3, "Mystery box data is invalid.");
  check(!files.includes("AGENT_INSTRUCTIONS.md"), "Instruction file must not be tracked.");
  console.log(`Project check passed: ${data.quizzes.length} quizzes, ${data.questions.length} questions, ${data.products.length} products, ${data.reviews.length} sample reviews.`);
}

try { main(); } catch (error) { console.error(`Project check failed: ${error.message}`); process.exitCode = 1; }
