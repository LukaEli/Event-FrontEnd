import React, { useState, useEffect } from "react";
import { fetchEvents } from "../services/api";

const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoading(true);
        const response = await fetchEvents();
        setEvents(response.data || response);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load events");
        setIsLoading(false);
      }
    };

    loadEvents();
  }, []);

  if (isLoading) {
    return <div>Loading events...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="events-container">
      <h1>Upcoming Events</h1>
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
                    Time: {event.startTime} - {event.endTime}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default EventsList;
