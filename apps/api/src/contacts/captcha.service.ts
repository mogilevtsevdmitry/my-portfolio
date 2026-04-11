import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Simple stateless math captcha:
 *
 *   1. `issue()` generates a random `a + b` (or `a - b`) question and signs a
 *      short-lived token that encodes the expected answer plus an expiry.
 *   2. `verify(token, answer)` recomputes the HMAC, rejects expired or
 *      tampered tokens, and checks the numeric answer in constant time.
 *
 * Stateless → no Redis, no DB; secret comes from `CAPTCHA_SECRET` or falls
 * back to `JWT_SECRET` so ops doesn't have to add a new env var.
 */

const TOKEN_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CaptchaPayload {
  expectedAnswer: number;
  expiresAt: number;
}

@Injectable()
export class CaptchaService {
  private readonly logger = new Logger(CaptchaService.name);

  constructor(private config: ConfigService) {}

  private getSecret(): string {
    const secret =
      this.config.get<string>('CAPTCHA_SECRET') ??
      this.config.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('CAPTCHA_SECRET or JWT_SECRET must be set');
    }
    return secret;
  }

  private sign(payload: CaptchaPayload): string {
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const sig = createHmac('sha256', this.getSecret())
      .update(body)
      .digest('base64url');
    return `${body}.${sig}`;
  }

  private parse(token: string): CaptchaPayload | null {
    const [body, sig] = token.split('.');
    if (!body || !sig) return null;

    const expected = createHmac('sha256', this.getSecret())
      .update(body)
      .digest('base64url');

    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

    try {
      return JSON.parse(Buffer.from(body, 'base64url').toString()) as CaptchaPayload;
    } catch {
      return null;
    }
  }

  /**
   * Generate a new captcha challenge and a matching signed token.
   */
  issue(): { question: string; token: string } {
    // Keep the numbers small so the UX stays frictionless.
    const op: '+' | '−' = Math.random() < 0.5 ? '+' : '−';
    let a = Math.floor(Math.random() * 9) + 2;   // 2..10
    let b = Math.floor(Math.random() * 8) + 1;   // 1..8
    if (op === '−' && b > a) [a, b] = [b, a];    // avoid negatives

    const expectedAnswer = op === '+' ? a + b : a - b;
    const question = `${a} ${op} ${b}`;
    const token = this.sign({
      expectedAnswer,
      expiresAt: Date.now() + TOKEN_TTL_MS,
    });

    return { question, token };
  }

  /**
   * Verify a captcha answer against a previously issued token.
   * Returns true only if the token is valid, not expired, and the answer matches.
   */
  verify(token: string, answer: number): boolean {
    const payload = this.parse(token);
    if (!payload) {
      this.logger.debug('Captcha token invalid or tampered');
      return false;
    }
    if (Date.now() > payload.expiresAt) {
      this.logger.debug('Captcha token expired');
      return false;
    }
    if (!Number.isFinite(answer)) return false;
    return payload.expectedAnswer === answer;
  }
}
