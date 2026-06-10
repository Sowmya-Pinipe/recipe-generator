import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import RecipeResult from "./pages/RecipeResult";
import SavedRecipes from "./pages/SavedRecipes";
import RecipeDetail from "./pages/RecipeDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { useAuth } from "./context/AuthContext";

function App() {
  const { checkAuth } = useAuth();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recipe" element={<RecipeResult />} />
          <Route path="/saved" element={<SavedRecipes />} />
          <Route path="/saved/:id" element={<RecipeDetail />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;