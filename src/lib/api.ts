import axios from 'axios';

// Consistent fallback: localhost in dev, production URL in production (no ports)
export const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:3001/api/v1' : 'https://api.haiflytrapng.com/api/v1');

/**
 * Centralized API client configured with httpOnly cookie credentials.
 * Cookies (admin_token, handler_token, user_token) are handled automatically by the browser.
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach role hint header based on the active path so backend knows which session cookie to prioritize
api.interceptors.request.use((config) => {
  const path = window.location.pathname;
  if (path.startsWith('/admin') || path.startsWith('/marketers') || path.includes('admin')) {
    config.headers['X-Auth-Role'] = 'admin';
  } else if (path.startsWith('/handler')) {
    config.headers['X-Auth-Role'] = 'handler';
  } else {
    config.headers['X-Auth-Role'] = 'customer';
  }
  return config;
});

export default api;
