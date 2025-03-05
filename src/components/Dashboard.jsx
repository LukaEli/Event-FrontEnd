import { useState, useEffect } from "react";
import {
  fetchEvents,
  createEvent,
  deleteEvent,
  registerForEvent,
  fetchRegistrations,
  unregisterForEvent,
} from "../services/api";
import CustomCalendar from "./CustomCalendar";
import "./Dashboard.css";

const Dashboard = ({ user }) => {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    startTime: "",
    endTime: "",
  });

  // Initialize registrationStatus from localStorage
  const [registrationStatus, setRegistrationStatus] = useState(() => {
    const savedStatus = localStorage.getItem("registrationStatus");
    return savedStatus ? JSON.parse(savedStatus) : {};
  });

  const [registrationIDs, setRegistrationIDs] = useState(() => {
    const savedRegistrations = localStorage.getItem("registrationIDs");
    return savedRegistrations ? JSON.parse(savedRegistrations) : {};
  });

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch events
        const eventsData = await fetchEvents();

        setEvents(eventsData.data);

        // If we have a user, fetch registrations
        if (user && user.id) {
          // Fetch all registrations
          const registrationsData = await fetchRegistrations();

          // Filter registrations for current user
          const userRegistrations = registrationsData.registrations.filter(
            (reg) => reg.user_id === user.id
          );

          // Create registration status object
          const newRegistrationStatus = {};
          userRegistrations.forEach((reg) => {
            newRegistrationStatus[reg.event_id] = "registered";
          });

          const registrationIDs = {};
          userRegistrations.forEach((reg) => {
            registrationIDs[reg.event_id] = reg.id;
          });
          // Update state and localStorage
          setRegistrationStatus(newRegistrationStatus);
          localStorage.setItem(
            "registrationStatus",
            JSON.stringify(newRegistrationStatus)
          );

          setRegistrationIDs(registrationIDs);
          localStorage.setItem(
            "registrationIDs",
            JSON.stringify(registrationIDs)
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchAllData();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || user.role !== "staff") {
      alert("Only staff members can create events!");
      return;
    }

    const convertTimeToMinutes = (timeString) => {
      if (!timeString) return 0;
      const [hours, minutes] = timeString.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const { startTime, endTime } = formData;
    const startMinutes = convertTimeToMinutes(startTime);
    const endMinutes = convertTimeToMinutes(endTime);

    // Check if end time is earlier than or equal to start time
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
      const newEvent = await createEvent(eventData);
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

      // Also remove from registration status
      const newRegistrationStatus = { ...registrationStatus };
      delete newRegistrationStatus[eventId];
      setRegistrationStatus(newRegistrationStatus);
      localStorage.setItem(
        "registrationStatus",
        JSON.stringify(newRegistrationStatus)
      );
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
      if (registrationStatus[eventId] === "registered") {
        alert("You are already registered for this event!");
        return;
      }

      const registrationData = {
        user_id: user.id,
        event_id: eventId,
      };

      await registerForEvent(registrationData);

      // Update registration status in state and localStorage
      const newRegistrationStatus = {
        ...registrationStatus,
        [eventId]: "registered",
      };
      setRegistrationStatus(newRegistrationStatus);
      localStorage.setItem(
        "registrationStatus",
        JSON.stringify(newRegistrationStatus)
      );

      alert("Successfully registered for the event!");
    } catch (error) {
      console.error("Error registering for event:", error);
      if (error.response?.data?.error?.includes("UNIQUE constraint failed")) {
        alert("You are already registered for this event!");
        const newRegistrationStatus = {
          ...registrationStatus,
          [eventId]: "registered",
        };
        setRegistrationStatus(newRegistrationStatus);
        localStorage.setItem(
          "registrationStatus",
          JSON.stringify(newRegistrationStatus)
        );
      } else {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Error registering for event";
        alert(errorMessage);
      }
    }
  };

  const handleUnregister = async (eventId) => {
    if (!user) {
      alert("Please log in to unregister from events!");
      return;
    }

    try {
      // Retrieve the registration ID for the event
      const registrationId = registrationIDs[eventId];

      if (!registrationId) {
        alert("No registration found for this event!");
        return;
      }

      await unregisterForEvent(registrationId); // Pass the registration ID

      // Update registration status in state and localStorage
      const newRegistrationStatus = {
        ...registrationStatus,
        [eventId]: null, // Clear the registration status
      };
      setRegistrationStatus(newRegistrationStatus);
      localStorage.setItem(
        "registrationStatus",
        JSON.stringify(newRegistrationStatus)
      );

      alert("Successfully unregistered from the event!");
    } catch (error) {
      console.error("Error unregistering from event:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Error unregistering from event";
      alert(errorMessage);
    }
  };

  // Add this function to format the date and time
  const formatDateTime = (date, time) => {
    if (date === null || time === null) {
      return "";
    }

    // Extract the date components
    const dateObj = new Date(date);
    const year = dateObj.getUTCFullYear();
    const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0"); // Months are zero-based
    const day = String(dateObj.getUTCDate()).padStart(2, "0");

    // Extract the time components
    const [hours, minutes] = time.split(":");

    return `${year}${month}${day}T${hours}${minutes}00`; // Format: YYYYMMDDTHHMMSS
  };

  return (
    <div className="dashboard-container">
      <h2>Event Dashboard</h2>

      {/* Custom Calendar View */}
      <CustomCalendar events={events} registrationStatus={registrationStatus} />

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
              {event.start_time && (
                <p>
                  Time: {event.start_time} - {event.end_time}
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
                  <>
                    {registrationStatus[event.id] === "registered" ? (
                      <button
                        className="unregister-btn"
                        onClick={() => handleUnregister(event.id)}
                      >
                        Unregister
                      </button>
                    ) : (
                      <button
                        className={`register-btn ${
                          registrationStatus[event.id] === "registered"
                            ? "registered"
                            : ""
                        }`}
                        onClick={() => handleRegister(event.id)}
                        disabled={registrationStatus[event.id] === "registered"}
                      >
                        Register
                      </button>
                    )}
                    <a
                      href={`https://calendar.google.com/calendar/r/eventedit?text=${encodeURIComponent(
                        event.title
                      )}&dates=${formatDateTime(
                        event.date,
                        event.start_time
                      )}/${formatDateTime(
                        event.date,
                        event.end_time
                      )}&details=${encodeURIComponent(
                        event.description
                      )}&location=${encodeURIComponent(event.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <button className="add-to-calendar-btn">
                        Add to Google Calendar
                      </button>
                    </a>
                  </>
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

// Existing Events, ar unda iyos dashboardshi amis magivrad unda iyos registered events da marto unda achvenebdes daregistrirebul eventebs , witeli button unregister---it da rom daacherr magas unda krebodes makedan

// registracia eventebze unda xdebodes event hubze da unda iyos marto green button register da rom daacher unda chndebodes dashboardze
