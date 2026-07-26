const express = require("express");
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getStats,
} = require("../controllers/taskController");

const router = express.Router();

router.get("/tasks", getTasks);
router.get("/tasks/:id", getTaskById);
router.post("/tasks", createTask);
router.put("/tasks/:id", updateTask);
router.delete("/tasks/:id", deleteTask);
router.get("/stats", getStats);

module.exports = router;
