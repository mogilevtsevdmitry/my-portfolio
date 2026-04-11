import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProxyAgent, type Dispatcher } from 'undici';

/**
 * Sends messages to a Telegram chat via Bot API.
 *
 * On servers located in regions where Telegram is blocked (e.g. some RU
 * hosting providers), set `TELEGRAM_PROXY_URL` or `HTTPS_PROXY` and the
 * service will route the request through an HTTP/HTTPS proxy via undici.
 */
@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name);
  private dispatcher: Dispatcher | undefined;

  constructor(private config: ConfigService) {}

  onModuleInit() {
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

    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
        }),
        // undici accepts a `dispatcher` init option that routes through the proxy.
        ...(this.dispatcher ? { dispatcher: this.dispatcher } : {}),
      } as RequestInit);

      if (!res.ok) {
        const body = await res.text().catch(() => '<unreadable>');
        this.logger.error(`Telegram API ${res.status}: ${body.slice(0, 300)}`);
      }
    } catch (err) {
      // undici's fetch wraps the real error in `cause`. Surface it so we can tell
      // a DNS miss (EAI_AGAIN) from a TCP refusal (ECONNREFUSED) from TLS.
      const cause: any = (err as any)?.cause;
      const code = cause?.code ?? (err as any)?.code;
      const msg = cause?.message ?? (err as Error)?.message;
      this.logger.error(
        `Telegram fetch failed: code=${code ?? 'unknown'} msg=${msg ?? '(no msg)'}${
          this.dispatcher ? ' (via proxy)' : ' (direct)'
        }`,
      );
    }
  }
}
