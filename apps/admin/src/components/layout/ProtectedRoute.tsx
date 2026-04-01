import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { apiFetch } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';

export function ProtectedRoute() {
  const [status, setStatus] = useState<'checking' | 'ok' | 'unauthenticated'>('checking');

  useEffect(() => {
    // GET /admin/blog is a protected endpoint — 200 = authenticated, 401 = not authenticated
    // (GET /auth/me is not in the API spec)
    apiFetch('/admin/blog')
      .then((res) => setStatus(res.ok ? 'ok' : 'unauthenticated'))
      .catch(() => setStatus('unauthenticated'));
  }, []);

  if (status === 'checking') return <Spinner />;
  if (status === 'unauthenticated') return <Navigate to="/login" replace />;
  return <Outlet />;
}
