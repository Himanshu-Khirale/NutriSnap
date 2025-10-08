const express = require("express");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { generateToken } = require("../middleware/auth");

const router = express.Router();

// Register
router.post(
  "/register",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
    body("name").trim().isLength({ min: 2 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, name } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user
      const user = await User.create({
        email,
        passwordHash,
        name,
        profile: {
          avatar: "/placeholder.svg",
          joinDate: new Date().toLocaleString("default", { month: "long", year: "numeric" }),
          dietaryPreferences: [],
        },
        goals: {
          calories: 2000,
          protein: 120,
          carbs: 200,
          fat: 70,
          fiber: 25,
          water: 8,
        },
      });

      // Generate token
      const token = generateToken(user._id);

      res.status(201).json({
        message: "User created successfully",
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          profile: user.profile,
        },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Login
router.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").exists()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Generate token
      const token = generateToken(user._id);

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          profile: user.profile,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Get current user
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const jwt = require("jsonwebtoken");
    const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      profile: user.profile,
      goals: user.goals,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = router;

