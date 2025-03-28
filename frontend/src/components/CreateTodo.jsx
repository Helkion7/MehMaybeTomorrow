import React, { useState } from "react";
import axios from "axios";
import { Plus, X, Tag, Flag, ListTodo } from "lucide-react";

const CreateTodo = ({ onAddTodo, availableTags = [] }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [priority, setPriority] = useState("medium");
  const [subtasks, setSubtasks] = useState([]);
  const [subtaskInput, setSubtaskInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddTag = () => {
    if (tagInput.trim() !== "" && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSelectExistingTag = (tag) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  // Add a subtask
  const handleAddSubtask = () => {
    if (subtaskInput.trim() !== "") {
      const newSubtask = {
        _id: Date.now().toString(), // Temporary ID for frontend
        title: subtaskInput.trim(),
        completed: false,
      };
      setSubtasks([...subtasks, newSubtask]);
      setSubtaskInput("");
    }
  };

  // Remove a subtask
  const handleRemoveSubtask = (subtaskId) => {
    setSubtasks(subtasks.filter((subtask) => subtask._id !== subtaskId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/todos`,
        { title, description, tags, priority, subtasks },
        { withCredentials: true }
      );

      onAddTodo(response.data.data);
      setTitle("");
      setDescription("");
      setTags([]);
      setPriority("medium");
      setSubtasks([]);
    } catch (error) {
      console.error("Failed to create todo:", error);
      setError(error.response?.data?.message || "Failed to create todo");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-4 px-1">
      <h3 className="text-base font-extralight tracking-tight mb-2">
        New Task
      </h3>
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="focus-within:ring-1 focus-within:ring-accent transition-all">
          <input
            type="text"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={100}
            className="w-full bg-transparent text-text-primary border-b border-border focus:outline-none focus:border-accent py-1 px-0 text-sm font-extralight"
          />
        </div>

        <div className="focus-within:ring-1 focus-within:ring-accent transition-all">
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            className="w-full bg-transparent text-text-primary border-b border-border focus:outline-none focus:border-accent py-1 px-0 resize-none field-sizing-normal text-sm font-extralight"
          />
        </div>

        {/* Priority section */}
        <div className="flex items-center gap-1 mb-1">
          <Flag
            size={14}
            strokeWidth={1}
            className="text-text-secondary opacity-70"
          />
          <span className="text-xs text-text-secondary">Priority</span>
        </div>
        <div className="flex gap-3 mb-2">
          <label className="flex items-center gap-1 text-xs">
            <input
              type="radio"
              name="priority"
              value="low"
              checked={priority === "low"}
              onChange={() => setPriority("low")}
              className="appearance-none w-3 h-3 rounded-full border border-border checked:bg-accent checked:border-accent"
            />
            <span className="text-text-secondary">Low</span>
          </label>
          <label className="flex items-center gap-1 text-xs">
            <input
              type="radio"
              name="priority"
              value="medium"
              checked={priority === "medium"}
              onChange={() => setPriority("medium")}
              className="appearance-none w-3 h-3 rounded-full border border-border checked:bg-accent checked:border-accent"
            />
            <span className="text-text-secondary">Medium</span>
          </label>
          <label className="flex items-center gap-1 text-xs">
            <input
              type="radio"
              name="priority"
              value="high"
              checked={priority === "high"}
              onChange={() => setPriority("high")}
              className="appearance-none w-3 h-3 rounded-full border border-border checked:bg-accent checked:border-accent"
            />
            <span className="text-text-secondary">High</span>
          </label>
        </div>

        {/* Subtasks section */}
        <div className="mb-2">
          <div className="flex items-center gap-1 mb-1">
            <ListTodo
              size={14}
              strokeWidth={1}
              className="text-text-secondary opacity-70"
            />
            <span className="text-xs text-text-secondary">Subtasks</span>
          </div>

          {/* Display existing subtasks */}
          {subtasks.length > 0 && (
            <div className="pl-4 mb-2 space-y-1">
              {subtasks.map((subtask) => (
                <div key={subtask._id} className="flex items-center text-xs">
                  <span className="w-3 h-3 border border-border rounded-sm mr-2"></span>
                  <span className="text-text-primary flex-1">
                    {subtask.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(subtask._id)}
                    className="text-text-secondary hover:text-accent transition-colors"
                  >
                    <X size={12} strokeWidth={1} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add subtask input field */}
          <div className="flex items-center focus-within:ring-1 focus-within:ring-accent transition-all">
            <input
              type="text"
              placeholder="Add a subtask"
              value={subtaskInput}
              onChange={(e) => setSubtaskInput(e.target.value)}
              className="w-full bg-transparent text-text-primary border-b border-border focus:outline-none focus:border-accent text-xs py-1 px-0"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddSubtask();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddSubtask}
              className="text-text-secondary hover:text-accent transition-colors ml-1"
            >
              <Plus
                size={14}
                strokeWidth={1}
                className="opacity-70 hover:opacity-100"
              />
            </button>
          </div>
        </div>

        {/* Tags section */}
        <div>
          <div className="flex items-center gap-1 mb-1">
            <Tag
              size={14}
              strokeWidth={1}
              className="text-text-secondary opacity-70"
            />
            <span className="text-xs text-text-secondary">Tags</span>
          </div>

          <div className="flex flex-wrap gap-1 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center text-xs border border-border rounded-full px-2 py-0.5 text-text-secondary"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1"
                >
                  <X size={10} strokeWidth={1} />
                </button>
              </span>
            ))}
          </div>

          <div className="flex items-center focus-within:ring-1 focus-within:ring-accent transition-all">
            <input
              type="text"
              placeholder="Add a tag"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              maxLength={20}
              className="w-full bg-transparent text-text-primary border-b border-border focus:outline-none focus:border-accent text-xs py-1 px-0"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="text-text-secondary hover:text-accent transition-colors ml-1"
            >
              <Plus
                size={14}
                strokeWidth={1}
                className="opacity-70 hover:opacity-100"
              />
            </button>
          </div>

          {availableTags.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-text-secondary mb-1">Existing:</p>
              <div className="flex flex-wrap gap-1">
                {availableTags
                  .filter((tag) => !tags.includes(tag))
                  .map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleSelectExistingTag(tag)}
                      className="text-xs border border-border rounded-full px-2 py-0.5 text-text-secondary hover:border-accent hover:text-accent transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-xs text-accent">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="text-text-secondary hover:text-accent transition-colors text-sm flex items-center gap-1"
        >
          <Plus
            size={16}
            strokeWidth={1}
            className="opacity-70 hover:opacity-100"
          />
          {isLoading ? "Creating..." : "Add Task"}
        </button>
      </form>
    </div>
  );
};

export default CreateTodo;
