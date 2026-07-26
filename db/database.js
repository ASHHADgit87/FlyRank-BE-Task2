const { createClient } = require("@libsql/client");

const url =
  process.env.TURSO_DATABASE_URL ||
  process.env.TASKS_DB_PATH ||
  "file:tasks.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient(authToken ? { url, authToken } : { url });

const init = async () => {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      done INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  const countResult = await client.execute(
    "SELECT COUNT(*) AS count FROM tasks",
  );
  const count = Number(countResult.rows[0].count);

  if (count === 0) {
    const seed = [
      { title: "Buy milk", done: 0 },
      { title: "Finish FlyRank BE-02 assignment", done: 0 },
      { title: "Read SQLite documentation", done: 1 },
    ];

    for (const task of seed) {
      await client.execute({
        sql: "INSERT INTO tasks (title, done) VALUES (?, ?)",
        args: [task.title, task.done],
      });
    }
  }
};

const ready = init();

module.exports = { client, ready };
