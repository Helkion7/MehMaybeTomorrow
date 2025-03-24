const express = require("express");
const router = express.Router();
const todoController = require("../controllers/todoController");
const verifyJWT = require("../middleware/verifyJWT");

// Protect all todo routes - require authentication
router.use(verifyJWT);

// Routes for todo operations
router.post("/", todoController.createTodo);
router.get("/", todoController.getTodos);
router.get("/today", todoController.getTodayTodos);
router.get("/tags", todoController.getTags); // This route should be working
router.put("/:id", todoController.updateTodo);
router.delete("/:id", todoController.deleteTodo);

module.exports = router;
