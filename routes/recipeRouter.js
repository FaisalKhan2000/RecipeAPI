import express from "express";
const router = express.Router();

import {
  addRecipe,
  getRecipes,
  getRecipe,
  updateRecipe,
  deleteRecipe,
} from "../controllers/recipeController.js";
import upload from "../middleware/multerMiddleware.js";

import { authenticateUser } from "../middleware/authMiddleware.js";

router
  .route("/")
  .get(getRecipes)
  .post(authenticateUser, upload.single("image"), addRecipe);
router
  .route("/:id")
  .get(authenticateUser, getRecipe)
  .patch(authenticateUser, updateRecipe)
  .delete(authenticateUser, deleteRecipe);

export default router;
