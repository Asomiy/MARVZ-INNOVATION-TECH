/**
 * Authenticated Admin API Fetch Utility
 * Injects Bearer token automatically and handles 401 session expiration cleanly.
 */

export function getAdminToken(): string | null {
  try {
    return localStorage.getItem('marvz_admin_token');
  } catch {
    return null;
  }
}

export async function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAdminToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    window.dispatchEvent(new CustomEvent('marvz-admin-unauthorized'));
  }

  return response;
}
