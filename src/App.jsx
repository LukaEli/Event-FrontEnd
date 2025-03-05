import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Register from "./components/auth/Register";
import Login from "./components/auth/Login";
import Dashboard from "./components/Dashboard";
import EventsList from "./components/EventList";
import Modal from "react-modal";

function App() {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;

    if (parsedUser) {
      localStorage.setItem("role", parsedUser.role);
    }
    return parsedUser;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", user.role);
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("role");
    }
    Modal.setAppElement("#app");
  }, [user]);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <Router>
      <div id="app" className="app">
        <Navbar user={user} setUser={setUser} onCreateEvent={toggleModal} />
        <Routes>
          <Route
            path="/"
            element={
              <EventsList
                user={user}
                toggleModal={toggleModal}
                isModalOpen={isModalOpen}
              />
            }
          />
          <Route path="/register" element={<Register setUser={setUser} />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route
            path="/dashboard"
            element={
              <Dashboard
                user={user}
                toggleModal={toggleModal}
                isModalOpen={isModalOpen}
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
