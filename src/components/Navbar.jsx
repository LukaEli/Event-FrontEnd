import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";

function Navbar({ user, setUser }) {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/">Events Hub</Link>
      </div>
      <div className="nav-right">
        {user ? (
          <>
            <span className="welcome-message">Welcome, {user.name}!</span>
            <NavLink
              to="/dashboard"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Dashboard
            </NavLink>
            <button
              onClick={() => {
                setUser(null);

                window.location.href = "/";
              }}
              className="logout-btn"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink
              to="/login"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Login
            </NavLink>
            <NavLink
              to="/register"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Register
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
