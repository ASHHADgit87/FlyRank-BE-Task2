const { client, ready } = require("../db/database");
const { successResponse, errorResponse } = require("../utils/response");

const toTaskObject = (row) => ({
  id: row.id,
  title: row.title,
  done: !!row.done,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const getTasks = async (req, res) => {
  await ready;
  const { search, done, sort } = req.query;

  let sql = "SELECT * FROM tasks WHERE 1=1";
  const args = [];

  if (search) {
    sql += " AND title LIKE ?";
    args.push(`%${search}%`);
  }

  if (done !== undefined) {
    if (done !== "true" && done !== "false") {
      return errorResponse(
        res,
        400,
        'Query param "done" must be "true" or "false"',
      );
    }
    sql += " AND done = ?";
    args.push(done === "true" ? 1 : 0);
  }

  sql += sort === "title" ? " ORDER BY title ASC" : " ORDER BY id ASC";

  const result = await client.execute({ sql, args });

  return successResponse(
    res,
    200,
    "Tasks retrieved successfully",
    result.rows.map(toTaskObject),
    {
      count: result.rows.length,
    },
  );
};

const getTaskById = async (req, res) => {
  await ready;
  const parsedId = Number(req.params.id);

  if (Number.isNaN(parsedId)) {
    return errorResponse(res, 400, "Task id must be a number");
  }

  const result = await client.execute({
    sql: "SELECT * FROM tasks WHERE id = ?",
    args: [parsedId],
  });

  if (result.rows.length === 0) {
    return errorResponse(res, 404, "Task not found");
  }

  return successResponse(
    res,
    200,
    "Task retrieved successfully",
    toTaskObject(result.rows[0]),
  );
};

const createTask = async (req, res) => {
  await ready;
  const { title, done } = req.body;

  if (!title || typeof title !== "string" || !title.trim()) {
    return errorResponse(res, 400, "Task title is required");
  }

  const insertResult = await client.execute({
    sql: "INSERT INTO tasks (title, done) VALUES (?, ?)",
    args: [title.trim(), done ? 1 : 0],
  });

  const newId = Number(insertResult.lastInsertRowid);

  const result = await client.execute({
    sql: "SELECT * FROM tasks WHERE id = ?",
    args: [newId],
  });

  return successResponse(
    res,
    201,
    "Task created successfully",
    toTaskObject(result.rows[0]),
  );
};

const updateTask = async (req, res) => {
  await ready;
  const parsedId = Number(req.params.id);

  if (Number.isNaN(parsedId)) {
    return errorResponse(res, 400, "Task id must be a number");
  }

  const existingResult = await client.execute({
    sql: "SELECT * FROM tasks WHERE id = ?",
    args: [parsedId],
  });

  if (existingResult.rows.length === 0) {
    return errorResponse(res, 404, "Task not found");
  }

  const existing = existingResult.rows[0];
  const { title, done } = req.body;

  if (title !== undefined && (typeof title !== "string" || !title.trim())) {
    return errorResponse(res, 400, "Task title must be a non-empty string");
  }

  const newTitle = title !== undefined ? title.trim() : existing.title;
  const newDone = done !== undefined ? (done ? 1 : 0) : existing.done;

  await client.execute({
    sql: "UPDATE tasks SET title = ?, done = ?, updated_at = datetime('now') WHERE id = ?",
    args: [newTitle, newDone, parsedId],
  });

  const result = await client.execute({
    sql: "SELECT * FROM tasks WHERE id = ?",
    args: [parsedId],
  });

  return successResponse(
    res,
    200,
    "Task updated successfully",
    toTaskObject(result.rows[0]),
  );
};

const deleteTask = async (req, res) => {
  await ready;
  const parsedId = Number(req.params.id);

  if (Number.isNaN(parsedId)) {
    return errorResponse(res, 400, "Task id must be a number");
  }

  const existingResult = await client.execute({
    sql: "SELECT * FROM tasks WHERE id = ?",
    args: [parsedId],
  });

  if (existingResult.rows.length === 0) {
    return errorResponse(res, 404, "Task not found");
  }

  await client.execute({
    sql: "DELETE FROM tasks WHERE id = ?",
    args: [parsedId],
  });

  return successResponse(res, 200, "Task deleted successfully", {
    id: parsedId,
  });
};

const getStats = async (req, res) => {
  await ready;

  const totalResult = await client.execute(
    "SELECT COUNT(*) AS count FROM tasks",
  );
  const completedResult = await client.execute(
    "SELECT COUNT(*) AS count FROM tasks WHERE done = 1",
  );

  const total = Number(totalResult.rows[0].count);
  const completed = Number(completedResult.rows[0].count);
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
