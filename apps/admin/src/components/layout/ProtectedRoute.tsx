import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';

async function fetchPosts() {
  const res = await apiFetch('/admin/blog');
  if (!res.ok) throw new Error('Unauthorized');
  return res.json();
}

export function ProtectedRoute() {
  const [status, setStatus] = useState<'checking' | 'ok' | 'unauthenticated'>('checking');
  const queryClient = useQueryClient();

  useEffect(() => {
    // GET /admin/blog is a protected endpoint — 200 = authenticated, 401 = not authenticated
    // (GET /auth/me is not in the API spec)
    // Using queryClient.fetchQuery so the result lands in TanStack Query cache —
    // BlogListPage's useQuery will then get a cache hit instead of a second network call.
    queryClient
      .fetchQuery({ queryKey: ['admin-blog'], queryFn: fetchPosts })
      .then(() => setStatus('ok'))
      .catch(() => setStatus('unauthenticated'));
  }, [queryClient]);

  if (status === 'checking') return <Spinner />;
  if (status === 'unauthenticated') return <Navigate to="/login" replace />;
  return <Outlet />;
}
