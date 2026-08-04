# TODO

Update whenever a task completes or a new one is identified. Mirrors the live session task tracker.

## High Priority

- [x] Connect `gowithporto.pt` custom domain to the Vercel project (2026-08-04) — both `gowithporto.pt` and `www.gowithporto.pt` verified; no production deployment yet
- [x] Full env var migration: `MONGODB_URI`, `NEXTAUTH_URL`/`NEXTAUTH_SECRET`, Google OAuth, Stripe sandbox keys, Gemini key, Cloudinary — into both Vercel and `.env.local` (2026-08-04) — first production deployment live on `www.gowithporto.pt`
- [x] Register Stripe webhook endpoint, get `STRIPE_WEBHOOK_SECRET`, test checkout → order flow end-to-end (2026-08-04) — confirmed via `/api/orders/confirm`; webhook itself still 404s in production until the code below is pushed
- [ ] **Push this session's work to GitHub and redeploy** — `src/app/api/webhooks/stripe`, `store-owner/connect`, `upload`, `user/profile`, `dashboard/profile`, and more have never been committed; production is still running the 2026-07-31 commit, which is why the Stripe webhook 404s
- [ ] Create Resend account (`admin@gowithporto.pt`), wire order confirmation + AI credit receipt emails

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
