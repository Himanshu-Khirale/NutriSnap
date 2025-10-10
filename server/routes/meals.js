const express = require("express");
const fs = require("fs");
const path = require("path");
const Meal = require("../models/Meal");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();
const { analyzeFoodImageBase64 } = require("../services/gemini");
const Achievement = require("../models/Achievement");

// naive image upload: accepts base64 dataUrl or public URL
router.post("/analyze", authenticateToken, async (req, res) => {
  try {
    const { imageBase64, imageUrl } = req.body || {};
    const userId = req.user._id;

    let storedUrl = imageUrl || null;
    if (imageBase64 && imageBase64.startsWith("data:image")) {
      const uploadsDir = path.join(__dirname, "..", "uploads");
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
      const [, data] = imageBase64.split(",");
      const buffer = Buffer.from(data, "base64");
      const filename = `meal_${Date.now()}.png`;
      const filepath = path.join(uploadsDir, filename);
      fs.writeFileSync(filepath, buffer);
      storedUrl = `/uploads/${filename}`;
    }

    // Analyze with Gemini if base64 provided
    let detectedFoods = [];
    let nutrition = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 };
    let score = 0;
    let recommendations = [];
    let alternatives = [];
    if (imageBase64) {
      try {
        const ai = await analyzeFoodImageBase64(imageBase64);
        detectedFoods = ai.foods || detectedFoods;
        nutrition = ai.nutrition || nutrition;
        score = ai.score || score;
        recommendations = ai.recommendations || [];
        alternatives = ai.alternatives || [];
      } catch (e) {
        console.error("Gemini analysis failed:", e.message);
        console.error("Full error:", e);
        // Return error instead of fallback
        return res.status(500).json({ 
          error: "AI analysis failed", 
          details: e.message,
          fallback: {
            foods: [{ name: "Meal", portion: "1 serving" }],
            nutrition: { calories: 400, protein: 25, carbs: 45, fat: 12, fiber: 5, sugar: 6 },
            score: 80,
            recommendations: ["AI analysis unavailable"],
            alternatives: []
          }
        });
      }
    }

    const meal = await Meal.create({
      userId,
      imageUrl: storedUrl,
      foods: detectedFoods,
      nutrition,
      score,
    });

    // Unlock first-meal achievement if this is their first meal
    const userMealCount = await Meal.countDocuments({ userId });
    if (userMealCount === 1) {
      const existing = await Achievement.findOne({ userId, title: "First Steps" });
      if (!existing) {
        await Achievement.create({
          userId,
          title: "First Steps",
          description: "Log your first meal",
          icon: "🥗",
          unlocked: true,
          unlockedDate: new Date().toISOString(),
          points: 50,
          category: "milestone",
        });
      }
    }

    // Emit real-time update
    const io = req.app.get("io");
    if (io) {
      io.to(`user-${userId}`).emit("meal-analyzed", {
        mealId: meal._id,
        foods: meal.foods,
        nutrition: meal.nutrition,
        score: meal.score,
      });
      io.to(`user-${userId}`).emit("achievement-updated", { refresh: true });
    }

    res.json({
      mealId: meal._id,
      imageUrl: meal.imageUrl,
      foods: meal.foods,
      nutrition: meal.nutrition,
      score: meal.score,
      recommendations,
      alternatives,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to analyze meal" });
  }
});

router.post("/save", authenticateToken, async (req, res) => {
  try {
    const { meal } = req.body;
    if (!meal) return res.status(400).json({ error: "Missing meal" });
    meal.userId = req.user._id;
    const created = await Meal.create(meal);
    
    // Emit real-time update
    const io = req.app.get("io");
    if (io) {
      io.to(`user-${req.user._id}`).emit("meal-saved", { mealId: created._id });
    }
    
    res.json({ ok: true, id: created._id });
  } catch (e) {
    res.status(500).json({ error: "Failed to save meal" });
  }
});

router.get("/recent", authenticateToken, async (req, res) => {
  const limit = Number.parseInt(req.query.limit) || 10;
  const meals = await Meal.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(limit);
  res.json({ meals });
});

module.exports = router;


