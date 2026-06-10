import { useState } from "react";
import { useRecipe } from "../context/RecipeContext";

function ManualIngredientEntry() {
  const [ingredientInput, setIngredientInput] = useState("");
  const [tempIngredients, setTempIngredients] = useState([]);
  const { setIngredients } = useRecipe();

  const addIngredient = () => {
    const trimmed = ingredientInput.trim();
    if (trimmed && !tempIngredients.includes(trimmed)) {
      setTempIngredients((prev) => [...prev, trimmed]);
      setIngredientInput("");
    }
  };

  const removeIngredient = (index) => {
    setTempIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addIngredient();
    }
  };

  const handleSubmit = () => {
    if (tempIngredients.length === 0) {
      alert("Please add at least one ingredient");
      return;
    }
    setIngredients(tempIngredients);
    setTempIngredients([]);
    setIngredientInput("");
  };

  return (
    <div className="manual-ingredient-entry">
      <h2>Enter Ingredients Manually</h2>
      <p className="entry-subtitle">
        Type in the ingredients you have and we'll suggest recipes
      </p>

      <div className="ingredient-input-section">
        <div className="input-wrapper">
          <input
            type="text"
            value={ingredientInput}
            onChange={(e) => setIngredientInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type an ingredient (e.g., chicken, tomato, rice)"
            className="ingredient-input-field"
          />
          <button onClick={addIngredient} className="add-ingredient-btn">
            Add
          </button>
        </div>
      </div>

      {tempIngredients.length > 0 && (
        <>
          <div className="ingredient-preview">
            <h3>Your Ingredients ({tempIngredients.length})</h3>
            <div className="ingredient-tags-manual">
              {tempIngredients.map((ingredient, index) => (
                <span key={index} className="ingredient-tag-manual">
                  {ingredient}
                  <button
                    className="remove-btn"
                    onClick={() => removeIngredient(index)}
                    aria-label={`Remove ${ingredient}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <button onClick={handleSubmit} className="submit-ingredients-btn">
            Use These Ingredients
          </button>
        </>
      )}
    </div>
  );
}

export default ManualIngredientEntry;
