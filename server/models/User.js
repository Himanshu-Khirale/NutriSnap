const mongoose = require("mongoose");

const goalsSchema = new mongoose.Schema(
  {
    calories: { type: Number, default: 2000 },
    protein: { type: Number, default: 120 },
    carbs: { type: Number, default: 200 },
    fat: { type: Number, default: 70 },
    fiber: { type: Number, default: 25 },
    water: { type: Number, default: 8 },
  },
  { _id: false }
);

const profileSchema = new mongoose.Schema(
  {
    avatar: String,
    age: Number,
    height: String,
    weight: String,
    activityLevel: String,
    dietaryPreferences: [String],
    joinDate: String,
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String },
    name: { type: String },
    profile: profileSchema,
    goals: goalsSchema,
    points: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);


