# Telegram Bot API relay on Cloudflare Workers

Transparent HTTPS relay that forwards `api.telegram.org` requests from
servers that can't reach it directly (typical for RU VPS — RKN blocks
Telegram's IP ranges). Runs on Cloudflare's free tier.

## Deploy (one-time, ~2 min)

```bash
# 1. Install Wrangler (Cloudflare CLI) if you don't have it.
#    https://developers.cloudflare.com/workers/wrangler/install-and-update/
npm install -g wrangler

# 2. Log in. This opens a browser tab — sign in with your CF account
#    (create one at https://dash.cloudflare.com/sign-up if needed).
wrangler login

# 3. Deploy. Run from this directory.
cd cloudflare/telegram-relay
wrangler deploy
```

Wrangler prints the public URL at the end, e.g.:
```
Published tg-relay (... sec)
  https://tg-relay.<your-subdomain>.workers.dev
```

## Add the shared secret (recommended)

Without a secret, anyone who finds the URL can use it — but they'd still
need your bot token. Adding a secret gives a second layer of protection.

```bash
# Pick any random string, e.g. `openssl rand -hex 32`
wrangler secret put RELAY_SECRET
# paste the random string, press Enter
```

## Wire it into the API

In Dokploy → your api service → **Environment Variables**, add:

```
TELEGRAM_API_BASE=https://tg-relay.<your-subdomain>.workers.dev
TELEGRAM_RELAY_SECRET=<same random string you put in Wrangler>
```

Redeploy the api service. From then on, `TelegramService` will hit the
Worker URL instead of `api.telegram.org` and you'll get notifications
even from a blocked network.

## Verify

After redeploy, from your server:

```bash
curl https://tg-relay.<your-subdomain>.workers.dev/
# → "tg-relay: ok"

curl -H "x-relay-secret: <your secret>" \
  https://tg-relay.<your-subdomain>.workers.dev/bot<YOUR_BOT_TOKEN>/getMe
# → {"ok":true,"result":{...}}
```

If `getMe` succeeds through the Worker but your server still can't reach
`api.telegram.org` directly, the setup is correct and the next contact
form submission will deliver a Telegram notification.

## Update later

```bash
cd cloudflare/telegram-relay
wrangler deploy
```

## Delete

```bash
wrangler delete tg-relay
```

## Rate limits

Cloudflare Workers free tier:
- **100,000 requests/day** — way more than a contact form needs
- **10 ms CPU/request** — a transparent fetch takes ~1 ms
- **No bandwidth cap** on free tier for Workers

If you ever outgrow free tier: the paid plan is $5/month and covers 10M
requests, but you won't.
