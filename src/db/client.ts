//* Libraries imports
import { Database } from "bun:sqlite";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

const DEFAULT_DB_PATH = join(process.cwd(), "data", "thunder-cat.sqlite");
const SCHEMA_PATH = join(import.meta.dir, "schema.sql");

export type DbClient = Database;

export function openDatabase(path: string = DEFAULT_DB_PATH): Database {
  if (path !== ":memory:") {
    mkdirSync(dirname(path), { recursive: true });
  }

  const schema = readFileSync(SCHEMA_PATH, "utf8");
  const db = new Database(path, { create: true, strict: true });
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(schema);

  return db;
}

export function closeDatabase(db: Database): void {
  db.close(false);
}
