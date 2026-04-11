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

export async function submitContact(payload: ContactPayload): Promise<void> {
  const res = await fetch(`${API_URL}/contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'omit',
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const msg =
      (Array.isArray(errBody?.message) ? errBody.message[0] : errBody?.message) ??
      `Contact submission failed: ${res.status}`;
    throw new Error(msg);
  }
}
