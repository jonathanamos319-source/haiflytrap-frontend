import axios from 'axios';


// Get the base URL from the environment, defaulting to localhost if not set
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

/**
 * Centralized API client configured with the base URL.
 * Auth token is pulled from the active Supabase session on every request.
 */
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Supabase session JWT automatically on every protected request
api.interceptors.request.use(async (config) => {
  const path = window.location.pathname;
  let session = null;
  const tempAdminToken = localStorage.getItem('temp_admin_token');

  // Import role-specific clients
  const { supabaseAdmin, supabaseHandler, supabaseUser } = await import('@/lib/supabase');

  if (path.startsWith('/admin') || path.startsWith('/marketers') || path.includes('admin')) {
    if (tempAdminToken && config.headers) {
      config.headers.Authorization = `Bearer ${tempAdminToken}`;
      return config;
    }

    const { data } = await supabaseAdmin.auth.getSession();
    session = data.session;
  } else if (path.startsWith('/handler')) {
    const { data } = await supabaseHandler.auth.getSession();
    session = data.session;
  } else {
    const { data } = await supabaseUser.auth.getSession();
    session = data.session;
  }

  const token = session?.access_token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


// Global error handler – on 401 sign out via Supabase
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const path = window.location.pathname;
      const tempAdminToken = localStorage.getItem('temp_admin_token');
      const { supabaseAdmin, supabaseHandler, supabaseUser } = await import('@/lib/supabase');
      
      if (path.startsWith('/admin') || path.startsWith('/marketers') || path.includes('admin')) {
        if (tempAdminToken) {
          return Promise.reject(error);
        }
        await supabaseAdmin.auth.signOut();
      } else if (path.startsWith('/handler')) {
        await supabaseHandler.auth.signOut();
      } else {
        await supabaseUser.auth.signOut();
      }
    }
    return Promise.reject(error);
  }
);


export default api;
