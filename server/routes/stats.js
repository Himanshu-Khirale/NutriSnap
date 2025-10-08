const express = require("express");
const Meal = require("../models/Meal");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.get("/today", authenticateToken, async (req, res) => {
  // naive: aggregate last 24h
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const meals = await Meal.find({ userId: req.user._id, createdAt: { $gte: since } });
  const totals = meals.reduce(
    (acc, m) => {
      acc.calories += m.nutrition?.calories || 0;
      acc.protein += m.nutrition?.protein || 0;
      acc.carbs += m.nutrition?.carbs || 0;
      acc.fat += m.nutrition?.fat || 0;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
  // simple defaults for goals
  res.json({
    calories: totals.calories,
    caloriesGoal: 2000,
    protein: totals.protein,
    proteinGoal: 120,
    carbs: totals.carbs,
    carbsGoal: 200,
    fat: totals.fat,
    fatGoal: 70,
  });
});

router.get("/weekly", authenticateToken, async (req, res) => {
  const days = 7;
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - i);
    const end = new Date(start);
    end.setDate(start.getDate() + 1);
    const meals = await Meal.find({ userId: req.user._id, createdAt: { $gte: start, $lt: end } });
    const calories = meals.reduce((sum, m) => sum + (m.nutrition?.calories || 0), 0);
    const avgScore = meals.length
      ? Math.round(meals.reduce((s, m) => s + (m.score || 0), 0) / meals.length)
      : 0;
    const day = start.toLocaleDateString(undefined, { weekday: "short" });
    result.push({ day, calories, score: avgScore });
  }
  res.json({ days: result });
});

router.get("/insights", authenticateToken, async (req, res) => {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const meals = await Meal.find({ userId: req.user._id, createdAt: { $gte: since } });
  const calories = meals.reduce((sum, m) => sum + (m.nutrition?.calories || 0), 0);
  const insights = [];
  if (calories < 1850) insights.push("You're under your daily calories. Consider a healthy snack!");
  if (meals.some((m) => (m.nutrition?.protein || 0) >= 30)) insights.push("Great protein intake in at least one meal!");
  insights.push("Keep consistency for better weekly scores.");
  res.json({ insights });
});

module.exports = router;


