import axios from 'axios'
import { useAuthStore } from '@/stores/auth-store'

/**
 * Base URL for the tourism API.
 * - Development: leave `VITE_API_URL` empty to use the Vite proxy (`/api` → backend).
 * - Production: set `VITE_API_URL` to your API origin (e.g. https://api.example.com).
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().auth.accessToken
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
