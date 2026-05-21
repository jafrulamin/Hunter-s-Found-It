const BASE_URL = import.meta.env.VITE_API_URL || "";

async function apiFetch(url, options) {
  if (!options) options = {};

  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
  };
  if (options.headers) {
    Object.assign(headers, options.headers);
  }
  if (token) {
    headers["Authorization"] = "Bearer " + token;
  }

  const response = await fetch(BASE_URL + url, {
    ...options,
    headers: headers,
  });

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
