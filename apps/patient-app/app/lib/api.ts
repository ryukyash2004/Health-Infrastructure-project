import { useAuthStore } from '../store/auth-store';

const BASE_URL = 'http://localhost:8000/api/v1';

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const { isAuthenticated, user, guestId } = useAuthStore.getState();

  const headers = new Headers(options.headers || {});
  
  // Custom headers for Aegis Auth/Guest tracking
  headers.set('X-User-Type', isAuthenticated ? 'authenticated' : 'guest');
  headers.set('X-User-ID', isAuthenticated ? user?.id || '' : guestId);
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
}
