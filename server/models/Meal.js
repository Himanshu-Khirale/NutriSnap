const mongoose = require("mongoose");

const mealFoodSchema = new mongoose.Schema(
  {
    name: String,
    portion: String,
  },
  { _id: false }
);

const nutritionSchema = new mongoose.Schema(
  {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number,
    sugar: Number,
  },
  { _id: false }
);

const mealSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    imageUrl: String,
    foods: [mealFoodSchema],
    nutrition: nutritionSchema,
    score: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Meal", mealSchema);


