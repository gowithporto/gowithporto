# CHANGELOG

Milestones only — not every commit. Newest at the top.

## 2026-08-04

- **Stripe MCP**: connected a restricted, test-mode Stripe MCP server (`https://mcp.stripe.com`) to Claude Code for the dev/test phase, configured via `~/.claude.json` with the key held in a `STRIPE_MCP_KEY` env var (not in any repo file)
- **Domain**: connected `gowithporto.pt` and `www.gowithporto.pt` to the Vercel project (CNAME records at Cloudflare, DNS-only/unproxied so Vercel handles TLS directly)
- **Env vars**: migrated all secrets (Mongo, Google OAuth, Stripe test keys, Gemini, Cloudinary) to the business-account values, into both `.env.local` and Vercel Production — first live production deployment on `www.gowithporto.pt`
- **Fixed**: Google sign-in `redirect_uri_mismatch` in production — NextAuth trusts the Vercel host header (`www.gowithporto.pt`), so the OAuth client needed the `www` callback/origin registered too, not just the bare domain; `NEXTAUTH_URL`/`NEXT_PUBLIC_BASE_URL` updated to the `www` canonical URL to match
- **Stripe webhook**: registered a test-mode webhook endpoint (`https://www.gowithporto.pt/api/webhooks/stripe`) listening for `checkout.session.completed` and `account.updated`, `STRIPE_WEBHOOK_SECRET` added to Vercel + `.env.local` — currently returning 404 in production because this code has never been pushed to GitHub (see below)
- **Admin bootstrap**: added `scripts/create-admin.js`, a one-off CLI script to create/promote a `User` to `ADMIN` directly via Mongo, since there's no public admin signup route
- **Store owner**: created first real store (`M&M Souvenirs`, code `MM-PORTO`) via the admin Stores panel; fixed a `NaN` crash on the Delivery Fee field when cleared
- **Store-owner product forms**: rebuilt Add/Edit Product pages to use the shared `Input`/`Select`/`Button` components instead of raw unstyled inputs; category is now a dropdown of ~16 souvenir-relevant presets plus a free-text "Other" option (backend already supported arbitrary category strings)
- **Design system**: added dark-mode styling to the shared `Input`/`Select` components (previously light-mode only, inconsistent with the rest of the dashboard)
- **Verified**: full checkout → order flow confirmed end-to-end via `/api/orders/confirm` (order visible in Mongo with correct `platformFeeAmount`/`storeOwnerAmount` split); confirmed `/dashboard/orders` already scopes results to the logged-in user correctly

## 2026-08-03

- **Business infrastructure migration**: domain (`gowithporto.pt`), business email (Zoho), dedicated Google account, MongoDB Atlas, Vercel, Google Cloud (Gemini + OAuth + Maps), Cloudinary, GitHub org — all moved off personal accounts to `admin@gowithporto.pt`
- **Security**: fixed a live vulnerability allowing free fake "paid" orders (client-trusted order creation with no Stripe verification); added real Stripe webhook signature verification; added login rate limiting
- **Fixed**: Google sign-in wasn't creating `User` records, silently breaking AI credit gating
- **Added**: real Cloudinary image upload for store-owner products (previously a pasted-URL textarea)
- **Added**: user profile settings page (avatar upload, name edit) — didn't exist before
- **Added**: Stripe Connect marketplace payouts — store owners onboard, checkout automatically splits payment (platform commission / store payout)
- **Docs**: established `/docs` as the project's source of truth (this file set)
