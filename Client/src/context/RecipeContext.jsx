import { createContext, useState, useContext, useCallback } from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

const RecipeContext = createContext();

export const useRecipe = () => {
  const context = useContext(RecipeContext);
  if (!context) {
    throw new Error("useRecipe must be used within a RecipeProvider");
  }
  return context;
};

export const RecipeProvider = ({ children }) => {
  const { token } = useAuth();
  const [ingredients,       setIngredients]       = useState([]);
  const [recipe,            setRecipe]            = useState(null);
  const [suggestions,       setSuggestions]       = useState([]);
  const [savedRecipes,      setSavedRecipes]      = useState([]);
  const [loading,           setLoading]           = useState(false);
  const [loadingStage,      setLoadingStage]      = useState("");
  const [error,             setError]             = useState(null);
  const [dietaryPreference, setDietaryPreference] = useState("");
  const [uploadedImage,     setUploadedImage]     = useState(null);
  const [strictMode,        setStrictMode]        = useState(false);

  const API_BASE = "/api/recipes";

  const getAuthHeaders = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const analyzeImage = useCallback(async (imageFile) => {
    setLoading(true);
    setLoadingStage("Uploading image...");
    setError(null);
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      setLoadingStage("Detecting ingredients...");

      const { data } = await axios.post(`${API_BASE}/analyze`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setIngredients(data.ingredients);
      setLoadingStage("Ingredients detected.");
      return data.ingredients;
    } catch (err) {
      const message = err.response?.data?.error || "Failed to analyze image";
      setError(message);
      throw new Error(message);
    } finally {
      setLoadingStage("");
      setLoading(false);
    }
  }, []);

  const generateRecipe = useCallback(
    async (ingredientList, diet) => {
      setLoading(true);
      setLoadingStage("Preparing recipe prompt...");
      setError(null);
      setLoadingStage("Generating recipe with AI...");
      try {
        const { data } = await axios.post(`${API_BASE}/generate`, {
          ingredients: ingredientList || ingredients,
          dietaryPreference: diet || dietaryPreference,
          strictMode
        });

        setRecipe(data.recipe);
        setLoadingStage("Finalizing recipe...");
        return data.recipe;
      } catch (err) {
        const message = err.response?.data?.error || "Failed to generate recipe";
        setError(message);
        throw new Error(message);
      } finally {
        setLoadingStage("");
        setLoading(false);
      }
    },
    [ingredients, dietaryPreference,strictMode]
  );

  const getRecipeSuggestions = useCallback(
    async (ingredientList, diet) => {
      setLoading(true);
      setLoadingStage("Generating recipe suggestions...");
      setError(null);
      try {
        const { data } = await axios.post(`${API_BASE}/suggestions`, {
          ingredients: ingredientList || ingredients,
          dietaryPreference: diet || dietaryPreference,
          strictMode
        });

        setSuggestions(data.suggestions);
        setLoadingStage("Suggestions ready.");
        return data.suggestions;
      } catch (err) {
        const message = err.response?.data?.error || "Failed to get suggestions";
        setError(message);
        throw new Error(message);
      } finally {
        setLoadingStage("");
        setLoading(false);
      }
    },
    [ingredients, dietaryPreference]
  );

  const saveRecipe = useCallback(async (recipeData) => {
    try {
      const { data } = await axios.post(`${API_BASE}/save`, recipeData, {
        headers: getAuthHeaders(),
      });
      setSavedRecipes((prev) => [data, ...prev]);
      return data;
    } catch (err) {
      const message = err.response?.data?.error || "Failed to save recipe";
      setError(message);
      throw new Error(message);
    }
  }, [token]);

  const fetchSavedRecipes = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters).toString();
      const { data } = await axios.get(`${API_BASE}/saved?${params}`, {
        headers: getAuthHeaders(),
      });
      setSavedRecipes(data);
      return data;
    } catch (err) {
      const message = err.response?.data?.error || "Failed to fetch recipes";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const deleteSavedRecipe = useCallback(async (id) => {
    try {
      await axios.delete(`${API_BASE}/saved/${id}`, {
        headers: getAuthHeaders(),
      });
      setSavedRecipes((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      const message = err.response?.data?.error || "Failed to delete recipe";
      setError(message);
      throw new Error(message);
    }
  }, [token]);

  const clearRecipe = useCallback(() => {
    setRecipe(null);
    setSuggestions([]);
    setError(null);
  }, []);

  const value = {
    ingredients, setIngredients,
    recipe, setRecipe,
    suggestions,
    savedRecipes,
    loading,
    error, setError,
    dietaryPreference, setDietaryPreference,
    uploadedImage, setUploadedImage,
    strictMode, setStrictMode,
    loadingStage,setLoadingStage,
    analyzeImage,
    generateRecipe,
    getRecipeSuggestions,
    saveRecipe,
    fetchSavedRecipes,
    deleteSavedRecipe,
    clearRecipe,
  };

  return (
    <RecipeContext.Provider value={value}>{children}</RecipeContext.Provider>
  );
};