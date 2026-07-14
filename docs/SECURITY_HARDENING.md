# Security hardening — what changed and what to do next

## What was added to the backend (`backend/app/security.py`)

1. **Security response headers** — HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
   a restrictive CSP, `Referrer-Policy`, `Permissions-Policy`, `Cache-Control: no-store`.
2. **Rate limiting** — 120 requests/minute per IP by default (`RateLimitMiddleware` in `main.py`),
   returns `429` with `Retry-After` when exceeded.
3. **Login brute-force lockout** — 5 failed logins for a username *or* an IP within 15 minutes
   blocks further attempts (`check_login_allowed` in `routers/auth.py`).
4. **WAF-lite request filter** — rejects requests whose (URL-decoded) path/query contains
   obvious SQL injection, XSS, path-traversal, or command-injection patterns, and caps body size
   at 2 MB (this API takes no file uploads).
5. **Host header allow-list** (`TrustedHostMiddleware`) — via `TERRACREST_ALLOWED_HOSTS`.
6. **Boot-time check** — refuses to start on Render if `TERRACREST_JWT_SECRET` is still the
   checked-in dev default, so a forgotten env var can't silently ship a forgeable secret.

All 33 existing backend tests pass unchanged (`pytest` in `backend/`).

**Limits to know:** the rate limiter and lockout counters live in process memory. Fine for a
single Render instance (the free tier you're on). If you ever run multiple instances behind a
load balancer, move these to Redis (`INCR` + `EXPIRE` per key) so counts are shared — see the
note at the bottom of `security.py`.

## Why this isn't "a WAF" by itself

A real WAF (Cloudflare, AWS WAF, etc.) sits *in front of* your app, at the network edge. It stops
volumetric attacks, known-bad IPs, and bot traffic before it ever reaches Render or Vercel — far
cheaper and more effective than anything Python can do per-request. The app-layer code above is a
second line of defense for things that need application context (which username failed, which
route is sensitive) or that slip past the edge. Use both.

## Recommended: put Cloudflare in front (free tier is enough)

1. Move your domain's DNS to Cloudflare (free plan).
2. Point your existing Vercel (frontend) and Render (API) hostnames through Cloudflare as
   proxied (orange-cloud) DNS records — a CNAME to `terracrest.vercel.app` and one to
   `terracrest-api.onrender.com`.
3. Turn on, under Cloudflare's dashboard:
   - **WAF → Managed Rules** (OWASP core ruleset) — free tier includes Cloudflare's own
     managed ruleset.
   - **Rate limiting rules** — e.g. block an IP hitting `/auth/login` more than 10×/minute.
   - **Bot Fight Mode** — free, blocks a lot of scripted scanning traffic.
   - **Always Use HTTPS** and **Automatic HTTPS Rewrites**.
4. Once Cloudflare is proxying, update `TERRACREST_ALLOWED_HOSTS` and `TERRACREST_CORS_ORIGINS`
   to include your real domain instead of (or alongside) the raw Render/Vercel ones.

## Other things worth doing (not code changes, just hygiene)

- Rotate `TERRACREST_JWT_SECRET` to a long random value in Render's env vars (not the repo).
- Move off the free ephemeral SQLite (already noted in `render.yaml`) to Postgres for anything
  beyond a demo — it also means your data survives restarts.
- Turn on GitHub's Dependabot alerts for this repo so `fastapi`, `PyJWT`, `bcrypt`, etc. get
  flagged when a CVE lands.
- Consider shortening `access_token_minutes` further (currently 15) if the deal-room data is
  sensitive, since a leaked access token is valid until it expires.
