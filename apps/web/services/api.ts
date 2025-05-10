// API service for backend communication

const API_BASE_URL = process.env.PUBLIC_API_URL || "http://localhost:3000"; // Update as needed

function getAuthHeaders(): Record<string, string> {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  }
  return {};
}

function extractErrorMessage(error: any): string {
  if (!error) return "Unknown error";
  if (typeof error === "string") return error;
  if (error.message) return error.message;
  if (error.error) return error.error;
  return JSON.stringify(error);
}

async function handleResponse<T>(res: Response): Promise<T> {
  let data;
  try {
    data = await res.json();
  } catch {
    data = await res.text();
  }
  if (!res.ok) {
    const message =
      data?.message ||
      data?.error ||
      (typeof data === "string" ? data : "Unknown error");
    throw { message, status: res.status, data };
  }
  return data;
}

export async function apiGet<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
    ...((options.headers as Record<string, string>) || {}),
  };
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    method: "GET",
    headers,
  });
  if (res.status === 401) {
    // Clear auth and redirect to login
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Unauthorized. Please log in again.");
  }
  if (res.status === 403) {
    // Show not authorized toast or redirect
    if (typeof window !== "undefined") {
      // Optionally show a toast here
      window.location.href = "/not-authorized";
    }
    throw new Error(
      "Forbidden. You are not authorized to access this resource."
    );
  }
  return handleResponse<T>(res);
}

export async function apiPost<T>(
  path: string,
  body: any,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
    ...((options.headers as Record<string, string>) || {}),
  };
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (res.status === 401) {
    // Clear auth and redirect to login
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("Unauthorized. Please log in again.");
  }
  if (res.status === 403) {
    // Show not authorized toast or redirect
    if (typeof window !== "undefined") {
      // Optionally show a toast here
      window.location.href = "/not-authorized";
    }
    throw new Error(
      "Forbidden. You are not authorized to access this resource."
    );
  }
  return handleResponse<T>(res);
}
