const express = require("express");
require("dotenv").config(); // Load environment variables from .env file
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./routes/authRoutes");
const todoRoutes = require("./routes/todoRoutes");
const userRoutes = require("./routes/userRoutes");
const rewardRoutes = require("./routes/rewardRoutes"); // Added rewardRoutes

// Initialize Express app
const app = express();

app.use(helmet());

mongoose
  .connect(process.env.DB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

let corsOptions = {
  origin: process.env.ORIGIN, // Allowed origin from environment variables
  methods: "GET,PUT,POST,DELETE",
  credentials: true, // Allow cookies in CORS requests
};

// Define rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: "Too many requests from this IP, please try again after 15 minutes",
});

app.use(limiter);

app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);
app.use("/api/users", userRoutes);
app.use("/api/rewards", rewardRoutes); // Added new route for rewards

// Enhanced debug route to check available routes
app.get("/debug/routes", (req, res) => {
  const routes = [];

  // Function to extract routes from a router stack
  const extractRoutes = (stack, prefix = "") => {
    stack.forEach((layer) => {
      if (layer.route) {
        // Routes registered directly
        const path = prefix + layer.route.path;
        const methods = Object.keys(layer.route.methods).map((m) =>
          m.toUpperCase()
        );
        routes.push({ path, methods });
      } else if (layer.name === "router" && layer.handle.stack) {
        // Router middleware
        const routerPath = layer.regexp.toString().match(/^\/\^\\(\/?[^\\]+)/);
        const pathPrefix = routerPath
          ? prefix + routerPath[1].replace(/\\\//g, "/")
          : prefix;
        extractRoutes(layer.handle.stack, pathPrefix);
      }
    });
  };

  extractRoutes(app._router.stack);

  res.json({
    routes: routes.sort((a, b) => a.path.localeCompare(b.path)),
    todoRoutesExported: Object.keys(todoRoutes),
    todoControllerMethods: Object.keys(require("./controllers/todoController")),
  });
});

app.get("/", (req, res) => {
  res.send(`Server running on port ${process.env.PORT}`);
});

// Handle 404s with useful information
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `The endpoint ${req.method} ${req.path} does not exist`,
    availableEndpoints: "GET /debug/routes to see all available endpoints",
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(
    `Debug routes available at: http://localhost:${PORT}/debug/routes`
  );
});
