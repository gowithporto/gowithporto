# AI_CONTEXT — Read this first

> Current state only. No daily logs. If something here is stale, fix it, don't append to it.

## Project overview

**GoWithPorto** — a Porto, Portugal tourism platform with three revenue lines:
1. **Marketplace** — store owners sell souvenirs/products, platform takes a commission via Stripe Connect.
2. **Referral network** — hotels/restaurants (curated, manual commission, no payment processing) — not yet built.
3. **AI itinerary generator** — Gemini-powered trip planning, sold via credit packs.

Solo founder (Al Mahmud Sarker), pre-launch, still in dev mode — no real users or real money yet.

## Tech stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **Auth**: NextAuth v4 (JWT sessions) — Google OAuth + two credentials providers (admin, store-owner)
- **Database**: MongoDB Atlas (Mongoose) — fresh cluster under the business Google account, free M0 tier, Paris region
- **Payments**: Stripe + Stripe Connect (Express accounts) for marketplace payouts
- **Images**: Cloudinary
- **AI**: Google Gemini API (`@google/generative-ai`, via Google AI Studio, not Vertex)
- **Maps**: Google Maps Platform (Directions + Places New) — enabled, not yet wired into any UI
- **Email**: Not yet set up — Resend is the planned provider, account not created yet

## Current branch

`main`

## Features completed

- Three-role auth: Admin, Store Owner, Customer (Google or dashboard)
- Store-owner product CRUD with real Cloudinary image upload (not pasted URLs)
- User profile settings page (avatar upload + name edit)
- Stripe Checkout → verified order creation via webhook (`checkout.session.completed`) **and** an instant-feedback confirm route, both idempotent via `Order.stripeSessionId`
- Stripe Connect onboarding for store owners + automatic payment split (platform commission / store owner payout) at checkout
- Login rate limiting (in-memory, per IP+account) on admin/store-owner credentials
- Google sign-in now creates a `User` record (previously didn't — broke AI credit gating)

## Feature currently being developed

Finishing the migration of all infrastructure to the business identity (`admin@gowithporto.pt`) and getting the app to a real working deploy:
- Connecting the `gowithporto.pt` custom domain to Vercel
- Full env var pass (Mongo, NextAuth, OAuth, Stripe sandbox, Gemini, Cloudinary) into Vercel + `.env.local`
- Registering the Stripe webhook endpoint / `STRIPE_WEBHOOK_SECRET`
- Resend account + order confirmation / receipt emails

## Known issues / gaps

- No admin-panel view of total commission earned or connected-store status yet (Stripe dashboard / Mongo are the only ways to see this right now)
- Vercel is on the Hobby plan deliberately (dev-only) — **must upgrade to Pro before any real launch**, Hobby's terms exclude commercial use
- `.env.local` still has old personal-account credentials in places; not yet fully migrated to the new business-identity services
- Rate limiting is in-memory (not distributed-safe across serverless instances) — fine for current scale, Upstash Redis is the documented upgrade path if traffic ever justifies it

## Current priorities (in order)

1. Connect custom domain to Vercel
2. Full env var migration + redeploy
3. Stripe webhook registration + end-to-end test
4. Resend setup + transactional emails

## Important reminders

- **Never add AI/Claude attribution to commits, PRs, or code** — explicit founder instruction.
- Every new service/account this project uses goes under `admin@gowithporto.pt`, not personal accounts.
- Budget-consciousness is a standing constraint — default to free tiers, only recommend paid upgrades with a clear, stated reason.
- Stripe Connect commission is per-store (`Store.commissionRate`, default 10%), not a global constant.
