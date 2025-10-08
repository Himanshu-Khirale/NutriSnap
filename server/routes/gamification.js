const express = require("express");
const Achievement = require("../models/Achievement");
const User = require("../models/User");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Seed defaults for user
async function ensureSeed(userId) {
  const count = await Achievement.countDocuments({ userId });
  if (count > 0) return;
  await Achievement.insertMany([
    { userId, title: "First Steps", description: "Log your first meal", icon: "🥗", unlocked: true, points: 50, category: "milestone" },
    { userId, title: "Streak Master", description: "Maintain a 7-day logging streak", icon: "🔥", unlocked: true, points: 200, category: "streak" },
    { userId, title: "Nutrition Scholar", description: "10 meals with 80+ score", icon: "🎓", unlocked: true, points: 300, category: "nutrition" },
    { userId, title: "Veggie Lover", description: "20 meals with vegetables", icon: "🥬", unlocked: true, points: 150, category: "nutrition" },
    { userId, title: "Protein Power", description: "Protein goal 14 days", icon: "💪", unlocked: false, progress: 8, total: 14, points: 250, category: "nutrition" },
  ]);
}

router.get("/overview", authenticateToken, async (req, res) => {
  await ensureSeed(req.user._id);
  const achievements = await Achievement.find({ userId: req.user._id }).sort({ createdAt: -1 });
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalPoints = achievements.reduce((s, a) => s + (a.unlocked ? a.points : 0), 0);
  const currentLevel = Math.floor(totalPoints / 300);
  const nextLevelPoints = (currentLevel + 1) * 300;
  const currentStreak = 12; // placeholder until streak calc implemented
  const longestStreak = req.user.longestStreak || 28;
  res.json({ totalPoints, currentLevel, nextLevelPoints, currentStreak, longestStreak, achievements });
});

module.exports = router;


