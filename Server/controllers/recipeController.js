const { groq } = require("../config/gemini");
const Recipe = require("../models/Recipe");

// ── POST /api/recipes/analyze ────────────────────────────────
const analyzeImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }

    // STEP A: Convert buffer to Base64 with MIME type
    const base64Image = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype;

    // STEP B: Call Groq Vision (LLaMA 4 Scout)
    const response = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
            {
              type: "text",
              text: 'Analyze this image carefully. FIRST determine whether this is food, ingredients, or cooking-related. If NOT food-related, return EXACTLY: {"validFoodImage": false, "ingredients": []}. If it IS food-related, extract all visible ingredients and return: {"validFoodImage": true, "ingredients": ["ingredient1", "ingredient2", ...]}. Return ONLY valid JSON, no markdown or extra text.',
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    const text = response.choices[0].message.content;

    // STEP C: Parse JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return res.status(400).json({
        error: "Failed to parse image analysis response. Please try again."
      });
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      return res.status(400).json({
        error: "Invalid response format from image analysis. Please try again."
      });
    }

    // STEP D: Check if image contains food
    if (!parsed.validFoodImage) {
      return res.status(400).json({
        error: "This doesn't appear to be a food or ingredient image. Please upload a photo of ingredients in your fridge or a dish you want to recreate."
      });
    }

    const ingredients = (parsed.ingredients || []).filter(
      (ing) => ing && ing.trim().length > 0
    );

    if (ingredients.length === 0) {
      return res.status(400).json({
        error: "No ingredients detected in the image. Please upload a clearer image with visible ingredients."
      });
    }

    res.json({ ingredients });
  } catch (error) {
    console.error("Image analysis error:", error);
    res.status(500).json({ error: "Failed to analyze image. Please try again." });
  }
};

// ── POST /api/recipes/generate ───────────────────────────────
const generateRecipe = async (req, res) => {
  try {
    const { ingredients, dietaryPreference,strictMode } = req.body;

    if (!ingredients || ingredients.length === 0) {
      return res.status(400).json({ error: "Ingredients are required" });
    }

    // STEP A: Build the dietary filter string
    const dietFilter = dietaryPreference
      ? `The recipe MUST be${dietaryPreference}-friendly.`
      : "";
      const ingredientMode = strictMode
      ? `IMPORTANT:
      Use ONLY the supplied ingredients.
      DO NOT introduce any extra ingredients.
      You may only use water, salt, pepper, or cooking oil if absolutely required.`
      : `You may introduce minimal pantry ingredients when needed
      (example: salt, oil, garlic, butter, spices).`;

    // STEP B: Construct the structured JSON prompt
    const prompt = `You are a professional chef and nutritionist. Based on these ingredients:${ingredients.join(", ")}.
${dietFilter}
${ingredientMode}

Generate a detailed recipe in the following JSON format (return ONLY valid JSON, no markdown):
{
  "title": "Recipe Name",
  "ingredients": [{"name": "ingredient name", "quantity": "amount needed"}],
  "instructions": [{"step": 1, "description": "Step description"}],
  "nutrition": {
    "calories": "approximate calories per serving",
    "protein": "protein in grams",
    "carbs": "carbs in grams",
    "fat": "fat in grams",
    "fiber": "fiber in grams"
  },
  "servings": "number of servings",
  "prepTime": "preparation time",
  "cookTime": "cooking time",
  "difficulty": "Easy/Medium/Hard",
  "dietaryTags": ["applicable tags from: vegan, vegetarian, keto, gluten-free, dairy-free, low-carb, high-protein, paleo"],
  "servingSuggestions": ["suggestion 1", "suggestion 2"]
}`;

    // STEP C: Call Groq Text (LLaMA 3.3 70B)
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1500,
    });

    const text = response.choices[0].message.content;

    // STEP D: Extract JSON object from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(500).json({ error: "Failed to parse recipe" });
    }

    const recipe = JSON.parse(jsonMatch[0]);

    // STEP E: Attach the original detected ingredients
    recipe.detectedIngredients = ingredients;

    res.json({ recipe });
  } catch (error) {
    console.error("Recipe generation error:", error);
    res.status(500).json({ error: "Failed to generate recipe" });
  }
};

// ── POST /api/recipes/suggestions ───────────────────────────
const generateMultipleRecipes = async (req, res) => {
  try {
    const { ingredients, dietaryPreference,strictMode } = req.body;

    if (!ingredients || ingredients.length === 0) {
      return res.status(400).json({ error: "Ingredients are required" });
    }

    const dietFilter = dietaryPreference
      ? `All recipes MUST be${dietaryPreference}-friendly.`
      : "";

    const ingredientMode = strictMode
      ? `IMPORTANT:
      Use ONLY the supplied ingredients.
      DO NOT introduce any extra ingredients.
      You may only use water, salt, pepper, or cooking oil if absolutely required.`
      : `You may introduce minimal pantry ingredients when needed
      (example: salt, oil, garlic, butter, spices).`;

    const prompt = `You are a professional chef. Based on these ingredients:${ingredients.join(", ")}.
${dietFilter}
${ingredientMode}

Suggest 3 different recipes that can be made. Return ONLY valid JSON array (no markdown):
[
  {
    "title": "Recipe Name",
    "description": "Brief 1-line description",
    "difficulty": "Easy/Medium/Hard",
    "cookTime": "estimated time",
    "dietaryTags": ["applicable tags"]
  }
]`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 800,
    });

    const text = response.choices[0].message.content;

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return res.status(500).json({ error: "Failed to parse suggestions" });
    }

    const suggestions = JSON.parse(jsonMatch[0]);
    res.json({ suggestions });
  } catch (error) {
    console.error("Multiple recipe error:", error);
    res.status(500).json({ error: "Failed to generate suggestions" });
  }
};

// ── POST /api/recipes/save ───────────────────────────────────
const saveRecipe = async (req, res) => {
  try {
    const recipe = new Recipe({
      ...req.body,
      userId: req.user.id,
    });
    const saved = await recipe.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("Save recipe error:", error);
    res.status(500).json({ error: "Failed to save recipe" });
  }
};

// ── GET /api/recipes/saved ───────────────────────────────────
const getSavedRecipes = async (req, res) => {
  try {
    const { diet, difficulty, search } = req.query;
    const filter = { userId: req.user.id };

    if (diet)       filter.dietaryTags  = diet;
    if (difficulty) filter.difficulty   = difficulty;
    if (search)     filter.title        = { $regex: search, $options: "i" };

    const recipes = await Recipe.find(filter).sort({ createdAt: -1 });
    res.json(recipes);
  } catch (error) {
    console.error("Get recipes error:", error);
    res.status(500).json({ error: "Failed to fetch recipes" });
  }
};

// ── GET /api/recipes/saved/:id ───────────────────────────────
const getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    res.json(recipe);
  } catch (error) {
    console.error("Get recipe error:", error);
    res.status(500).json({ error: "Failed to fetch recipe" });
  }
};

// ── DELETE /api/recipes/saved/:id ────────────────────────────
const deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    res.json({ message: "Recipe deleted successfully" });
  } catch (error) {
    console.error("Delete recipe error:", error);
    res.status(500).json({ error: "Failed to delete recipe" });
  }
};

module.exports = {
  analyzeImage,
  generateRecipe,
  generateMultipleRecipes,
  saveRecipe,
  getSavedRecipes,
  getRecipeById,
  deleteRecipe,
};

