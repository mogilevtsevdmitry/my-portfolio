const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface ContactPayload {
  name: string;
  contact: string;
  description: string;
}

export async function submitContact(payload: ContactPayload): Promise<void> {
  const res = await fetch(`${API_URL}/contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'omit',
  });

  if (!res.ok) {
    throw new Error(`Contact submission failed: ${res.status}`);
  }
}
