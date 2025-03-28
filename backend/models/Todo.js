const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SubtaskSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, "Subtask title cannot be more than 100 characters"],
  },
  completed: {
    type: Boolean,
    default: false,
  },
});

const TodoSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot be more than 500 characters"],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: [20, "Tag cannot be more than 20 characters"],
      },
    ],
    subtasks: [SubtaskSchema],
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Todo", TodoSchema);
