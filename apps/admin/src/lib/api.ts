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

export const projectsApi = {
  list: async (): Promise<any[]> => {
    const res = await apiFetch('/admin/projects');
    if (!res.ok) throw new Error('Failed to fetch projects');
    return res.json();
  },
  get: async (id: string): Promise<any> => {
    const res = await apiFetch(`/admin/projects/${id}`);
    if (!res.ok) throw new Error('Failed to fetch project');
    return res.json();
  },
  create: async (data: any): Promise<any> => {
    const res = await apiFetch('/admin/projects', { method: 'POST', body: JSON.stringify(data) });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message ?? 'Create failed');
    }
    return res.json();
  },
  update: async (id: string, data: any): Promise<any> => {
    const res = await apiFetch(`/admin/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message ?? 'Update failed');
    }
    return res.json();
  },
  remove: async (id: string): Promise<void> => {
    const res = await apiFetch(`/admin/projects/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete failed');
  },
  presign: async (fileName: string, contentType: string): Promise<{ uploadUrl: string; fileUrl: string }> => {
    const res = await apiFetch('/admin/upload/presign', {
      method: 'POST',
      body: JSON.stringify({ fileName, contentType }),
    });
    if (!res.ok) throw new Error('Presign failed');
    return res.json();
  },
};
