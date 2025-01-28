import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../services/api";
import Spinner from "../common/Spinner";
import "./Auth.css";

function Register({ setUser }) {
  const navigate = useNavigate();
  const STAFF_PIN = "13111999";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    isStaff: false,
    staffPin: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.isStaff && formData.staffPin !== STAFF_PIN) {
      setError("Invalid staff PIN");
      return;
    }

    setIsLoading(true);

    try {
      const response = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.isStaff ? "staff" : "user",
      });
      setUser(response.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Register</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter your name"
              disabled={isLoading}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Enter your email"
              disabled={isLoading}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              placeholder="Enter your password"
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.isStaff}
                onChange={(e) =>
                  setFormData({ ...formData, isStaff: e.target.checked })
                }
                disabled={isLoading}
              />
              Register as Staff Member
            </label>
          </div>

          {formData.isStaff && (
            <div className="form-group">
              <label>Staff PIN</label>
              <input
                type="password"
                value={formData.staffPin}
                onChange={(e) =>
                  setFormData({ ...formData, staffPin: e.target.value })
                }
                placeholder="Enter staff PIN"
                disabled={isLoading}
                required={formData.isStaff}
              />
              <small className="helper-text">
                Required for staff registration
              </small>
            </div>
          )}

          <button
            type="submit"
            className={`auth-button ${isLoading ? "loading" : ""}`}
            disabled={isLoading}
          >
            <span className="button-text">
              {isLoading ? (
                <div className="button-spinner">
                  <Spinner />
                </div>
              ) : (
                "Register"
              )}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;
