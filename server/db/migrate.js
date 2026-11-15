import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { openDatabase } from "./database.js";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const migrationsDirectory = path.join(currentDirectory, "migrations");
const db = openDatabase();

try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      migration_name TEXT NOT NULL UNIQUE,
      executed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const files = fs.readdirSync(migrationsDirectory)
    .filter((file) => /^\d+_[a-z0-9_-]+\.sql$/i.test(file))
    .sort();

  const isApplied = db.prepare(
    "SELECT 1 FROM schema_migrations WHERE migration_name = ?"
  );
  const recordApplied = db.prepare(
    "INSERT INTO schema_migrations (migration_name) VALUES (?)"
  );

  for (const file of files) {
    if (isApplied.get(file)) {
      console.log(`Already applied: ${file}`);
      continue;
    }

    const sql = fs.readFileSync(path.join(migrationsDirectory, file), "utf8");
    console.log(`Applying: ${file}`);

    db.exec("BEGIN IMMEDIATE");
    try {
      db.exec(sql);
      recordApplied.run(file);
      db.exec("COMMIT");
      console.log(`Applied: ${file}`);
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }

  console.log("All database migrations completed.");
} catch (error) {
  console.error("Database migration failed:", error);
  process.exitCode = 1;
} finally {
  db.close();
}
