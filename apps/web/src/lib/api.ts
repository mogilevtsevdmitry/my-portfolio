// Strip trailing slash so downstream paths like `/contacts/captcha` never
// produce a double slash (`//`), which some proxies/CORS configs reject.
const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001').replace(
  /\/+$/,
  '',
);

export interface ContactPayload {
  name: string;
  contact: string;
  description: string;
  captchaToken: string;
  captchaAnswer: number;
  /** Honeypot — must stay empty. Bots fill it, real users never see it. */
  website?: string;
}

export interface CaptchaChallenge {
  question: string;
  token: string;
}

export async function fetchCaptcha(): Promise<CaptchaChallenge> {
  const res = await fetch(`${API_URL}/contacts/captcha`, {
    method: 'GET',
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Captcha fetch failed: ${res.status}`);
  }
  return res.json();
}

/**
 * Error thrown by `submitContact` when the API returns a non-2xx status.
 * Carries a machine-readable `code` (e.g. 'CAPTCHA_INVALID', 'VALIDATION_ERROR')
 * and, for validation errors, the list of offending field names and the raw
 * validator messages, so the UI can pick the right localized label.
 */
export class ContactSubmitError extends Error {
  constructor(
    public readonly code: string | null,
    public readonly status: number,
    message: string,
    public readonly fields: string[] = [],
    public readonly messages: string[] = [],
  ) {
    super(message);
    this.name = 'ContactSubmitError';
  }
}

export async function submitContact(payload: ContactPayload): Promise<void> {
  const res = await fetch(`${API_URL}/contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'omit',
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const code = typeof errBody?.code === 'string' ? errBody.code : null;
    const rawMessages: string[] = Array.isArray(errBody?.message)
      ? errBody.message
      : errBody?.message
        ? [errBody.message]
        : [];
    const msg = rawMessages[0] ?? `Contact submission failed: ${res.status}`;
    const fields: string[] = Array.isArray(errBody?.fields) ? errBody.fields : [];
    throw new ContactSubmitError(code, res.status, msg, fields, rawMessages);
  }
}
