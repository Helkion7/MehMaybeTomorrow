import React, { useState } from "react";
import axios from "axios";
import { Trash2, Edit, Check, X, Tag, Plus, GripVertical } from "lucide-react";

const TodoItem = ({
  todo,
  onUpdateTodo,
  onDeleteTodo,
  availableTags = [],
  index,
  onDragStart,
  onDragOver,
  onDrop,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description || "");
  const [completed, setCompleted] = useState(todo.completed);
  const [tags, setTags] = useState(todo.tags || []);
  const [tagInput, setTagInput] = useState("");

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

  const handleUpdate = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/todos/${todo._id}`,
        { title, description, completed, tags },
        { withCredentials: true }
      );

      onUpdateTodo(response.data.data);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update todo:", error);
    }
  };

  const handleToggleComplete = async () => {
    try {
      const newCompletedStatus = !completed;

      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/todos/${todo._id}`,
        {
          title,
          description,
          completed: newCompletedStatus,
          tags,
        },
        { withCredentials: true }
      );

      setCompleted(newCompletedStatus);
      onUpdateTodo(response.data.data);
    } catch (error) {
      console.error("Failed to update todo status:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/todos/${todo._id}`,
        { withCredentials: true }
      );

      onDeleteTodo(todo._id);
    } catch (error) {
      console.error("Failed to delete todo:", error);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const handleDragStart = (e) => {
    onDragStart(e, index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    onDragOver(e, index);
  };

  const handleDrop = (e) => {
    onDrop(e, index);
  };

  return (
    <div
      draggable={!isEditing}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="flex flex-col border rounded shadow-sm mb-4 cursor-grab active:cursor-grabbing"
    >
      {isEditing ? (
        <form onSubmit={handleUpdate}>
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
            />
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                checked={completed}
                onChange={() => setCompleted(!completed)}
              />
              <span>Completed</span>
            </label>
          </div>

          <div>
            <div>
              <span>Tags</span>
            </div>

            <div>
              {tags.map((tag) => (
                <span key={tag}>
                  {tag}
                  <button type="button" onClick={() => handleRemoveTag(tag)}>
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>

            <div>
              <input
                type="text"
                placeholder="Add a tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                maxLength={20}
              />
              <button type="button" onClick={handleAddTag}>
                <Plus size={18} />
              </button>
            </div>

            {availableTags.length > 0 && (
              <div>
                <p>Existing tags:</p>
                <div>
                  {availableTags
                    .filter((tag) => !tags.includes(tag))
                    .map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleSelectExistingTag(tag)}
                      >
                        {tag}
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <button type="submit">
              <Check size={16} /> Save
            </button>
            <button type="button" onClick={() => setIsEditing(false)}>
              <X size={16} /> Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-col p-4">
          <div className="flex items-center gap-2">
            <div className="cursor-grab flex items-center">
              <GripVertical size={20} />
            </div>
            <input
              type="checkbox"
              checked={completed}
              onChange={handleToggleComplete}
              className="mr-2"
            />
            <h3
              className={`text-lg font-medium ${
                completed ? "line-through opacity-70" : ""
              }`}
            >
              {todo.title}
            </h3>
          </div>

          {todo.description && <p className="mt-2">{todo.description}</p>}

          {todo.tags && todo.tags.length > 0 && (
            <div className="flex flex-wrap mt-2 gap-1">
              {todo.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs border rounded-full px-2 py-1"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="text-xs mt-2 text-gray-500">
            <small>Created: {formatDate(todo.createdAt)}</small>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1 text-sm border rounded px-2 py-1"
            >
              <Edit size={16} /> Edit
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1 text-sm border rounded px-2 py-1"
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoItem;
