import { readFile } from "fs/promises";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Recipe from "./models/RecipeModel.js";
import User from "./models/UserModel.js";
try {
  await mongoose.connect(process.env.MONGODB_URI);
  const user = await User.findOne({ email: "iamfaisal.luv@gmail.com" });
  // const user = await User.findOne({ email: "test@test.com" });

  const jsonRecipe = JSON.parse(
    await readFile(new URL("./recipe.json", import.meta.url))
  );
  const recipe = jsonRecipe.map((recipe) => {
    return { ...recipe, createdBy: user._id };
  });
  await Recipe.deleteMany({ createdBy: user._id });
  await Recipe.create(recipe);
  console.log("Success!!!");
  process.exit(0);
} catch (error) {
  console.log(error);
  process.exit(1);
}
