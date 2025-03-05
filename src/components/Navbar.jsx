import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";
import Modal from "react-modal";
import { useState } from "react";
import { createEvent, fetchEvents, fetchRegistrations } from "../services/api"; // Import necessary API functions

function Navbar({ user, setUser }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    startTime: "",
    endTime: "",
  });

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || user.role !== "staff") {
      alert("Only staff members can create events!");
      return;
    }

    // Convert time to minutes for validation
    const convertTimeToMinutes = (timeString) => {
      if (!timeString) return 0;
      const [hours, minutes] = timeString.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const { startTime, endTime } = formData;
    const startMinutes = convertTimeToMinutes(startTime);
    const endMinutes = convertTimeToMinutes(endTime);

    // Validate end time
    if (startTime && endTime && startMinutes >= endMinutes) {
      alert("End time must be later than start time!");
      return;
    }

    const eventData = {
      ...formData,
      created_by: user.id,
      role: user.role,
    };

    try {
      await createEvent(eventData);
      alert("Event created successfully!");
      toggleModal(); // Close the modal after successful creation
      setFormData({
        // Reset form data
        title: "",
        description: "",
        location: "",
        date: "",
        startTime: "",
        endTime: "",
      });
      window.location.reload(); // Refresh the page to show updated data
    } catch (error) {
      console.error("Error creating event:", error);
      const errorMessage =
        error.response?.data?.error || error.message || "Error creating event";
      alert(errorMessage);
    }
  };

  const isEventListPage = window.location.pathname === "/";

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
            {user.role === "staff" && (
              <>
                <button onClick={toggleModal} className="create-event-btn">
                  Create Event
                </button>
              </>
            )}
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

      <Modal isOpen={isModalOpen} onRequestClose={toggleModal}>
        <h2>Create Event</h2>
        <form className="event-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Event Title"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Event Description"
            value={formData.description}
            onChange={handleChange}
          />
          <input
            type="text"
            name="location"
            placeholder="Event Location"
            value={formData.location}
            onChange={handleChange}
          />
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
          <input
            type="time"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            required
          />
          <input
            type="time"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            required
          />
          <button type="submit">Create Event</button>
          <button type="button" onClick={toggleModal}>
            Close
          </button>
        </form>
      </Modal>
    </nav>
  );
}

export default Navbar;
