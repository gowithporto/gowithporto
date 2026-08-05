# TODO

Update whenever a task completes or a new one is identified. Mirrors the live session task tracker.

## High Priority

- [x] Connect `gowithporto.pt` custom domain to the Vercel project (2026-08-04) — both `gowithporto.pt` and `www.gowithporto.pt` verified; no production deployment yet
- [x] Full env var migration: `MONGODB_URI`, `NEXTAUTH_URL`/`NEXTAUTH_SECRET`, Google OAuth, Stripe sandbox keys, Gemini key, Cloudinary — into both Vercel and `.env.local` (2026-08-04) — first production deployment live on `www.gowithporto.pt`
- [x] Register Stripe webhook endpoint, get `STRIPE_WEBHOOK_SECRET`, test checkout → order flow end-to-end (2026-08-04) — confirmed via `/api/orders/confirm`
- [x] Push this session's work to GitHub (2026-08-04) — `cfd931c..51759e2` on `main`, auto-deployed by Vercel; Stripe webhook confirmed `200 OK` in production, order correctly saved to Mongo with fee split
- [x] Resend account created (`admin@gowithporto.pt`), `gowithporto.pt` domain verified, wired 4 transactional emails: order confirmation (final design), order shipped / AI credit receipt / first-login welcome (placeholders, to be redesigned) (2026-08-05) — needs the code pushed to production before real purchases send mail (see note below)
- [ ] Push this session's Resend work to GitHub/Vercel — until deployed, production's Stripe webhook (old code) keeps winning the order-creation race against local dev and silently skips email sending, since local and production share one MongoDB database

## Medium Priority

- [ ] Admin-panel view of total commission earned + connected-store onboarding status (currently only visible via Mongo/Stripe dashboard directly)
- [ ] Upgrade Vercel from Hobby to Pro before accepting any real traffic (Hobby's terms exclude commercial use)
- [ ] Rotate the Gemini API key, OAuth client secret, and Cloudinary secret — all appeared in screenshots during setup

## Low Priority

- [ ] Consider Upstash Redis for rate limiting once traffic justifies distributed-safe limiting
- [ ] Pin the Gemini model to a specific dated version instead of `gemini-flash-latest` (avoids silent behavior changes)

## Future Ideas

- Bike rental + tour guide partners, generalized into the same `Store`-like Connect model as store owners
- Referral partner (hotel/restaurant) model — curated list, manual commission, no live payment integration
- Google Maps Directions integration in the AI itinerary output (APIs already enabled, not yet wired into any UI)
- French/Spanish localized routes + content for SEO (target audience is France, then Spain)
