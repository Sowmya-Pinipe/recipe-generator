const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { protect } = require("../middleware/auth");
const {
  analyzeImage,
  generateRecipe,
  generateMultipleRecipes,
  saveRecipe,
  getSavedRecipes,
  getRecipeById,
  deleteRecipe,
} = require("../controllers/recipeController");

// ── AI Routes ────────────────────────────────────────────────
router.post("/analyze",     upload.single("image"), analyzeImage);
router.post("/generate",    generateRecipe);
router.post("/suggestions", generateMultipleRecipes);

// ── CRUD Routes ──────────────────────────────────────────────
router.post("/save",        protect, saveRecipe);
router.get("/saved",        protect, getSavedRecipes);
router.get("/saved/:id",    protect, getRecipeById);
router.delete("/saved/:id", protect, deleteRecipe);

module.exports = router;