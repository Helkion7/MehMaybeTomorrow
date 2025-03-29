import React, { useState, useEffect, useRef } from "react";
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
  Shuffle,
  ZapOff,
} from "lucide-react";
import TodoItem from "../components/TodoItem";
import CreateTodo from "../components/CreateTodo";

// Single sound URL - replace with path to your 10-second audio file
const ROULETTE_SOUND_URL = "/sounds/roulette.mp3";

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
  const [randomTodoId, setRandomTodoId] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinningIndex, setSpinningIndex] = useState(null);
  const [screenEffect, setScreenEffect] = useState(false);
  const [spinIntensity, setSpinIntensity] = useState(0);
  const [glitchTestTodoId, setGlitchTestTodoId] = useState(null);
  const audioRef = useRef(null);
  const navigate = useNavigate();

  // Fetch todos when component mounts or when filters change
  useEffect(() => {
    fetchTodos();
  }, [selectedDate, selectedTag]);

  // Reset random todo selection when filters change
  useEffect(() => {
    setRandomTodoId(null);
  }, [selectedDate, selectedTag, selectedPriority, searchTerm, sortBy]);

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

  // Function to simulate a "wheel of fortune" effect with enhanced visuals and sound
  const selectRandomTodo = () => {
    if (filteredAndSortedTodos.length === 0) {
      return;
    }

    // Reset the current selection and start spinning
    setRandomTodoId(null);
    setIsSpinning(true);
    setScreenEffect(true);
    setSpinIntensity(0);

    // Play roulette sound
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 1.0;
      audioRef.current
        .play()
        .catch((e) => console.log("Audio playback prevented by browser"));
    }

    // Pick the final result in advance
    const finalIndex = Math.floor(
      Math.random() * filteredAndSortedTodos.length
    );
    const selectedTodo = filteredAndSortedTodos[finalIndex];

    // Set animation duration to match the 10-second audio track
    const totalDuration = 10000; // 10 seconds in milliseconds
    const initialDelay = 50; // Faster at the beginning
    const endDelay = 350; // Slower at the end

    // Create the animation sequence
    let currentSpin = 0;
    let startTime = Date.now();
    let endAnimationTimeoutId = null;

    // Schedule the final selection to happen right at the end of the animation
    const endAnimation = () => {
      // Final selection
      setSpinningIndex(finalIndex); // Briefly highlight the final selection

      setTimeout(() => {
        setSpinningIndex(null);
        setRandomTodoId(selectedTodo._id);
        setIsSpinning(false);

        // Reset screen effects
        setScreenEffect(false);
        document.documentElement.style.transform = "none";

        // Scroll to the selected todo
        setTimeout(() => {
          const todoElement = document.getElementById(
            `todo-${selectedTodo._id}`
          );
          if (todoElement) {
            todoElement.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 200);
      }, 300);
    };

    // Schedule the end animation to occur at exactly the right time
    endAnimationTimeoutId = setTimeout(endAnimation, totalDuration - 300);

    const spinTheWheel = () => {
      const elapsedTime = Date.now() - startTime;

      // If we've reached the end of the animation, stop here
      if (elapsedTime >= totalDuration - 400) {
        return;
      }

      // Calculate progress (0 to 1)
      const progress = Math.min(0.99, elapsedTime / totalDuration);

      // Calculate delay with easing (starts fast, slows down more dramatically)
      const easedProgress = progress * progress; // Quadratic easing for smoother progression
      const currentDelay =
        initialDelay + easedProgress * (endDelay - initialDelay);

      // Update screen effect intensity - increases as we approach the end
      setSpinIntensity(Math.min(1, progress * 1.5));

      // Select a random index to highlight (avoid the same index twice in a row)
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * filteredAndSortedTodos.length);
      } while (
        randomIndex === spinningIndex &&
        filteredAndSortedTodos.length > 1
      );

      // Update the highlighted item
      setSpinningIndex(randomIndex);

      // Add small screen shake that increases with intensity
      if (currentSpin > 5) {
        document.documentElement.style.transform = `translate(${
          (Math.random() * 4 - 2) * spinIntensity
        }px, ${(Math.random() * 4 - 2) * spinIntensity}px)`;
      }

      currentSpin++;

      // Always continue the animation until we're near the end of the duration
      setTimeout(spinTheWheel, currentDelay);
    };

    // Start the animation sequence
    setTimeout(spinTheWheel, 100);

    // Clean up function in case component unmounts during animation
    return () => {
      if (endAnimationTimeoutId) {
        clearTimeout(endAnimationTimeoutId);
      }
    };
  };

  // Add a new function to test the glitch feature
  const testGlitchFeature = () => {
    if (filteredAndSortedTodos.length === 0) return;

    // Select a random todo from the filtered list
    const randomIndex = Math.floor(
      Math.random() * filteredAndSortedTodos.length
    );
    const selectedTodo = filteredAndSortedTodos[randomIndex];

    // Set the ID of the todo to glitch
    setGlitchTestTodoId(selectedTodo._id);

    // Reset the glitch test after a short delay (to allow for re-testing)
    setTimeout(() => {
      setGlitchTestTodoId(null);
    }, 100);
  };

  // Clean up audio on component unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

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
    <>
      {/* Single audio element */}
      <audio
        ref={audioRef}
        src={ROULETTE_SOUND_URL}
        preload="auto"
        loop={false}
      ></audio>

      {/* Screen effect overlay */}
      {screenEffect && (
        <div
          className="fixed inset-0 pointer-events-none z-30 bg-gradient-to-r from-accent/5 to-transparent"
          style={{
            animation: "pulse-overlay 0.6s ease-in-out infinite alternate",
            opacity: spinIntensity * 0.35,
          }}
        ></div>
      )}

      <div
        className={`py-2 px-1 transition-all duration-300 ${
          screenEffect ? "roulette-active" : ""
        }`}
      >
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

        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="text-text-secondary hover:text-accent transition-colors text-sm flex items-center gap-1"
          >
            <PlusCircle size={14} strokeWidth={1} className="opacity-70" />
            {showCreateForm ? "Cancel" : "New Task"}
          </button>

          <button
            onClick={selectRandomTodo}
            disabled={filteredAndSortedTodos.length === 0 || isSpinning}
            title="Randomly select a task to work on next"
            className={`text-text-secondary hover:text-accent transition-colors text-sm flex items-center gap-1 ${
              isSpinning ? "animate-pulse text-accent" : ""
            }`}
          >
            <Shuffle
              size={14}
              strokeWidth={1}
              className={isSpinning ? "animate-spin" : "opacity-70"}
            />
            {isSpinning ? "Spinning..." : "Task Roulette"}
          </button>
        </div>

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
                isSelected={
                  todo._id === randomTodoId || index === spinningIndex
                }
                isSpinning={index === spinningIndex}
                onUpdateTodo={handleUpdateTodo}
                onDeleteTodo={handleDeleteTodo}
                availableTags={availableTags}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                forceGlitch={todo._id === glitchTestTodoId}
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

      {/* Add test button in lower right corner */}
      <button
        onClick={testGlitchFeature}
        className="fixed bottom-4 right-4 text-text-secondary hover:text-accent border border-border hover:border-accent transition-colors py-1 px-2 text-xs font-extralight bg-black/50 backdrop-blur-sm z-50 flex items-center gap-1"
        title="Test task glitch feature"
      >
        <ZapOff size={14} strokeWidth={1} className="opacity-70" />
        <span>Test Glitch</span>
      </button>
    </>
  );
};

export default TodoPage;
