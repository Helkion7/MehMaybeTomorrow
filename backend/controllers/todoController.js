const Todo = require("../models/Todo");

// Create a new todo
const createTodo = async (req, res) => {
  try {
    const { title, description, tags, priority, subtasks } = req.body;

    // Create new todo associated with the logged-in user
    const newTodo = await Todo.create({
      title,
      description,
      tags,
      priority,
      subtasks, // Add subtasks to the new todo
      user: req.user.userId,
    });

    res.status(201).json({
      success: true,
      data: newTodo,
    });
  } catch (error) {
    console.error("Create todo error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating todo",
    });
  }
};

// Get all todos for current user (filtered by date if provided)
const getTodos = async (req, res) => {
  try {
    const { date, tag } = req.query;

    // Build date filters
    let filters = { user: req.user.userId };

    if (date) {
      // Create date range for the specific day
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      filters.createdAt = {
        $gte: startDate,
        $lte: endDate,
      };
    }

    // Add tag filter if provided
    if (tag) {
      filters.tags = tag;
    }

    // Get todos for the logged-in user with filters
    const todos = await Todo.find(filters).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: todos.length,
      data: todos,
    });
  } catch (error) {
    console.error("Get todos error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching todos",
    });
  }
};

// Get today's todos for current user
const getTodayTodos = async (req, res) => {
  try {
    // Create today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Build filter
    const filter = {
      user: req.user.userId,
      createdAt: {
        $gte: today,
        $lt: tomorrow,
      },
    };

    // Add tag filter if provided
    if (req.query.tag) {
      filter.tags = req.query.tag;
    }

    // Get todos created today for this user
    const todos = await Todo.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: todos.length,
      data: todos,
    });
  } catch (error) {
    console.error("Get today's todos error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching today's todos",
    });
  }
};

// Update a todo
const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, completed, tags, priority, subtasks } =
      req.body;

    // Find todo and check ownership
    const todo = await Todo.findById(id);

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: "Todo not found",
      });
    }

    // Make sure user owns this todo
    if (todo.user.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this todo",
      });
    }

    // Update todo
    const updatedTodo = await Todo.findByIdAndUpdate(
      id,
      { title, description, completed, tags, priority, subtasks },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedTodo,
    });
  } catch (error) {
    console.error("Update todo error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating todo",
    });
  }
};

// Update a subtask within a todo
const updateSubtask = async (req, res) => {
  try {
    const { todoId, subtaskId } = req.params;
    const { title, completed } = req.body;

    // Find todo and check ownership
    const todo = await Todo.findById(todoId);

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: "Todo not found",
      });
    }

    // Make sure user owns this todo
    if (todo.user.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this todo",
      });
    }

    // Find and update the specific subtask
    const subtask = todo.subtasks.id(subtaskId);
    if (!subtask) {
      return res.status(404).json({
        success: false,
        message: "Subtask not found",
      });
    }

    subtask.title = title || subtask.title;
    subtask.completed = completed !== undefined ? completed : subtask.completed;

    // Save the updated todo
    await todo.save();

    res.status(200).json({
      success: true,
      data: todo,
    });
  } catch (error) {
    console.error("Update subtask error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating subtask",
    });
  }
};

// Delete a subtask
const deleteSubtask = async (req, res) => {
  try {
    const { todoId, subtaskId } = req.params;

    // Find todo and check ownership
    const todo = await Todo.findById(todoId);

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: "Todo not found",
      });
    }

    // Make sure user owns this todo
    if (todo.user.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this todo",
      });
    }

    // Remove the subtask
    todo.subtasks.pull(subtaskId);

    // Save the updated todo
    await todo.save();

    res.status(200).json({
      success: true,
      data: todo,
    });
  } catch (error) {
    console.error("Delete subtask error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting subtask",
    });
  }
};

// Get all unique tags
const getTags = async (req, res) => {
  try {
    // Find all todos for this user and extract the unique tags
    const todos = await Todo.find({ user: req.user.userId });
    const tagsSet = new Set();

    todos.forEach((todo) => {
      if (todo.tags && todo.tags.length > 0) {
        todo.tags.forEach((tag) => tagsSet.add(tag));
      }
    });

    const uniqueTags = Array.from(tagsSet);

    res.status(200).json({
      success: true,
      count: uniqueTags.length,
      data: uniqueTags,
    });
  } catch (error) {
    console.error("Get tags error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching tags",
    });
  }
};

// Delete a todo
const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;

    // Find todo and check ownership
    const todo = await Todo.findById(id);

    if (!todo) {
      return res.status(404).json({
        success: false,
        message: "Todo not found",
      });
    }

    // Make sure user owns this todo
    if (todo.user.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this todo",
      });
    }

    // Delete todo
    await todo.deleteOne();

    res.status(200).json({
      success: true,
      message: "Todo deleted successfully",
    });
  } catch (error) {
    console.error("Delete todo error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting todo",
    });
  }
};

module.exports = {
  createTodo,
  getTodos,
  getTodayTodos,
  updateTodo,
  updateSubtask,
  deleteSubtask,
  deleteTodo,
  getTags,
};
