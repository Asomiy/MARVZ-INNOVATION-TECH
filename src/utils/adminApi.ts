import type { AdminRole, AdminUser } from '../types/admin';

/**
 * Authenticated Admin API Fetch Utility & RBAC / Password Helpers
 * Uses HTTP-only session cookies (credentials: 'include'), CSRF header protection,
 * and Bearer token header fallback for iframe/non-cookie environments.
 */

const TOKEN_KEY = 'marvz_admin_token';
const CSRF_KEY = 'marvz_admin_csrf';
const USER_KEY = 'marvz_admin_user';

let inMemoryToken: string | null = null;
let inMemoryCsrf: string | null = null;

function readStorage(key: string): string | null {
  try {
    return sessionStorage.getItem(key) || localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function getAdminToken(): string | null {
  return inMemoryToken || readStorage(TOKEN_KEY);
}

export function getAdminCsrfToken(): string | null {
  return inMemoryCsrf || readStorage(CSRF_KEY);
}

export function setAdminAuthSession(params: {
  token?: string;
  csrfToken?: string;
  user: AdminUser;
  rememberMe?: boolean;
}) {
  if (params.token) inMemoryToken = params.token;
  if (params.csrfToken) inMemoryCsrf = params.csrfToken;

  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CSRF_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(CSRF_KEY);
    sessionStorage.removeItem(USER_KEY);

    const target = params.rememberMe ? localStorage : sessionStorage;
    if (params.token) target.setItem(TOKEN_KEY, params.token);
    if (params.csrfToken) target.setItem(CSRF_KEY, params.csrfToken);
    target.setItem(USER_KEY, JSON.stringify(params.user));
  } catch {
    // Fallback to in-memory tokens when storage is restricted
  }
}

export function clearAdminAuthSession() {
  inMemoryToken = null;
  inMemoryCsrf = null;
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CSRF_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(CSRF_KEY);
    sessionStorage.removeItem(USER_KEY);
  } catch {
    // ignore storage errors
  }
}

export function setInMemoryCsrfToken(csrfToken?: string) {
  if (csrfToken) {
    inMemoryCsrf = csrfToken;
    try {
      if (localStorage.getItem(USER_KEY)) {
        localStorage.setItem(CSRF_KEY, csrfToken);
      } else {
        sessionStorage.setItem(CSRF_KEY, csrfToken);
      }
    } catch {
      // ignore
    }
  }
}

export async function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAdminToken();
  const csrf = getAdminCsrfToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (csrf) {
    headers.set('X-CSRF-Token', csrf);
  }

  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers,
  });

  if (response.status === 401) {
    clearAdminAuthSession();
    window.dispatchEvent(new CustomEvent('marvz-admin-unauthorized'));
  }

  return response;
}

export interface PasswordRuleResult {
  minLength: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
  isValid: boolean;
}

export function evaluatePasswordStrength(password: string): PasswordRuleResult {
  const minLength = password.length >= 8;
  const uppercase = /[A-Z]/.test(password);
  const lowercase = /[a-z]/.test(password);
  const number = /[0-9]/.test(password);
  const special = /[^A-Za-z0-9]/.test(password);
  return {
    minLength,
    uppercase,
    lowercase,
    number,
    special,
    isValid: minLength && uppercase && lowercase && number && special,
  };
}

export const ROLE_ALLOWED_TABS: Record<AdminRole, string[]> = {
  'Super Admin': [
    'dashboard',
    'content',
    'internships',
    'programs',
    'contacts',
    'leads',
    'location',
    'kb',
    'training',
    'livechat',
    'documents',
    'settings',
  ],
  'Content Manager': ['dashboard', 'content', 'location', 'kb', 'training', 'documents', 'settings'],
  'Knowledge Editor': ['dashboard', 'kb', 'training', 'documents', 'settings'],
  'HR & Training Coordinator': ['dashboard', 'internships', 'programs', 'settings'],
  'Support Agent': ['dashboard', 'contacts', 'leads', 'livechat', 'settings'],
};

export function canRoleAccessTab(role: AdminRole, tabId: string): boolean {
  if (role === 'Super Admin') return true;
  return (ROLE_ALLOWED_TABS[role] || ['dashboard', 'settings']).includes(tabId);
}
