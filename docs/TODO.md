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

- [x] Fix AI itinerary prompt ignoring travel style/interests, and make the instruction more specific (2026-08-06) — `AIPlannerForm` was collecting `travelStyles` and `interests` from the user but `POST /api/ai/preview` never read them from the request body, so Gemini generated itineraries with no awareness of what the user actually selected. Now passed through to the prompt, along with dates. Also rewrote the system prompt/instruction to require realistic, budget/group-appropriate, non-repeating days naming real Porto places, in a warmer "local expert" voice instead of a generic one-liner
- [x] Fix AI itinerary credit deduction happening before the Gemini call succeeds (2026-08-06) — a failed generation (e.g. Gemini API error) was permanently burning the user's free try or a paid credit for nothing. `POST /api/ai/preview` now generates first, charges only on success
- [x] Bring the 3 remaining emails (order shipped, AI credit receipt, first-login welcome) up to the same branded look as order confirmation (2026-08-05) — they already shared the logo/colors/footer via `shared.ts`, but were plain text + button. Added a reusable `metaBar()` helper (the bordered info-box pattern from order confirmation) and used it in all three; welcome gets a 2-column "what you can do" box, credit receipt gets a "Start Planning" CTA it was missing
- [x] Admin-panel view of total commission earned + connected-store onboarding status (2026-08-05) — `/admin/revenue` now shows total platform commission vs. store payouts, per-store commission earned, and a Stripe Connect onboarding status table (Connected / Onboarding started / Not connected) for every store
- [x] Verify Stripe Connect payout split end-to-end in production (2026-08-05) — created a real test store, completed Stripe Express onboarding, confirmed a post-onboarding order split 10%/90% correctly in Mongo. Found and fixed two real bugs along the way: `stripeOnboardingComplete` could get stuck `false` forever because the `account.updated` webhook needs a separate Connect-scoped endpoint in the Stripe Dashboard (fixed with a self-healing check in `GET /api/store-owner/connect`); and the commission column showed a store's configured rate next to a blended dollar total, which was misleading for stores with mixed pre/post-connection orders (fixed to show the actual blended rate)
- [x] Replace the default Vercel favicon with the real GoWithPorto icon (2026-08-05) — added `src/app/icon.png` (32×32) and `src/app/apple-icon.png` (180×180) via Next.js's file-based icon convention, generated from `src/assets/Fav Icon.png`; removed the stale `favicon.ico`
- [ ] Upgrade Vercel from Hobby to Pro before accepting any real traffic (Hobby's terms exclude commercial use) — founder wants to revisit later (2026-08-05); don't re-flag unprompted
- [ ] Rotate the Gemini API key, OAuth client secret, and Cloudinary secret — all appeared in screenshots during setup; founder wants to revisit later (2026-08-05), don't re-flag unprompted

## Low Priority

- [ ] Consider Upstash Redis for rate limiting once traffic justifies distributed-safe limiting
- [ ] Pin the Gemini model to a specific dated version instead of `gemini-flash-latest` (avoids silent behavior changes)

## Future Ideas

- Bike rental + tour guide partners, generalized into the same `Store`-like Connect model as store owners
- Referral partner (hotel/restaurant) model — curated list, manual commission, no live payment integration
- Google Maps Directions integration in the AI itinerary output (APIs already enabled, not yet wired into any UI)
- French/Spanish localized routes + content for SEO (target audience is France, then Spain)
