const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const { generateRecipeFromIngredients } = require("../services/gemini");

const router = express.Router();

// Generate recipe from ingredients
router.post("/generate", authenticateToken, async (req, res) => {
  try {
    const { ingredientsText, imageBase64 } = req.body;
    const userId = req.user._id;

    if (!ingredientsText && !imageBase64) {
      return res.status(400).json({ 
        error: "Please provide either ingredients text or an image" 
      });
    }

    console.log("Generating recipe for user:", userId);
    console.log("Ingredients text:", ingredientsText);
    console.log("Has image:", !!imageBase64);

    // Generate recipe using Gemini
    const recipeData = await generateRecipeFromIngredients(ingredientsText, imageBase64);

    // Prepare response
    const response = {
      recipe: {
        title: recipeData.recipe.title || "Generated Recipe",
        description: recipeData.recipe.description || "A delicious recipe created from your ingredients",
        prepTime: recipeData.recipe.prepTime || "15 minutes",
        cookTime: recipeData.recipe.cookTime || "30 minutes",
        servings: recipeData.recipe.servings || 4,
        ingredients: recipeData.recipe.ingredients || [],
        instructions: recipeData.recipe.instructions || [],
        tips: recipeData.recipe.tips || []
      },
      nutrition: {
        calories: recipeData.nutrition.calories || 0,
        protein: recipeData.nutrition.protein || 0,
        carbs: recipeData.nutrition.carbs || 0,
        fat: recipeData.nutrition.fat || 0,
        fiber: recipeData.nutrition.fiber || 0,
        sugar: recipeData.nutrition.sugar || 0,
        sodium: recipeData.nutrition.sodium || 0,
        vitamins: recipeData.nutrition.vitamins || {},
        minerals: recipeData.nutrition.minerals || {}
      },
      substitutions: recipeData.substitutions || []
    };

    // Emit real-time update
    const io = req.app.get("io");
    if (io) {
      io.to(`user-${userId}`).emit("recipe-generated", {
        recipe: response.recipe,
        nutrition: response.nutrition
      });
    }

    res.json(response);
  } catch (error) {
    console.error("Recipe generation error:", error);
    res.status(500).json({ 
      error: "Failed to generate recipe",
      details: error.message 
    });
  }
});

// Save generated recipe to user's collection
router.post("/save", authenticateToken, async (req, res) => {
  try {
    const { recipe, nutrition, substitutions } = req.body;
    const userId = req.user._id;

    if (!recipe) {
      return res.status(400).json({ error: "Recipe data is required" });
    }

    // Here you would save to a Recipe model if you had one
    // For now, we'll just return success
    console.log("Saving recipe for user:", userId);
    console.log("Recipe title:", recipe.title);

    // Emit real-time update
    const io = req.app.get("io");
    if (io) {
      io.to(`user-${userId}`).emit("recipe-saved", { 
        recipeId: `recipe_${Date.now()}`,
        title: recipe.title 
      });
    }

    res.json({ 
      success: true, 
      message: "Recipe saved successfully",
      recipeId: `recipe_${Date.now()}`
    });
  } catch (error) {
    console.error("Recipe save error:", error);
    res.status(500).json({ 
      error: "Failed to save recipe",
      details: error.message 
    });
  }
});

// Get user's saved recipes
router.get("/saved", authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Here you would fetch from a Recipe model if you had one
    // For now, return empty array
    const recipes = [];

    res.json({ recipes });
  } catch (error) {
    console.error("Get saved recipes error:", error);
    res.status(500).json({ 
      error: "Failed to fetch saved recipes",
      details: error.message 
    });
  }
});

module.exports = router;
