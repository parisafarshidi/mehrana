import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import fs from "node:fs";

/**
 * Uses the same default SQLite path as server/index.js.
 * MEHRANA_DB_PATH can override it in both the API and migration process.
 */
export function getDatabasePath() {
  return path.resolve(
    process.env.MEHRANA_DB_PATH || "server/data/mehrana.sqlite"
  );
}

export function openDatabase() {
  const databasePath = getDatabasePath();
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });

  const db = new DatabaseSync(databasePath);
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA busy_timeout = 5000;");
  return db;
}
