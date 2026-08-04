# ARCHITECTURE

Update only when the architecture itself changes, not for routine feature work.

## Folder structure (relevant parts)

```
src/
├── app/
│   ├── api/                  # Route handlers, grouped by domain (see API.md)
│   ├── admin/                # Admin-only pages (role: ADMIN)
│   ├── store-owner/          # Store-owner pages (role: STORE_OWNER)
│   ├── dashboard/            # Customer-facing account pages
│   ├── checkout/             # Cart → Stripe → success/cancel flow
│   ├── shop/, cart/          # Public storefront
│   └── ai/                   # AI itinerary generation UI
├── components/
│   ├── dashboard/, store-owner/, ui/
├── lib/                      # Shared server-side utilities (auth, db, stripe helpers)
├── models/                   # Mongoose schemas
└── assets/                   # Static images, numbered by page/section
```

## System architecture

Single Next.js app (monolith), no separate backend service. Three tiers of "product" inside one codebase, sharing the same auth/session system:
- Marketplace (Store, Product, Order)
- AI itinerary generation (Gemini, AIResponse, credit ledger on User)
- (Planned) referral partners — not yet modeled

## Authentication flow

NextAuth v4, JWT session strategy (`src/lib/auth.ts`). Three providers:
1. **Google** — for customers. `signIn` callback creates a `User` document on first login if none exists (this was a bug fixed this session — previously Google users had no DB row at all).
2. **`admin-login`** (Credentials) — email + password, checks `User.role === "ADMIN"`.
3. **`store-owner-login`** (Credentials) — store code + password, checks against `Store`.

Both credentials providers are rate-limited (`src/lib/rateLimit.ts`, in-memory, 5 attempts / 15 min, keyed by IP + target account).

Role/store info is carried on the JWT (`token.role`, `token.storeId`, `token.storeName`) and exposed via the `session` callback. Session updates (e.g. profile name/photo changes) go through NextAuth's `update()` client call, which the `jwt` callback picks up via `trigger === "update"`.

## Payment / order architecture

Two paths can create an `Order`, and both are idempotent on `Order.stripeSessionId` (unique):

1. **Stripe webhook** (`/api/webhooks/stripe`) — signature-verified via `stripe.webhooks.constructEvent`. Listens for `checkout.session.completed` (creates the order — the reliable, browser-independent path) and `account.updated` (tracks Connect onboarding completion on `Store`).
2. **Instant-confirm route** (`/api/orders/confirm`) — called by the browser right after Stripe's redirect, for immediate UI feedback. Checks for an existing order by `stripeSessionId` first; if the webhook already won the race, it just returns that order instead of duplicating.

Both share one helper — `src/lib/buildOrderFromStripeSession.ts` — so the order-shape and fee-split logic can never drift between the two paths.

**Stripe Connect split**: at checkout (`/api/payments/checkout`), if the store has completed Connect onboarding (`Store.stripeOnboardingComplete`), the Checkout Session includes `payment_intent_data.application_fee_amount` + `transfer_data.destination`. Stripe splits the charge atomically — platform keeps the fee, the rest auto-transfers to the store's connected account, which Stripe then pays out to their bank on its own schedule. Commission is computed on the product subtotal only (delivery fee is 100% the store owner's). If the store hasn't onboarded yet, checkout still works — 100% stays with the platform, matching the pre-Connect behavior, rather than breaking checkout.

Two previously-existing endpoints that let anyone create a fake "paid" order with zero payment verification (`POST /api/orders`, `POST /api/payments/success`) were removed this session — dead code from the UI's perspective, but directly callable, so a real vulnerability.

## Image upload architecture

`/api/upload` — authenticated (any signed-in user), accepts `FormData`, uploads server-side to Cloudinary via `src/lib/cloudinary.ts` (credentials never touch the client). Two consumers: `ImageUploader` (multi-image, store-owner products) and `AvatarUploader` (single image, user profile) — both client components in `src/components/ui/`.

## Deployment architecture

- **Hosting**: Vercel, under `admin@gowithporto.pt`, currently Hobby plan (dev only — upgrade to Pro before launch)
- **Repo**: GitHub org `gowithporto/gowithporto` (not a personal account)
- **Database**: MongoDB Atlas, org + cluster under the business Google account, free M0, region `eu-west-3` (Paris)
- **Domain**: `gowithporto.pt`, DNS hosted on Cloudflare (DNS.PT — the registrar — doesn't host DNS records itself)
- **Email**: `admin@gowithporto.pt` via Zoho Mail (human correspondence only); Resend planned for transactional/app-triggered email (not yet set up)
