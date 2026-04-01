import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiFetch } from '@/lib/api';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('apiFetch', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  // Note on module-level state: `refreshPromise` is a module-level variable in api.ts.
  // In practice this does not leak between tests because the mocked fetch resolves
  // synchronously (Promises resolve in the same microtask queue), so `refreshPromise`
  // is always back to `null` before the next test's `beforeEach` runs.

  it('sends request with credentials:include', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200 });

    await apiFetch('/admin/blog');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/admin/blog'),
      expect.objectContaining({ credentials: 'include' }),
    );
  });

  it('on 401: calls /auth/refresh then retries original request', async () => {
    // First call → 401, second (refresh) → 200, third (retry) → 200
    mockFetch
      .mockResolvedValueOnce({ ok: false, status: 401 })
      .mockResolvedValueOnce({ ok: true, status: 200 })  // refresh
      .mockResolvedValueOnce({ ok: true, status: 200 }); // retry

    const res = await apiFetch('/admin/blog');

    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('/auth/refresh'),
      expect.objectContaining({ method: 'POST' }),
    );
    expect(res.status).toBe(200);
  });

  it('on 401 + failed refresh: does not loop and throws', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: false, status: 401 })
      .mockResolvedValueOnce({ ok: false, status: 401 }); // refresh also fails

    await expect(apiFetch('/admin/blog')).rejects.toThrow();
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('on 401 + failed refresh: redirects window to /login', async () => {
    const mockLocation = { href: '' } as Location;
    vi.spyOn(window, 'location', 'get').mockReturnValue(mockLocation);

    mockFetch
      .mockResolvedValueOnce({ ok: false, status: 401 })
      .mockResolvedValueOnce({ ok: false, status: 401 });

    await apiFetch('/admin/blog').catch(() => {});
    expect(mockLocation.href).toBe('/login');
  });

  it('does not retry refresh endpoint on 401 (prevents loop)', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 401 });

    await expect(apiFetch('/auth/refresh', { method: 'POST' })).rejects.toThrow();
    // Only called once — no refresh retry for /auth/* paths
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
