import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🍳</span>
          AI Recipe Generator
        </Link>
        <div className="navbar-links">
          <Link to="/" className={`nav-link${location.pathname === "/" ? " active" : ""}`}>
            <span className="nav-icon">🏠</span>
            Home
          </Link>
          <Link to="/saved" className={`nav-link${location.pathname === "/saved" ? " active" : ""}`}>
            <span className="nav-icon">📌</span>
            Saved
          </Link>

          <div className="navbar-auth">
            {isAuthenticated && user ? (
              <>
                <span className="user-greeting">👤 {user.name}</span>
                <button onClick={logout} className="nav-link logout-btn">
                  <span className="nav-icon">🚪</span>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={`nav-link${location.pathname === "/login" ? " active" : ""}`}>
                  <span className="nav-icon">🔐</span>
                  Login
                </Link>
                <Link to="/register" className={`nav-link register-link${location.pathname === "/register" ? " active" : ""}`}>
                  <span className="nav-icon">✨</span>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;