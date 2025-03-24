import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, X, Tag } from "lucide-react";

const CreateTodo = ({ onAddTodo, availableTags = [] }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/todos`,
        { title, description, tags },
        { withCredentials: true }
      );

      onAddTodo(response.data.data);
      setTitle("");
      setDescription("");
      setTags([]);
    } catch (error) {
      console.error("Failed to create todo:", error);
      setError(error.response?.data?.message || "Failed to create todo");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h3>Create New Todo</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            placeholder="Todo title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={100}
          />
        </div>

        <div>
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
          />
        </div>

        <div>
          <div>
            <Tag size={18} />
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

        {error && <p>{error}</p>}

        <button type="submit" disabled={isLoading}>
          <Plus size={18} />
          {isLoading ? "Creating..." : "Create Todo"}
        </button>
      </form>
    </div>
  );
};

export default CreateTodo;
