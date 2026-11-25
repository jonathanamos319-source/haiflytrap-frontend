import axios from 'axios';

// Consistent fallback: localhost in dev, production URL in production (no ports)
export const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:3001/api/v1' : 'https://api.haiflytrapng.com/api/v1');

export type AuthRole = 'customer' | 'admin' | 'handler';

const TOKEN_PREFIX = 'haifly_token_';
const memoryTokenStore = new Map<string, string>();

/** Store a role-scoped auth token safely (works even when mobile third-party cookies are blocked). */
export function setAuthToken(role: string, token: string): void {
  const key = `${TOKEN_PREFIX}${role}`;
  memoryTokenStore.set(key, token);
  try {
    localStorage.setItem(key, token);
  } catch {
    // Fallback to in-memory store if storage is restricted in mobile WebView
  }
}

/** Retrieve the stored token for a specific role context. */
export function getAuthToken(role: string): string | null {
  const key = `${TOKEN_PREFIX}${role}`;
  try {
    const stored = localStorage.getItem(key);
    if (stored) return stored;
  } catch {
    // Ignore storage read restrictions
  }
  return memoryTokenStore.get(key) || null;
}

/** Clear the stored token for a specific role context (or all roles if omitted). */
export function clearAuthToken(role?: string): void {
  const roles: AuthRole[] = role ? [role as AuthRole] : ['customer', 'admin', 'handler'];
  for (const r of roles) {
    const key = `${TOKEN_PREFIX}${r}`;
    memoryTokenStore.delete(key);
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore storage write restrictions
    }
  }
}

/** Resolve the active auth role context from the request URL/method and current page path. */
export function resolveRequestRole(url = '', method = 'get'): AuthRole {
  const lowerUrl = url.toLowerCase();
  const queryMatch = lowerUrl.match(/[?&]role=(admin|handler|customer)\b/);
  if (queryMatch) {
    return queryMatch[1] as AuthRole;
  }

  const path = window.location.pathname;
  const adminSecret = import.meta.env.VITE_ADMIN_SECRET_PATH || 'hft-secure-portal-2018';
  const lowerMethod = method.toLowerCase();

  const isAdminAction =
    lowerUrl.startsWith('/admin') ||
    lowerUrl.startsWith('/marketers') ||
    ((lowerUrl.startsWith('/products') || lowerUrl.startsWith('/blogs')) && lowerMethod !== 'get');

  if (
    isAdminAction ||
    path.startsWith('/admin') ||
    path.startsWith('/marketers') ||
    path.includes('admin') ||
    path.includes(adminSecret)
  ) {
    return 'admin';
  }

  if (path.startsWith('/handler') || lowerUrl.startsWith('/handler')) {
    return 'handler';
  }

  return 'customer';
}

/** Convert raw Axios/WAF errors into concise, user-friendly diagnostics. */
export function getFriendlyApiError(err: any, fallback: string): string {
  const serverError = err?.response?.data?.error;
  if (typeof serverError === 'string' && serverError.trim()) {
    return serverError;
  }
  if (!err?.response || typeof err?.response?.data === 'string') {
    return 'Unable to reach the authentication server right now. Check your internet connection or try again in a normal browser tab.';
  }
  return err?.message || fallback;
}

/**
 * Centralized API client configured with both httpOnly cookies AND Bearer token fallback.
 * Mobile browsers (iOS Safari ITP, Chrome iOS, in-app browsers) block cross-domain cookies;
 * role-scoped Bearer tokens ensure sessions persist across all devices.
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach role hint header + Bearer token fallback matching the exact role context
api.interceptors.request.use((config) => {
  const role = resolveRequestRole(config.url || '', config.method || 'get');
  config.headers['X-Auth-Role'] = role;

  const token = getAuthToken(role);
  if (token && !config.headers['Authorization']) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  return config;
});

// Automatically persist tokens on auth responses and clear stale tokens on logout / invalid session
api.interceptors.response.use(
  (response) => {
    const url = (response.config?.url || '').toLowerCase();
    const token = response.data?.token;
    const role = response.data?.data?.role || resolveRequestRole(url, response.config?.method);

    if (typeof token === 'string' && token.length > 0) {
      setAuthToken(role, token);
    } else if (url.includes('/auth/logout')) {
      clearAuthToken(resolveRequestRole(url, response.config?.method));
    }

    return response;
  },
  (error) => {
    const status = error?.response?.status;
    const url = (error?.config?.url || '').toLowerCase();
    if ((status === 401 || status === 403) && url.includes('/auth/me')) {
      clearAuthToken(resolveRequestRole(url, error?.config?.method));
    }
    return Promise.reject(error);
  }
);

export default api;
