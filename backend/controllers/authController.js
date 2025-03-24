const User = require("../models/User");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");

// Helper function to create JWT
const createToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      username: user.username,
    },
    process.env.SECRET_KEY,
    { expiresIn: "1d" } // Token expires in 1 day
  );
};

// Set cookie options
const cookieOptions = {
  httpOnly: true, // Prevents client-side JS from reading the cookie
  secure: process.env.NODE_ENV === "production", // Use secure cookies in production
  sameSite: "strict", // Prevent CSRF attacks
  maxAge: 24 * 60 * 60 * 1000, // 1 day
};

// Register a new user
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user or email already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists with that email or username",
      });
    }

    // Hash the password
    const hashedPassword = await argon2.hash(password, {
      type: argon2.argon2id, // Most recommended type
      memoryCost: 2 ** 16, // Adjust based on your server capabilities
      timeCost: 3, // Number of iterations
      parallelism: 1, // Degree of parallelism
    });

    // Create new user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // Create token
    const token = createToken(newUser);

    // Set token in cookie
    res.cookie("token", token, cookieOptions);

    // Return user data without password
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verify password
    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create token
    const token = createToken(user);

    // Set token in cookie
    res.cookie("token", token, cookieOptions);

    // Return user data
    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// Logout user
const logout = (req, res) => {
  // Clear the cookie
  res.clearCookie("token");
  res.status(200).json({ message: "Logout successful" });
};

module.exports = {
  register,
  login,
  logout,
};
