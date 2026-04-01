import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ContactsPage } from '@/pages/ContactsPage';

vi.mock('@/lib/api', () => ({ apiFetch: vi.fn() }));
import { apiFetch } from '@/lib/api';

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      {children}
    </QueryClientProvider>
  );
}

describe('ContactsPage', () => {
  beforeEach(() => vi.mocked(apiFetch).mockReset());

  it('shows empty state when no contacts', async () => {
    vi.mocked(apiFetch).mockResolvedValue({ ok: true, json: async () => [] } as Response);
    render(<ContactsPage />, { wrapper: Wrapper });
    await waitFor(() => expect(screen.getByText(/no leads yet/i)).toBeInTheDocument());
  });

  it('shows contact name in table when contacts exist', async () => {
    const contacts = [{
      id: '1', name: 'Иван Иванов', contact: 'ivan@test.com',
      description: 'Hello', status: 'NEW', createdAt: '2024-01-01T00:00:00Z',
    }];
    vi.mocked(apiFetch).mockResolvedValue({ ok: true, json: async () => contacts } as Response);
    render(<ContactsPage />, { wrapper: Wrapper });
    await waitFor(() => expect(screen.getByText('Иван Иванов')).toBeInTheDocument());
  });
});
