import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { BlogListPage } from '@/pages/BlogListPage';

vi.mock('@/lib/api', () => ({ apiFetch: vi.fn() }));
import { apiFetch } from '@/lib/api';

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('BlogListPage', () => {
  beforeEach(() => vi.mocked(apiFetch).mockReset());

  it('shows empty state when no posts', async () => {
    vi.mocked(apiFetch).mockResolvedValue({ ok: true, json: async () => [] } as Response);
    render(<BlogListPage />, { wrapper: Wrapper });
    await waitFor(() => expect(screen.getByText(/no posts yet/i)).toBeInTheDocument());
  });

  it('shows post slug in table when posts exist', async () => {
    const posts = [{
      id: '1', slug: 'hello-world', status: 'PUBLISHED',
      publishedAt: null, updatedAt: '2024-01-01T00:00:00Z',
      translations: [{ locale: 'ru', title: 'Привет мир', excerpt: '' }],
    }];
    vi.mocked(apiFetch).mockResolvedValue({ ok: true, json: async () => posts } as Response);
    render(<BlogListPage />, { wrapper: Wrapper });
    await waitFor(() => expect(screen.getByText('hello-world')).toBeInTheDocument());
  });
});
