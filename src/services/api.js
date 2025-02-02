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
  const userRole = localStorage.getItem("role") || eventData.role;
  const token = localStorage.getItem("token");

  if (!userRole) {
    throw new Error("Authentication required - No role found");
  }

  return api
    .post(
      "/events",
      { ...eventData, role: userRole },
      {
        headers: {
          Authorization: `Bearer ${token || "dummy-token"}`,
          "X-User-Role": userRole,
        },
      }
    )
    .then((response) => response.data);
};

export const updateEvent = (eventId, eventData) => {
  return api
    .put(`/events/${eventId}`, eventData)
    .then((response) => response.data);
};

export const deleteEvent = (eventId) => {
  const userRole = localStorage.getItem("role");
  const token = localStorage.getItem("token") || "dummy-token";

  if (!userRole) {
    throw new Error("Authentication required - No role found");
  }

  return api
    .delete(`/events/${eventId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-User-Role": userRole,
      },
      data: { role: userRole },
    })
    .then((response) => response.data);
};
// Event Registrations API calls
export const fetchRegistrations = () => {
  return api.get("/event-registrations").then((response) => response.data);
};

export const registerForEvent = (registrationData) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  return api
    .post("/event-registrations", registrationData, {
      headers: {
        Authorization: `Bearer ${token || "dummy-token"}`,
        "X-User-Role": userRole,
      },
    })
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
    .post("users", {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role || "user",
    })
    .then((response) => response.data);
};

export const loginUser = async (credentials) => {
  try {
    // Get all users
    const response = await api.get("/users");

    const user = response.data.data.find(
      (user) =>
        user.email === credentials.email &&
        user.password === credentials.password
    );

    if (!user) {
      throw new Error("Invalid credentials");
    }

    return {
      user,
    };
  } catch (error) {
    throw new Error("Login failed: " + error.message);
  }
};

export const getCurrentUser = () => {
  return api.get("/users/me").then((response) => response.data);
};

export default api;
