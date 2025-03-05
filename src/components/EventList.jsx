import React, { useState, useEffect } from "react";
import { fetchEvents } from "../services/api";
import "./Navbar.css"; // Import the CSS file

const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleSearch = () => {
    const filteredEvents = events.filter((event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setEvents(filteredEvents);
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
      <div>
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
