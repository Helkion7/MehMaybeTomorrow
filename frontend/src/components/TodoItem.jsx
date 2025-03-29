import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  Trash2,
  Edit,
  Check,
  X,
  Tag,
  Plus,
  GripVertical,
  Flag,
  ChevronDown,
  ChevronRight,
  ListTodo,
} from "lucide-react";
import GlitchPopup from "./GlitchPopup";

const TodoItem = ({
  todo,
  onUpdateTodo,
  onDeleteTodo,
  availableTags = [],
  index,
  onDragStart,
  onDragOver,
  onDrop,
  isSelected = false,
  isSpinning = false,
  forceGlitch = false, // Add new prop for testing
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description || "");
  const [completed, setCompleted] = useState(todo.completed);
  const [tags, setTags] = useState(todo.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [priority, setPriority] = useState(todo.priority || "medium");
  const [subtasks, setSubtasks] = useState(todo.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [showSubtasks, setShowSubtasks] = useState(false);

  const [isInteracting, setIsInteracting] = useState(false);
  const [isGlitched, setIsGlitched] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const interactionTimerRef = useRef(null);
  const interactionStartTimeRef = useRef(null);

  useEffect(() => {
    if (isInteracting && !isGlitched && !isEditing) {
      interactionStartTimeRef.current = Date.now();
      console.log("Started interaction timer"); // Add debug log back

      interactionTimerRef.current = setInterval(() => {
        const timeSpent = Date.now() - interactionStartTimeRef.current;
        console.log(`Time spent interacting: ${timeSpent}ms`); // Add debug log back

        if (timeSpent > 30000) {
          console.log("Triggering glitch effect"); // Add debug log back
          setIsGlitched(true);
          setShowPopup(true);
          clearInterval(interactionTimerRef.current);
        }
      }, 1000);
    }

    return () => {
      if (interactionTimerRef.current) {
        clearInterval(interactionTimerRef.current);
      }
    };
  }, [isInteracting, isGlitched, isEditing]);

  useEffect(() => {
    if (forceGlitch && !isGlitched && !isEditing) {
      setIsGlitched(true);
      setShowPopup(true);
    }
  }, [forceGlitch, isGlitched, isEditing]);

  const handleMouseEnter = () => {
    if (!isEditing && !isGlitched) {
      console.log("Mouse enter - setting isInteracting to true"); // Add debug log back
      setIsInteracting(true);
    }
  };

  const handleMouseLeave = () => {
    console.log("Mouse leave - setting isInteracting to false"); // Add debug log back
    setIsInteracting(false);
    if (interactionTimerRef.current) {
      clearInterval(interactionTimerRef.current);
    }
  };

  const handleFixGlitch = () => {
    setIsGlitched(false);
    setShowPopup(false);
    setIsInteracting(false);
  };

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
        { title, description, completed, tags, priority, subtasks },
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
          priority,
          subtasks,
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

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim() === "") return;

    const newSubtask = {
      _id: Date.now().toString(),
      title: newSubtaskTitle,
      completed: false,
    };

    setSubtasks([...subtasks, newSubtask]);
    setNewSubtaskTitle("");
  };

  const handleToggleSubtaskComplete = (subtaskId) => {
    const updatedSubtasks = subtasks.map((subtask) =>
      subtask._id === subtaskId
        ? { ...subtask, completed: !subtask.completed }
        : subtask
    );

    setSubtasks(updatedSubtasks);
  };

  const handleDeleteSubtask = (subtaskId) => {
    const updatedSubtasks = subtasks.filter(
      (subtask) => subtask._id !== subtaskId
    );
    setSubtasks(updatedSubtasks);
  };

  const completedSubtasks = subtasks.filter(
    (subtask) => subtask.completed
  ).length;
  const subtaskRatio =
    subtasks.length > 0 ? `${completedSubtasks}/${subtasks.length}` : "";

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

  const renderPriorityIndicator = (priorityLevel) => {
    const colors = {
      low: "text-text-secondary opacity-50",
      medium: "text-text-secondary opacity-70",
      high: "text-accent opacity-90",
    };

    return <Flag size={12} strokeWidth={1} className={colors[priorityLevel]} />;
  };

  return (
    <>
      {showPopup && <GlitchPopup onClick={handleFixGlitch} />}
      <div
        id={`todo-${todo._id}`}
        draggable={!isEditing}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`border-b border-border hover:bg-black/20 transition-colors backdrop-blur-sm relative z-10 ${
          isSelected
            ? isSpinning
              ? "border-l-2 border-l-accent bg-accent/10 transition-all duration-75"
              : "roulette-final border-l-2 border-l-accent bg-accent/5 transition-all duration-300"
            : ""
        } ${isGlitched ? "todo-glitched" : ""}`}
      >
        {isEditing ? (
          <form onSubmit={handleUpdate} className="py-2 px-2">
            <div className="mb-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-transparent text-text-primary border-b border-border focus:outline-none focus:border-accent pb-1"
              />
            </div>
            <div className="mb-2">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optional)"
                className="w-full bg-transparent text-text-primary border-b border-border focus:outline-none focus:border-accent pb-1 resize-none field-sizing-normal"
              />
            </div>
            <div className="mb-3 flex items-center gap-2">
              <input
                type="checkbox"
                id={`completed-${todo._id}`}
                checked={completed}
                onChange={() => setCompleted(!completed)}
                className="appearance-none w-4 h-4 border border-border checked:bg-accent checked:border-accent relative rounded-sm"
              />
              <label htmlFor={`completed-${todo._id}`} className="text-sm">
                Completed
              </label>
            </div>

            <div className="mb-3">
              <div className="flex items-center gap-1 mb-1">
                <Flag
                  size={14}
                  strokeWidth={1}
                  className="text-text-secondary"
                />
                <span className="text-sm">Priority</span>
              </div>
              <div className="flex gap-3">
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
            </div>

            <div className="mb-3">
              <div className="flex items-center gap-1 mb-1">
                <ListTodo
                  size={14}
                  strokeWidth={1}
                  className="text-text-secondary"
                />
                <span className="text-sm">Subtasks</span>
              </div>
              {subtasks.map((subtask, idx) => (
                <div
                  key={subtask._id}
                  className="flex items-center gap-2 mb-1 pl-3"
                >
                  <input
                    type="checkbox"
                    checked={subtask.completed}
                    onChange={() => handleToggleSubtaskComplete(subtask._id)}
                    className="appearance-none w-3 h-3 border border-border checked:bg-accent checked:border-accent relative rounded-sm"
                  />
                  <input
                    type="text"
                    value={subtask.title}
                    onChange={(e) => {
                      const updatedSubtasks = [...subtasks];
                      updatedSubtasks[idx].title = e.target.value;
                      setSubtasks(updatedSubtasks);
                    }}
                    className="flex-1 bg-transparent text-text-primary border-b border-border focus:outline-none focus:border-accent text-xs py-0.5"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteSubtask(subtask._id)}
                    className="text-text-secondary hover:text-accent transition-colors"
                  >
                    <X size={12} strokeWidth={1} />
                  </button>
                </div>
              ))}
              <div className="flex items-center mt-2">
                <input
                  type="text"
                  placeholder="Add a subtask"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  className="flex-1 bg-transparent text-text-primary border-b border-border focus:outline-none focus:border-accent text-xs py-0.5"
                />
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  className="text-text-secondary hover:text-accent transition-colors ml-1"
                >
                  <Plus size={14} strokeWidth={1} />
                </button>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-center gap-1 mb-1">
                <Tag
                  size={14}
                  strokeWidth={1}
                  className="text-text-secondary"
                />
                <span className="text-sm">Tags</span>
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
                      <X size={12} strokeWidth={1} />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="Add a tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  maxLength={20}
                  className="w-full bg-transparent text-text-primary border-b border-border focus:outline-none focus:border-accent text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="text-text-secondary hover:text-accent ml-1"
                >
                  <Plus size={16} strokeWidth={1} />
                </button>
              </div>

              {availableTags.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-text-secondary mb-1">
                    Existing tags:
                  </p>
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

            <div className="flex gap-2">
              <button
                type="submit"
                className="text-text-secondary hover:text-accent transition-colors flex items-center gap-1 text-sm py-1"
              >
                <Check size={14} strokeWidth={1} /> Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-text-secondary hover:text-accent transition-colors flex items-center gap-1 text-sm py-1"
              >
                <X size={14} strokeWidth={1} /> Cancel
              </button>
            </div>
          </form>
        ) : (
          <div>
            <div
              className={`flex items-center justify-between w-full px-2 py-1 ${
                isSpinning ? "animate-pulse" : ""
              }`}
            >
              <div className="flex items-center gap-2 flex-1">
                <div className="cursor-grab flex items-center text-text-secondary">
                  <GripVertical
                    size={16}
                    strokeWidth={1}
                    className="opacity-50"
                  />
                </div>
                <input
                  type="checkbox"
                  checked={completed}
                  onChange={handleToggleComplete}
                  className="appearance-none w-4 h-4 border border-border checked:bg-accent checked:border-accent relative rounded-sm"
                />

                <div className="flex-1 flex items-start">
                  <div className="flex items-center min-w-[30%] pr-3">
                    {renderPriorityIndicator(todo.priority || "medium")}
                    <h3
                      className={`text-base font-extralight ${
                        isGlitched ? "todo-glitched-text" : ""
                      } ${
                        completed
                          ? "line-through text-text-secondary"
                          : "text-text-primary"
                      }`}
                    >
                      {todo.title}
                    </h3>

                    {subtasks.length > 0 && (
                      <span
                        className={`text-xs text-text-secondary ml-2 ${
                          isGlitched ? "todo-glitched-text" : ""
                        }`}
                      >
                        ({subtaskRatio})
                      </span>
                    )}
                  </div>

                  {todo.description && todo.description.trim() !== "" && (
                    <p
                      className={`text-xs text-text-secondary font-extralight flex-1 px-2 ${
                        isGlitched ? "todo-glitched-text" : ""
                      }`}
                    >
                      {todo.description}
                    </p>
                  )}

                  {todo.tags && todo.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 ml-auto">
                      {todo.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`text-xs text-text-secondary whitespace-nowrap ${
                            isGlitched ? "todo-glitched-text" : ""
                          }`}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-1 items-center ml-2">
                {subtasks.length > 0 && (
                  <button
                    onClick={() => setShowSubtasks(!showSubtasks)}
                    className="text-text-secondary hover:text-accent transition-colors p-1"
                  >
                    {showSubtasks ? (
                      <ChevronDown
                        size={14}
                        strokeWidth={1}
                        className="opacity-70"
                      />
                    ) : (
                      <ChevronRight
                        size={14}
                        strokeWidth={1}
                        className="opacity-70"
                      />
                    )}
                  </button>
                )}
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-text-secondary hover:text-accent transition-colors p-1"
                >
                  <Edit
                    size={14}
                    strokeWidth={1}
                    className="opacity-70 hover:opacity-100"
                  />
                </button>
                <button
                  onClick={handleDelete}
                  className="text-text-secondary hover:text-accent transition-colors p-1"
                >
                  <Trash2
                    size={14}
                    strokeWidth={1}
                    className="opacity-70 hover:opacity-100"
                  />
                </button>
              </div>
            </div>

            {showSubtasks && subtasks.length > 0 && (
              <div className="pl-10 pr-3 pb-2">
                {subtasks.map((subtask) => (
                  <div
                    key={subtask._id}
                    className="flex items-center py-0.5 text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      onChange={() => {
                        const updatedSubtasks = subtasks.map((st) =>
                          st._id === subtask._id
                            ? { ...st, completed: !st.completed }
                            : st
                        );
                        setSubtasks(updatedSubtasks);

                        axios
                          .put(
                            `${import.meta.env.VITE_BACKEND_URL}/api/todos/${
                              todo._id
                            }`,
                            {
                              title,
                              description,
                              completed,
                              tags,
                              priority,
                              subtasks: updatedSubtasks,
                            },
                            { withCredentials: true }
                          )
                          .then((response) => {
                            onUpdateTodo(response.data.data);
                          })
                          .catch((error) => {
                            console.error("Failed to update subtask:", error);
                          });
                      }}
                      className="appearance-none w-3 h-3 border border-border checked:bg-accent checked:border-accent relative rounded-sm"
                    />
                    <span
                      className={`ml-2 ${
                        subtask.completed
                          ? "line-through text-text-secondary"
                          : "text-text-primary"
                      }`}
                    >
                      {subtask.title}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default TodoItem;
