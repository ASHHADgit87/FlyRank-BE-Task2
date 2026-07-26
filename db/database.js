const Database = require("better-sqlite3");
const path = require("path");

const dbPath =
  process.env.TASKS_DB_PATH || path.join(__dirname, "..", "tasks.db");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    done INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

const countRow = db.prepare("SELECT COUNT(*) AS count FROM tasks").get();

if (countRow.count === 0) {
  const insert = db.prepare("INSERT INTO tasks (title, done) VALUES (?, ?)");
  const seed = db.transaction((tasks) => {
    tasks.forEach((task) => insert.run(task.title, task.done ? 1 : 0));
  });

  seed([
    { title: "Buy milk", done: false },
    { title: "Finish FlyRank BE-02 assignment", done: false },
    { title: "Read SQLite documentation", done: true },
  ]);
}

module.exports = db;
