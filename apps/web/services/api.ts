// API service for backend communication

import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'; // Update as needed

function getAuthHeaders(): Record<string, string> {
  // Get token from localStorage directly since we can't use hooks in a non-React context
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  
  if (token) {
    return { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }
  return { 
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
}

function extractErrorMessage(error: any): string {
  if (!error) return 'Unknown error'
  if (typeof error === 'string') return error
  if (error.message) return error.message
  if (error.error) return error.error
  return JSON.stringify(error)
}

async function handleResponse<T>(res: Response): Promise<T> {
  let data
  try {
    data = await res.json()
  } catch {
    data = await res.text()
  }

  if (!res.ok) {
    // Handle auth errors
    if (res.status === 401) {
      // Clear auth state
      useAuth.getState().logout()
      throw { message: 'Session expired. Please login again.', status: res.status, data }
    }
    
    const message = data?.message || data?.error || (typeof data === 'string' ? data : 'Unknown error')
    throw { message, status: res.status, data }
  }
  return data
}

export async function apiGet<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {}),
  }

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      method: 'GET',
      headers,
      credentials: 'include',
      mode: 'cors'
    })

    return handleResponse<T>(res)
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message)
    }
    throw new Error('Failed to fetch data')
  }
}

export async function apiPost<T>(path: string, body: any, options: RequestInit = {}): Promise<T> {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {}),
  }

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      method: options.method || 'POST',
      headers,
      body: JSON.stringify(body),
      credentials: 'include',
      mode: 'cors'
    })

    return handleResponse<T>(res)
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message)
    }
    throw new Error('Failed to send data')
  }
}

export async function apiDelete<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {}),
  }

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      method: 'DELETE',
      headers,
      credentials: 'include',
      mode: 'cors'
    })

    return handleResponse<T>(res)
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message)
    }
    throw new Error('Failed to delete data')
  }
}

export async function apiPut<T>(path: string, body: any, options: RequestInit = {}): Promise<T> {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {}),
  }

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
      credentials: 'include',
      mode: 'cors'
    })

    return handleResponse<T>(res)
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message)
    }
    throw new Error('Failed to update data')
  }
} 