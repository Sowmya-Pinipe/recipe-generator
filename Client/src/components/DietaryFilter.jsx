import { useRecipe } from "../context/RecipeContext";

const DIETARY_OPTIONS = [
  { value: "",              label: "No Preference", icon: "🍽️" },
  { value: "vegan",         label: "Vegan", icon: "🌱" },
  { value: "vegetarian",    label: "Vegetarian", icon: "🥕" },
  { value: "keto",          label: "Keto", icon: "🥩" },
  { value: "gluten-free",   label: "Gluten-Free", icon: "🌾" },
  { value: "dairy-free",    label: "Dairy-Free", icon: "🥛" },
  { value: "low-carb",      label: "Low Carb", icon: "🥦" },
  { value: "high-protein",  label: "High Protein", icon: "💪" },
  { value: "paleo",         label: "Paleo", icon: "🦴" },
];

function DietaryFilter() {
  const { dietaryPreference, setDietaryPreference } = useRecipe();
  const {strictMode ,        setStrictMode  }       = useRecipe();

  return (
    <div className="dietary-filter">
      <h3>Dietary Preference</h3>
      <div className="filter-options">
        {DIETARY_OPTIONS.map((option) => (
          <button
            key={option.value}
            className={`filter-btn ${dietaryPreference === option.value ? "active" : ""}`}
            onClick={() => setDietaryPreference(option.value)}
            title={option.label}
          >
            <span className="filter-icon">{option.icon}</span>
            <span className="filter-label">{option.label}</span>
          </button>
        ))}
      </div>
      <div className="strict-toggle">

  <label>

<input
    type="checkbox"
    checked={strictMode}
    onChange={() =>
      setStrictMode(prev=>!prev)
    }
/>

Use ONLY uploaded ingredients

</label>

</div>
    </div>
  );
}

export default DietaryFilter;