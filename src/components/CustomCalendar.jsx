import React, { useState } from "react";
import "./Calendar.css";

const CustomCalendar = ({ events = [], registrationStatus = {} }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);

  const getMonthDays = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    const firstDayOfWeek = firstDay.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      const prevDate = new Date(year, month, -i);
      days.unshift({ date: prevDate, isPadding: true });
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isPadding: false });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isPadding: true });
    }

    return days;
  };

  const isSameDay = (date1, date2) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const getEventsForDay = (day) => {
    if (!Array.isArray(events)) return [];

    // Filter for registered events only
    const registeredEvents = events.filter(
      (event) =>
        event && event.id && registrationStatus[event.id] === "registered"
    );

    return registeredEvents.filter((event) => {
      if (!event || !event.date) return false;

      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === day.getDate() &&
        eventDate.getMonth() === day.getMonth() &&
        eventDate.getFullYear() === day.getFullYear()
      );
    });
  };

  const formatDate = (date) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const handleEventClick = (event) => {
    setSelectedEvent(selectedEvent?.id === event.id ? null : event);
  };

  const closeEventDetails = () => {
    setSelectedEvent(null);
  };

  const days = getMonthDays(currentDate.getFullYear(), currentDate.getMonth());
  const today = new Date();

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={prevMonth} className="calendar-nav-button">
          Previous
        </button>
        <h2 className="calendar-title">
          My Registered Events - {formatDate(currentDate)}
        </h2>
        <button onClick={nextMonth} className="calendar-nav-button">
          Next
        </button>
      </div>

      <div className="calendar-grid">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}

        {days.map((day, index) => {
          const dayEvents = getEventsForDay(day.date);
          const isToday = isSameDay(day.date, today);
          const maxVisibleEvents = window.innerWidth <= 768 ? 2 : 3;

          return (
            <div
              key={index}
              className={`calendar-day ${day.isPadding ? "padding-day" : ""} ${
                isToday ? "today" : ""
              }`}
            >
              <div className="day-number">{day.date.getDate()}</div>
              <div className="event-list">
                {dayEvents.slice(0, maxVisibleEvents).map((event) => (
                  <div
                    key={
                      event.id ||
                      `${event.title}-${event.date}-${event.startTime}`
                    }
                    className={`calendar-event ${
                      selectedEvent?.id === event.id ? "selected-event" : ""
                    }`}
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="event-title">
                      {event.title || "Untitled"}
                    </div>
                    {event.description && (
                      <div className="event-preview">
                        {event.description.length > 30
                          ? `${event.description.substring(0, 30)}...`
                          : event.description}
                      </div>
                    )}
                    <div className="event-tooltip">
                      <strong>{event.title || "Untitled"}</strong>
                      {event.location && <div>Location: {event.location}</div>}
                      {event.startTime && (
                        <div>
                          Time: {event.startTime} - {event.endTime}
                        </div>
                      )}
                      {event.description && <div>{event.description}</div>}
                    </div>
                  </div>
                ))}
                {dayEvents.length > maxVisibleEvents && (
                  <div className="more-events">
                    +{dayEvents.length - maxVisibleEvents} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedEvent && (
        <div className="event-details-modal">
          <div className="event-details-content">
            <div className="event-details-header">
              <h3>{selectedEvent.title || "Untitled Event"}</h3>
              <button onClick={closeEventDetails} className="close-button">
                ×
              </button>
            </div>
            <div className="event-details-body">
              {selectedEvent.location && (
                <div className="detail-row">
                  <strong>Location:</strong> {selectedEvent.location}
                </div>
              )}
              {selectedEvent.startTime && (
                <div className="detail-row">
                  <strong>Time:</strong> {selectedEvent.startTime} -{" "}
                  {selectedEvent.endTime}
                </div>
              )}
              {selectedEvent.date && (
                <div className="detail-row">
                  <strong>Date:</strong>{" "}
                  {new Date(selectedEvent.date).toLocaleDateString()}
                </div>
              )}
              {selectedEvent.description && (
                <div className="detail-row description">
                  <strong>Description:</strong>
                  <div className="description-text">
                    {selectedEvent.description}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomCalendar;
