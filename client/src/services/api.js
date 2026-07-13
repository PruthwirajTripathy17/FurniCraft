const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function apiRequest(path, options = {}) {
  const isAdminRoute = typeof window !== "undefined" && window.location.pathname.startsWith("/admin");
  const token = isAdminRoute
    ? localStorage.getItem("adminToken")
    : (localStorage.getItem("token") || localStorage.getItem("adminToken"));

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}
