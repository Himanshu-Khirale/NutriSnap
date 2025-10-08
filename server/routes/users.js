const express = require("express");
const User = require("../models/User");
const Meal = require("../models/Meal");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.get("/me", authenticateToken, async (req, res) => {
  res.json({
    id: req.user._id,
    email: req.user.email,
    name: req.user.name,
    profile: req.user.profile,
    goals: req.user.goals,
  });
});

router.get("/me/stats", authenticateToken, async (req, res) => {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const meals = await Meal.find({ userId: req.user._id, createdAt: { $gte: since } });
  const totalMeals = meals.length;
  const averageScore = totalMeals ? Math.round(meals.reduce((s, m) => s + (m.score || 0), 0) / totalMeals) : 0;
  const favoriteFood = (() => {
    const map = new Map();
    meals.forEach((m) => m.foods?.forEach((f) => map.set(f.name, (map.get(f.name) || 0) + 1)));
    let fav = "";
    let max = 0;
    for (const [k, v] of map) if (v > max) { max = v; fav = k; }
    return fav || "Meal";
  })();
  // streak placeholder
  const streakDays = Math.min((meals.length ? 1 : 0) + 0, 30);
  res.json({ totalMeals, averageScore, streakDays, favoriteFood });
});

router.put("/me/profile", authenticateToken, async (req, res) => {
  req.user.profile = { ...req.user.profile?.toObject?.() || {}, ...req.body };
  await req.user.save();
  res.json({ ok: true });
});

router.put("/me/goals", authenticateToken, async (req, res) => {
  req.user.goals = { ...req.user.goals?.toObject?.() || {}, ...req.body };
  await req.user.save();
  res.json({ ok: true });
});

router.get("/me/history", authenticateToken, async (req, res) => {
  const days = 3;
  const data = [];
  for (let i = 0; i < days; i++) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - i);
    const end = new Date(start);
    end.setDate(start.getDate() + 1);
    const meals = await Meal.find({ userId: req.user._id, createdAt: { $gte: start, $lt: end } });
    data.push({
      date: i === 0 ? "Today" : i === 1 ? "Yesterday" : `${i} days ago`,
      meals: meals.map((m) => ({
        name: m.foods?.[0]?.name || "Meal",
        time: new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        calories: m.nutrition?.calories || 0,
        score: m.score || 0,
      })),
    });
  }
  res.json({ history: data });
});

module.exports = router;


