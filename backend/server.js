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
app.use("/api/todos", todoRoutes); // This should mount the /tags endpoint
app.use("/api/users", userRoutes);

// Debug route to check available routes
app.get("/routes", (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      // Routes registered directly on the app
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods),
      });
    } else if (middleware.name === "router") {
      // Router middleware
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push({
            path: handler.route.path,
            methods: Object.keys(handler.route.methods),
          });
        }
      });
    }
  });
  res.json(routes);
});

app.get("/", (req, res) => {
  res.send(`Server running on port ${process.env.PORT}`);
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
