import React, { useState } from "react";
import axios from "axios";
import { Trash2, Edit, Check, X, Tag, Plus } from "lucide-react";

const TodoItem = ({ todo, onUpdateTodo, onDeleteTodo, availableTags = [] }) => {
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

  return (
    <div>
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
        <div>
          <div>
            <input
              type="checkbox"
              checked={completed}
              onChange={handleToggleComplete}
            />
            <h3>{todo.title}</h3>
          </div>

          {todo.description && <p>{todo.description}</p>}

          {todo.tags && todo.tags.length > 0 && (
            <div>
              {todo.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          )}

          <div>
            <small>Created: {formatDate(todo.createdAt)}</small>
          </div>

          <div>
            <button onClick={() => setIsEditing(true)}>
              <Edit size={16} /> Edit
            </button>
            <button onClick={handleDelete}>
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoItem;
