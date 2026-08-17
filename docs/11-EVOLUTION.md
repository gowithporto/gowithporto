# 11 — Maintenance, Evolution and Retirement

> **SDLC stages:** 17. Maintenance · 18. Evolution · 21. Retirement
> **Status:** Stage 18 DONE, stages 17 PARTIAL and 21 SPEC — maintenance practice is active and well-logged; dependency policy and automated patching are absent
> **Baseline:** commit `3eb178a`, 2026-08-16
> **Update when:** the roadmap or a scaling threshold changes.

---

## 1. Maintenance practice as it actually is

### 1.1 What exists

Maintenance on this project is a documented, disciplined practice carried out by
one person. The evidence is `docs/CHANGELOG.md` — 34,800 bytes covering
2026-08-03 to 2026-08-14, alongside `docs/TODO.md` (14,610 bytes) and
`docs/DECISIONS.md` (4,882 bytes).

The defining characteristic is that entries record **root cause and reasoning**,
not outcome. A typical entry names the file, states what the code was doing,
states why that produced the observed symptom, states what was changed, and
states what was verified. Several entries also record work *not* done and why.

| Artefact | Purpose | Currency at baseline | Status |
|---|---|---|---|
| `docs/CHANGELOG.md` | Milestone log with root-cause narrative | Last entry 2026-08-14 | PARTIAL |
| `docs/TODO.md` | Open and closed task register, mirrors live tracker | Last entry 2026-08-14 | PARTIAL |
| `docs/DECISIONS.md` | Rationale record ("the *why*, not just the *what*") | Last entry **2026-08-03** | PARTIAL |
| `docs/SESSION_HANDOFF.md` | Explicitly temporary, overwritten each session | Describes the 2026-08-08 session as uncommitted | STALE by design |
| Automated regression tests | Protect fixes from returning | None in repository | ABSENT |
| CI | Enforce any of the above | No `.github/` directory | ABSENT |

### 1.2 Four representative fixes

**The locale-loss bug, fixed structurally (2026-08-14).** Founder screenshots
showed a user switching to French and losing the language on the next click, on
both guest and authenticated pages. The changelog records the diagnosis rather
than the symptom: nearly every internal `<Link href="/...">` in the application
hardcoded an unprefixed path, left over from before locale routing existed, and
only the header switcher's own `router.push()` was locale-aware. The fix was not
33 individual edits to hrefs. It was one new component,
`src/components/ui/LocalizedLink.tsx`, a drop-in replacement for `next/link`
that reads the active locale from `useLanguage()` and prefixes internal hrefs
while leaving external URLs, `#` anchors, `mailto:` and `tel:` untouched, then
an import swap across 33 customer-facing files. Verification was performed by
curling rendered HTML across all four locales.

**AI credit deduction ordering (2026-08-06).** `POST /api/ai/preview` deducted
the user's free try or a paid credit *before* calling Gemini, so any generation
failure permanently consumed the credit for nothing. The changelog records the
ordering as the defect and the discovery context — a Gemini billing-tier error
in local development, explicitly identified as an environment problem and not a
code bug, which is what surfaced the real code bug behind it. The fix reorders
the operations so credits are charged only after a successful generation. This
is a money-correctness fix and is the single most consequential entry in the
log.

**Stripe Connect onboarding self-healing (2026-08-05).** `stripeOnboardingComplete`
could remain `false` permanently even after Stripe had fully approved a store,
because the `account.updated` event requires a Connect-scoped webhook endpoint
that is a separate Dashboard setting from the checkout webhook. The fix does not
just add the missing endpoint — it makes the code tolerant of the endpoint being
absent or misconfigured, by having `GET /api/store-owner/connect` re-verify
against Stripe directly and repair the flag whenever it has not yet flipped.
This is a fix aimed at the failure mode rather than the instance: a
misconfigured Connect webhook can no longer strand an approved store.

**Email logo sizing (2026-08-12).** Transactional emails intermittently rendered
a broken logo in Gmail. The changelog identifies why "intermittently" was the
clue: `src/lib/emailTemplates/shared.ts` pointed at `public/logo.png`, a
3508×2480 print-resolution export of roughly 193 KB, displayed at 180 px wide;
Gmail proxies and caches external images per message at first open, so a single
slow fetch leaves that one message's logo permanently broken while the site
itself is fine. The fix adds a 540 px, ~9.6 KB `public/logo-email.png` used
**only** by email templates, leaving `public/logo.png` unchanged because it is
also the Open Graph share image where the larger asset is correct. The changelog
also records the follow-on detail: the new file had to be added to `src/proxy.ts`'s
locale-routing exclusions alongside the existing ones.

Two further entries are worth noting because they record **negative results**,
which most solo logs omit. The 2026-08-14 investigation of "the attraction page
is slow in French" concludes it was not a bug — a cold Turbopack route compile
measured ~5.1 s against ~0.24 s warm, plus ~2 s of Atlas round-trip latency from
a local machine, neither of which applies in production — and was written down
specifically so it is not later mistaken for a regression. The 2026-08-05 entry
on emails not sending in local development root-causes a race: local development
and production share one MongoDB database, and production's Stripe webhook was
winning the order-creation race against the local `/api/orders/confirm` call, so
the local code path never reached the email send at all. No code changed;
deploying resolved it.

### 1.3 Where the practice is weak

| Weakness | Evidence | Consequence |
|---|---|---|
| **No regression test protects any fix** | No test files, no test runner in `package.json` `devDependencies`, no `test` script | Every fix in §1.2 can silently return. Nothing would detect a reintroduced unprefixed `<Link>`, a reordered credit deduction, or a reverted logo path |
| **No CI to run what does exist** | No `.github/` directory; `tsc --noEmit` and `eslint` are run by hand and recorded per entry | Verification depends on the founder remembering. Cross-ref `09-QUALITY` §5 |
| **The baseline commit's own feature is unlogged** | `3eb178a` is titled *"gate Stripe payouts on buyer-confirmed delivery, add dispute resolution"*; `grep -i dispute` over `docs/CHANGELOG.md` and `docs/TODO.md` returns nothing | The escrow and dispute system — `src/app/api/fulfill/[token]/confirm`, `.../report`, `src/app/api/admin/disputes/**`, and the `issueReport`/`resolution`/`legalException` subdocuments on `Order` — is the most financially sensitive code in the project and has no maintenance record at all |
| **`DECISIONS.md` has drifted into `CHANGELOG.md`** | `DECISIONS.md` last entry 2026-08-03; decision-grade rationale for the `translations: Mixed` overlay, the Gemini model pin, and keeping `<select>` values in English all live in changelog entries instead | The rationale record is no longer the place to look for rationale |
| **Repository history is a weak maintenance source** | 77 commits, but 41 of 77 subject lines carry no type prefix and many say nothing usable (`font changed`, `update footer options`). Release tagging stopped at `v0.5.0` on 2026-07-31, leaving the entire August programme untagged | `git log` cannot reliably answer "when did this behaviour change, and why". That function rests almost entirely on the prose log; if the log lapses, little else carries it. See `08-ENGINEERING` §9.2 |

**Honest summary.** The diagnose-and-record half of maintenance is performed to
a standard well above what a solo pre-launch project usually achieves. The
protect-the-fix half does not exist. The changelog is, at present, the only
regression suite the project has, and it executes only when a human reads it.

---

## 2. Refactoring policy

### 2.1 The observed principle

The codebase already follows a rule, applied without ever being written down:

> When a class of bug appears more than twice, change the shape of the code so
> that the bug becomes unavailable, rather than fixing the instances.

**Evidence — locale loss.** The same class of defect surfaced three times in
eight days:

| Date | Instance | Response |
|---|---|---|
| 2026-08-08 | Header language switcher only flipped client state; the URL and the language desynchronised | Instance fix — switcher now navigates to the localised URL |
| 2026-08-13 | All five `/dashboard/*` pages used a hardcoded `redirect("/")`, dropping a French visitor to the English homepage | **Shape change** — `src/lib/localePath.ts` exports `localizedPath(path)`, reading `x-locale` from the request headers; all five redirects became `redirect(await localizedPath("/"))` |
| 2026-08-14 | Essentially every internal `<Link>` in the application dropped the locale | **Shape change** — `src/components/ui/LocalizedLink.tsx`; import swapped in 33 files |

After the second and third responses, the unsafe operation is no longer the
default one. `localizedPath()` is the server-side redirect primitive;
`LocalizedLink` is the client-side navigation primitive. Both encapsulate the
same locale rule, and both were introduced only after the per-instance approach
had demonstrably failed to hold.

A second, smaller instance of the same principle: `metaBar()` was added to
`src/lib/emailTemplates/shared.ts` (2026-08-05) after the bordered info-box
pattern needed to appear in a fourth email template, rather than being copied a
fourth time.

### 2.2 The codified rule

| Rule | Statement |
|---|---|
| **R1 — Rule of three** | First occurrence: fix in place. Second: fix in place and record it in `CHANGELOG.md` as a repeat. Third: stop, and change the shape of the code so the defect cannot be expressed |
| **R2 — Prefer removing the unsafe default** | A shape change must make the correct call the easy one. `LocalizedLink` qualifies because the import name is `Link`; a helper that must be remembered does not qualify |
| **R3 — Blast radius stated before starting** | Record the file count up front. The 2026-08-14 refactor states 33 files; the 2026-08-13 translations overlay explicitly chose `translations: Mixed` over restructuring every field into per-locale objects to keep admin forms, API allow-lists and English rendering untouched |
| **R4 — Verify across the full surface, not the reported case** | Both locale refactors were verified across `en`/`fr`/`es`/`pt`, not only the reported page |
| **R5 — A shape change is the point at which a test becomes mandatory** | Currently unmet — see §4. Once a test harness exists, no refactor of this class merges without one test asserting the invariant the new shape guarantees |
| **R6 — Never refactor and change behaviour in the same commit** | Observed in practice; not enforced by tooling |

Cross-ref `08-ENGINEERING` §11 for the branch and review model these rules
assume once a second engineer exists.

---

## 3. Dependency and patch policy

**Status: SPEC.** Nothing in this section is currently implemented. There is no
`.github/dependabot.yml`, no Renovate configuration, no `npm audit` in any
script, no lockfile-refresh cadence, and no `test` script for an update to be
validated against. `package.json` exposes exactly four scripts: `dev`, `build`,
`start`, `lint`.

### 3.1 Current surface

| Metric | Value at baseline |
|---|---|
| Production dependencies | **19** (not 20 — verified by counting `dependencies` in `package.json`) |
| Development dependencies | 9 |
| Lockfile | `package-lock.json`, 286,180 bytes, committed |
| Automated update tooling | None |
| Vulnerability scanning | None |

Full production dependency list: `@google/generative-ai`, `@heroicons/react`,
`@reduxjs/toolkit`, `@stripe/stripe-js`, `@types/bcryptjs`, `bcryptjs`,
`cloudinary`, `mongodb`, `mongoose`, `next`, `next-auth`, `qrcode`, `react`,
`react-dom`, `react-hot-toast`, `react-icons`, `react-redux`, `resend`,
`stripe`.

### 3.2 The policy to adopt

| Class | Definition | Action window | Validation required |
|---|---|---|---|
| **Critical / High security advisory** | CVSS ≥ 7.0 affecting a production dependency on a reachable code path | Patch and deploy within **72 hours** of the advisory becoming known | Build passes; manual smoke of the affected path |
| **Moderate security advisory** | CVSS 4.0–6.9, or high severity on a dev-only dependency | Within **14 days** | Build passes |
| **Low security advisory** | CVSS < 4.0 | Batched into the next monthly minor update | Build passes |
| **Minor and patch updates** | Non-breaking version bumps | **Monthly, batched into one branch**, first working day of the month | `tsc --noEmit` + `eslint` + build + smoke of checkout, AI generation, login |
| **Major updates (non-framework)** | Breaking version bumps to libraries | Only with a **stated reason** recorded in `DECISIONS.md` and a **written rollback plan** (previous version, lockfile commit hash, revert procedure) | Full manual regression of the affected subsystem |
| **Framework majors** | `next`, `react`/`react-dom`, `next-auth`, `mongoose` | Treated as **projects, not chores**: scoped, scheduled, with a migration note in `DECISIONS.md`. Never batched with anything else | Full manual regression; deploy to a Vercel preview and exercise checkout end-to-end before promoting |

Minimum enabling steps, in order: (1) add `npm audit --audit-level=moderate` to
a CI job, (2) add `.github/dependabot.yml` with `npm` ecosystem, weekly
schedule, and grouped minor/patch pull requests, (3) require the CI job green
before merge. Steps 1 and 3 depend on CI existing at all — see §4.

### 3.3 Named risk items

| Item | Version | Risk | Required action |
|---|---|---|---|
| **`next-auth`** | `^4.24.13` | v4 is a terminal line. The successor is Auth.js / NextAuth v5, which changes the configuration shape, the session-access API and the middleware integration. The project uses `getServerSession(authOptions)` in the majority of its 54 API route files, plus `useSession` in client guards (`AdminGuard`, `StoreOwnerGuard`) — a v5 migration touches nearly every authenticated surface | Treat as a framework major (§3.2). Do **not** attempt before a test harness exists. Track the v4 maintenance status explicitly; a security advisory against v4 with no v4 patch is the forcing event |
| **`mongodb` + `mongoose` both direct** | `mongodb ^7.0.0`, `mongoose ^9.1.2` | Unusual, and verified to be unnecessary here. `mongoose` already depends on the MongoDB driver transitively. A repository-wide search for `from "mongodb"` / `require("mongodb")` across `src/` and `scripts/` returns **zero matches** — the only database entry point is `src/lib/mongodb.ts`, which imports `mongoose` and calls `mongoose.connect()`. Declaring the driver directly risks npm resolving a driver version that mongoose has not been tested against | Remove `mongodb` from `dependencies` after confirming the build and a database round-trip still succeed. If it is ever needed directly (for example an `@auth/mongodb-adapter`, which is also not installed), reinstate it pinned to the version mongoose resolves |
| **Gemini model pin** | `gemini-3.7-flash` | `src/services/ai/geminiProvider.ts` pins `MODEL_NAME` with a comment instructing a check of `https://ai.google.dev/gemini-api/docs/models` before bumping. The pin is correct — it prevents quota, pricing and output behaviour shifting silently under `gemini-flash-latest` — but it converts model retirement into a hard outage rather than a silent degradation. `scripts/translate-content.js` carries the same pin and must be bumped in step | Add a quarterly calendar check of Google's model list, including the deprecation and retirement dates for the pinned version. Bumping the model is a **major** update under §3.2: it changes generated itinerary quality, which is the product |
| **`@types/bcryptjs` in `dependencies`** | `^2.4.6` | A types-only package declared as a production dependency. Harmless at runtime, but it inflates the production tree and signals the dependency split is not being maintained | Move to `devDependencies` during the first monthly batch |
| **`@google/generative-ai`** | `^0.21.0` | A pre-1.0 SDK. Semver does not protect against breaking changes below `1.0.0`, and `^0.21.0` permits `0.21.x` only, which is the correct behaviour by accident rather than by intent | Pin exactly (`0.21.x` → no caret) and treat any bump as a major |

---

## 4. Technical debt burn-down

Ordered by what should be paid first. Ordering is driven by interest rate — what
the debt costs while it remains unpaid — not by size.

| # | Debt | Interest being paid | When to fix |
|---|---|---|---|
| ~~1~~ | ~~**Unauthenticated destructive seed endpoint** — `GET /api/dev/seed/products` calls `seedProducts()`, which runs `Product.deleteMany({})`, with no auth, no role check and no environment guard~~ | Cross-ref `07-SECURITY` §1 (SEC-1) | **Done 2026-08-17** — route and helper both deleted |
| 2 | **No automated tests** | Every fix in §1.2 is unprotected. The money path — commission split, escrow release on buyer confirmation, dispute resolution, transfer idempotency — has zero assertions. Refactoring is discouraged by the absence of a safety net, which is how a structurally-fixed codebase turns back into a patched one | Before the first real commercial transaction. Cross-ref `09-QUALITY` §5 |
| 3 | **No CI** | `tsc --noEmit` and `eslint` are run by hand and their results recorded in prose. A tired founder skips them. Nothing enforces a green build before Vercel auto-deploys `main` | With, or immediately after, item 2. Cross-ref `08-ENGINEERING` §11 |
| 4 | **No backups** — Atlas M0 has no continuous backup | Total data loss on cluster failure or operator error, with no recovery path. Orders are financial records | Before the first real order. See §5 |
| 5 | **Unrotated secrets** — Gemini API key, Google OAuth client secret, Cloudinary secret all appeared in screenshots during setup | Live credential exposure of unknown blast radius. Deferred by the founder on 2026-08-05 with an explicit instruction not to re-raise unprompted; recording it here is the standing raise. Cross-ref `07-SECURITY` §1 | Before public launch. Non-negotiable at that gate |
| 6 | **No monitoring or error tracking** | No Sentry, Datadog or equivalent is installed — a repository search returns nothing. Failures are discovered by the founder using the site, or by a user complaining. Silent failures already exist by design: `src/lib/email.ts` wraps every send so a failure cannot break the flow that triggered it, which means a systematically failing email provider produces no signal at all. Cross-ref `10-OPERATIONS` §4 | Before public launch |
| 7 | **Vercel Hobby plan** | Hobby's terms exclude commercial use. Accepting a real payment on Hobby is a terms breach, and the remedy is at Vercel's discretion. Deferred by the founder on 2026-08-05 | Before the first real commercial transaction. See §5 |
| 8 | **Gemini free tier** — hard 5 requests/minute, plus a separate ~20 requests/day ceiling observed during the 2026-08-13 translation migration | Paying AI-credit users hit instant 429s under trivial concurrency. Mitigated but not solved: `geminiProvider.ts` retries once after 2 s and raises `AIRateLimitError` so the route returns a friendly 429 rather than a bare 500. The changelog states plainly that this smooths bursts and cannot substitute for billing | Before opening the AI Planner to real users. See §5 |
| 9 | **In-memory rate limiting** — `src/lib/rateLimit.ts` holds a module-level `Map`, 5 attempts per 15-minute window, keyed on the first `x-forwarded-for` entry | Resets on every cold start and is not shared across serverless instances, so the effective limit is 5 × (number of warm instances). Accepted deliberately in `DECISIONS.md` (2026-08-03) and documented rather than hidden | On the trigger in §5, not before |
| 10 | **Dead `backend/` directory** | `backend/Dockerfile` and `backend/package.json` are both **0 bytes**. Costs nothing at runtime; costs a new reader's time and implies an architecture that does not exist. Cross-ref `03-ARCHITECTURE` §1.3 | Next housekeeping pass. Delete, together with root-level `hash.js`, the 22 KB `models_debug.json`, and `jsconfig.json` (redundant beside `tsconfig.json`) |
| 11 | **Untranslated UI chrome** | Shop, attractions, local-experiences list and detail pages, checkout, cart and dashboard still render hardcoded English labels, filters and buttons regardless of locale. Content is translated; the frame around it is not. A French user sees French product copy inside English chrome, which reads as broken rather than partial | Medium horizon (§6). The pattern is established by `/ai` and the home page; the remaining work is mechanical |
| 12 | **Untranslated data fields** — product `variants[].name`, attraction `nearbyHotels`/`nearbyRestaurants` blurbs, `Category` and `BikeRentalProvider` names | Explicitly deferred from the 2026-08-13 pass to keep it shippable in one day. Category filtering is also keyed on the untranslated English category string, so the filter values themselves cannot localise until this is addressed | Medium horizon, alongside item 11 |
| 13 | **Dead `href="#"` footer links** | `Footer.tsx` line 86 renders `footer.localGuides` as a link to nowhere — a customer-visible dead end and an SEO signal. Beyond the item recorded in `TODO.md`, `StoreOwnerFooter.tsx` carries three more at lines 108, 112 and 116 | Next housekeeping pass. Either build the destination or remove the link |
| 14 | **Stale `SESSION_HANDOFF.md` and lapsed `DECISIONS.md`** | The handover file describes the 2026-08-08 session's work as uncommitted; it is committed. `DECISIONS.md` stops at 2026-08-03 while decision-grade rationale accumulates in the changelog. Both mislead a reader — including a future second engineer — about the current state | Next documentation pass. Backfill `DECISIONS.md` from the 08-05 to 08-14 changelog entries |
| 15 | **Store-owner "Pending Payouts" sums order totals, not `storeOwnerAmount`** | Recorded in `SESSION_HANDOFF.md` as known-inaccurate. A store owner sees a payout figure inflated by the platform commission and the delivery fee. It is a display bug, not a money bug — the transfers themselves compute from `commissionRateSnapshot` — but it erodes the one number store owners care about | Before onboarding a second real store |

---

## 5. Scaling triggers

The purpose of this section is to convert "we might need to change this" into
"change it when X". Every threshold is numeric or event-based. None requires
judgement in the moment.

The founder's stated planning assumption is approximately **100 users over five
years**, with a shift to a team if marketing or demand grows. Every row below is
sized against that assumption, and every row states the observable that
invalidates it.

### 5.1 Trigger table

| # | Signal | Threshold | Action | Estimated effort |
|---|---|---|---|---|
| **T1** | Gemini free-tier quota | **Before any public launch** — an event, not a usage number. The free tier is a hard 5 requests/minute with no queueing, so five simultaneous visitors is already the ceiling | Enable billing on the Google Cloud project behind `GEMINI_API_KEY`. Keep the pinned model. Set a Cloud billing budget alert at €20/month | **1 hour**, no code change. The single cheapest item in this table and a hard launch blocker |
| **T2** | Vercel plan | **First real commercial transaction.** A terms threshold, not a capacity one — Hobby excludes commercial use, so the breach occurs on payment one, not at a traffic level | Upgrade Hobby → Pro (~US$20/month). Confirm the domain, environment variables and the Stripe webhook endpoint survive the change | **1 hour** including verification |
| **T3** | Atlas M0 storage | **300 MB used** (of the 512 MB M0 limit) | Upgrade M0 → M10 | **2–4 hours** including a restore rehearsal |
| **T4** | Atlas connections | **Sustained connection warnings** in the Atlas UI, or any `MongoServerSelectionError` in production logs. M0 caps at 500 connections; serverless instances each open their own pool, and `src/lib/mongodb.ts` caches one connection per warm instance | Upgrade M0 → M10 | As T3 |
| **T5** | Backup coverage | **The first real order.** M0 has no continuous backup. This trigger fires before T3 and T4 in practice, because backup matters from order number one — an order is a financial record and a customer obligation, and losing one is not recoverable by re-seeding | Upgrade M0 → M10 (~US$57/month) for continuous backup and point-in-time restore. Until the upgrade lands, run a scheduled `mongodump` to encrypted off-cluster storage. Cross-ref `05-DATA` §7 and `10-OPERATIONS` §6 | **4 hours** for the upgrade plus a documented, *executed* restore test. An untested backup is not a backup |
| **T6** | Rate-limiting correctness | **Sustained traffic spanning multiple concurrent serverless instances** (observable as login attempts arriving at more than one instance within a 15-minute window), **or any observed brute-force attempt** against `/api/auth` or the store-owner login | Replace the in-memory `Map` in `src/lib/rateLimit.ts` with Upstash Redis. The module already exposes exactly two functions, `getClientIp()` and `checkRateLimit(key)`, so the swap is behind a stable seam | **4–6 hours** including account setup and verification across instances |
| **T7** | Dispute volume | **More than 10 disputes per week.** Resolution is fully manual today: `GET /api/admin/disputes` flattens every `Order` item at `fulfillmentStatus: "issue_reported"` into a list, and an admin posts an outcome of `seller_fault`, `buyer_fault` or `split` per item | Build tooling: bulk actions, a canned-reason taxonomy, an SLA clock on `issueReport.reportedAt`, and buyer/seller evidence attachment. Do **not** automate the money decision itself | **1–2 weeks** |
| **T8** | Reconciliation load | **More than 50 orders per month.** Reconciling Stripe against MongoDB by hand stops being feasible somewhere around weekly-for-an-hour, which is roughly this volume | Build a scheduled job that walks Stripe charges and transfers for the period and asserts, per order, that `stripeSessionId`, `paymentIntentId`, `chargeId`, per-item `transferId`/`transferAmount`, and `deliveryFeeTransferId` all match Stripe's record — and that no item is stuck with `transferPending: true`. `transfer_group` is already set to `order._id.toString()` at checkout and on every transfer, so the join key exists | **1 week** |
| **T9** | Catalogue query cost | **More than 300 catalogue items** across products, attractions and local experiences combined. `GET /api/products` currently issues `Product.find({ active: true }).sort(...).populate("storeId").lean()` with **no `limit` or `skip`**, returns the full set, and the client filters in the browser. Only `/api/admin/orders` and `/api/user/ai-history` apply any limit at all | Introduce Atlas Search, or at minimum server-side pagination plus compound indexes on `{ active: 1, category: 1 }`. Note that `category` filtering is keyed on the untranslated English string (debt item 12), so localised search requires that debt paid first | **1–2 weeks** for Atlas Search; **2 days** for pagination and indexes as an interim step |
| **T10** | Architecture | **A second engineer needs to deploy independently**, **OR** the AI planner's load profile begins affecting checkout latency (observable as p95 latency on `/api/payments/checkout` rising while `/api/ai/preview` volume rises) | Extract one service along a named seam. See §5.2 | **3–6 weeks** per seam. Do not begin without T11 satisfied |
| **T11** | Team | **The founder's stated condition: sustained demand following marketing.** Made concrete: more than 100 orders per month sustained for three consecutive months, or a support and dispute load exceeding 10 hours per week | Hire or bring in a second engineer. See §5.3 for what must exist first | See §5.3 |

### 5.2 The three clean seams (T10)

The monolith is not arbitrarily entangled. Three boundaries already exist in the
code and would survive extraction without a redesign.

| Seam | Existing boundary | Why it is clean | Caveat |
|---|---|---|---|
| **AI generation** | `src/services/ai/aiProvider.ts` declares `interface AIProvider { generate(input: AIInput): Promise<AIOutput> }`, implemented by `GeminiProvider` and resolved through `src/services/ai/index.ts` | The consumer already depends on an interface, not on Gemini. Extraction replaces the local implementation with an HTTP client behind the same interface. This is also the seam with the most distinct load profile — long, bursty, rate-limited calls sharing a serverless budget with checkout | Credit accounting must stay on the monolith side of the boundary. The 2026-08-06 fix depends on charging only after a successful generation; splitting that across a network call reintroduces the failure it fixed |
| **Settlement and disputes** | Every money movement is keyed by `transfer_group: order._id.toString()` — set at checkout in `/api/payments/checkout`, and on every `stripe.transfers.create` call in `/api/fulfill/[token]/confirm` and `/api/admin/disputes/.../resolve`. Transfers carry idempotency keys of the form `transfer:${order._id}:${item._id}` and `transfer:${order._id}:deliveryFee` | A consistent external correlation key plus per-operation idempotency is exactly what a settlement service needs to be re-drivable and independently auditable | Highest-risk extraction in the system. Extract last, and only with the automated reconciliation job from T8 already running against it |
| **Public catalogue** | `GET /api/products`, `/api/attractions`, `/api/local-experiences` (list and `[slug]` detail), plus `sitemap.ts` and `robots.ts`. All read-only, all anonymous, all pass through `resolveLocalized()` in `src/lib/localizeContent.ts` | No writes, no session, no money. It is also the only surface that would benefit from independent caching and independent scaling under SEO traffic | Detail-page `layout.tsx` files query Mongoose directly via `React.cache` for `generateMetadata` and JSON-LD; extraction must preserve that single-query-per-render property or metadata rendering doubles the database load |

### 5.3 What must exist before a second engineer is productive (T11)

A second engineer arriving into the current repository would be net-negative for
their first weeks, because nothing prevents them breaking money-path code and
nothing tells them they have.

| Prerequisite | Why it blocks a second engineer | Cross-ref |
|---|---|---|
| **CI running `tsc --noEmit`, `eslint` and `build` on every push** | Today these are run by hand by the person who wrote the change. A second engineer has no way to know their change compiles against everyone else's | `08-ENGINEERING` §11 |
| **A test suite covering the money path** | Commission split, escrow release on confirmation, dispute resolution, transfer idempotency, and the legacy/per-item fulfilment split (§7.1). Without it, the founder must personally review every change touching payments, which negates the second engineer | `09-QUALITY` §5 |
| **Branch protection on `main`** | Vercel auto-deploys `main`. Today one `git push` reaches production with no gate. This is tolerable for one person who knows the system; it is not tolerable for two | `08-ENGINEERING` §11 |
| **Mandatory pull-request review** | The rationale for most design choices lives in the founder's head and in `CHANGELOG.md`. Review is the mechanism that transfers it | `08-ENGINEERING` §11 |
| **A seeded local environment** | Local development currently shares the production MongoDB database — this caused the 2026-08-05 webhook race. Two developers sharing one production database is not workable | `10-OPERATIONS` §2 |
| **`DECISIONS.md` backfilled to current** | It stops at 2026-08-03 (§1.3). It is the intended onboarding document and is nearly two weeks stale at baseline | — |

Estimated cost of the prerequisites: **3–4 weeks of focused work.** This is the
real price of the solo-optimised choices recorded throughout this documentation
set, and it is payable before the second engineer, not after.

---

## 6. Product roadmap

### 6.1 Near horizon — pre-launch hardening

Nothing in this horizon adds a feature. All of it is the launch gate.

| Item | Status | Blocking? |
|---|---|---|
| Delete `GET /api/dev/seed/products` | **Done 2026-08-17** | cross-ref `07-SECURITY` §1 |
| Test suite covering the money path | Not started | **Yes** |
| CI pipeline | Not started | **Yes** |
| Error tracking and uptime monitoring | Not started | **Yes** |
| Atlas M10 upgrade with a rehearsed restore | Not started | **Yes** — T5 |
| Rotate Gemini, Google OAuth and Cloudinary secrets | Deferred by founder 2026-08-05 | **Yes** |
| Enable Gemini billing | Deferred | **Yes** — T1 |
| Vercel Hobby → Pro | Deferred by founder 2026-08-05 | **Yes** — T2 |
| Legal: terms of service, marketplace terms, GDPR records, DAC7 seller reporting readiness | Cross-ref `12-GOVERNANCE` §2 | **Yes** |
| Remove or resolve the four `href="#"` dead links | Not started | No |
| Delete `backend/`, `hash.js`, `models_debug.json`, `jsconfig.json` | Not started | No |

### 6.2 Medium horizon — post-launch

| Item | Trigger or precondition | Notes |
|---|---|---|
| **Reviews and ratings** | **20 or more completed orders.** Below that, an empty or three-item review section reduces trust rather than building it | `LocalExperience` already carries `rating` and `reviewCount` fields, currently set as static content rather than derived from real reviews. A real implementation needs a `Review` model, a verified-purchase check against `Order`, and moderation. Cross-ref `04-DOMAIN` §6 |
| **Complete the UI-chrome translation** | None — mechanical work | Debt items 11 and 12. The pattern is fully established by the `/ai` page and home-page passes. Includes `variants[].name`, `nearbyHotels`/`nearbyRestaurants`, and `Category`/`BikeRentalProvider` names, and requires decoupling category filtering from the English category string |
| **Google Maps Directions in AI itinerary output** | None — the APIs are already enabled on the Google Cloud project and are **not wired into any UI** | Recorded under "Future Ideas" in `TODO.md`. The itinerary already names real Porto places by prompt construction (`promptBuilder.ts` requires "a real Porto place or experience" per activity), so day-by-day walking directions are the natural next output. Watch the cost: Directions is billed per request, unlike the currently-free Gemini tier |
| **Bike-rental and tour-guide partners generalised into the Store/Connect model** | A second partner type requesting payouts | `BikeRentalProvider` exists today as a separate content-only model with no Connect account and no payout path. Generalising means those partners become `Store`-shaped: `storeCode`, `passwordHash`, `stripeAccountId`, `commissionRate`, and the same per-item escrow. Effort is dominated by the schema decision — one polymorphic `Store` with a `type`, or parallel models — not by the Stripe work, which is already built |
| **Referral partners as a curated manual list** | Any hotel or restaurant partnership | Deliberately no payment integration. `DECISIONS.md` (2026-08-03) records this as intentional simplicity, not a placeholder: money never passes through the platform, so there is no Connect account and no live integration. Commission is invoiced manually |

### 6.3 Long horizon — multi-city expansion

Expansion beyond Porto is the only roadmap item that requires a data-model
change rather than additive work. The current model does not merely lack a city
field — it encodes single-city as an assumption in four places.

| Component | Current state (verified) | What must change |
|---|---|---|
| `Attraction` | No `city` field. Location is `area: String` — a Porto neighbourhood name, meaningful only within Porto | Add a `city` reference; migrate all 39 existing documents to Porto; make `area` a child of city |
| `LocalExperience` | Same: `area: String`, no `city`. `meetingPoint` is free text assuming local knowledge | As above, for 9 documents |
| `Store` | `location: String`, required, free text. No city reference, no coordinates | Add a `city` reference. Delivery-fee semantics become city-scoped; a flat `deliveryFee` per store stops making sense across cities |
| `Product` | No location of its own — inherits it entirely from `storeId` | No direct change, but every catalogue query must gain a city filter, which interacts with T9 |
| **AI prompt** | `src/services/ai/promptBuilder.ts` hardcodes Porto in the prompt body: `"User preferences for this Porto trip"` and `"each naming a real Porto place or experience"` | City must become a prompt parameter. This is the smallest code change and the largest quality risk — itinerary quality depends on the model's density of knowledge about the specific city, which varies enormously |
| **Routing and SEO** | Locale prefixes are `/fr`, `/es`, `/pt`. There is no city segment. `sitemap.ts` enumerates every active slug with per-locale `hreflang` | Introducing `/porto/...` renames every ranked URL. Cross-ref §7.3 — there are no redirects configured. Adding a second city is the one moment where breaking the URL structure is cheaper than living with it, and it must be done with `301`s in place |
| **Brand** | The product is called GoWithPorto; the domain is `gowithporto.pt` | Not a code problem, and the largest constraint of all. Multi-city under this name is a rebrand, not a feature |

Realistic assessment: multi-city is a **rewrite of the content layer and a
rebrand**, not an increment. Cross-ref `01-PRODUCT` §9.3.

---

## 7. Backward compatibility policy

### 7.1 Order documents and fulfilment state — the live example

**Policy: never break the fulfilment state of an existing `Order`. Add a new
path; keep the old one running for documents that predate it.**

This is not aspirational. The codebase already honours it, and the mechanism is
explicit in both directions.

`Order` documents exist in two generations. Older ones have no `paymentIntentId`
and are fulfilled whole-order. Newer ones have a `paymentIntentId` and are
fulfilled per item, with escrowed release. Rather than migrating the old
documents or silently mis-handling them, the two routes each refuse the other's
documents:

```ts
// src/app/api/store-owner/orders/[orderId]/items/[itemId]/dispatch/route.ts
if (!order.paymentIntentId) {
  return NextResponse.json(
    { error: "This order uses the legacy fulfillment flow — use Mark as Shipped instead." },
    { status: 400 }
  );
}
```

```ts
// src/app/api/store-owner/orders/[orderId]/ship/route.ts
if (order.paymentIntentId) {
  return NextResponse.json(
    { error: "This order uses per-item fulfillment — dispatch items individually." },
    { status: 400 }
  );
}
```

The guards are mutually exclusive and complete: every order routes to exactly
one flow, the discriminator is a field that is either present or absent rather
than a version number that could be wrong, and the error message tells the store
owner what to do instead rather than failing opaquely. This is the correct
shape, and it is the reference pattern for every future fulfilment change.

The costs are real and should be stated. Two live fulfilment paths mean two code
paths to maintain, two email flows (`sendOrderShippedForOrder` versus
`sendOrderDispatchedForOrder` / `sendOrderReadyForPickupForOrder`), and two sets
of behaviour a new engineer must learn. Neither path has a test.

| Rule | Statement |
|---|---|
| **BC-1** | An existing `Order` must always be resolvable to exactly one fulfilment flow by a field that is present or absent, never by inference or by date |
| **BC-2** | A legacy path is removed only when a query proves zero remaining documents can reach it — and the removal is recorded in `CHANGELOG.md` with that count |
| **BC-3** | New fields on `Order` are optional with a safe default. The `fulfillmentStatus` enum may be extended; existing values may not be renamed or removed |
| **BC-4** | `commissionRateSnapshot` is a snapshot by design — changing `Store.commissionRate` must never retroactively alter settled orders |

### 7.2 Stripe identifiers as permanent reconciliation keys

**Policy: `stripeSessionId`, `paymentIntentId`, `chargeId`, `transfer_group` and
the transfer idempotency keys are permanent. They are never reused, never
regenerated, and never repurposed.**

| Key | Where it lives | Guarantee |
|---|---|---|
| `Order.stripeSessionId` | Unique sparse index | One Checkout Session maps to at most one order. This index is the duplicate-order defence |
| `Order.paymentIntentId`, `Order.chargeId` | Fields on `Order` | The join to Stripe's charge record, and the `source_transaction` for every transfer |
| `transfer_group` | Set to `order._id.toString()` at checkout and on every transfer | The single correlation key linking a Stripe charge, all item transfers, the delivery-fee transfer, and any dispute refund or reversal. Changing its derivation orphans every historical order in Stripe's dashboard |
| `transfer:${order._id}:${item._id}` and `transfer:${order._id}:deliveryFee` | Idempotency keys on `stripe.transfers.create` | Prevents double payment on retry. Changing the format re-opens the double-transfer window for any in-flight retry |
| `Order.items[].fulfillmentToken` | Unique sparse index; the bearer token in the handover URL | Must remain unique across the whole collection for the lifetime of the system, including for completed orders |

These identifiers are also the substrate for the T8 reconciliation job and for
any tax or DAC7 reporting (cross-ref `12-GOVERNANCE` §2). They outlive the
features that created them. Retention is therefore longer than the operational
need — see §8.3.

### 7.3 Public URLs and slugs

**Policy: a published slug is permanent. If a slug must change, a `301` from the
old path ships in the same deployment.**

`Product`, `Attraction` and `LocalExperience` each carry `slug: { type: String,
unique: true }`, and `src/app/sitemap.ts` publishes every active slug with
per-locale `hreflang` alternates. The project has invested in SEO — title
templates, Open Graph and Twitter cards, JSON-LD (`Product`/`Offer`,
`TouristAttraction`, `TouristTrip`/`AggregateRating`), sitemap and robots — and
French and Spanish organic search is the stated acquisition channel.

There are **no redirects configured**. `next.config.mjs` defines none, and
`src/proxy.ts` rewrites locale prefixes rather than redirecting paths.
Consequently, changing a slug today produces a `404` on a page that may be
ranked, and the ranking does not transfer.

| Rule | Statement |
|---|---|
| **URL-1** | Slugs are immutable once the URL appears in `sitemap.xml`. Editing a title does not change the slug |
| **URL-2** | If a slug must change, add a permanent redirect in `next.config.mjs` in the same deployment, and keep it for a minimum of **12 months** |
| **URL-3** | Deleting a catalogue item sets `active: false` — it drops out of the sitemap — rather than deleting the document, so historical `Order` items keep resolving |
| **URL-4** | Locale prefixes `/fr`, `/es`, `/pt` are part of the public contract. English stays unprefixed; changing that breaks every indexed English URL |

### 7.4 i18n keys

**Policy: a key in `src/i18n/en.json` is an API. Renaming one is a breaking
change to three other files.**

`src/i18n/index.ts` implements `t(lang, key)` with a two-step fallback: the
requested locale, then `en`, then the raw key string. The failure mode is
therefore visible but ugly — a missing key renders as `footer.localGuides` in
the user interface, not as a crash.

| Rule | Statement |
|---|---|
| **I18N-1** | Keys are additive. Rename only by adding the new key, migrating all call sites, then removing the old key in a separate commit |
| **I18N-2** | A new key ships in all four locale files simultaneously. English-only means a French user sees English text with no signal that it is untranslated |
| **I18N-3** | **Values that reach Gemini are not translatable.** `promptBuilder.ts` interpolates the submitted `budget`, `people` and `travelStyles` values directly into the prompt, so `<select>` option `value`s stay as stable English identifiers (`"Cheap"`, `"Solo"`, `"Culture & History"`) and only the displayed label is localised. The same convention applies to `contact.topics.*`. Translating a value silently changes what the model receives |
| **I18N-4** | Admin and store-owner surfaces are English-only by design and are excluded from the `proxy.ts` matcher. Do not add locale keys there without also changing the routing decision |

---

## 8. Retirement and deprecation policy

**Status: SPEC.** Correctly unexercised. No feature has been retired, no data
has been deleted under a retention policy, and no shutdown has been rehearsed.
This section exists so that the first exercise is not also the first time anyone
thinks about it.

### 8.1 Feature deprecation

| Phase | Duration | Actions |
|---|---|---|
| **1. Announce** | Minimum 30 days before dual-run ends | Record in `CHANGELOG.md` and `DECISIONS.md` with the removal date. Notify affected store owners by email if the feature touches fulfilment or payouts |
| **2. Dual-run** | Minimum 60 days | Old and new paths both live, discriminated by a document field, exactly as §7.1 does for `ship` versus `dispatch`. New documents take the new path only |
| **3. Verify** | Before removal | Run a query proving zero remaining documents can reach the old path. Record the count in the removal commit message (rule BC-2) |
| **4. Remove** | — | Delete the code, keep the data. Fields on existing documents are not dropped |

The removal of `POST /api/orders` and `/api/payments/success` on 2026-08-03 is
the nearest precedent, but it is not an example of this process — those routes
were deleted immediately because they were a live security hole and nothing in
the UI called them. That was correct. It is not the template for retiring a
feature people use.

### 8.2 Full shutdown — required order of operations

The ordering below is domain-specific. A content site can shut down in any
order. A marketplace holding escrowed money cannot: unconfirmed handovers hold
**buyers' money** that has been captured but not yet transferred to the seller.
Steps 1 to 3 must complete before anything that could make the system unable to
move money.

| # | Step | Why it is at this position |
|---|---|---|
| **1** | **Stop accepting new orders and new AI credit purchases.** Disable `/api/payments/checkout` and the credit purchase path first | Every hour the checkout stays open adds new escrowed items to the backlog created by step 2 |
| **2** | **Enumerate and settle every in-flight escrowed item.** Query `Order` for all items where `fulfillmentStatus` is `pending`, `dispatched` or `ready_for_pickup`, plus every item with `transferPending: true`, plus every order with `deliveryFeeTransferred: false` and a non-zero fee. For each: either the goods were received, in which case release to the seller, or they were not, in which case refund the buyer | This is the money-specific step that makes this domain different. An item at `dispatched` represents a captured payment the platform is holding on behalf of a buyer who has not confirmed receipt. Shutting down with those open converts a wind-down into a consumer-protection dispute and, in the EU, a potential regulatory matter |
| **3** | **Resolve every open dispute.** Every item at `fulfillmentStatus: "issue_reported"`, plus any `legalException.requested` still unprocessed | Same rationale as step 2. Disputes are money in a contested state; abandoning them is worse than abandoning uncontested money |
| **4** | **Verify against Stripe, not against the database.** Confirm the Stripe balance is zero and that every `transfer_group` reconciles: no unreconciled charge, no pending transfer, no unresolved dispute in Stripe's own dispute system | The database can be wrong. Steps 2 and 3 are only complete when Stripe agrees |
| **5** | **Export and deliver store owners' sales history.** Per store: every order, item, price, `commissionRateSnapshot`, `platformFeeAmount`, `storeOwnerAmount`, transfer identifier and date, in CSV and JSON, delivered by email with a documented retention window | Store owners have their own tax and accounting obligations that outlive the platform. Withdrawing their records is both a commercial and a legal failure |
| **6** | **Offboard Stripe Connect accounts.** Notify each connected account holder, confirm final payouts have arrived (not merely been created — check for `in_transit`), then close the platform's Connect integration | Closing the platform account with payouts in transit strands seller funds |
| **7** | **Notify users.** Minimum 30 days' notice to every `User`, with an explanation of what happens to their data, how to export it, and the date access ends | Article 13/14 transparency obligations do not lapse because the business is closing. Cross-ref `12-GOVERNANCE` §2 |
| **8** | **Execute data deletion against the retention matrix.** Not a blanket `dropDatabase()` — see §8.3 |
| **9** | **Wind down infrastructure in dependency order.** Vercel deployment, then Atlas cluster (after a final encrypted archival export), then Cloudinary, Resend, the Google Cloud project, and finally Stripe | Deleting the Atlas cluster before the export in step 5 has been delivered and acknowledged destroys the records needed for step 8's exempt categories |
| **10** | **DNS and domain.** Keep `gowithporto.pt` registered and serving a static wind-down notice for **12 months**, then let it lapse. Remove the Cloudflare zone last | Ranked pages, transactional emails already delivered, and Stripe receipts all reference the domain. An immediately dead domain turns every historical link into a `404` and every historical email into a phishing-shaped dead end. Letting the domain expire and be re-registered by a third party is the worse outcome |
| **11** | **Archive the repository and this documentation set.** Mark the GitHub repository read-only, tag a final release, and keep `/docs` and this documentation set intact | The repository is also this project's academic and portfolio artefact. It has value after the service does not |

### 8.3 Data deletion versus retention

Deletion is not uniform. Three categories with different rules:

| Category | Examples | Rule |
|---|---|---|
| **Delete promptly** | `User` profile data, avatars in Cloudinary, `Favorite` documents, `AIResponse` itinerary history, session records | Delete at shutdown, subject to any live dispute. This is personal data with no continuing legal basis once the service ends |
| **Retain — tax** | `Order` financial records: totals, `platformFeeAmount`, `storeOwnerAmount`, `commissionRateSnapshot`, Stripe identifiers | Portuguese commercial and tax record-keeping obligations run to **10 years**. These records are retained in an encrypted archive after the service stops, not deleted with it |
| **Retain — DAC7** | Seller identification and per-seller consideration paid, per reportable period | EU DAC7 platform-operator reporting requires seller records to be kept for the statutory period after the reporting year. Cross-ref `12-GOVERNANCE` §2 for the applicability assessment |

The tension is real and must be resolved deliberately rather than discovered
during a shutdown: a GDPR erasure request cannot delete a record that tax law
requires be kept. The correct handling is to minimise the retained record to the
fields the obligation actually names, remove everything else, and document the
lawful basis for what remains. Doing this at shutdown is far harder than
designing for it now — the retention matrix should be written while the system
is running.

### 8.4 The realistic scenario: operational dormancy

Full shutdown is not the likely end state. The founder is a final-year master's
student at FEUP. The probable outcome is graduation followed by employment,
after which the available maintenance time falls sharply — not to zero, but well
below what a live marketplace with real money in escrow requires.

Dormancy is the honest plan for that case: the site stays up and informational,
the money paths close, and the maintenance burden falls to something a person
with a full-time job can sustain.

| Requirement | Detail |
|---|---|
| **Close the money paths cleanly** | Steps 1 to 4 of §8.2 execute in full. There is no dormant state in which escrowed items remain unresolved. This is the entire point: dormancy is only safe once the platform holds nobody's money |
| **Disable checkout and AI credit purchase; keep the catalogue** | Attractions, local experiences and the shop become read-only content. Products can stay visible with purchasing disabled, or be set `active: false` — the second is cleaner but drops them from the sitemap and forfeits their rankings |
| **Decide the AI planner's fate explicitly** | It is the single recurring cost that scales with visitors rather than with orders. Either keep it running with a hard Google Cloud billing cap, or disable it behind a clear message. Leaving it on with an uncapped billing account is the one configuration that can produce an unbounded bill for a dormant site |
| **Downgrade the paid tiers** | Reverse T2 and T3/T5 once the data is archived: Vercel Pro → Hobby is permissible again once no commercial transactions occur; Atlas M10 → M0 or M2 is permissible once the financial archive lives outside the cluster |
| **Keep security patching, drop feature work** | The dependency policy in §3.2 continues to apply to Critical and High advisories only. Everything else stops. A dormant site with an unpatched authentication library is worse than a shut-down one |
| **Offboard store owners properly** | Final payouts confirmed as arrived, sales history delivered (step 5), Connect accounts closed (step 6). Store owners must not be left with a dashboard that no longer settles |
| **Publish the state** | A visible notice explaining that the marketplace is paused and the content remains. Silence looks like abandonment and destroys the reputational value the project holds as a portfolio artefact |
| **Set a review date** | An explicit calendar date — 12 months out — to either reactivate, continue dormancy, or execute §8.2 in full. Dormancy without a review date is abandonment with extra steps |

---

## Trade-offs recorded

**A prose changelog is a real maintenance practice, and it is not a substitute
for tests.** The 34 KB of root-caused entries in `docs/CHANGELOG.md` are more
than most solo projects produce and more than many funded teams sustain — the
Gmail image-proxy diagnosis, the local-versus-production webhook race, the
Turbopack cold-compile timing that was written down precisely because it was
*not* a bug. That practice caught real defects and produced structural fixes
rather than patches. But its output is knowledge in a document, and a document
does not execute. Every fix described in §1.2 could be reintroduced tomorrow by
a change that compiles, lints and looks correct, and nothing in the system would
object. The changelog also demonstrates its own limit: the baseline commit's
escrow and dispute system — the most financially sensitive code in the project —
appears nowhere in it. A practice that depends entirely on discipline degrades
exactly when the person is busiest, which is when the riskiest code ships.

**Deferring the dependency policy is defensible today and stops being
defensible at launch.** Nineteen production dependencies on a pre-launch project
maintained by one person is a small surface, and monthly manual review would
have found nothing so far. Automated update tooling on a repository with no CI
and no tests would also produce pull requests nobody can safely merge — a
Dependabot bump with no test suite behind it is a request for the founder to
manually regress the application, weekly, forever. The ordering in §4 reflects
that: tests and CI come before automated patching because they are what make
automated patching useful rather than annoying. What is not defensible is
carrying that state past the first real payment. At that point the project holds
other people's money and other people's personal data, and "I would have noticed
a bad update" stops being an acceptable control.

**The two live fulfilment paths are the right decision and should be recognised
as a cost, not a badge.** `ship` and `dispatch` refusing each other's orders is
textbook backward compatibility — the discriminator is structural rather than a
version number, the guards are mutually exclusive and complete, and the error
message tells the store owner what to do instead. Migrating the legacy orders
would have been faster to write and would have risked corrupting settled
financial records for no user-visible benefit. But the project now maintains two
fulfilment flows, two email paths and two mental models, indefinitely, with no
test covering either, and no query has ever been run to establish how many
legacy orders actually remain. The policy in BC-2 exists because the honest
completion of this decision is to eventually run that query and delete one path
— and the discipline required to do that is the same discipline that has not yet
produced a test.

**Solo operation is the constraint that shapes every threshold in §5, and its
exit cost has been quantified rather than deferred.** Almost every trigger in
the scaling table converts a judgement call into an observable, because a solo
operator has no colleague to sanity-check a judgement call at 23:00 after a
support email. That is the correct adaptation. What the table also makes plain
is that the shift to a team — the founder's own stated plan if demand grows —
is not a hiring decision followed by productive work. It is three to four weeks
of prerequisite engineering (CI, tests, branch protection, review, a local
environment that does not share the production database) that must be paid
*before* the second engineer arrives, or the second engineer's first month is
spent breaking things nobody can detect. Recording that number now is the point
of this document: the alternative is discovering it during the month when demand
is finally growing and there is least time to absorb it.
