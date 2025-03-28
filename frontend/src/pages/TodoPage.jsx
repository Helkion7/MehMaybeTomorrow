import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  PlusCircle,
  Filter,
  Tag,
  X,
  Search,
  Calendar,
  ChevronDown,
  Flag,
} from "lucide-react";
import TodoItem from "../components/TodoItem";
import CreateTodo from "../components/CreateTodo";

const TodoPage = () => {
  const [todos, setTodos] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("date"); // Options: date, priority
  const navigate = useNavigate();

  // Fetch todos when component mounts or when filters change
  useEffect(() => {
    fetchTodos();
  }, [selectedDate, selectedTag]);

  // Fetch available tags
  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/todos/tags`,
        { withCredentials: true }
      );
      setAvailableTags(response.data.data);
    } catch (error) {
      console.error("Failed to fetch tags:", error);
    }
  };

  const fetchTodos = async () => {
    setIsLoading(true);
    try {
      let url = `${import.meta.env.VITE_BACKEND_URL}/api/todos`;
      let params = new URLSearchParams();

      // Add date filter if selected
      if (selectedDate) {
        params.append("date", selectedDate);
      }

      // Add tag filter if selected
      if (selectedTag) {
        params.append("tag", selectedTag);
      }

      // Append params to URL if any exist
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url, { withCredentials: true });
      setTodos(response.data.data);
    } catch (error) {
      console.error("Failed to fetch todos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTodayTodos = async () => {
    setIsLoading(true);
    try {
      let url = `${import.meta.env.VITE_BACKEND_URL}/api/todos/today`;

      // Add tag filter if selected
      if (selectedTag) {
        url += `?tag=${selectedTag}`;
      }

      const response = await axios.get(url, { withCredentials: true });
      setTodos(response.data.data);
      // Reset date picker when showing today's todos
      setSelectedDate("");
    } catch (error) {
      console.error("Failed to fetch today's todos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTodo = (newTodo) => {
    setTodos([newTodo, ...todos]);
    setShowCreateForm(false);
    // Refresh tags if a new tag was added
    if (
      newTodo.tags &&
      newTodo.tags.some((tag) => !availableTags.includes(tag))
    ) {
      fetchTags();
    }
  };

  const handleUpdateTodo = (updatedTodo) => {
    setTodos(
      todos.map((todo) => (todo._id === updatedTodo._id ? updatedTodo : todo))
    );
    // Refresh tags if tags were updated
    fetchTags();
  };

  const handleDeleteTodo = (todoId) => {
    setTodos(todos.filter((todo) => todo._id !== todoId));
  };

  const clearFilters = () => {
    setSelectedDate("");
    setSelectedTag("");
    setSelectedPriority("");
  };

  const handleDragStart = (e, index) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // Make drag image transparent in some browsers
    const dragImage = document.createElement("div");
    dragImage.style.display = "none";
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();

    if (draggedItemIndex === null || draggedItemIndex === dropIndex) {
      return;
    }

    // Create a new array with reordered todos
    const newTodos = [...todos];
    const draggedItem = newTodos[draggedItemIndex];

    // Remove the dragged item from array
    newTodos.splice(draggedItemIndex, 1);
    // Insert it at the drop position
    newTodos.splice(dropIndex, 0, draggedItem);

    setTodos(newTodos);
    setDraggedItemIndex(null);
  };

  // Filter and sort todos based on search term, priority, etc.
  const filteredAndSortedTodos = todos
    .filter((todo) => {
      // Filter by search term
      const matchesSearch =
        searchTerm.trim() === ""
          ? true
          : todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (todo.description &&
              todo.description
                .toLowerCase()
                .includes(searchTerm.toLowerCase())) ||
            (todo.tags &&
              todo.tags.some((tag) =>
                tag.toLowerCase().includes(searchTerm.toLowerCase())
              ));

      // Filter by priority if selected
      const matchesPriority =
        !selectedPriority || todo.priority === selectedPriority;

      return matchesSearch && matchesPriority;
    })
    .sort((a, b) => {
      // Sort by chosen criteria
      if (sortBy === "priority") {
        // Define priority weights for sorting (high = 3, medium = 2, low = 1)
        const priorityWeight = { high: 3, medium: 2, low: 1 };
        return (
          priorityWeight[b.priority || "medium"] -
          priorityWeight[a.priority || "medium"]
        );
      }

      // Default sort by date (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  // Helper function to render priority badge with appropriate styling
  const renderPriorityBadge = (priority) => {
    const styles = {
      low: "border-border text-text-secondary",
      medium: "border-border text-text-primary",
      high: "border-accent/70 text-accent",
    };

    return (
      <span
        className={`text-xs font-extralight border px-1.5 py-0.5 rounded-full ${styles[priority]}`}
      >
        {priority}
      </span>
    );
  };

  return (
    <div className="py-2 px-1">
      <div className="mb-4">
        <h1 className="text-xl font-extralight text-text-primary tracking-tight">
          Todo List
        </h1>
        <p className="text-sm text-text-secondary">Minimalism in motion</p>
      </div>

      {/* Search bar */}
      <div className="mb-4 focus-within:ring-1 focus-within:ring-accent transition-all">
        <div className="flex items-center border-b border-border">
          <Search
            size={16}
            strokeWidth={1}
            className="text-text-secondary opacity-70"
          />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-text-primary focus:outline-none py-1 px-2 text-sm font-extralight"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="text-text-secondary"
            >
              <X size={14} strokeWidth={1} />
            </button>
          )}
        </div>
      </div>

      <div className="mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1 text-text-secondary hover:text-accent transition-colors text-sm"
        >
          <Filter size={14} strokeWidth={1} className="opacity-70" />
          <span>Filters</span>
          <ChevronDown
            size={14}
            strokeWidth={1}
            className={`opacity-70 transform transition-transform ${
              showFilters ? "rotate-180" : ""
            }`}
          />
        </button>

        {showFilters && (
          <div className="mt-2 space-y-2 border-l border-border pl-2">
            <button
              onClick={handleTodayTodos}
              className="text-text-secondary hover:text-accent transition-colors text-xs flex items-center gap-1"
            >
              <Calendar size={12} strokeWidth={1} className="opacity-70" />
              Today
            </button>

            <div className="flex items-center gap-2">
              <label
                htmlFor="dateFilter"
                className="text-xs text-text-secondary"
              >
                Date:
              </label>
              <input
                id="dateFilter"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-text-primary border-b border-border focus:outline-none focus:border-accent text-xs py-0 px-1"
              />
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="tagFilter"
                className="text-xs text-text-secondary"
              >
                Tag:
              </label>
              <select
                id="tagFilter"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="bg-transparent text-text-primary border-b border-border focus:outline-none focus:border-accent text-xs py-0 px-1"
              >
                <option value="">All Tags</option>
                {availableTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="priorityFilter"
                className="text-xs text-text-secondary flex items-center gap-1"
              >
                <Flag size={12} strokeWidth={1} className="opacity-70" />
                Priority:
              </label>
              <select
                id="priorityFilter"
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="bg-transparent text-text-primary border-b border-border focus:outline-none focus:border-accent text-xs py-0 px-1"
              >
                <option value="">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="sortBy" className="text-xs text-text-secondary">
                Sort by:
              </label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-text-primary border-b border-border focus:outline-none focus:border-accent text-xs py-0 px-1"
              >
                <option value="date">Date</option>
                <option value="priority">Priority</option>
              </select>
            </div>

            {(selectedDate || selectedTag || selectedPriority) && (
              <button
                onClick={clearFilters}
                className="text-text-secondary hover:text-accent transition-colors text-xs flex items-center gap-1"
              >
                <X size={12} strokeWidth={1} />
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      <button
        onClick={() => setShowCreateForm(!showCreateForm)}
        className="text-text-secondary hover:text-accent transition-colors text-sm flex items-center gap-1 mb-4"
      >
        <PlusCircle size={14} strokeWidth={1} className="opacity-70" />
        {showCreateForm ? "Cancel" : "New Task"}
      </button>

      {showCreateForm && (
        <CreateTodo onAddTodo={handleAddTodo} availableTags={availableTags} />
      )}

      {selectedPriority && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xs text-text-secondary">
            Filtered by priority:
          </span>
          {renderPriorityBadge(selectedPriority)}
          <button
            onClick={() => setSelectedPriority("")}
            className="text-text-secondary hover:text-accent"
          >
            <X size={12} strokeWidth={1} />
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="py-4 flex justify-center">
          <p className="text-sm text-text-secondary">Loading...</p>
        </div>
      ) : filteredAndSortedTodos.length > 0 ? (
        <div className="space-y-0">
          {filteredAndSortedTodos.map((todo, index) => (
            <TodoItem
              key={todo._id}
              todo={todo}
              index={index}
              onUpdateTodo={handleUpdateTodo}
              onDeleteTodo={handleDeleteTodo}
              availableTags={availableTags}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
          ))}
        </div>
      ) : (
        <div className="py-6 flex flex-col items-center">
          {searchTerm || selectedPriority ? (
            <p className="text-sm text-text-secondary">
              No matching tasks found
            </p>
          ) : (
            <p className="text-sm text-text-secondary">No tasks yet</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TodoPage;
