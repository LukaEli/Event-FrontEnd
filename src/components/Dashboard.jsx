import React, { useState, useEffect } from "react";
import {
  fetchEvents,
  fetchRegistrations,
  unregisterForEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../services/api";
import CustomCalendar from "./CustomCalendar";
import "./Dashboard.css";

const Dashboard = ({ user, toggleModal, isModalOpen }) => {
  // State management
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [registrationStatus, setRegistrationStatus] = useState({});
  const [registrationIDs, setRegistrationIDs] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    startTime: "",
    endTime: "",
  });

  // Fetch user events on component mount or user change
  useEffect(() => {
    const fetchUserEvents = async () => {
      if (!user) {
        setRegisteredEvents([]);
        setAllEvents([]);
        setRegistrationStatus({});
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Fetch all registrations
        const registrationsData = await fetchRegistrations();

        // Filter registrations for current user
        const userRegistrations = registrationsData.registrations.filter(
          (reg) => reg.user_id === user.id
        );

        // Create registration status and IDs objects
        const newRegistrationStatus = {};
        const newRegistrationIDs = {};
        userRegistrations.forEach((reg) => {
          newRegistrationStatus[reg.event_id] = "registered";
          newRegistrationIDs[reg.event_id] = reg.id;
        });

        // Fetch all events
        const eventsResponse = await fetchEvents();
        const allEvents = eventsResponse.data;

        // Filter events to only include registered events
        const userEvents = allEvents.filter((event) =>
          userRegistrations.some((reg) => reg.event_id === event.id)
        );

        setRegisteredEvents(userEvents);
        setAllEvents(allEvents);
        setRegistrationStatus(newRegistrationStatus);
        setRegistrationIDs(newRegistrationIDs);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching events:", error);
        setError("Failed to load events");
        setIsLoading(false);
      }
    };

    fetchUserEvents();
  }, [user]);

  // Handle unregistering from an event
  const handleUnregister = async (eventId) => {
    try {
      // Retrieve the registration ID for the event
      const registrationId = registrationIDs[eventId];

      if (!registrationId) {
        alert("No registration found for this event!");
        return;
      }

      await unregisterForEvent(registrationId);

      // Remove the event from registered events
      const updatedEvents = registeredEvents.filter(
        (event) => event.id !== eventId
      );
      setRegisteredEvents(updatedEvents);

      // Update registration status
      const newRegistrationStatus = { ...registrationStatus };
      delete newRegistrationStatus[eventId];
      setRegistrationStatus(newRegistrationStatus);

      // Update registration IDs
      const newRegistrationIDs = { ...registrationIDs };
      delete newRegistrationIDs[eventId];
      setRegistrationIDs(newRegistrationIDs);

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

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle event creation submission
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
      const newEvent = await createEvent(eventData);

      // Update all events list
      setAllEvents([...allEvents, newEvent]);

      // Reset form
      setFormData({
        title: "",
        description: "",
        location: "",
        date: "",
        startTime: "",
        endTime: "",
      });

      alert("Event created successfully!");
    } catch (error) {
      console.error("Error creating event:", error);
      const errorMessage =
        error.response?.data?.error || error.message || "Error creating event";
      alert(errorMessage);
    }
  };

  // Handle event deletion
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

      // Remove the event from all events list
      const updatedAllEvents = allEvents.filter(
        (event) => event.id !== eventId
      );
      setAllEvents(updatedAllEvents);

      // Remove from registered events if it exists there
      const updatedRegisteredEvents = registeredEvents.filter(
        (event) => event.id !== eventId
      );
      setRegisteredEvents(updatedRegisteredEvents);

      alert("Event deleted successfully!");
    } catch (error) {
      console.error("Error deleting event:", error);
      const errorMessage =
        error.response?.data?.error || error.message || "Error deleting event";
      alert(errorMessage);
    }
  };

  // Handle editing an event
  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title || "",
      description: event.description || "",
      location: event.location || "",
      date: event.date ? new Date(event.date).toISOString().split("T")[0] : "",
      startTime: event.start_time || "",
      endTime: event.end_time || "",
    });
  };

  // Handle update event submission
  const handleUpdateEvent = async (e) => {
    e.preventDefault();

    if (!user || user.role !== "staff") {
      alert("Only staff members can edit events!");
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
      title: formData.title,
      description: formData.description,
      location: formData.location,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      created_by: user.id,
      role: user.role,
    };

    try {
      const updatedEvent = await updateEvent(editingEvent.id, eventData);

      console.log("Updated Event:", updatedEvent);
      console.log("Current All Events:", allEvents);
      console.log("Current Registered Events:", registeredEvents);

      // Update all events list
      setAllEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === updatedEvent.id ? updatedEvent : event
        )
      );

      // Update registered events if needed
      setRegisteredEvents((prevRegisteredEvents) =>
        prevRegisteredEvents.map((event) =>
          event.id === updatedEvent.id ? updatedEvent : event
        )
      );

      // Reset editing state
      setEditingEvent(null);
      setFormData({
        title: "",
        description: "",
        location: "",
        date: "",
        startTime: "",
        endTime: "",
      });

      alert("Event updated successfully!");

      // Refresh the page
      window.location.reload();
    } catch (error) {
      console.error("Error updating event:", error);
      const errorMessage =
        error.response?.data?.error || error.message || "Error updating event";
      alert(errorMessage);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingEvent(null);
    setFormData({
      title: "",
      description: "",
      location: "",
      date: "",
      startTime: "",
      endTime: "",
    });
  };

  // Render loading or error states
  if (!user) {
    return <div>Please log in to view your dashboard.</div>;
  }

  if (isLoading) {
    return <div>Loading events...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>

      {/* Custom Calendar View for Registered Events */}
      <CustomCalendar
        events={registeredEvents}
        registrationStatus={registrationStatus}
      />

      <h3>My Registered Events</h3>
      {registeredEvents.length === 0 ? (
        <p>You have not registered for any events.</p>
      ) : (
        <ul className="event-list">
          {registeredEvents.map((event) => (
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
                <button
                  className="unregister-btn"
                  onClick={() => handleUnregister(event.id)}
                >
                  Unregister
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Staff Event Management */}
      {user?.role === "staff" && (
        <>
          <h3>All Events</h3>
          {editingEvent ? (
            <form onSubmit={handleUpdateEvent} className="event-edit-form">
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Event Title"
                required
              />
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Event Description"
                required
              />
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Location"
                required
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
              <div className="form-actions">
                <button type="submit" className="update-btn">
                  Update Event
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <ul className="event-list">
              {allEvents.map((event) => (
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
                    <button
                      className="edit-btn"
                      onClick={() => handleEditEvent(event)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(event.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
