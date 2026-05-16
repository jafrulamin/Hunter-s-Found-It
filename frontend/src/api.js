// api.js
// helper for talking to the backend.
// We keep one function: apiFetch(url, options).
// It adds the JWT token (if we have one) and parses the JSON response.

// In development this is empty so the Vite proxy forwards "/api/..." to
// http://localhost:5000. In production we set VITE_API_URL to the full
// backend URL (for example, https://hunters-foundit-backend.onrender.com).
const BASE_URL = import.meta.env.VITE_API_URL || "";

async function apiFetch(url, options) {
  // options is optional, so default it to an empty object
  if (!options) options = {};

  // Read the saved JWT token (set when the user logs in)
  const token = localStorage.getItem("token");

  // Build the headers
  const headers = {
    "Content-Type": "application/json",
  };
  if (options.headers) {
    Object.assign(headers, options.headers);
  }
  if (token) {
    headers["Authorization"] = "Bearer " + token;
  }

  // Make the request
  const response = await fetch(BASE_URL + url, {
    ...options,
    headers: headers,
  });

  // Try to parse the body as JSON. If the server doesn't send JSON we still
  // want a friendly error.
  let data = null;
  try {
    data = await response.json();
  } catch (e) {
    data = null;
  }

  if (!response.ok) {
    const msg = (data && data.message) || "Something went wrong";
    throw new Error(msg);
  }

  return data;
}

export default apiFetch;
