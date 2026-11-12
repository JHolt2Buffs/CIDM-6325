"use strict";

const { fail } = require("./errors");

function objectBody(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(400, "INVALID_REQUEST", "A JSON object is required.");
  return value;
}

function slug(value, label = "ID") {
  if (typeof value !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) || value.length > 80) fail(400, "INVALID_REQUEST", `${label} is invalid.`);
  return value;
}

function uuid(value, label = "ID") {
  if (typeof value !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) fail(400, "INVALID_REQUEST", `${label} is invalid.`);
  return value;
}

function selectedIndex(value, choiceCount) {
  if (!Number.isInteger(value) || value < 0 || value >= choiceCount) fail(400, "INVALID_ANSWER", "Choose a valid answer.");
  return value;
}

module.exports = { objectBody, slug, uuid, selectedIndex };
