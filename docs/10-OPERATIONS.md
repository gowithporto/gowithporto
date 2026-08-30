# 10 — Infrastructure, Deployment and Operations

> **SDLC stages:** 13. Infrastructure · 14. Deployment / Release · 15. Operations · 16. Incidents
> **Status:** MIXED — infrastructure DONE, deployment PARTIAL, **operations and incident response are SPEC: nothing is implemented**
> **Baseline:** commit `3eb178a`, 2026-08-16
> **Update when:** infrastructure, an alert, or a runbook step changes.

---

## 1. Infrastructure

### 1.1 Inventory

| Layer | Provider | Plan | Region | Account |
|---|---|---|---|---|
| Domain registrar | DNS.PT | Annual | PT | `admin@gowithporto.pt` |
| DNS | Cloudflare | Free | Global | Business account |
| Hosting / compute | Vercel | **Hobby** | Global edge, functions in `iad1` unless configured | `admin@gowithporto.pt` |
| Database | MongoDB Atlas | **M0** | `eu-west-3` (Paris) | Business Google account |
| Media | Cloudinary | Free | Global CDN | Business account |
| Payments | Stripe | Standard + Connect Express | EU | Business account |
| AI | Google Gemini | **Free tier** | — | Business Google account |
| Transactional email | Resend | Free | — | `admin@gowithporto.pt`, domain verified |
| Human mailbox | Zoho Mail | Free | — | `admin@gowithporto.pt` |
| Identity | Google OAuth | — | — | Google Cloud project |

Registrar and DNS are separate because DNS.PT registers domains but provides no
zone editor; Cloudflare supplies one at no cost.

Every account sits under the business identity rather than the founder's personal
accounts — a deliberate separation made at project inception so that ownership can
transfer without untangling a personal Google account (ADR 2026-08-03).

### 1.2 Infrastructure as code — OUT OF SCOPE

There is none, and none is planned. Every resource above is configured through a
web console.

The argument for IaC — reproducibility, review, drift detection — assumes
infrastructure complex enough to drift and a team large enough to need review.
This estate is ten managed services with perhaps thirty settings between them,
provisioned once. Terraform would add a state file, a provider matrix and a second
thing to keep current, to manage resources that change a few times a year.

**The cost of this decision is real and should be named:** the configuration
exists only in ten web dashboards and in the heads of one person. If those
accounts were lost, or if the founder were unavailable, rebuilding would be
archaeology. The mitigation is not Terraform but documentation — §1.3 — and it is
a weaker mitigation, chosen knowingly.

### 1.3 Configuration that lives outside the repository

The settings below are load-bearing, invisible to `git`, and easy to get wrong on
a rebuild. This list is the closest thing the project has to infrastructure state.

| Setting | Where | Note |
|---|---|---|
| Environment variables (15) | Vercel project settings | `08-ENGINEERING` §6 enumerates them |
| Stripe webhook endpoint + signing secret | Stripe dashboard | Standard account events |
| **Stripe Connect webhook endpoint** | Stripe dashboard, **separate** | `account.updated` for connected accounts requires its own endpoint. Missing this once stranded a store's onboarding status permanently, and the code now self-heals around it |
| Google OAuth authorised redirect URIs | Google Cloud console | Must list both the apex and `www` |
| Atlas network access list | Atlas | **Unverified** — must be confirmed restricted, not `0.0.0.0/0`. See `07-SECURITY` §5.4 |
| Atlas database user and connection string | Atlas | |
| Resend domain verification (DKIM, SPF) | Resend + Cloudflare DNS | |
| Cloudflare DNS records | Cloudflare | A/CNAME for apex and `www`, plus Resend records |
| Cloudinary upload preset and folder | Cloudinary | |
| Gemini API key and project | Google Cloud | Billing **not** enabled |

---

## 2. Environments

| Environment | Exists | URL | Database | Stripe | Purpose |
|---|---|---|---|---|---|
| Local | Yes | `localhost:3000` | **Shared production Atlas cluster** | Live keys (shop + AI credits + payouts) | Development |
| Preview | Implicitly, per Vercel deployment | `*.vercel.app` | Same cluster | Live keys | Not used deliberately |
| **Staging** | **No** | — | — | — | — |
| Production | Yes | `www.gowithporto.pt` | Atlas M0 | Live keys | — |

Three problems here, and the first is worse than the missing staging environment.

**Local development runs against the production database.** There is no separate
development cluster; `.env.local` points at the same Atlas M0 instance that serves
production — confirmed still true as of the live-payments cutover below. A careless
script, a mistaken `deleteMany`, or an experiment with a schema change operates on
live data. This is the same class of exposure as SEC-1 (`07-SECURITY` §1) arriving
from a different direction, and the remedy is the same size: create a second free
M0 cluster for development and repoint `.env.local`. Fifteen minutes — more urgent
now than when this was first written, since real store owners and real orders will
start populating this database.

**Local development can no longer safely exercise the shop money path at all.**
Shop checkout, order confirm, refunds, dispute resolution, fulfillment-confirm,
payouts, and Connect onboarding all switched from `STRIPE_SECRET_KEY` (test) to
`STRIPE_SECRET_KEY_LIVE` as part of going live for real product payments. Only AI
credits ran on the live key before this. There is no local-only way to test any of
this money path anymore — it either runs against Stripe with real money, or it
isn't tested locally. Verification now happens by pushing and checking the
deployed site directly, given there's no staging environment (next point).

**There is no staging.** Changes go from a laptop to production, verified by the
developer clicking through the live site. Vercel preview deployments exist
automatically and would serve as staging almost for free — they are simply not
used as a gate, because there is no pull-request workflow to attach them to
(`09-QUALITY` §5.4).

---

## 3. Deployment

### 3.1 The pipeline as it is

```
git push origin main
   → Vercel detects the push
   → next build
   → build succeeds → promoted to production immediately
   → build fails → previous deployment stays live
```

No test runs. No approval. No staging soak. Elapsed time from push to live:
roughly two minutes.

The single virtue of this pipeline is that a compile error cannot reach
production. Everything else can.

### 3.2 The pipeline as it should be

```
feature branch → pull request
   → CI: typecheck · lint · format · tests · build   (09-QUALITY §5.1)
   → Vercel preview deployment
   → E2E smoke against the preview                    (09-QUALITY §5.2)
   → merge to main (branch protection requires CI green)
   → production deployment
   → release job tags and updates CHANGELOG           (09-QUALITY §5.5)
```

Specified in `09-QUALITY`. Steps 1 and 2 of the implementation order there — CI
and branch protection — take under ninety minutes and close the gap that matters
most.

### 3.3 Database migrations during deployment

There is no migration step, because there is no migration framework. Mongoose's
schemaless tolerance means a deployment introducing a new field simply reads
`undefined` on existing documents until they are backfilled by a script run by
hand.

This works and it is not safe. A deployment that *requires* a new field on
existing documents would break silently on old records, and nothing in the
pipeline would notice. See `05-DATA` §8.

### 3.4 Feature flags

None. Every change is live for everyone the moment it deploys. For a system with
one operator and no users this has cost nothing so far; it does mean there is no
mechanism to ship a risky change dark, and no kill switch for a misbehaving
feature short of a rollback.

### 3.5 Rollback

| Property | State |
|---|---|
| Mechanism | Vercel "Promote to Production" on a previous deployment |
| Time to roll back code | Under two minutes |
| Documented | Not until this document |
| **Rehearsed** | **Never** |
| Data rollback | **Impossible** — no point-in-time recovery on Atlas M0 |

The asymmetry in that table is the important part. Code can be reverted in two
minutes; **data cannot be reverted at all.** A deployment that corrupts or deletes
data is unrecoverable, which makes the migration gap in §3.3 and the backup gap in
`05-DATA` §7 considerably more serious than they would be with a restorable
database.

**Rollback procedure**, written down for the first time:

1. Vercel dashboard → Deployments → select the last known-good deployment → Promote to Production.
2. Confirm `www.gowithporto.pt` serves the reverted build.
3. If the bad deployment ran a migration script, understand that the data change is **not** reverted by this and assess separately.
4. Record the incident in `CHANGELOG.md` with the deployment ID reverted from and to.

This should be rehearsed once, deliberately, before launch — promoting a previous
deployment and back again on a quiet evening. An untested rollback is a hypothesis.

---

## 4. Monitoring — SPEC, nothing implemented

### 4.1 What exists

Nothing. This is not shorthand for "not much."

| Capability | State |
|---|---|
| Error tracking | None. Route and global error boundaries render a friendly message and report it nowhere |
| Uptime monitoring | None |
| Performance monitoring | None |
| Log aggregation | None. `console.*` output lands in Vercel's runtime log viewer, with short retention on the Hobby plan and no search across deployments |
| Alerting | None, on any channel |
| Product analytics | None |
| Database monitoring | Atlas built-in metrics, never configured with alerts and never reviewed |
| Stripe monitoring | Stripe's own dashboard, plus its automatic failed-webhook emails — **the only alerting mechanism in the entire system, and it is a side effect of a third-party default** |

### 4.2 What this means concretely

The current detection mechanism for a production failure is **a user complains, by
email, to a mailbox the founder may not read for hours.**

Specific failures that would today be invisible:

| Failure | How long until noticed | Consequence while unnoticed |
|---|---|---|
| Resend outage or misconfiguration | Indefinitely | Buyers pay and receive no confirmation. The worst-isolated failure in the system (`03-ARCHITECTURE` §6.2) |
| A `stripe.transfers.create` failing repeatedly | Until a seller asks where their money is | Sellers unpaid; `transferPending` accumulates with no retry |
| The Stripe webhook returning 500 | Until Stripe's own retry-failure email arrives | Orders not recorded, though `/api/orders/confirm` partially covers |
| An error boundary firing on the checkout page | Never | Silent revenue loss with no trace |
| Gemini quota exhausted | Only if a user reports it | Paying credit-holders see a "high demand" message |
| Atlas approaching its 512 MB ceiling | Never | Writes begin failing |
| SEC-1 being triggered | Never | Catalogue destroyed with no record of when or by whom |

That last row is the one to sit with. **A successful attack on this system would
currently leave no trace that anyone would see.** That is OWASP A09, and it is
rated ABSENT rather than weak for good reason.

### 4.3 The specified minimum

Free tiers cover all of it. Estimated total effort: **half a day.**

| # | Capability | Tool | Effort | Configures |
|---|---|---|---|---|
| M-1 | Error tracking | Sentry (free tier) | 1 hour | `@sentry/nextjs`, server and client. Wire the existing `error.tsx` and `global-error.tsx` boundaries to report. Email alert on any new issue type |
| M-2 | Uptime | Better Stack or UptimeRobot (free) | 20 min | Poll `https://www.gowithporto.pt/robots.txt` every 5 minutes. Alert after two consecutive failures |
| M-3 | Money-path health | Custom `/api/health/settlement` + the uptime poller | 2 hours | Returns non-200 if any item has been `transferPending` for over an hour, or any item has sat `dispatched` beyond the stale threshold (§5.2) |
| M-4 | Email delivery | Resend dashboard webhooks → Sentry | 1 hour | Alert on bounce or delivery failure, closing the worst blind spot in §4.2 |
| M-5 | Stripe | Stripe dashboard alerts | 20 min | Failed webhooks, failed transfers, disputes. Route to the same address |
| M-6 | Database | Atlas alerts | 20 min | Storage above 60%, connection count above 60%, replica-set health |
| M-7 | Product analytics | Plausible or Vercel Analytics | 30 min | Closes SM-8, SM-9 and SM-10 in `01-PRODUCT` §5, which are currently unmeasurable |

M-3 deserves comment: it is the only item on this list specific to this system.
Generic uptime monitoring tells you the site is up. It does not tell you that
money stopped moving, which is the failure this platform should fear most. A
health endpoint that fails when settlement stalls turns an invisible financial
problem into a page.

### 4.4 Structured logging

`console.*` in a serverless environment produces unsearchable, uncorrelated,
short-retention output. The upgrade path is small and worth taking with M-1:

- A thin logging wrapper emitting JSON with a level, a message and context.
- A request ID generated per invocation and threaded through, so the lines
  belonging to one checkout can be found together.
- **Never log** email addresses, addresses, tokens, PINs or Stripe secrets.
  Log order IDs, item IDs and Stripe object IDs, which are safe and sufficient.
- Ship to Sentry as breadcrumbs, so an error arrives with the context that
  produced it.

---

## 5. Service levels

### 5.1 Objectives

Targets, not measurements. Nothing here is currently instrumented; each becomes
real when the matching item in §4.3 is implemented.

| SLI | Objective | Measured by | Live |
|---|---|---|---|
| Public site availability | 99.0% monthly (≈ 7h/month of allowed downtime) | M-2 | No |
| Checkout availability | 99.5% monthly | M-2 + M-1 | No |
| Order-creation success rate | 99.9% of paid Stripe sessions produce an `Order` | M-3 | No |
| Settlement latency | 95% of confirmed handovers transfer within 60 s | M-3 | No |
| Transactional email delivery | 99% delivered | M-4 | No |
| AI generation success | 95% of credited attempts return an itinerary | M-1 | No |
| Catalogue page p95 latency | < 800 ms | M-7 | No |

The 99.0% figure is deliberately modest. A solo operator without on-call cannot
honestly promise more, and promising more than can be delivered is worse than
promising less.

### 5.2 The stale-handover threshold

`04-DOMAIN` §6 records that an item dispatched and never confirmed remains in
escrow indefinitely, with no policy. Monitoring cannot substitute for that policy,
but it can stop the situation being invisible.

**Interim operational rule, pending a proper policy:** M-3 flags any item in
`dispatched` or `ready_for_pickup` for more than **14 days**. The operator
contacts both parties. Fourteen days is chosen to sit outside the EU's 14-day
withdrawal window rather than inside it, so the platform is not forcing a
settlement decision while the buyer still holds a statutory right
(`12-GOVERNANCE` §2).

This is a detection rule, not a resolution rule. The resolution policy still needs
writing.

---

## 6. Incident response — SPEC, never exercised

### 6.1 Severity

| Level | Definition | Response | Examples |
|---|---|---|---|
| **SEV-1** | Money is wrong, or data is being lost | Immediately, drop everything | Double transfers; catalogue deleted; orders not recording |
| **SEV-2** | A core journey is broken | Within hours | Checkout failing; login broken; site down |
| **SEV-3** | Degraded, with a workaround | Within a day | Planner unavailable; images broken; emails delayed |
| **SEV-4** | Cosmetic or isolated | Next working session | A translation missing; a broken link |

For a single operator, severity's real function is deciding what to abandon.
SEV-1 means abandon the lecture.

### 6.2 Procedure

1. **Stabilise before diagnosing.** If a deployment caused it, roll back first
   (§3.5) and investigate afterwards. A running previous version buys time; a
   diagnosis under pressure does not.
2. **Stop the money if money is involved.** Stripe test mode, or disabling the
   affected route, is preferable to letting an incorrect settlement continue.
3. **Capture evidence before repairing.** Export the affected `Order` documents,
   the relevant Stripe event IDs and the Vercel logs. Logs on the Hobby plan do
   not persist long, and a repair usually destroys the evidence of the cause.
4. **Communicate.** Affected buyers and sellers by email, from
   `admin@gowithporto.pt`. Money incidents warrant contact even where the platform
   resolved them unprompted.
5. **Fix.**
6. **Record** in `CHANGELOG.md`: symptom, root cause, fix, and — the entry that
   matters — the detection gap that let it run undetected.
7. **Write the regression test** (`09-QUALITY`). An incident without a test is an
   incident scheduled to recur.

### 6.3 Runbooks

Written for the five most likely failures. **None has been exercised.**

**R-1 — Duplicate order created for one Stripe session.**
Shouldn't happen; the unique sparse index on `stripeSessionId` prevents it.
If observed, the index is missing or was dropped. Verify with
`db.orders.getIndexes()`. Identify duplicates by grouping on `stripeSessionId`.
Keep the document with settlement history; delete the other. Verify against
Stripe that only one charge exists before touching anything.

**R-2 — Transfer failed; `transferPending` is set.**
Read `item.transferError`. Most common cause is a store that has not completed
Connect onboarding, which is expected behaviour rather than a fault (BR-11).
Otherwise check the connected account's status in Stripe. To retry, re-run the
transfer with the *same* idempotency key `transfer:{orderId}:{itemId}` — Stripe
will refuse to duplicate it. Update the item's `transferId`, `transferAmount` and
`transferredAt`, and clear `transferPending`.

**R-3 — Stripe webhook failing.**
Stripe's dashboard shows the response body of each failed attempt. Confirm
`STRIPE_WEBHOOK_SECRET` matches the endpoint's current signing secret — rotating
the endpoint changes it. While the webhook is down, `/api/orders/confirm` still
creates orders for buyers who complete the browser redirect; buyers who close the
tab will have paid with no order recorded. Reconcile those from Stripe's session
list once the webhook is restored.

**R-4 — Database unreachable.**
Check Atlas status and the cluster's health. Confirm the network access list still
permits Vercel's egress. Confirm the connection string and database user. If the
cluster is at its storage ceiling, the immediate mitigation is deleting old
`airesponses` documents, which carry no financial or legal obligation
(`05-DATA` §10).

**R-5 — Data loss.**
There is no restore path. Atlas M0 has no continuous backup and no scheduled dump
exists. Recovery is limited to what can be reconstructed from Stripe — which
covers orders, charges, transfers and refunds, and covers nothing else. The
catalogue, users, itineraries and favourites would be gone.
**This runbook exists to state that it does not work.** Its remedy is
`05-DATA` §7, and it is a launch-gate item.

### 6.4 Post-incident review

For SEV-1 and SEV-2, written into `CHANGELOG.md` — blameless by construction,
since there is one person. Four questions: what happened; why did the safeguards
not prevent it; **how long until it was detected, and by what**; what changed as a
result. The third question is the one that will keep returning the same answer —
"a user told me" — until §4.3 is implemented.

---

## 7. Cost and capacity operations

| Concern | Current practice |
|---|---|
| Cost monitoring | None. All services are on free tiers, so the current bill is near zero and there is nothing to watch |
| **Cost alerting** | **None — and this becomes urgent the moment Gemini billing is enabled.** An unlimited AI endpoint with a billing account attached and no per-IP rate limit (`07-SECURITY` §5.3) is a cost incident waiting to happen. A Google Cloud budget alert must be configured in the same session as billing itself |
| Capacity review | Ad hoc. Atlas storage and Vercel invocation counts are visible in dashboards, unmonitored |
| Capacity triggers | Defined numerically in `11-EVOLUTION` §5 |

---

## 8. Priority order

| # | Action | Effort | Why first |
|---|---|---|---|
| 1 | Separate development database from production | 15 min | Removes the ability to destroy live data from a laptop |
| 2 | Sentry (M-1) | 1 hour | Turns every silent failure into a visible one |
| 3 | Uptime monitoring (M-2) | 20 min | Cheapest possible detection |
| 4 | Atlas backup — dump schedule or M10 (`05-DATA` §7) | 1 hour | Makes R-5 a runbook that works |
| 5 | Stripe and Atlas alerts (M-5, M-6) | 40 min | Free, already available, unconfigured |
| 6 | Rehearse a rollback | 20 min | Converts a hypothesis into a procedure |
| 7 | Email delivery alerting (M-4) | 1 hour | Closes the worst-isolated failure |
| 8 | Settlement health endpoint (M-3) | 2 hours | The only monitor specific to this system's real risk |
| 9 | Google Cloud budget alert | 15 min | Must precede enabling Gemini billing |
| 10 | Analytics (M-7) | 30 min | Makes three product metrics measurable |

Items 1–5 are a single morning and change the operational posture from blind to
adequate.

---

## Trade-offs recorded

**Fully managed infrastructure over anything self-operated.** Two single points of
failure — Vercel and Atlas — with no multi-region strategy and no control over
their incident response. Bought: an estate that requires zero attention to stay
healthy, which is the only kind a part-time solo operator can honestly run. Both
providers have better availability records than anything one person could build,
and the failure mode of self-hosting is not an outage but slow neglect.

**No infrastructure as code.** Accepts that the entire configuration exists in
ten web dashboards and one person's memory, and that a rebuild would be
archaeology. Bought: no Terraform state to maintain for thirty settings that change
a few times a year. The mitigation is §1.3, which is a list rather than a
mechanism, and is therefore weaker than what it replaces. This is the least
comfortable trade in the document.

**Modest SLOs.** 99.0% on public availability is unambitious, and it is
deliverable by one person with no on-call rotation. Publishing 99.9% would be a
number chosen for how it reads rather than for what can be met, and the first
incident would expose it. A target that is met is worth more than a target that
impresses.

**Monitoring deferred until after launch was planned, and that plan was wrong.**
The reasoning was that monitoring protects users, and there were no users. The
flaw is that monitoring is also how an operator learns their system's normal
behaviour — and the moment real traffic arrives is the worst possible time to
start learning it, because every anomaly looks like traffic and every incident is
someone's actual money. Half a day of Sentry and uptime checks, spent months ago,
would have been the highest-return half-day in the project.
