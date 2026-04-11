/**
 * Telegram Bot API relay.
 *
 * Purpose: when your backend sits on a network that blocks egress to
 * api.telegram.org (typical for RU VPS — RKN blackholes Telegram's IP
 * blocks), deploy this Cloudflare Worker as a drop-in replacement URL.
 * Cloudflare's edge has unrestricted access to api.telegram.org, so the
 * request gets out.
 *
 * Usage:
 *   1. `wrangler deploy`  (see ./README.md)
 *   2. Set env var on your API:
 *        TELEGRAM_API_BASE=https://tg-relay.<your-subdomain>.workers.dev
 *        TELEGRAM_RELAY_SECRET=<matches RELAY_SECRET env on the worker>
 *
 * Security model:
 *   - Anyone who finds the worker URL can relay to Telegram, but they'd
 *     still need YOUR bot token — tokens never live in the worker.
 *   - Optional shared `RELAY_SECRET` adds a second layer: unauthenticated
 *     requests are rejected with 401. Strongly recommended.
 *
 * The worker is transparent: it forwards method, path, query, body and
 * returns the upstream response verbatim so the existing TelegramService
 * doesn't need to care about the response shape.
 */

const TELEGRAM_ORIGIN = 'https://api.telegram.org';

export default {
  /**
   * @param {Request} request
   * @param {{ RELAY_SECRET?: string }} env
   */
  async fetch(request, env) {
    // Health check — handy for `curl <worker-url>/` during debugging.
    if (request.method === 'GET' && new URL(request.url).pathname === '/') {
      return new Response('tg-relay: ok', {
        status: 200,
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      });
    }

    // Optional shared-secret gate.
    if (env.RELAY_SECRET) {
      const provided = request.headers.get('x-relay-secret');
      if (provided !== env.RELAY_SECRET) {
        return new Response('Unauthorized', { status: 401 });
      }
    }

    const incoming = new URL(request.url);
    const target = `${TELEGRAM_ORIGIN}${incoming.pathname}${incoming.search}`;

    // Strip hop-by-hop / CF-specific headers; keep content-type so the JSON
    // body Telegram expects survives the hop.
    const forwardHeaders = new Headers();
    const allowed = new Set(['content-type', 'accept', 'user-agent']);
    for (const [key, value] of request.headers) {
      if (allowed.has(key.toLowerCase())) forwardHeaders.set(key, value);
    }

    const init = {
      method: request.method,
      headers: forwardHeaders,
      body:
        request.method === 'GET' || request.method === 'HEAD'
          ? undefined
          : request.body,
    };

    try {
      const upstream = await fetch(target, init);
      // Stream the upstream response back verbatim. Preserve status + most headers.
      const outHeaders = new Headers();
      upstream.headers.forEach((value, key) => {
        // Drop CF-adjustable / transfer headers so the Worker can re-encode.
        if (['content-encoding', 'transfer-encoding'].includes(key.toLowerCase())) return;
        outHeaders.set(key, value);
      });
      return new Response(upstream.body, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers: outHeaders,
      });
    } catch (err) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'relay_upstream_failed',
          message: err instanceof Error ? err.message : String(err),
        }),
        { status: 502, headers: { 'content-type': 'application/json' } },
      );
    }
  },
};
