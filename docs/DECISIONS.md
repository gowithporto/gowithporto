# DECISIONS

Record the *why*, not just the *what*. Newest at the bottom.

---

**2026-08-03 — Fresh accounts under `admin@gowithporto.pt`, not migrated from personal accounts**
Domain, email, MongoDB Atlas, Vercel, Google Cloud, Cloudinary, and Stripe were all previously under the founder's personal Gmail/Yahoo. Decided to create fresh accounts under the new business identity rather than invite the business account as a co-owner on the old ones.
*Alternatives considered*: inviting the business email as an org member on existing accounts (less setup work).
*Reason chosen*: founder explicitly wanted full separation, not shared ownership — matches the reason the domain/email infrastructure was bought in the first place. Dev-stage data in the old accounts wasn't worth preserving.

**2026-08-03 — Zoho Mail over Google Workspace for the business mailbox**
*Reason*: Workspace's only real advantage is unifying the mailbox login with the Google Cloud identity. A free, separate Google Account (used for Cloud/Gemini/Maps/OAuth) achieves the same practical separation from personal accounts at zero cost, vs. Workspace's recurring ~€40-70/year. Given the founder's explicit budget priority, the convenience wasn't worth the recurring cost.

**2026-08-03 — Cloudflare for DNS, not DNS.PT**
*Reason*: DNS.PT (the registrar) only manages domain registration and nameserver assignment — it has no DNS zone/record editor. Cloudflare's free plan provides one, so nameservers were pointed there.

**2026-08-03 — Resend for transactional/app-triggered email, Zoho only for human correspondence**
*Reason*: mailbox products like Zoho are sized for a human's normal send volume and share sending reputation with automated mail — mixing them risks both. Resend (or similar) is purpose-built for app-triggered email, with separate DNS/DKIM authentication from the human mailbox.

**2026-08-03 — In-memory rate limiting now, Upstash Redis later if needed**
*Reason*: Upstash's free tier would be the textbook-correct, distributed-safe choice, but adds another account/service for a problem that, at current scale (pre-launch, ~100 users year one), an in-memory limiter already meaningfully solves (stops naive brute-force scripts). Documented as a known limitation (resets on cold start, not shared across serverless instances) rather than hidden.

**2026-08-03 — Stripe Connect (Express) for marketplace payouts, not a custom payout system**
*Reason*: no payout mechanism existed at all before this. Building custom money-splitting/holding logic enters payment-regulation territory (money transmission). Stripe Connect handles the split, the connected account's own bank onboarding, and payout scheduling — the platform never touches store owners' bank details or holds their funds.

**2026-08-03 — Commission rate is per-store (`Store.commissionRate`), not a global constant**
*Reason*: keeps the door open for different deals with different store owners later, without a schema migration.

**2026-08-03 — Platform commission applies to product subtotal only, not delivery fee**
*Reason*: delivery fee is treated as the store owner's pass-through shipping cost, not marketplace-facilitated revenue.

**2026-08-03 — Referral partners (hotels/restaurants) stay manual/no-payment-processing, deliberately**
*Reason*: different money shape from the marketplace — money never passes through the platform, so no Stripe Connect account, no live integration needed. Curated list + manual commission invoicing is intentional simplicity, not a placeholder.

**2026-08-03 — Deleted `POST /api/orders` and `/api/payments/success`**
*Reason*: both created a "paid" `Order` directly from client-submitted data with zero Stripe verification. Neither was called from any UI (dead code from the frontend's perspective) but both were still live, directly-callable API routes — anyone signed in could `curl` a free fake order. Removed rather than fixed, since nothing used them.

**2026-08-03 — Google sign-in now creates a `User` document (`signIn` callback)**
*Reason*: previously only the credentials providers created/looked up `User` rows. Google-authenticated customers had no database record at all, which silently broke the AI credit gate (`User not found`) and blocked any future welcome-email feature.

**2026-08-03 — Restricted, test-mode-only Stripe API key for the Claude MCP connector**
*Reason*: giving an AI agent tool-calling access to a live financial account needs a hard boundary. A `sk_test_`/`rk_test_` key is structurally incapable of touching live data regardless of how the MCP layer's permissioning behaves, and Stripe's restricted-key permission granularity lets access be scoped to only the specific operations the app's code actually uses (Checkout Sessions, Webhooks, Connect Accounts/Links, read-only on Payments/Payouts/Balance/Events).
