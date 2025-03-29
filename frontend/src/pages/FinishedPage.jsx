import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, X, Filter, ChevronDown, Calendar } from "lucide-react";
import TodoItem from "../components/TodoItem";

const FinishedPage = () => {
  const [finishedTasks, setFinishedTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [availableTags, setAvailableTags] = useState([]);

  // Fetch finished tasks
  useEffect(() => {
    fetchFinishedTasks();
    fetchTags();
  }, [selectedDate, selectedTag]);

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

  const fetchFinishedTasks = async () => {
    setIsLoading(true);
    try {
      let url = `${import.meta.env.VITE_BACKEND_URL}/api/todos/finished`;
      let params = new URLSearchParams();

      if (selectedDate) {
        params.append("date", selectedDate);
      }

      if (selectedTag) {
        params.append("tag", selectedTag);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url, { withCredentials: true });
      setFinishedTasks(response.data.data);
    } catch (error) {
      console.error("Failed to fetch finished tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTodo = (updatedTodo) => {
    if (!updatedTodo.completed) {
      // If the task is unchecked, remove it from the finished tasks list
      setFinishedTasks(
        finishedTasks.filter((task) => task._id !== updatedTodo._id)
      );
    } else {
      setFinishedTasks(
        finishedTasks.map((task) =>
          task._id === updatedTodo._id ? updatedTodo : task
        )
      );
    }
  };

  const handleDeleteTodo = (todoId) => {
    setFinishedTasks(finishedTasks.filter((task) => task._id !== todoId));
  };

  const clearFilters = () => {
    setSelectedDate("");
    setSelectedTag("");
  };

  // Filter tasks based on search term
  const filteredTasks = finishedTasks.filter((task) => {
    const matchesSearch =
      searchTerm.trim() === ""
        ? true
        : task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (task.description &&
            task.description
              .toLowerCase()
              .includes(searchTerm.toLowerCase())) ||
          (task.tags &&
            task.tags.some((tag) =>
              tag.toLowerCase().includes(searchTerm.toLowerCase())
            ));

    return matchesSearch;
  });

  return (
    <div className="py-2 px-1">
      <div className="mb-4">
        <h1 className="text-xl font-extralight text-text-primary tracking-tight">
          Finished Tasks
        </h1>
        <p className="text-sm text-text-secondary">Tasks you've completed</p>
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
            <div className="flex items-center gap-2">
              <label
                htmlFor="dateFilter"
                className="text-xs text-text-secondary flex items-center gap-1"
              >
                <Calendar size={12} strokeWidth={1} className="opacity-70" />
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

            {(selectedDate || selectedTag) && (
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

      {isLoading ? (
        <div className="py-4 flex justify-center">
          <p className="text-sm text-text-secondary">Loading...</p>
        </div>
      ) : filteredTasks.length > 0 ? (
        <div className="space-y-0">
          {filteredTasks.map((task, index) => (
            <TodoItem
              key={task._id}
              todo={task}
              index={index}
              onUpdateTodo={handleUpdateTodo}
              onDeleteTodo={handleDeleteTodo}
              availableTags={availableTags}
            />
          ))}
        </div>
      ) : (
        <div className="py-6 flex flex-col items-center">
          <p className="text-sm text-text-secondary">No finished tasks found</p>
        </div>
      )}
    </div>
  );
};

export default FinishedPage;
