const configuredApiUrl = import.meta.env.VITE_API_URL;

export const API_BASE_URL = (
  configuredApiUrl ||
  (import.meta.env.DEV ? "http://localhost:5000" : "https://echo-6piz.onrender.com")
).replace(/\/$/, "");