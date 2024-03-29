import mongoose from "mongoose";
import { tags } from "../utils/constants.js";

const RecipeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    ingredients: {
      type: [String], // Assuming ingredients are strings
      required: true,
    },
    instructions: {
      type: [String], // Assuming instructions are strings
      required: true,
    },
    prepTimeMinutes: {
      type: Number,
      required: true,
    },
    cookTimeMinutes: {
      type: Number,
      required: true,
    },
    servings: {
      type: Number,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"], // Example of constraint
      required: true,
    },
    cuisine: {
      type: String,
      required: true,
    },
    caloriesPerServing: {
      type: Number,
      required: true,
    },
    tags: {
      type: [String], // Assuming tags are strings
      required: true,
      enum: Object.values(tags),
    },

    // image: {
    //   type: String,
    // },
    image: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    rating: {
      type: Number,
      min: 0,
      max: 5, // Example of constraint
      required: true,
    },
    reviewCount: {
      type: Number,
      required: true,
    },
    mealType: {
      type: [String], // Assuming mealType is an array of strings
      required: true,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Recipe", RecipeSchema);
