import React, { useState, useEffect } from "react";
import {
  fetchEvents,
  registerForEvent,
  unregisterForEvent,
  fetchRegistrations,
} from "../services/api";
import "./Navbar.css";

const EventsList = ({ user, toggleModal, isModalOpen }) => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

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
    const loadEvents = async () => {
      try {
        setIsLoading(true);
        const response = await fetchEvents();
        const eventsData = response.data || response;
        setEvents(eventsData);

        // If user is logged in, fetch registrations
        if (user && user.id) {
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

        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load events");
        setIsLoading(false);
      }
    };

    loadEvents();
  }, [user]);

  const handleSearch = async () => {
    try {
      // Fetch the original events again
      const response = await fetchEvents();
      const eventsData = response.data || response;

      // Filter the events based on the search query
      const filteredEvents = eventsData.filter((event) =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase())
      );

      // Update the events state with filtered results
      setEvents(filteredEvents);
    } catch (err) {
      console.error("Error searching events:", err);
      alert("Failed to search events");
    }
  };

  // Format date and time for Google Calendar
  const formatDateTime = (date, time) => {
    if (date === null || time === null) {
      return "";
    }

    // Extract the date components
    const dateObj = new Date(date);
    const year = dateObj.getUTCFullYear();
    const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getUTCDate()).padStart(2, "0");

    // Extract the time components
    const [hours, minutes] = time.split(":");

    return `${year}${month}${day}T${hours}${minutes}00`;
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

      const registrationResponse = await registerForEvent(registrationData);

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

      const newRegistrationIDs = {
        ...registrationIDs,
        [eventId]: registrationResponse.registrationId, // Assuming the response contains the registration ID
      };

      setRegistrationIDs(newRegistrationIDs);
      localStorage.setItem(
        "registrationIDs",
        JSON.stringify(newRegistrationIDs)
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
      if (registrationStatus[eventId] !== "registered") {
        alert("You are not registered for this event!");
        return;
      }

      const registrationResponse = await unregisterForEvent(
        registrationIDs[eventId]
      );

      // Update registration status in state and localStorage
      const newRegistrationStatus = {
        ...registrationStatus,
        [eventId]: "unregistered",
      };
      setRegistrationStatus(newRegistrationStatus);
      localStorage.setItem(
        "registrationStatus",
        JSON.stringify(newRegistrationStatus)
      );

      // Remove the registration ID
      const newRegistrationIDs = {
        ...registrationIDs,
        [eventId]: undefined,
      };
      setRegistrationIDs(newRegistrationIDs);
      localStorage.setItem(
        "registrationIDs",
        JSON.stringify(newRegistrationIDs)
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

  if (isLoading) {
    return <div>Loading events...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="events-container">
      <h1>Upcoming Events</h1>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search events..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {events.length === 0 ? (
        <p>No events available</p>
      ) : (
        <ul className="events-list">
          {events.map((event) => (
            <li key={event.id} className="event-item">
              <div className="event-details">
                <h2>{event.title}</h2>
                <p>{event.description}</p>
                <div className="event-meta">
                  <span>Location: {event.location || "Not specified"}</span>
                  <span>Date: {new Date(event.date).toLocaleDateString()}</span>
                  <span>
                    Time: {event.start_time} - {event.end_time}
                  </span>
                </div>
              </div>
              {user && (
                <div className="event-actions">
                  {registrationStatus[event.id] !== "registered" ? (
                    <button
                      className="register-btn"
                      onClick={() => handleRegister(event.id)}
                    >
                      Register
                    </button>
                  ) : (
                    <>
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
                      <button
                        className="unregister-btn"
                        onClick={() => handleUnregister(event.id)}
                      >
                        Unregister
                      </button>
                    </>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EventsList;

//padding daumate searchis me event cardshi, kvemot
// rom daacher cards daaamte add to google calendar button da remove google calendar (states refresh gaukete rom egreve gichvenos ganaxleba)
