const mongoose = require("mongoose");

const achievementSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: String,
    description: String,
    icon: String,
    unlocked: { type: Boolean, default: false },
    unlockedDate: String,
    points: { type: Number, default: 0 },
    category: { type: String, enum: ["milestone", "nutrition", "streak"], default: "milestone" },
    progress: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Achievement", achievementSchema);


