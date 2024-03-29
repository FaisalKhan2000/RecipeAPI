import Recipe from "../models/RecipeModel.js";
import { StatusCodes } from "http-status-codes";
import cloudinary from "cloudinary";

// GET RECIPES
export const getRecipes = async (req, res) => {
  const { search, difficulty, tags, mealType, sort } = req.query;

  const queryObject = {};

  // Search

  if (search) {
    queryObject.$or = [
      { name: { $regex: search, $options: "i" } },
      { ingredients: { $regex: search, $options: "i" } },
      { cuisine: { $regex: search, $options: "i" } },
    ];
  }

  // Filter - case sensitive
  // if (difficulty) queryObject.difficulty = difficulty;
  // if (tags) queryObject.tags = tags;
  // if (mealType) queryObject.tags = mealType;

  if (difficulty) {
    queryObject.difficulty = { $regex: new RegExp(difficulty, "i") };
  }
  if (tags) {
    queryObject.tags = { $regex: new RegExp(tags, "i") };
  }
  if (mealType) {
    queryObject.mealType = { $regex: new RegExp(mealType, "i") };
  }

  // Sort
  const sortOptions = {
    newest: "-createdAt",
    oldest: "createdAt",
    "a-z": "name",
    "z-a": "-name",
    highRating: "rating",
    lowestRating: "-rating",
  };

  const sortKey = sortOptions[sort] || sortOptions.newest;

  // Pagination
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const recipes = await Recipe.find(queryObject)
    .sort(sortKey)
    .skip(skip)
    .limit(limit);

  const totalRecipes = await Recipe.countDocuments(queryObject);
  const numOfPages = Math.ceil(totalRecipes / limit);

  res
    .status(StatusCodes.OK)
    .json({ totalRecipes, numOfPages, currentPage: page, recipes });
};

// ADD RECIPE
export const addRecipe = async (req, res) => {
  let imageLink = {};

  if (req.file) {
    // Assuming only one image is uploaded
    const file = req.file;
    const result = await cloudinary.v2.uploader.upload(file.path, {
      folder: "recipes",
    });

    imageLink = {
      public_id: result.public_id,
      url: result.secure_url,
    };

    // Set the new image link in the newUser object
    req.body.image = imageLink;
  }

  req.body.userId = req.user.userId;

  const recipe = await Recipe.create(req.body);

  res.status(StatusCodes.CREATED).json({ success: true, recipe });
};

// GET  RECIPE

export const getRecipe = async (req, res) => {
  if (!req.user.userId) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ success: false, message: "Unauthorized" });
  }
  const recipe = await Recipe.findOne({
    userId: req.user.userId,
    _id: req.params.id,
  });

  if (!recipe) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ success: false, message: "Recipe not found" });
  }

  res.status(StatusCodes.OK).json({ success: true, recipe });
};

// UPDATE RECIPE
export const updateRecipe = async (req, res) => {
  const newRecipe = req.body;

  // Check if user is authenticated
  if (!req.user.userId) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ success: false, message: "Unauthorized" });
  }

  const recipe = await Recipe.findOneAndUpdate(
    { userId: req.user.userId, _id: req.params.id },
    newRecipe,
    { new: true }
  );

  // Check if recipe is found and updated
  if (!recipe) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ success: false, message: "Recipe not found" });
  }

  res.status(StatusCodes.OK).json({ success: true, recipe });
};

// DELETE RECIPE
export const deleteRecipe = async (req, res) => {
  if (!req.user.userId) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ success: false, message: "Unauthorized" });
  }
  const recipe = await Recipe.findOneAndDelete({
    userId: req.user.userId,
    _id: req.params.id,
  });

  if (!recipe) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ success: false, message: "Recipe not found" });
  }

  res.status(StatusCodes.OK).json({ success: true, recipe });
};
