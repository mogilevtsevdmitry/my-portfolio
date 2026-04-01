const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

let refreshPromise: Promise<void> | null = null;

async function doRefresh(): Promise<void> {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Refresh failed');
}

export async function apiFetch(
  path: string,
  options?: RequestInit & { _isRetry?: boolean },
): Promise<Response> {
  const { _isRetry, ...fetchOptions } = options ?? {};

  const res = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...fetchOptions.headers },
  });

  if (res.status === 401) {
    // Auth endpoints skip refresh to prevent infinite loops — throw immediately
    if (_isRetry || path.startsWith('/auth/')) {
      throw new Error('Unauthorized');
    }

    if (!refreshPromise) {
      refreshPromise = doRefresh().finally(() => { refreshPromise = null; });
    }
    try {
      await refreshPromise;
      return apiFetch(path, { ...options, _isRetry: true });
    } catch {
      window.location.href = '/login';
      throw new Error('Session expired');
    }
  }

  return res;
}
