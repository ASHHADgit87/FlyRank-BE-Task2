const db = require("../db/database");
const { successResponse, errorResponse } = require("../utils/response");

const toTaskObject = (row) => ({
  id: row.id,
  title: row.title,
  done: !!row.done,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const getTasks = (req, res) => {
  const { search, done, sort } = req.query;

  let query = "SELECT * FROM tasks WHERE 1=1";
  const params = [];

  if (search) {
    query += " AND title LIKE ?";
    params.push(`%${search}%`);
  }

  if (done !== undefined) {
    if (done !== "true" && done !== "false") {
      return errorResponse(
        res,
        400,
        'Query param "done" must be "true" or "false"',
      );
    }
    query += " AND done = ?";
    params.push(done === "true" ? 1 : 0);
  }

  query += sort === "title" ? " ORDER BY title ASC" : " ORDER BY id ASC";

  const rows = db.prepare(query).all(...params);

  return successResponse(
    res,
    200,
    "Tasks retrieved successfully",
    rows.map(toTaskObject),
    {
      count: rows.length,
    },
  );
};

const getTaskById = (req, res) => {
  const { id } = req.params;
  const parsedId = Number(id);

  if (Number.isNaN(parsedId)) {
    return errorResponse(res, 400, "Task id must be a number");
  }

  const row = db.prepare("SELECT * FROM tasks WHERE id = ?").get(parsedId);

  if (!row) {
    return errorResponse(res, 404, "Task not found");
  }

  return successResponse(
    res,
    200,
    "Task retrieved successfully",
    toTaskObject(row),
  );
};

const createTask = (req, res) => {
  const { title, done } = req.body;

  if (!title || typeof title !== "string" || !title.trim()) {
    return errorResponse(res, 400, "Task title is required");
  }

  const result = db
    .prepare("INSERT INTO tasks (title, done) VALUES (?, ?)")
    .run(title.trim(), done ? 1 : 0);

  const row = db
    .prepare("SELECT * FROM tasks WHERE id = ?")
    .get(result.lastInsertRowid);

  return successResponse(
    res,
    201,
    "Task created successfully",
    toTaskObject(row),
  );
};

const updateTask = (req, res) => {
  const { id } = req.params;
  const parsedId = Number(id);

  if (Number.isNaN(parsedId)) {
    return errorResponse(res, 400, "Task id must be a number");
  }

  const existing = db.prepare("SELECT * FROM tasks WHERE id = ?").get(parsedId);

  if (!existing) {
    return errorResponse(res, 404, "Task not found");
  }

  const { title, done } = req.body;

  if (title !== undefined && (typeof title !== "string" || !title.trim())) {
    return errorResponse(res, 400, "Task title must be a non-empty string");
  }

  const newTitle = title !== undefined ? title.trim() : existing.title;
  const newDone = done !== undefined ? (done ? 1 : 0) : existing.done;

  db.prepare(
    "UPDATE tasks SET title = ?, done = ?, updated_at = datetime('now') WHERE id = ?",
  ).run(newTitle, newDone, parsedId);

  const row = db.prepare("SELECT * FROM tasks WHERE id = ?").get(parsedId);

  return successResponse(
    res,
    200,
    "Task updated successfully",
    toTaskObject(row),
  );
};

const deleteTask = (req, res) => {
  const { id } = req.params;
  const parsedId = Number(id);

  if (Number.isNaN(parsedId)) {
    return errorResponse(res, 400, "Task id must be a number");
  }

  const existing = db.prepare("SELECT * FROM tasks WHERE id = ?").get(parsedId);

  if (!existing) {
    return errorResponse(res, 404, "Task not found");
  }

  db.prepare("DELETE FROM tasks WHERE id = ?").run(parsedId);

  return successResponse(res, 200, "Task deleted successfully", {
    id: parsedId,
  });
};

const getStats = (req, res) => {
  const total = db.prepare("SELECT COUNT(*) AS count FROM tasks").get().count;
  const completed = db
    .prepare("SELECT COUNT(*) AS count FROM tasks WHERE done = 1")
    .get().count;
  const pending = total - completed;

  return successResponse(res, 200, "Stats retrieved successfully", {
    total,
    completed,
    pending,
  });
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getStats,
};
