import { v4 as uuidv4 } from 'uuid';
import type { FunnelEvent } from '@portfolio/shared';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const SESSION_KEY = '_sid';

export function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  const existing = localStorage.getItem(SESSION_KEY);
  if (existing) return existing;

  const id = uuidv4();
  localStorage.setItem(SESSION_KEY, id);
  return id;
}

export async function trackEvent(
  event: FunnelEvent,
  payload?: Record<string, string>,
): Promise<void> {
  try {
    const sessionId = getSessionId();
    await fetch(`${API_URL}/analytics/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, payload, sessionId }),
    });
  } catch {
    // Fire-and-forget: never throw
  }
}

// Listen for custom DOM events dispatched from server components via Hero CTAs
if (typeof window !== 'undefined') {
  window.addEventListener('track', ((e: CustomEvent) => {
    trackEvent(e.detail.event, e.detail.payload);
  }) as EventListener);
}
