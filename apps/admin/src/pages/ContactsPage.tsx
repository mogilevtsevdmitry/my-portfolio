import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';

type ContactStatus = 'NEW' | 'READ' | 'ARCHIVED';

interface Contact {
  id: string;
  name: string;
  contact: string;
  description: string;
  status: ContactStatus;
  createdAt: string;
}

async function fetchContacts(): Promise<Contact[]> {
  const res = await apiFetch('/contacts');
  if (!res.ok) throw new Error('Failed to fetch contacts');
  return res.json();
}

const nextStatus: Record<ContactStatus, ContactStatus> = {
  NEW: 'READ',
  READ: 'ARCHIVED',
  ARCHIVED: 'NEW',
};

const statusLabel: Record<ContactStatus, string> = {
  NEW: 'Mark Read',
  READ: 'Archive',
  ARCHIVED: 'Reopen',
};

export function ContactsPage() {
  const qc = useQueryClient();
  const { data: contacts, isLoading, error } = useQuery({
    queryKey: ['admin-contacts'],
    queryFn: fetchContacts,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ContactStatus }) => {
      const res = await apiFetch(`/contacts/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Update failed');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-contacts'] }),
  });

  if (isLoading) return <Spinner />;
  if (error) return <p className="text-red-400">Failed to load contacts.</p>;

  return (
    <div>
      <h1 className="text-xl font-bold text-[var(--text-primary)] mb-6">Contacts</h1>

      {!contacts?.length ? (
        <div className="glass-card p-8 text-center text-[var(--text-muted)]">No leads yet.</div>
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--text-muted)] text-left">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Message</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-card)]">
                  <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{c.name}</td>
                  <td className="px-4 py-3 text-[var(--text-muted)] text-xs">{c.contact}</td>
                  <td className="px-4 py-3 text-[var(--text-muted)] max-w-xs truncate">{c.description}</td>
                  <td className="px-4 py-3"><Badge status={c.status} /></td>
                  <td className="px-4 py-3 text-[var(--text-muted)] text-xs">
                    {new Date(c.createdAt).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => updateMutation.mutate({ id: c.id, status: nextStatus[c.status] })}
                      disabled={updateMutation.isPending}
                      className="text-xs text-accent hover:underline disabled:opacity-50"
                    >
                      {statusLabel[c.status]}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
