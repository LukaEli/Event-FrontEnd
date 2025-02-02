import { useState, useEffect } from "react";
import {
  fetchEvents,
  createEvent,
  deleteEvent,
  registerForEvent,
} from "../services/api";
import useGoogleCalendar from "./UseGoogleCalendar";
import "./Dashboard.css";

const Dashboard = ({ user }) => {
  const googleCalendar = useGoogleCalendar();
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    startTime: "",
    endTime: "",
  });

  const [registrationStatus, setRegistrationStatus] = useState({});

  useEffect(() => {
    fetchEvents()
      .then((data) => setEvents(data.data))
      .catch((error) => console.error("Error fetching events:", error));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    //console.log("Current user:", user);
    //console.log("localStorage role:", localStorage.getItem("role"));

    if (!user || user.role !== "staff") {
      alert("Only staff members can create events!");
      return;
    }

    const eventData = {
      ...formData,
      created_by: user.id,
      role: user.role,
    };

    //console.log("Sending event data:", eventData);

    try {
      const newEvent = await createEvent(eventData);
      //console.log("Response:", newEvent);
      setEvents([...events, { id: newEvent.eventId, ...eventData }]);
      setFormData({
        title: "",
        description: "",
        location: "",
        date: "",
        startTime: "",
        endTime: "",
      });
    } catch (error) {
      console.error("Error creating event:", error);
      const errorMessage =
        error.response?.data?.error || error.message || "Error creating event";
      alert(errorMessage);
    }
  };

  const handleDelete = async (eventId) => {
    //console.log("Attempting to delete event:", eventId);
    //console.log("User role:", user?.role);
    //console.log("LocalStorage role:", localStorage.getItem("role"));

    if (!user || user.role !== "staff") {
      alert("Only staff members can delete events!");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this event?"
    );
    if (!confirmDelete) return;

    try {
      await deleteEvent(eventId);
      setEvents(events.filter((event) => event.id !== eventId));
    } catch (error) {
      console.error("Error deleting event:", error);
      const errorMessage =
        error.response?.data?.error || error.message || "Error deleting event";
      alert(errorMessage);
    }
  };

  const handleRegister = async (eventId) => {
    if (!user) {
      alert("Please log in to register for events!");
      return;
    }

    try {
      // Check if already registered in local state
      if (registrationStatus[eventId] === "registered") {
        alert("You are already registered for this event!");
        return;
      }

      const registrationData = {
        user_id: user.id,
        event_id: eventId,
      };

      // console.log("Sending registration data:", registrationData);

      try {
        const response = await registerForEvent(registrationData);
        //  console.log("Registration response:", response);

        setRegistrationStatus((prev) => ({
          ...prev,
          [eventId]: "registered",
        }));

        const event = events.find((e) => e.id === eventId);
        if (
          event &&
          googleCalendar.isInitialized &&
          !googleCalendar.isLoading
        ) {
          const addToCalendar = window.confirm(
            "Would you like to add this event to your Google Calendar?"
          );
          if (addToCalendar) {
            try {
              await googleCalendar.addToCalendar(event);
              alert("Event successfully added to your Google Calendar!");
            } catch (error) {
              console.error("Failed to add to Google Calendar:", error);
              if (error.message?.includes("popup")) {
                alert(
                  "Please allow popups for this site to use Google Calendar integration."
                );
              } else {
                alert(
                  "Failed to add event to Google Calendar. Please try again."
                );
              }
            }
          }
        }

        alert("Successfully registered for the event!");
      } catch (error) {
        console.error("Error registering for event:", error);
        if (error.response?.data?.error?.includes("UNIQUE constraint failed")) {
          alert("You are already registered for this event!");
          // Update local state to reflect registration status
          setRegistrationStatus((prev) => ({
            ...prev,
            [eventId]: "registered",
          }));
        } else {
          const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            "Error registering for event";
          alert(errorMessage);
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="dashboard-container">
      <h2>Event Dashboard</h2>

      {user?.role === "staff" && (
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
        </form>
      )}

      <h3>Existing Events</h3>
      <ul className="event-list">
        {events.map((event) => (
          <li key={event.id} className="event-item">
            <div className="event-details">
              <strong>{event.title}</strong>
              <p>{event.description}</p>
              <p>Location: {event.location}</p>
              {event.date && (
                <p>Date: {new Date(event.date).toLocaleDateString()}</p>
              )}
              {event.startTime && (
                <p>
                  Time: {event.startTime} - {event.endTime}
                </p>
              )}
            </div>
            <div className="event-actions">
              {user?.role === "staff" ? (
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(event.id)}
                >
                  Delete
                </button>
              ) : (
                user && (
                  <button
                    className={`register-btn ${
                      registrationStatus[event.id] === "registered"
                        ? "registered"
                        : ""
                    }`}
                    onClick={() => handleRegister(event.id)}
                    disabled={registrationStatus[event.id] === "registered"}
                  >
                    {registrationStatus[event.id] === "registered"
                      ? "Registered"
                      : "Register"}
                  </button>
                )
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
