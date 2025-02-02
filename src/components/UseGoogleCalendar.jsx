import { useState, useEffect } from "react";

const useGoogleCalendar = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadGoogleAPI = async () => {
      try {
        // Load Google API and Identity Services scripts
        await Promise.all([
          new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://apis.google.com/js/api.js";
            script.async = true;
            script.defer = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          }),
          new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://accounts.google.com/gsi/client";
            script.async = true;
            script.defer = true;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          }),
        ]);

        // Initialize GAPI client
        await new Promise((resolve) => {
          window.gapi.load("client", resolve);
        });

        // Initialize client with new method
        await window.gapi.client.init({
          apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
          discoveryDocs: [
            "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
          ],
        });

        // Configure Google Identity Services
        if (window.google) {
          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
          });
        }

        setIsInitialized(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Google Calendar API initialization error:", error);
        setIsLoading(false);
        setIsInitialized(false);
      }
    };

    loadGoogleAPI();
  }, []);

  // Callback for handling Google Sign-In credentials
  const handleCredentialResponse = (response) => {
    console.log("Encoded JWT ID token:", response.credential);
    // You can send this token to your backend for verification if needed
  };

  // Method to trigger Google Sign-In
  const signIn = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    }
  };

  // Method to add event to calendar
  const addToCalendar = async (event) => {
    if (!isInitialized) {
      throw new Error("Google Calendar API not initialized");
    }

    try {
      // Ensure user is signed in (you might want to add a more robust sign-in check)
      const startDateTime =
        event.date && event.startTime
          ? new Date(`${event.date}T${event.startTime}:00`)
          : new Date();

      const endDateTime =
        event.date && event.endTime
          ? new Date(`${event.date}T${event.endTime}:00`)
          : new Date(startDateTime.getTime() + 60 * 60 * 1000); // Default 1 hour event

      const calendarEvent = {
        summary: event.title || "Untitled Event",
        location: event.location || "",
        description: event.description || "",
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      };

      // Insert the event
      const response = await window.gapi.client.calendar.events.insert({
        calendarId: "primary",
        resource: calendarEvent,
      });

      return response;
    } catch (error) {
      console.error("Error adding event to Google Calendar:", error);
      throw error;
    }
  };

  return {
    isLoading,
    isInitialized,
    signIn,
    addToCalendar,
  };
};

export default useGoogleCalendar;
