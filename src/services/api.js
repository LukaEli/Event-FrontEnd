import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Users API calls
export const fetchUsers = () => {
  return api.get("/users").then((response) => response.data);
};

export const createUser = (userData) => {
  return api.post("/users", userData).then((response) => response.data);
};

export const deleteUser = (userId) => {
  return api.delete(`/users/${userId}`).then((response) => response.data);
};

// Events API calls
export const fetchEvents = (eventId) => {
  if (eventId) {
    return api.get(`/events/${eventId}`).then((response) => response.data);
  }
  return api.get("/events").then((response) => response.data);
};

export const createEvent = (eventData) => {
  return api.post("/events", eventData).then((response) => response.data);
};

export const updateEvent = (eventId, eventData) => {
  return api
    .put(`/events/${eventId}`, eventData)
    .then((response) => response.data);
};

export const deleteEvent = (eventId) => {
  return api.delete(`/events/${eventId}`).then((response) => response.data);
};

// Event Registrations API calls
export const fetchRegistrations = () => {
  return api.get("/event-registrations").then((response) => response.data);
};

export const registerForEvent = (registrationData) => {
  return api
    .post("/event-registrations", registrationData)
    .then((response) => response.data);
};

export const deleteRegistration = (registrationId) => {
  return api
    .delete(`/event-registrations/${registrationId}`)
    .then((response) => response.data);
};

// Tokens API calls
export const getUserToken = (userId) => {
  return api.get(`/tokens/${userId}`).then((response) => response.data);
};

export const saveToken = (tokenData) => {
  return api.post("/tokens", tokenData).then((response) => response.data);
};

// Auth API calls
export const registerUser = (userData) => {
  return api
    .post("/users", {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role || "user",
    })
    .then((response) => response.data);
};

export const loginUser = (credentials) => {
  return api
    .post("/auth/login", {
      email: credentials.email,
      password: credentials.password,
    })
    .then((response) => response.data);
};

export const getCurrentUser = () => {
  return api.get("/auth/me").then((response) => response.data);
};

export default api;
