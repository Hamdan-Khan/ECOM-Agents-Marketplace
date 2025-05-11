// API service for backend communication

import { useAuth } from "@/hooks/use-auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"; // Update as needed

function getAuthHeaders(): Record<string, string> {
  // Get token from localStorage directly since we can't use hooks in a non-React context
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (token) {
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

function extractErrorMessage(error: any): string {
  if (!error) return "Unknown error";
  if (typeof error === "string") return error;
  if (error.message) return error.message;
  if (error.error) return error.error;
  return JSON.stringify(error);
}

async function handleResponse<T>(res: Response): Promise<T> {
  // If response status is 204 (No Content), return null as the response
  if (res.status === 204) {
    return null as T;
  }

  // For DELETE requests that are successful, return null
  if (res.status === 200 && res.headers.get('content-length') === '0') {
    return null as T;
  }

  // Check if there's any content to parse
  const contentType = res.headers.get('content-type');
  let data;

  if (contentType && contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch (e) {
      console.warn('Failed to parse JSON response:', e);
      data = null;
    }
  } else {
    try {
      data = await res.text();
      // Try to parse text as JSON in case content-type is incorrect
      if (data) {
        try {
          data = JSON.parse(data);
        } catch {
          // Keep as text if not JSON
        }
      }
    } catch (e) {
      console.warn('Failed to read response text:', e);
      data = null;
    }
  }

  if (!res.ok) {
    // Handle auth errors
    if (res.status === 401) {
      // Clear auth state
      useAuth.getState().logout();
      throw {
        message: "Session expired. Please login again.",
        status: res.status,
        data,
      };
    }

    // Handle API error structure
    const errorMessage = data && typeof data === 'object' ? 
      data.message || data.error || 'Unknown error' :
      data || 'Unknown error';

    throw {
      message: errorMessage,
      status: res.status,
      data: data
    };
  }
  
  return data;
}

export async function apiGet<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      method: "GET",
      headers,
      mode: "cors",
    });

    return handleResponse<T>(res);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Failed to fetch data");
  }
}

export async function apiPost<T>(
  path: string,
  body: any,
  options: RequestInit = {}
): Promise<T> {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      method: options.method || "POST",
      headers,
      body: JSON.stringify(body),
      mode: "cors",
    });

    return handleResponse<T>(res);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Failed to send data");
  }
}

export async function apiDelete<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      method: "DELETE",
      headers,
      mode: "cors",
    });

    return handleResponse<T>(res);
  } catch (error: any) {
    // If it's already our custom error structure, rethrow it
    if (error.status && error.message) {
      throw error;
    }
    // Otherwise wrap it in our error structure
    if (error instanceof Error) {
      throw {
        message: error.message,
        status: 500,
        data: null
      };
    }
    throw {
      message: "Failed to delete data",
      status: 500,
      data: null
    };
  }
}

export async function apiPut<T>(
  path: string,
  body: any,
  options: RequestInit = {}
): Promise<T> {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      method: "PUT",
      headers,
      body: JSON.stringify(body),
      mode: "cors",
    });

    return handleResponse<T>(res);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Failed to update data");
  }
}

export async function apiPatch<T>(
  path: string,
  body: any,
  options: RequestInit = {}
): Promise<T> {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      method: "PATCH",
      headers,
      body: JSON.stringify(body),
      mode: "cors",
    });

    return handleResponse<T>(res);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Failed to update data");
  }
}
