# 01 — Product and Requirements

> **SDLC stages:** 0. Idea / Problem · 1. Discovery / Requirements
> **Status:** DONE · **Baseline:** commit `3eb178a`, 2026-08-16
> **Update when:** scope changes, or a requirement is added or dropped.

---

## 1. Problem

Porto received roughly 2.5 million overnight visitors in recent years against a
resident population near 230,000. The typical short-stay visitor arrives with two
unresolved problems that existing tools address separately and badly:

**Planning.** Generic AI assistants produce plausible-sounding Porto itineraries
that mix genuine landmarks with places that closed, sit an hour apart with no
acknowledgement of transit time, or ignore that the visitor said they had a
€40/day budget and two small children. Curated guidebooks are accurate but static
and identical for everyone. Neither adapts to *this* traveller's dates, budget,
group and interests.

**Buying.** Souvenir retail in the historic centre is dominated by imported
mass-produced goods. Small Porto producers — tinned fish, cork, azulejo work,
Port accessories — have limited digital reach and usually no ability to sell to a
tourist who has already flown home, or to one who wants an item delivered to their
hotel rather than carried around for three days.

**The connection that justifies one product rather than two:** the moment a
visitor is most receptive to buying something local is while they are planning or
consuming an itinerary that mentions it. Trip planning generates commercial intent;
a marketplace bolted to a generic guidebook does not.

### 1.1 Why this is worth building at all

An honest statement of the weakness: **demand is assumed, not evidenced.** No
customer interviews were conducted, no landing-page test was run, and the platform
has not been marketed. The build was undertaken because the founder judged the
engineering exercise worthwhile independent of commercial outcome (see §2.3), and
because Porto is the founder's city of residence and study, giving cheap access to
producers and to the domain. This is recorded rather than dressed up: a reviewer
should read the business case as unvalidated and the engineering case as the
primary justification.

---

## 2. Goals

### 2.1 Business goals

| ID | Goal | Measured by |
|---|---|---|
| BG-1 | Give visitors a Porto itinerary specific enough to act on | Share of generated itineraries where the user returns to the result page at least once after generation |
| BG-2 | Monetise itinerary generation without a paywall on first contact | Conversion from exhausted free generation to a paid credit purchase |
| BG-3 | Give small Porto producers a sales channel with no fixed cost | Number of active stores with at least one completed order |
| BG-4 | Take a defensible cut of marketplace transactions | Platform commission recognised, currently 10% of product subtotal |
| BG-5 | Serve EU visitors in their own language | Share of sessions in a non-English locale |

### 2.2 Technical goals

| ID | Goal | Rationale |
|---|---|---|
| TG-1 | One person can operate the whole system | Every architectural choice is subordinate to this |
| TG-2 | Every external provider is replaceable behind an interface | AI, payments, storage and email are all commodity; being locked to one is a needless risk |
| TG-3 | Money movement is auditable and idempotent end to end | The system holds other people's money; correctness here outranks every other quality attribute |
| TG-4 | SEO-addressable content in four languages | Organic search is the only viable acquisition channel with no marketing budget |
| TG-5 | The codebase is legible to an engineer who did not write it | Both a hiring artefact and a hedge against the founder's own memory |

### 2.3 Non-goals of this project

Stated explicitly so that their absence is not read as oversight:

- Not attempting to compete with GetYourGuide, Viator or Booking on inventory breadth.
- Not building a booking engine for third-party tours with live availability.
- Not pursuing venture funding; the cost model targets near-zero fixed cost.
- Not building for scale beyond the capacity model in `03-ARCHITECTURE` §1.3.

---

## 3. Stakeholders

| Stakeholder | Interest | Influence | How they are served |
|---|---|---|---|
| **Tourist / visitor** | A trip plan that fits their actual constraints; authentic goods delivered before they leave | High — the only revenue source | Public site, AI planner, storefront, buyer dashboard |
| **Store owner (Porto producer)** | Sales with no fixed cost, prompt payout, no technical burden | High — supply side of the marketplace | Store-owner portal, Stripe Express onboarding and payouts |
| **Fulfilment handler** (courier or shop counter staff, often the store owner) | Confirm a handover in seconds, on a phone, with no account | Medium — a bad handover experience breaks settlement | Tokenised confirmation link + store PIN, no login |
| **Platform operator** (the founder) | Revenue, low operating burden, dispute resolution power | High — sole operator | Admin console: catalogue, stores, users, orders, revenue, disputes |
| **Payment processor (Stripe)** | Regulatory compliance of the platform, KYC of connected accounts | High — can suspend the business | Stripe Connect Express; the platform never holds seller bank details |
| **EU / Portuguese regulators** | GDPR, consumer protection, VAT, platform reporting | High — non-compliance is existential | See `12-GOVERNANCE` §2. **Currently unsatisfied** |
| **Academic supervisor (FEUP)** | Evidence of engineering process, not just a working artefact | Medium | This documentation set |
| **Future engineering team** | Onboarding speed, safe change | Low today, high if the project scales | `08-ENGINEERING`, `AI_CONTEXT.md`, ADRs |

---

## 4. Personas

**P1 — Short-stay city visitor.** 25–45, EU or Brazilian, in Porto two to four
nights, books flights and accommodation independently, arrives with no fixed plan
beyond one or two landmarks. Uses a phone almost exclusively. Price-sensitive on
activities, not on a €15 souvenir. Reads English but prefers their own language
when offered. *Primary persona — every default in the product is set for them.*

**P2 — Slow traveller / repeat visitor.** 30–60, staying a week or more, or
returning. Wants the parts of the city that are not on the first-timer list. Higher
willingness to pay for a curated local experience. Values the "local expert" voice
of the itinerary over completeness.

**P3 — Porto micro-producer.** Runs a shop or a small workshop; between one and
thirty product lines; limited English; no e-commerce presence or a neglected one.
Will not learn a complex tool. Needs to see money arrive and needs to know what to
hand over to whom. *The store-owner portal is deliberately narrow because of this
persona.*

**P4 — Platform operator.** The founder. Needs to answer, in under a minute:
did that order pay out, why is this store not receiving money, who is disputing
what, and what did the platform earn this month.

### 4.1 Anti-persona

**Group tour operators and travel agencies.** Their needs — bulk inventory,
contracts, availability calendars, invoicing — would double the domain model. The
product deliberately does not serve them.

---

## 5. Success metrics

Metrics are chosen so a single operator can actually read them. Instrumentation
status is stated honestly: most of these **cannot currently be measured** because
no analytics or product telemetry exists (see `10-OPERATIONS` §4).

| ID | Metric | Target (year 1) | Instrumented? |
|---|---|---|---|
| SM-1 | Registered users | 100 | Yes — `User` collection |
| SM-2 | Itineraries generated | 250 | Yes — `AIResponse` collection |
| SM-3 | Free → paid credit conversion | ≥ 8% | Derivable from `User.freeUsed` + `Transaction` |
| SM-4 | Completed marketplace orders | 60 | Yes — `Order` where all items confirmed |
| SM-5 | Active stores (≥ 1 completed order) | 5 | Derivable |
| SM-6 | Platform commission recognised | €300 | Yes — `/admin/revenue` |
| SM-7 | Disputed items as share of items sold | < 5% | Yes — `fulfillmentStatus = issue_reported` |
| SM-8 | Non-English session share | ≥ 30% | **No** — no analytics |
| SM-9 | Itinerary re-visit rate (proxy for usefulness) | ≥ 40% | **No** — no analytics |
| SM-10 | Checkout abandonment | < 60% | **No** — no funnel instrumentation |

**Gap acknowledged:** three of the ten metrics that would tell the operator whether
the product works are unmeasurable today. Closing this is in `TODO.md` and
specified in `10-OPERATIONS` §4.3.

---

## 6. Constraints

| ID | Constraint | Consequence for design |
|---|---|---|
| C-1 | **One engineer, part-time**, alongside a final-year master's at FEUP | No architecture requiring more than one person to operate. Managed services over self-hosted, everywhere |
| C-2 | **Near-zero fixed cost** | Free tiers wherever they exist; this directly causes the Atlas M0 backup gap (`05-DATA` §7) and the Gemini rate ceiling (`11-EVOLUTION` §3) |
| C-3 | **The platform handles third-party money** | Rules out any custom money-holding logic; forces Stripe Connect. See ADR 2026-08-03 |
| C-4 | **EU jurisdiction, Portuguese establishment** | GDPR, ePrivacy, consumer withdrawal rights, VAT/IVA and DAC7 all apply. See `12-GOVERNANCE` §2 |
| C-5 | **Organic search is the only acquisition channel** | SSR, per-locale URLs, structured data and sitemaps are requirements, not enhancements |
| C-6 | **Mobile-first** — the primary persona is holding a phone in a street in Porto | Every flow must complete on a small screen; the fulfilment confirmation is phone-only by design |
| C-7 | **Founder may leave the project** on graduation or employment | Documentation and legibility are functional requirements, not nice-to-have |

---

## 7. Feasibility and build-vs-buy

Assessed at stage 0 and revisited whenever a component was added. Full technology
evaluation is in `03-ARCHITECTURE` §1.

| Capability | Decision | Reasoning |
|---|---|---|
| Itinerary generation | **Buy** — Google Gemini via API | Training or fine-tuning a model is out of reach for one person. A pinned commodity model behind an interface is sufficient and swappable |
| Payments | **Buy** — Stripe Checkout | PCI scope reduction alone justifies it |
| Marketplace payouts | **Buy** — Stripe Connect Express | Building payout logic means holding third-party funds, which is regulated money transmission. Non-negotiable |
| Escrow / release-on-delivery logic | **Build** — on top of Stripe transfers | No off-the-shelf product matched the model (per-item confirmation, PIN handover, three-way dispute outcomes). This is the system's most substantial original engineering; see `04-DOMAIN` §4–5 |
| Auth | **Buy** — NextAuth, Google OAuth + credentials | Rolling session/password handling is a well-known way to create vulnerabilities |
| Image hosting | **Buy** — Cloudinary | Transformation and CDN for free at this volume |
| Transactional email | **Buy** — Resend | Deliverability is a reputation problem, not a code problem |
| Internationalisation | **Build** — JSON dictionaries + `t()` + locale-prefixed routes | `next-intl` and similar carry more machinery than four flat dictionaries need. Reversible in an afternoon if it stops paying |
| Admin console | **Build** | Off-the-shelf admin panels do not understand this domain's money rules |
| Search | **Deferred** | Catalogue is under 100 items; MongoDB queries suffice. Threshold for revisiting: `11-EVOLUTION` §5 |

---

## 8. Requirements

### 8.1 Functional requirements

Status column reflects the codebase at baseline.

#### Public catalogue and content

| ID | Requirement | Status |
|---|---|---|
| FR-1 | Visitors browse products without an account | DONE |
| FR-2 | Products are filterable by category and sortable by price | DONE |
| FR-3 | Each product has a slug-addressable detail page with gallery and variants | DONE |
| FR-4 | Visitors browse a curated attractions catalogue with detail pages | DONE |
| FR-5 | Visitors browse curated local experiences, filterable by duration and category | DONE |
| FR-6 | Visitors see a directory of bike-rental providers linking to Google Maps | DONE |
| FR-7 | All public content is available in `en`, `fr`, `es`, `pt` at locale-prefixed URLs | DONE |
| FR-8 | Each public page emits title, description, Open Graph, `hreflang` and JSON-LD | DONE |
| FR-9 | A sitemap enumerates every static route and every active catalogue item per locale | DONE |
| FR-10 | Static pages exist for about, FAQ, contact and privacy | DONE |
| FR-11 | Contact form submissions reach the operator by email | DONE |

#### AI itinerary planner

| ID | Requirement | Status |
|---|---|---|
| FR-12 | Signed-in users generate an itinerary from days, dates, budget, group size, travel styles and interests | DONE |
| FR-13 | Every user receives exactly one free generation | DONE |
| FR-14 | Subsequent generations consume one purchased credit | DONE |
| FR-15 | A generation that fails consumes neither the free try nor a credit | DONE — charge occurs only after a successful response |
| FR-16 | Users purchase credit bundles via Stripe Checkout | DONE |
| FR-17 | Every generation is persisted and listed in the user's history | DONE |
| FR-18 | Provider rate limiting surfaces as a "high demand" message, not an error page | DONE |
| FR-19 | Itineraries name real, specific Porto and Gaia locations and respect stated budget and group | PARTIAL — enforced by prompt design only; no automated output validation |

#### Marketplace and checkout

| ID | Requirement | Status |
|---|---|---|
| FR-20 | Users add product variants to a cart persisted across navigation | DONE |
| FR-21 | Users choose pickup or delivery; delivery adds the store's delivery fee | DONE |
| FR-22 | Payment is taken through Stripe Checkout; the platform never sees card data | DONE |
| FR-23 | An order is created exactly once per Stripe session, whichever path arrives first | DONE — unique index on `stripeSessionId`, both paths guarded |
| FR-24 | Stock decrements on successful payment | DONE |
| FR-25 | The buyer receives a branded order confirmation email | DONE |
| FR-26 | Buyers see order status per item, not only per order | DONE |
| FR-27 | Users favourite products, attractions, experiences and rental providers | DONE |

#### Fulfilment and settlement

| ID | Requirement | Status |
|---|---|---|
| FR-28 | The store owner marks each item dispatched or ready for pickup | DONE |
| FR-29 | Each item carries a unique fulfilment token rendered as a QR code for the buyer | DONE |
| FR-30 | A handover is confirmed by the handler entering the store's fulfilment PIN against the token — no account required | DONE |
| FR-31 | The seller's share transfers **only** on confirmed handover, never at checkout | DONE |
| FR-32 | Transfers are idempotent and reconcilable to the order via `transfer_group` | DONE |
| FR-33 | The buyer may report an issue instead of confirming, freezing settlement | DONE |
| FR-34 | The operator resolves a disputed item as seller fault, buyer fault or a percentage split, executing the corresponding refund and transfer | DONE |

#### Store owner and operator

| ID | Requirement | Status |
|---|---|---|
| FR-35 | Store owners sign in with a store code and password, scoped to their own store's data | DONE |
| FR-36 | Store owners manage their own products and categories | DONE |
| FR-37 | Store owners complete Stripe Express onboarding and reach their payout dashboard | DONE |
| FR-38 | The operator manages the attractions, experiences and bike-rental catalogues | DONE |
| FR-39 | The operator manages stores, sets per-store commission, and views onboarding status | DONE |
| FR-40 | The operator sees total commission, per-store payouts and a Connect onboarding table | DONE |
| FR-41 | The operator can issue a statutory refund outside the normal dispute flow, reversing a completed transfer | DONE |

### 8.2 Non-functional requirements

| ID | Attribute | Requirement | Status |
|---|---|---|---|
| NFR-1 | **Correctness of money** | No order duplicated, no double transfer, no double refund, under retry or concurrent execution | DONE by construction (unique index + Stripe idempotency keys); **not covered by a single automated test** |
| NFR-2 | **Availability** | 99% monthly for public pages; degradation of the AI provider must not take down the storefront | PARTIAL — architecturally isolated; unmeasured |
| NFR-3 | **Performance** | Largest Contentful Paint under 2.5 s on 4G for catalogue pages | Not measured |
| NFR-4 | **Capacity** | 100 users over five years; peak ~20 concurrent | DONE — see `03-ARCHITECTURE` §1.3 |
| NFR-5 | **Security** | No unauthenticated path may create, modify or settle an order | DONE at baseline; two such paths existed and were removed (ADR 2026-08-03) |
| NFR-6 | **Privacy** | Personal data limited to email, display name, avatar and delivery address; no card data stored | DONE |
| NFR-7 | **Localisation** | Four locales, URL-addressable, no locale loss on internal navigation | DONE |
| NFR-8 | **Accessibility** | WCAG 2.1 AA | **NOT MET / unaudited** — see `02-UX` §7 |
| NFR-9 | **Maintainability** | A competent Next.js engineer reaches first meaningful commit within one day | Subjective; this doc set is the mechanism |
| NFR-10 | **Observability** | A production failure is detected by the operator before a user reports it | **NOT MET** — no monitoring exists |
| NFR-11 | **Recoverability** | Restore to a point in time within 24 hours of data loss | **NOT MET** — Atlas M0 provides no continuous backup |
| NFR-12 | **Cost** | Fixed monthly cost under €30 pre-revenue | DONE — currently near zero, with the Vercel plan caveat in `12-GOVERNANCE` §4 |

### 8.3 Business rules

Rules are stated here and implemented as described in `04-DOMAIN`.

| ID | Rule |
|---|---|
| BR-1 | Every user gets exactly one free itinerary generation, tracked by `User.freeUsed`, independent of credit balance |
| BR-2 | A credit is consumed only after the AI provider returns successfully |
| BR-3 | Platform commission applies to the product subtotal only. The delivery fee is the seller's pass-through cost and is never commissioned |
| BR-4 | Commission rate is per store and is **snapshotted onto the order** at creation; later rate changes never alter historical orders |
| BR-5 | Funds transfer to the seller only after a handover is confirmed against the item's fulfilment token and the store's PIN |
| BR-6 | Settlement is per item, not per order. A three-item order can have one item paid out, one disputed and one still pending |
| BR-7 | An item may be resolved exactly once; a second resolution attempt is rejected before any Stripe call is made |
| BR-8 | Only a buyer may report an issue, and only while the item is `dispatched` or `ready_for_pickup` |
| BR-9 | On a seller-fault resolution the delivery fee is refunded to the buyer **only** when the order has a single item, because fee attribution is otherwise ambiguous. Multi-item cases are escalated to manual handling rather than guessed |
| BR-10 | On buyer-fault and split resolutions the delivery fee always remains with the seller — the delivery was performed |
| BR-11 | If a store has not completed Connect onboarding, checkout still succeeds and settlement is marked pending rather than failing the purchase |
| BR-12 | The fulfilment PIN is a store-level secret distinct from the store login code, so it can be given to a courier without granting portal access |
| BR-13 | Stock decrements on payment confirmation, not on add-to-cart |

### 8.4 Assumptions

| ID | Assumption | If wrong |
|---|---|---|
| A-1 | Peak load stays under ~20 concurrent users for five years | Serverless scales, but Atlas M0's 500-connection ceiling and Gemini's rate limit bind first. Triggers in `11-EVOLUTION` §5 |
| A-2 | Store owners will complete Stripe Express onboarding | Settlement silently accrues as pending; the system already tolerates this without breaking checkout (BR-11) |
| A-3 | Fulfilment handlers can be trusted with a store-level PIN | A leaked PIN allows false confirmation of that store's handovers. Mitigation in `07-SECURITY` §4 |
| A-4 | Disputes are rare enough to resolve manually | Manual resolution stops scaling around ~10/week |
| A-5 | Organic search will deliver meaningful traffic | Unvalidated; if wrong, SM-1 through SM-6 all miss and the product needs a paid channel it has no budget for |
| A-6 | Gemini output quality is adequate without validation | FR-19 is prompt-enforced only. A quality regression in the model would be invisible |

### 8.5 External dependencies

| Dependency | Used for | Failure impact | Substitutability |
|---|---|---|---|
| Vercel | Hosting, edge, CI-less deploy | Total outage | Moderate — Next.js is portable, but the deploy pipeline is not |
| MongoDB Atlas | All persistence | Total outage | Moderate — Mongoose abstracts the driver, not the data |
| Stripe (Checkout + Connect) | All money | No sales, no payouts | Low — Connect semantics are deeply embedded in the domain |
| Google Gemini | Itinerary generation | Planner unavailable; storefront unaffected | High — provider interface exists (`services/ai/aiProvider.ts`) |
| Cloudinary | Image storage and delivery | Images break sitewide | High |
| Resend | Transactional email | Silent — users get no confirmations. Worst failure mode, because nothing surfaces it | High |
| Cloudflare | DNS | Total outage | High |
| Google OAuth | Customer sign-in | No new or returning customer logins | Moderate |

### 8.6 Risk register

Scored as likelihood × impact, each 1–5.

| ID | Risk | L | I | Score | Mitigation | Owner state |
|---|---|---|---|---|---|---|
| R-0 | ~~Product catalogue destroyed by an unauthenticated `GET`~~ — `/api/dev/seed/products` called `deleteMany({})` in production, with no restore path | 4 | 5 | **20** | Deleted `src/app/api/dev/seed/`. `07-SECURITY` §1, SEC-1 | **RESOLVED 2026-08-17** |
| R-1 | Money-path regression ships undetected — no tests, no CI gate, `main` auto-deploys | 4 | 5 | **20** | Test suite and CI gate specified in `09-QUALITY` | **OPEN** |
| R-2 | EU regulatory non-compliance (GDPR, cookie consent, withdrawal rights, VAT, DAC7) | 4 | 5 | **20** | Scoped in `12-GOVERNANCE` §2; needs Portuguese legal input | **OPEN** |
| R-3 | Production failure goes undetected — no monitoring or alerting | 5 | 3 | **15** | Minimum viable setup in `10-OPERATIONS` §4.3 | **OPEN** |
| R-4 | Data loss with no point-in-time recovery on Atlas M0 | 2 | 5 | **10** | Tier upgrade or scheduled logical dump; `05-DATA` §7 | **OPEN** |
| R-5 | Credentials exposed in setup screenshots remain unrotated | 3 | 4 | **12** | Rotate; `07-SECURITY` §1, SEC-2 | **OPEN — deferred by founder** |
| R-6 | Vercel Hobby plan terms exclude commercial use | 3 | 4 | **12** | Upgrade to Pro before real traffic | **OPEN — deferred by founder** |
| R-7 | Gemini free tier (5 req/min) throttles real traffic | 3 | 3 | 9 | Enable billing before opening the planner | **OPEN** |
| R-8 | In-memory rate limiting is not shared across serverless instances | 3 | 3 | 9 | Upstash Redis at the trigger in `11-EVOLUTION` §5 | Accepted at current scale (ADR 2026-08-03) |
| R-9 | Fulfilment PIN leaked or shared, enabling false confirmations | 2 | 4 | 8 | Per-store rotation; `07-SECURITY` §4 | Accepted |
| R-10 | Sole operator becomes unavailable | 3 | 4 | 12 | This documentation set is the mitigation | Partially mitigated |
| R-11 | No demand materialises | 4 | 3 | 12 | None — accepted (§1.1) | Accepted |

---

## 9. Scope and MVP boundary

### 9.1 In scope, shipped

Public catalogue in four locales · AI itinerary planner with free-then-credit
monetisation · marketplace cart and Stripe checkout · per-item fulfilment with
tokenised PIN handover · confirmation-gated seller settlement · buyer-initiated
dispute reporting and three-outcome operator resolution · store-owner portal with
Stripe Express onboarding and payouts · admin console for catalogue, stores, users,
orders, revenue and disputes · eight branded transactional emails.

### 9.2 Explicitly deferred

| Item | Why deferred | Revisit when |
|---|---|---|
| Automated test suite and CI | Was traded against feature completion. **This trade is now judged wrong** and is the top backlog item | Immediately — before public launch |
| Monitoring, alerting, error tracking | Same trade | Immediately — before public launch |
| Real-money launch readiness (plan upgrade, key rotation, Gemini billing, legal) | Each is a discrete unblock, not a build | Before the first non-test transaction |
| Reviews and ratings on products | Requires moderation the operator cannot staff | ≥ 20 completed orders |
| In-app messaging buyer ↔ store | Email plus the dispute flow covers the real need today | Disputes exceed ~10/week |
| Live availability booking for experiences | Doubles the domain model (calendars, capacity, cancellation windows) | A partner requests it and will commit inventory |
| Referral partners (hotels, restaurants) | Money never passes through the platform, so no integration is needed — a curated list plus manual invoicing is the correct answer, not a placeholder (ADR 2026-08-03) | Manual invoicing becomes the bottleneck |
| Native mobile applications | The responsive web app serves the persona; two more build targets for one engineer is indefensible | Never, at current scale |
| Multi-currency | Porto is in the eurozone and the buyer's card handles conversion | Expansion beyond the euro area |
| Search engine (Atlas Search / Meilisearch) | Catalogue under 100 items | Catalogue exceeds ~300 items |

### 9.3 The launch gate

The platform is feature-complete and technically incomplete. The following must
be true before the first transaction from a member of the public who is not a
test user. Each links to its specification.

0. ~~`src/app/api/dev/seed/` is deleted~~ — **done 2026-08-17.** Was an unauthenticated production endpoint that wiped the product catalogue. `07-SECURITY` §1, SEC-1
1. Money-path tests exist and pass in CI — `09-QUALITY` §3
2. CI blocks merge on typecheck, lint and tests — `09-QUALITY` §5
3. Error tracking and uptime alerting are live — `10-OPERATIONS` §4.3
4. A restorable database backup exists and a restore has been rehearsed — `05-DATA` §7
5. Local development no longer runs against the production database — `10-OPERATIONS` §2
6. Exposed credentials are rotated — `07-SECURITY` §1, SEC-2
7. Security headers are configured — `07-SECURITY` §5.4
8. Hosting plan permits commercial use — `12-GOVERNANCE` §4
9. AI provider billing is enabled, with a cost alert configured first — `11-EVOLUTION` §5, `10-OPERATIONS` §7
10. Store onboarding collects the seller data DAC7 requires — `12-GOVERNANCE` §2.5
11. GDPR basis, processor agreements, the AI-transfer disclosure, withdrawal-rights notice, store-owner terms and the VAT position are settled with Portuguese advisers — `12-GOVERNANCE` §2

Item 0 should be done today; it takes minutes. Items 1–7 are engineering and are
specified in this set. Items 8–10 are administrative unblocks. Item 11 requires
outside expertise and has by far the longest lead time — **it should be started
first, because everything else can proceed in parallel with it and nothing about
it can be compressed by working harder in the final week.**

---

## Trade-offs recorded

**Feature completeness over engineering safety.** Seven months of solo effort, January to August 2026,
went into shipping the full marketplace and settlement domain rather than into
tests and observability. The result is a system with genuinely non-trivial domain
logic — escrowed per-item settlement with three-way dispute resolution — and no
automated verification of it whatsoever. For a portfolio artefact the depth was
worth it; for a system about to take real money it was not, and the balance is
being corrected before launch rather than after. This is recorded as a judgement
made, not a mistake discovered.

**Assumed demand over validated demand.** No customer discovery was performed
(§1.1). A commercially-motivated founder should have run a landing-page test before
writing a line of code. The engineering-motivated justification is stated openly
rather than retrofitted as market research.
