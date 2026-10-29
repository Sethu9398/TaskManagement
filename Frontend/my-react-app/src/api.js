import axios from "axios";

// Relative by default: requests go to the Vite dev proxy (see vite.config.js),
// so the auth cookie is set on the app's own origin and is sent back on every
// later request, including after a refresh or route change.
// Override with VITE_API_BASE_URL when the API is served from elsewhere.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export default api;
