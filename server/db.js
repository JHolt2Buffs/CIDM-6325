"use strict";

const { MongoClient } = require("mongodb");

async function connectDatabase({ uri, database }) {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  try {
    await client.connect();
    const db = client.db(database);
    await db.command({ ping: 1 });
    return { client, db, collection: (name) => db.collection(name), close: () => client.close() };
  } catch (error) {
    await client.close();
    throw error;
  }
}

module.exports = { connectDatabase };
