# TODO

Update whenever a task completes or a new one is identified. Mirrors the live session task tracker.

## High Priority

- [x] Connect `gowithporto.pt` custom domain to the Vercel project (2026-08-04) — both `gowithporto.pt` and `www.gowithporto.pt` verified; no production deployment yet
- [x] Full env var migration: `MONGODB_URI`, `NEXTAUTH_URL`/`NEXTAUTH_SECRET`, Google OAuth, Stripe sandbox keys, Gemini key, Cloudinary — into both Vercel and `.env.local` (2026-08-04) — first production deployment live on `www.gowithporto.pt`
- [x] Register Stripe webhook endpoint, get `STRIPE_WEBHOOK_SECRET`, test checkout → order flow end-to-end (2026-08-04) — confirmed via `/api/orders/confirm`
- [x] Push this session's work to GitHub (2026-08-04) — `cfd931c..51759e2` on `main`, auto-deployed by Vercel; Stripe webhook confirmed `200 OK` in production, order correctly saved to Mongo with fee split
- [x] Resend account created (`admin@gowithporto.pt`), `gowithporto.pt` domain verified, wired 4 transactional emails: order confirmation (final design), order shipped / AI credit receipt / first-login welcome (placeholders, to be redesigned) (2026-08-05)
- [x] Push Resend integration to GitHub/Vercel and verify in production (2026-08-05) — real purchase on `www.gowithporto.pt` produced a correctly formatted order-confirmation email; order shipped / AI credit receipt / welcome share the same send infrastructure but haven't each been individually triggered in production yet

## Medium Priority

- [ ] Swap in branded HTML/CSS for the 3 placeholder emails (order shipped, AI credit receipt, first-login welcome) once the founder designs them — order confirmation is already the final design; drop-in only touches `src/lib/emailTemplates/`, not the sending logic
- [x] Admin-panel view of total commission earned + connected-store onboarding status (2026-08-05) — `/admin/revenue` now shows total platform commission vs. store payouts, per-store commission earned, and a Stripe Connect onboarding status table (Connected / Onboarding started / Not connected) for every store
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
