import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import RecipeDisplay from "../components/RecipeDisplay";
import Loader from "../components/Loader";

function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token, loading: authLoading } = useAuth();
  const [recipe,  setRecipe]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const { data } = await axios.get(`/api/recipes/saved/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecipe(data);
      } catch {
        setError("Recipe not found");
      } finally {
        setLoading(false);
      }
    };
    if (user && token) {
      fetchRecipe();
    }
  }, [id, user, token]);

  if (authLoading || loading) return<Loader message="Loading recipe..." />;

  if (!user) return null;

  if (error) {
    return (
      <div className="error-page">
        <h2>{error}</h2>
        <button className="primary-btn" onClick={() => navigate("/saved")}>
          Back to Saved Recipes
        </button>
      </div>
    );
  }

  return (
    <div className="recipe-detail-page">
      <button className="back-btn" onClick={() => navigate("/saved")}>&larr; Back to Saved Recipes</button>
      <RecipeDisplay recipe={recipe} />
    </div>
  );
}

export default RecipeDetail;