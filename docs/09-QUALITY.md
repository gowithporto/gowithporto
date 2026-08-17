# 09 — Testing, Quality and Continuous Integration

> **SDLC stages:** 11. Testing / Quality · 12. Build / CI
> **Status:** SPEC — **nothing in this document is implemented.** No test runner, no test files, no pipeline. This is a specification, not a record
> **Baseline:** commit `3eb178a`, 2026-08-16
> **Update when:** a gate is added or the test strategy shifts.

---

## 1. The current position, stated plainly

| Question | Answer |
|---|---|
| Test runner in `package.json` | None |
| Test files in the repository | None. `backend/` holds two zero-byte placeholder files and nothing else |
| `npm test` script | Does not exist |
| Code coverage | 0% |
| CI pipeline | None. No `.github/` directory |
| Automated gate between `git push` and production | **None** |
| What runs before a deploy | Vercel's `next build`, which fails only on a compile error |
| What the developer runs by hand | `tsc --noEmit` and `eslint`, diligently, as recorded in `CHANGELOG.md` on 2026-08-13 and 08-14 |

The system moves other people's money. It executes Stripe transfers, refunds and
transfer reversals; it computes commission splits; it decides who is owed what
when a delivery goes wrong. **None of that logic has ever been executed by
anything except a human clicking through it.**

The manual discipline is real and should not be dismissed — running `tsc` and
`eslint` before every push is better than most solo projects manage. But
diligence is a property of a person on a good day. A pipeline is a property of the
system. The purpose of this document is to convert the first into the second.

### 1.1 Why this happened, recorded honestly

Seven months of solo effort went into building a complete marketplace with an
escrowed settlement domain. Tests were traded against features, repeatedly and
consciously. For most of that period, when the platform had no users and no
real money, that trade was defensible: a test suite protecting code that changes
shape weekly is expensive and the protection is thin.

That justification expired the moment production went live on a custom domain with
real Stripe keys. It has not been acted on. This is the single largest gap between
the engineering practice this project demonstrates and the engineering practice it
documents, and it is recorded as such rather than softened.

---

## 2. Test strategy

### 2.1 The shape, and why it is not a pyramid

The conventional pyramid — many unit tests, fewer integration, fewest end-to-end —
assumes a team with time to maintain all three layers. One part-time engineer
cannot maintain three layers, and a suite that is not maintained becomes a suite
that is skipped.

The strategy here is deliberately **narrow and deep**: near-total coverage of the
money path, meaningful coverage of authorisation, and almost nothing else.

```
        ┌──────────────────────────────┐
        │  E2E — 2 smoke journeys      │  Playwright, against a preview deploy
        ├──────────────────────────────┤
        │  Integration — 6 tests       │  Real Mongo (in-memory), mocked Stripe
        ├──────────────────────────────┤
        │  Authorisation — 1 matrix    │  Every mutating route × every actor
        ├──────────────────────────────┤
        │  Unit — 10 tests             │  Pure logic: money arithmetic, guards
        └──────────────────────────────┘
                  ↑
        Everything else: untested, on purpose
```

### 2.2 What is deliberately not tested

| Not tested | Reason |
|---|---|
| React component rendering | Visual regressions are cheap to notice and cheap to fix. Component tests are expensive to maintain and rarely catch what actually breaks |
| Catalogue CRUD | A broken product form is immediately visible and financially harmless |
| i18n dictionary completeness | Better served by a lint script than a test — see §4 |
| AI output quality | Non-deterministic. Testing that Gemini returns *something* well-formed is worth it; testing that the itinerary is good is not automatable |
| Third-party behaviour | Stripe's and Mongoose's own correctness is their responsibility |
| Admin UI | One user, who can report a fault directly |

Stating what is not tested is as much a part of a strategy as stating what is.
A suite that claims broad coverage and delivers shallow coverage is worse than a
narrow suite that is honest about its edges.

---

## 3. The specified test suite

Nineteen tests. This is the complete set required before the launch gate in
`01-PRODUCT` §9.3 can be considered closed.

### 3.1 Unit tests — pure logic, no I/O

Target: `src/lib/buildOrderFromStripeSession.ts` and the arithmetic extracted from
the settlement routes. Several of these require a small refactor to make the
arithmetic testable in isolation — extracting the seller-amount calculation into a
pure function. That refactor is part of the work.

| # | Test | Asserts |
|---|---|---|
| U-1 | Commission applies to the product subtotal only | A €100 order with a €5 delivery fee at 10% yields a platform fee of €10.00, not €10.50 (BR-3) |
| U-2 | Seller amount is computed from the snapshot, not the live store rate | Changing `Store.commissionRate` after order creation does not change the amount transferred (BR-4) |
| U-3 | Rounding never creates or destroys cents | Across a sweep of prices and quantities, `sellerCents + platformCents === itemCents` for every case |
| U-4 | Variant pricing overrides base pricing | A line with a variant uses the variant's price, not the product's |
| U-5 | The delivery-fee line is excluded from order items | An order built from a session containing a "Delivery Fee" line produces items without it |
| U-6 | Split resolution percentages are bounded | `buyerPct + sellerPct > 100` is rejected; negatives are rejected |
| U-7 | Split remainder accrues to the platform | 40/40 leaves exactly 20% of the item amount with the platform, to the cent |
| U-8 | Legal-exception amount cannot exceed what was transferred | A request above `item.transferAmount` is rejected |
| U-9 | Fulfilment tokens are unguessable and unique | 10 000 generated tokens are distinct and each decodes to 24 bytes |
| U-10 | Locale overlay falls back per field | A `translations.fr` overlay with only `title` set leaves `description` in English, and strips the `translations` blob from the result |

### 3.2 Integration tests — real database, mocked Stripe

Run against `mongodb-memory-server`. Stripe is mocked at the SDK boundary,
asserting on the arguments passed rather than calling the network.

| # | Test | Asserts |
|---|---|---|
| I-1 | **Order creation is idempotent across both paths** | Webhook and `/api/orders/confirm` invoked concurrently for the same session produce exactly one `Order`. Repeat with each path first. This is the single most important test in the suite |
| I-2 | Webhook rejects an invalid signature | A payload with a bad signature returns 400 and creates nothing |
| I-3 | **Settlement fires only on confirmed handover** | An item in `pending` or `dispatched` has no transfer. Confirming with the correct PIN produces exactly one `stripe.transfers.create`, with the idempotency key `transfer:{orderId}:{itemId}` and the correct amount (BR-5) |
| I-4 | A wrong PIN transfers nothing and leaks nothing | Response is generic; item status unchanged; no Stripe call made |
| I-5 | **An item resolves exactly once** | Two concurrent resolutions of the same disputed item produce one refund and one transfer. The second is rejected with 409 *before* any Stripe call (BR-7) |
| I-6 | Delivery fee transfers at most once per order | Confirming two items on one delivery order produces exactly one delivery-fee transfer |

### 3.3 Authorisation tests

A single parameterised test walking the authorisation matrix in `06-API` §2. For
every mutating endpoint, assert that each actor who should be refused is refused.

| # | Test | Asserts |
|---|---|---|
| A-1 | **Every mutating endpoint refuses the wrong actor** | Anonymous, buyer, store owner and admin are each tried against every mutating route; only the permitted actor succeeds. Includes: store owner A cannot dispatch store owner B's item; a buyer cannot resolve a dispute; a buyer cannot report an issue on another user's order |

This one test would have caught SEC-1 (`07-SECURITY` §1) on the day it was
written, because a destructive endpoint reachable by an anonymous actor fails the
assertion by construction. It is the highest-value test in the suite per line of
code.

### 3.4 End-to-end smoke tests

Playwright against a Vercel preview deployment with Stripe test keys.

| # | Journey | Asserts |
|---|---|---|
| E-1 | Purchase | Browse → add to cart → checkout with Stripe's test card → order appears in the buyer's dashboard with correct totals |
| E-2 | Handover | Store owner dispatches → buyer's QR appears → handler submits the PIN → item shows delivered and a transfer is recorded |

Two journeys, deliberately. E2E tests are the most expensive to maintain and the
most prone to flaking; these two cover the paths where a silent failure costs
money.

### 3.5 Tooling

| Concern | Choice | Reason |
|---|---|---|
| Runner | **Vitest** | Native TypeScript and ESM, no Babel configuration, fast watch mode. Jest would need more setup for the same result |
| Database | `mongodb-memory-server` | Real Mongo semantics — indexes, unique constraints, `$inc` — without a container. Testing against a mock would not exercise the unique index on `stripeSessionId`, which is the mechanism I-1 exists to verify |
| Stripe | Manual mock at the SDK boundary | Asserting on call arguments verifies idempotency keys and amounts, which is what matters. `stripe-mock` adds a service for no additional signal |
| E2E | **Playwright** | Already available in most CI images; Stripe test-mode checkout works in a real browser |
| Coverage | `@vitest/coverage-v8` | Reported, not gated — see §4.2 |

Estimated effort: **three to four focused days**, including the small refactors
that make the arithmetic testable.

---

## 4. Quality gates

### 4.1 The gates

| Gate | Tool | Blocks merge | Blocks deploy |
|---|---|---|---|
| Type check | `tsc --noEmit` | Yes | Yes |
| Lint | `eslint` | Yes | Yes |
| Format | `prettier --check` | Yes | No |
| Unit + integration tests | `vitest run` | Yes | Yes |
| Build | `next build` | Yes | Yes |
| Dependency audit | `npm audit --audit-level=high` | Warn only | No |
| i18n completeness | Custom script (§4.3) | Warn only | No |
| E2E smoke | Playwright, against the preview | No | **Yes** |

### 4.2 On coverage thresholds

Coverage is measured and reported; **no percentage threshold is enforced.** A
threshold on a narrow-and-deep suite produces the wrong incentive — the cheapest
way to raise a global percentage is to write shallow tests for the catalogue code
that §2.2 deliberately excludes, which adds maintenance burden and no protection.

What is enforced instead is a **path rule**: any change touching
`src/lib/buildOrderFromStripeSession.ts`, `src/app/api/fulfill/**`,
`src/app/api/admin/disputes/**`, `src/app/api/payments/**` or
`src/app/api/webhooks/**` requires the money-path tests to pass and, if it changes
behaviour, a corresponding test change. Coverage of *those* paths should be near
total; coverage elsewhere is not a goal.

### 4.3 The i18n completeness script

Not a test, but a gate worth having: a script comparing key sets across
`src/i18n/{en,fr,es,pt}.json` and failing on any key present in `en` but missing
elsewhere. Roughly twenty lines. It catches the most common localisation
regression — adding an English string and forgetting the other three — which the
project has already experienced and which no type check can see.

---

## 5. Continuous integration — specification

Two workflows.

### 5.1 `.github/workflows/ci.yml` — on every push and pull request

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npx eslint .
      - run: npx prettier --check .
      - run: npx vitest run --coverage
      - run: npm run build
        env:
          # Build-time placeholders — no real secrets in CI
          MONGODB_URI: mongodb://localhost:27017/ci
          NEXTAUTH_URL: http://localhost:3000
          NEXTAUTH_SECRET: ci-placeholder
      - run: npm audit --audit-level=high
        continue-on-error: true
      - run: node scripts/check-i18n.js
        continue-on-error: true
```

### 5.2 `.github/workflows/e2e.yml` — on pull request, against the preview

Waits for the Vercel preview deployment, then runs the two Playwright journeys
against it with Stripe test keys. Kept separate so a flaking browser test never
blocks the fast feedback loop in §5.1.

### 5.3 `.github/dependabot.yml`

```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: "/"
    schedule: { interval: weekly }
    open-pull-requests-limit: 5
    groups:
      minor-and-patch:
        update-types: [minor, patch]
```

Grouping minor and patch updates into one weekly pull request prevents the failure
mode where twenty individual dependency PRs go unread and the mechanism is
mentally switched off.

### 5.4 Branch protection

Required on `main`, and this is the change that gives the pipeline its teeth:

- Direct pushes to `main` disallowed
- `verify` must pass before merge
- Branches must be current with `main` before merging

**A solo developer's usual objection is "who would review my pull request?" The
answer is that CI is the reviewer.** It never has a deadline, never assumes the
change is small, and never skips the check because it is late. Requiring a pull
request against oneself costs about thirty seconds per change and converts every
push from an act of trust into an act with a gate. On a system that moves money,
that is not ceremony.

### 5.5 Release automation

Because release tagging lapsed exactly when the work got busy (`08-ENGINEERING`
§10.4), the fix should not depend on remembering. A release job on merge to `main`
should bump `package.json`, create an annotated tag, and open a `## [x.y.z]`
section in `CHANGELOG.md`. Rituals that depend on discipline fail under load;
rituals that run in CI do not.

---

## 6. Build

| Property | Current |
|---|---|
| Build command | `next build` |
| Where it runs | Vercel, on push to `main` |
| Type checking during build | Yes, as part of `next build` |
| Linting during build | Not enforced as a failure |
| Artefact | Vercel's own deployment bundle; no separately published artefact |
| Reproducibility | `package-lock.json` is committed; `npm ci` in CI would make it reproducible |
| Build time | Not measured |

The build is adequate. Its weakness is that it is the *only* automated step, so
"it built" is currently the entire definition of "it is safe to deploy."

---

## 7. Implementation order

Highest protection per hour first. Each row is independently shippable.

| Step | Work | Effort | What it protects |
|---|---|---|---|
| 1 | `ci.yml` with typecheck, lint and build only — no tests yet | 1 hour | Makes the existing manual discipline automatic and unskippable |
| 2 | Branch protection on `main` | 10 min | Closes the direct-push-to-production path |
| 3 | Vitest installed; U-1 to U-3 written (the money arithmetic) | Half a day | The commission logic, which is where a silent error costs real euros |
| 4 | A-1, the authorisation matrix test | Half a day | Would have caught SEC-1. Highest value per line in the suite |
| 5 | I-1, I-3, I-5 — the three concurrency invariants | 1 day | Duplicate orders, premature settlement, double refunds |
| 6 | Remaining unit and integration tests | 1 day | Completeness |
| 7 | `dependabot.yml` and `npm audit` | 30 min | SEC-5 |
| 8 | Playwright E-1 and E-2 | 1 day | Regression on the two journeys that carry money |
| 9 | Release automation | 2 hours | Restores the tagging practice without relying on memory |

**Steps 1 and 2 together take under ninety minutes and change the project's risk
profile more than anything else in this document.** They should not wait for the
test suite.

---

## Trade-offs recorded

**Narrow and deep over broad and shallow.** Eighteen tests will leave most of the
codebase uncovered, and a coverage report will look poor. It will also mean that
every euro the system moves passes through logic that a machine has verified. A
suite of two hundred component tests would produce a better number and protect
nothing that matters. The number is not the point; the money is.

**No coverage threshold.** Enforcing a percentage would, on this suite shape,
actively push work toward the code least worth testing. A path rule on the money
directories achieves the intent — do not change settlement without changing its
tests — without the perverse incentive. The cost is that the rule must be
respected by a human rather than computed, which is a real weakness and is
accepted because the alternative is worse.

**Pull requests against oneself.** Thirty seconds of ceremony per change, for a
developer who is also the only reviewer. Bought: a gate that does not get tired,
a diff that gets read once before it is live, and a working practice that a second
engineer can join without anything changing. The objection that it is theatre
holds only if CI is empty; with §5.1 in place it is the opposite of theatre.

**Specifying this instead of building it.** This document was produced in a pass
whose scope was documentation, and it therefore describes a suite that does not
exist. There is an obvious failure mode where a specification becomes a substitute
for the work. Mitigation: every item is in `TODO.md` with the effort estimate from
§7, and the launch gate in `01-PRODUCT` §9.3 treats steps 1–6 as blocking. A
specification that blocks a launch is harder to quietly abandon than one that
merely aspires.
