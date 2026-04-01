const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

let refreshPromise: Promise<void> | null = null;

async function doRefresh(): Promise<void> {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Refresh failed');
}

export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  return _apiFetch(path, options, false);
}

async function _apiFetch(
  path: string,
  options: RequestInit | undefined,
  isRetry: boolean,
): Promise<Response> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });

  if (res.status === 401) {
    // Auth endpoints skip refresh to prevent infinite loops — throw immediately
    if (isRetry || path.startsWith('/auth/')) {
      throw new Error('Unauthorized');
    }

    if (!refreshPromise) {
      refreshPromise = doRefresh().finally(() => { refreshPromise = null; });
    }
    try {
      await refreshPromise;
      return _apiFetch(path, options, true);
    } catch {
      window.location.href = '/login';
      throw new Error('Session expired');
    }
  }

  return res;
}
