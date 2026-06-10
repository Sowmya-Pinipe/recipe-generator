import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  const navigate = useNavigate();
  const { register, loading, error, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    // Validation
    if (!name || !email || !password || !passwordConfirm) {
      setLocalError("Please fill in all fields");
      return;
    }

    if (name.length < 2) {
      setLocalError("Name must be at least 2 characters long");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLocalError("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      setLocalError("Password must be at least 6 characters long");
      return;
    }

    if (password !== passwordConfirm) {
      setLocalError("Passwords do not match");
      return;
    }

    try {
      await register(name, email, password, passwordConfirm);
      navigate("/");
    } catch (err) {
      setLocalError(err.message);
    }
  };

  const displayError = localError || error;

  return (
    <div className="auth-page register-page">
      <div className="auth-container">
        <div className="auth-form-wrapper">
          <div className="auth-header">
            <h1>Create Account</h1>
            <p>Join us to save your favorite recipes</p>
          </div>

          {displayError && (
            <div className="auth-error-banner">
              <span className="error-icon">⚠️</span>
              <p>{displayError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="form-input"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="passwordConfirm">Confirm Password</label>
              <div className="password-wrapper">
                <input
                  id="passwordConfirm"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  disabled={loading}
                  className="form-input"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-submit-btn"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{" "}
              <Link to="/login" className="auth-link">
                Sign in
              </Link>
            </p>
          </div>

          <div className="auth-divider">
            <span>or continue as guest</span>
          </div>

          <Link to="/" className="guest-btn">
            Continue Without Signing Up
          </Link>
        </div>

        <div className="auth-side">
          <div className="side-content">
            <h2>AI Recipe Generator</h2>
            <p>🍳 Upload food photos</p>
            <p>🤖 Get instant recipes</p>
            <p>💾 Save your favorites</p>
            <p>✨ Personalized experience</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
