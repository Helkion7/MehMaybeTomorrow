import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { PlusCircle, Filter, Tag, X, Search } from "lucide-react";
import TodoItem from "../components/TodoItem";
import CreateTodo from "../components/CreateTodo";

const TodoPage = () => {
  const [todos, setTodos] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
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

  // Calculate search ranking score for a todo
  const getSearchScore = (todo, term) => {
    const searchTermLower = term.toLowerCase();
    let score = 0;

    // Check title matches (highest weight)
    if (todo.title.toLowerCase().includes(searchTermLower)) {
      score += 10;
      // Exact title match gets higher score
      if (todo.title.toLowerCase() === searchTermLower) {
        score += 5;
      }
      // Title starts with search term gets higher score
      if (todo.title.toLowerCase().startsWith(searchTermLower)) {
        score += 3;
      }
    }

    // Check description matches
    if (
      todo.description &&
      todo.description.toLowerCase().includes(searchTermLower)
    ) {
      score += 5;
    }

    // Check tag matches
    if (todo.tags) {
      for (const tag of todo.tags) {
        if (tag.toLowerCase().includes(searchTermLower)) {
          score += 8;
          // Exact tag match gets higher score
          if (tag.toLowerCase() === searchTermLower) {
            score += 4;
          }
        }
      }
    }

    return score;
  };

  // Filter and sort todos based on search term
  const filteredTodos =
    searchTerm.trim() === ""
      ? todos
      : todos
          .filter((todo) => {
            const searchTermLower = searchTerm.toLowerCase();
            return (
              todo.title.toLowerCase().includes(searchTermLower) ||
              (todo.description &&
                todo.description.toLowerCase().includes(searchTermLower)) ||
              (todo.tags &&
                todo.tags.some((tag) =>
                  tag.toLowerCase().includes(searchTermLower)
                ))
            );
          })
          .sort((a, b) => {
            // Sort by search relevance score
            const scoreA = getSearchScore(a, searchTerm);
            const scoreB = getSearchScore(b, searchTerm);
            return scoreB - scoreA;
          });

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Your Todos</h1>
      </div>

      {/* Search bar */}
      <div className="mb-4">
        <div className="flex items-center">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search todos by title, description or tags"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")}>
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Filters</h2>

        <div className="flex flex-wrap gap-4 items-center">
          <button
            onClick={handleTodayTodos}
            className="border rounded px-3 py-1.5"
          >
            Today's Todos
          </button>

          <div className="flex items-center gap-2">
            <label htmlFor="dateFilter">Date:</label>
            <input
              id="dateFilter"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border rounded px-2 py-1.5"
            />
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="tagFilter">Tag:</label>
            <select
              id="tagFilter"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="border rounded px-2 py-1.5"
            >
              <option value="">All Tags</option>
              {availableTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>

          {(selectedDate || selectedTag) && (
            <button
              onClick={clearFilters}
              className="border rounded px-3 py-1.5"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      <button
        onClick={() => setShowCreateForm(!showCreateForm)}
        className="flex items-center gap-1 border rounded px-3 py-2 mb-6"
      >
        {showCreateForm ? "Cancel" : "Add New Todo"}
      </button>

      {showCreateForm && (
        <CreateTodo onAddTodo={handleAddTodo} availableTags={availableTags} />
      )}

      {isLoading ? (
        <div className="text-center py-8">
          <p>Loading todos...</p>
        </div>
      ) : filteredTodos.length > 0 ? (
        <div className="space-y-2">
          {filteredTodos.map((todo, index) => (
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
        <div className="text-center py-8">
          {searchTerm ? (
            <p>No todos matching your search. Try a different term.</p>
          ) : (
            <p>No todos found. Create one!</p>
          )}
          {!showCreateForm && !searchTerm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-1 border rounded px-3 py-2 mt-4"
            >
              Add New Todo
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TodoPage;
