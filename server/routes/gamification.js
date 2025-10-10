const express = require("express");
const Achievement = require("../models/Achievement");
const User = require("../models/User");
const Meal = require("../models/Meal");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

function formatDateKey(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

router.get("/overview", authenticateToken, async (req, res) => {
  const achievements = await Achievement.find({ userId: req.user._id }).sort({ createdAt: -1 });

  // Points and level from unlocked achievements only
  const totalPoints = achievements.reduce((sum, a) => sum + (a.unlocked ? a.points : 0), 0);
  const currentLevel = Math.floor(totalPoints / 300);
  const nextLevelPoints = (currentLevel + 1) * 300;

  // Compute streaks from real meals (days with at least one meal)
  const meals = await Meal.find({ userId: req.user._id }).select("createdAt").sort({ createdAt: -1 });
  const datesSet = new Set(meals.map((m) => formatDateKey(new Date(m.createdAt))));
  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let cursor = new Date(today);
  while (datesSet.has(formatDateKey(cursor))) {
    currentStreak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  let longestStreak = req.user.longestStreak || 0;
  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
    await User.findByIdAndUpdate(req.user._id, { longestStreak });
  }

  res.json({ totalPoints, currentLevel, nextLevelPoints, currentStreak, longestStreak, achievements });
});

module.exports = router;


