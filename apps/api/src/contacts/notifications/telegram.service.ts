import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProxyAgent, type Dispatcher } from 'undici';

/**
 * Sends messages to a Telegram chat via Bot API.
 *
 * Three transport options, picked in priority order:
 *
 *   1. `TELEGRAM_API_BASE` — swap the upstream host (e.g. a Cloudflare
 *      Worker relay at https://tg-relay.xxx.workers.dev) for networks
 *      where api.telegram.org is blocked. If `TELEGRAM_RELAY_SECRET` is
 *      also set, it goes in the `x-relay-secret` header.
 *
 *   2. `TELEGRAM_PROXY_URL` / `HTTPS_PROXY` / `HTTP_PROXY` — route
 *      through an HTTP/HTTPS proxy via undici. Works if you have a
 *      reachable proxy; less convenient than a relay.
 *
 *   3. Direct. Only works where egress to api.telegram.org is allowed.
 */
@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);
  private dispatcher: Dispatcher | undefined;
  private apiBase = 'https://api.telegram.org';
  private relaySecret: string | undefined;

  constructor(private config: ConfigService) {}

  onModuleInit() {
    const apiBase = this.config.get<string>('TELEGRAM_API_BASE');
    if (apiBase) {
      // Strip trailing slashes so path concatenation is predictable.
      this.apiBase = apiBase.replace(/\/+$/, '');
      this.logger.log(`Telegram API base: ${this.apiBase}`);
    }

    this.relaySecret = this.config.get<string>('TELEGRAM_RELAY_SECRET');
    if (this.relaySecret) {
      this.logger.log('Telegram relay secret configured');
    }

    const proxyUrl =
      this.config.get<string>('TELEGRAM_PROXY_URL') ??
      this.config.get<string>('HTTPS_PROXY') ??
      this.config.get<string>('HTTP_PROXY');

    if (proxyUrl) {
      this.dispatcher = new ProxyAgent(proxyUrl);
      this.logger.log(`Telegram will use proxy: ${proxyUrl}`);
    }
  }

  async sendMessage(text: string): Promise<void> {
    const token = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    const chatId = this.config.get<string>('TELEGRAM_CHAT_ID');

    if (!token || !chatId) {
      this.logger.warn('Telegram not configured, skipping notification');
      return;
    }

    // Never put the bot token in a log line: it lives only in the request URL.
    const url = `${this.apiBase}/bot${token}/sendMessage`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.relaySecret) {
      headers['x-relay-secret'] = this.relaySecret;
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
        }),
        // undici accepts a `dispatcher` init option that routes through the proxy.
        ...(this.dispatcher ? { dispatcher: this.dispatcher } : {}),
      } as RequestInit);

      if (!res.ok) {
        // A non-2xx status is the fail-closed relay (401/503) or Telegram
        // itself rejecting the call. The caller swallows the promise, so this
        // is the only place the failure is recorded — keep it loud (warn) and
        // include the transport so a relay outage is distinguishable from a
        // bad token. Never log the URL (it carries the token).
        const body = await res.text().catch(() => '<unreadable>');
        this.logger.warn(
          `Telegram notification not delivered (${this.transportLabel()}): ` +
            `status=${res.status} body=${body.slice(0, 300)}`,
        );
      }
    } catch (err) {
      // undici's fetch wraps the real error in `cause`. Surface it so we can tell
      // a DNS miss (EAI_AGAIN) from a TCP refusal (ECONNREFUSED) from TLS.
      const cause: any = (err as any)?.cause;
      const code = cause?.code ?? (err as any)?.code;
      const msg = cause?.message ?? (err as Error)?.message;
      this.logger.error(
        `Telegram fetch failed (${this.transportLabel()}): ` +
          `code=${code ?? 'unknown'} msg=${msg ?? '(no msg)'}`,
      );
    }
  }

  /** Human-readable label for the active transport, for log context. */
  private transportLabel(): string {
    if (this.apiBase !== 'https://api.telegram.org') {
      return `via relay ${this.apiBase}`;
    }
    return this.dispatcher ? 'via proxy' : 'direct';
  }
}
