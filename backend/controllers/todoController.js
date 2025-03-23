const Todo = require("../models/Todo");

// Create a new todo
const createTodo = async (req, res) => {
  try {
    const { title, description } = req.body;

    // Create new todo associated with the logged-in user
    const newTodo = await Todo.create({
      title,
      description,
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
    const { date } = req.query;

    // Build date filters
    let dateFilter = {};
    if (date) {
      // Create date range for the specific day
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      dateFilter = {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }

    // Get todos for the logged-in user with date filter if provided
    const todos = await Todo.find({
      user: req.user.userId,
      ...dateFilter,
    }).sort({ createdAt: -1 });

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

    // Get todos created today for this user
    const todos = await Todo.find({
      user: req.user.userId,
      createdAt: {
        $gte: today,
        $lt: tomorrow,
      },
    }).sort({ createdAt: -1 });

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
    const { title, description, completed } = req.body;

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
      { title, description, completed },
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
  deleteTodo,
};
