# CHANGELOG

Milestones only — not every commit. Newest at the top.

## 2026-08-05

- **Replaced the default Vercel favicon**: added `src/app/icon.png` (32×32) and `src/app/apple-icon.png` (180×180) via Next.js's file-based icon convention, generated from the founder's `src/assets/Fav Icon.png`; removed the stale `favicon.ico` so nothing conflicts
- **Cleaned up test data**: removed the Porto Ceramics Co. test store, its 2 products, and the 2 test orders placed against it (used to verify the Connect payout split above) — real revenue dashboard now reflects only genuine M&M Souvenirs activity
- **End-to-end Stripe Connect split verified**: created a second test store (Porto Ceramics Co.), completed real Stripe Express onboarding, and confirmed in the database that a post-onboarding order split correctly (10% commission / 90% payout), vs. a pre-onboarding order on the same store correctly staying 100%/$0 (no connected account existed yet to split to)
- **Fixed**: `stripeOnboardingComplete` could get permanently stuck `false` even after Stripe fully approved a store, because the `account.updated` webhook needs a Connect-scoped webhook endpoint (a separate Dashboard setting from the regular checkout webhook) that wasn't configured. `GET /api/store-owner/connect` now re-verifies with Stripe directly and self-heals the flag whenever it hasn't flipped yet, so a missing/misconfigured Connect webhook can't strand an already-approved store
- **Fixed**: the "Top Performing Stores" commission column on `/admin/revenue` showed each store's *configured* commission rate (e.g. "10%") next to its total commission dollar amount, which was misleading for any store with a mix of pre- and post-Connect orders (a store showing "$17.15 (10%)" when $17.15 is actually ~46% of that store's revenue). Now shows the actual blended rate computed from the numbers on screen, with a tooltip explaining the discrepancy when it differs from the configured rate
- **Admin commission dashboard**: extended `/api/admin/revenue` and `/admin/revenue` — total platform commission earned vs. total paid out to stores (summed from `Order.platformFeeAmount`/`storeOwnerAmount`), commission-per-store column on the top-stores table, and a new Stripe Connect onboarding status table listing every store's connection state (`Connected` / `Onboarding started` / `Not connected`) and commission rate, so this no longer requires checking Mongo/Stripe directly
- **Resend integration**: created the Resend account (`admin@gowithporto.pt`), verified the `gowithporto.pt` sending domain (DKIM/SPF/DMARC auto-configured via the Cloudflare integration), added `RESEND_API_KEY`/`EMAIL_FROM`/`SUPPORT_EMAIL` to `.env.local`
- **Added** `src/lib/email.ts` — Resend client wrapper, every send wrapped so a failure never breaks the checkout/login/credits flow it's triggered from
- **Added** 4 email templates in `src/lib/emailTemplates/`: order confirmation (final branded design, matches the founder's supplied mockup), order shipped / AI credit receipt / first-login welcome (plain placeholders — founder will supply branded HTML/CSS for these later)
- **Wired triggers**: order paid → confirmation email (from both `/api/orders/confirm` and the Stripe webhook, whichever creates the order first); store owner marks shipped → shipped email; AI credits purchased → receipt email; first-ever Google sign-in → welcome email
- **Added** `cardBrand`/`cardLast4` to the `Order` model, captured from the Stripe payment method, so the confirmation email can show "Visa •••• 4242" like the design
- **Copied** the logo to `public/logo.png` so emails can load it from a real URL
- **Debugged and root-caused** a confusing local-dev symptom where real test purchases never sent an email despite everything (Resend account, API key, code) checking out individually: local dev and production share one MongoDB database, and production's Stripe webhook (still running last session's code, with no knowledge of Resend) was winning the order-creation race against the local `/api/orders/confirm` call almost every time — so email sending never even got attempted locally. Confirmed via response-body instrumentation showing the local request consistently hit the "order already exists" branch, with the existing order's timestamp seconds before the local request ran. No code bug — resolved by deploying.
- **Verified in production**: pushed to `main`, Vercel auto-deployed, a real purchase on `www.gowithporto.pt` produced a correctly formatted order-confirmation email (branding, order summary, card brand/last4, totals all correct)

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
