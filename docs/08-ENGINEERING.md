# 08 — Implementation and Version Control

> **SDLC stages:** 9. Implementation · 10. Version control / Team
> **Status:** Stage 9 DONE, stage 10 PARTIAL — implementation standards are consistent; version-control practice is thin for a system handling money
> **Baseline:** commit `3eb178a`, 2026-08-16
> **Update when:** a standard or a workflow changes.

---

## 0. Scope and evidence base

Everything below was derived from the repository at `3eb178a` by direct inspection. Counts come from `grep`/`find` over `src/` with `src/assets/` excluded unless stated. Where a claim could not be verified from the clone, that is said explicitly rather than glossed.

| Measure | Value | How obtained |
|---|---|---|
| Tracked files | 408 | `git ls-files \| wc -l` |
| TypeScript/TSX source lines (`src/`, excl. assets) | 24,586 | `find … -exec cat + \| wc -l` |
| `.tsx` files | 147 | `find src -name '*.tsx'` |
| `.ts` files | 107 | `find src -name '*.ts'` |
| API route handlers (`route.ts`) | 54 | `find src/app/api -name route.ts` |
| Client components (`"use client"`) | 96 | `grep -rl '"use client"' src --include=*.tsx` |
| Mongoose models | 12 (+1 barrel) | `ls src/models` |
| Tracked binary design assets under `src/assets/` | 107 files, 141 MB on disk | `git ls-files 'src/assets/*'`, `du -sh` |
| `.git` directory size | 120 MB | `du -sh .git` |

Cross-references: `03-ARCHITECTURE` §2 (module decomposition), `07-SECURITY` §3.2 (authorisation) and §5.1 (input validation), `09-QUALITY` §5 (test strategy and the absence of a test suite), `10-OPERATIONS` §4 (monitoring and observability), `11-EVOLUTION` §2 (what changes when the team grows).

---

## 1. Repository structure

### 1.1 Annotated tree

```
gowithporto/
├── src/
│   ├── app/                 App Router: pages, layouts and API routes co-located by URL
│   │   ├── api/             54 route.ts handlers — the entire server-side HTTP surface
│   │   │   ├── admin/       Platform-operator endpoints (attractions, stores, revenue, disputes)
│   │   │   ├── store-owner/ Seller endpoints (products, orders, dispatch, Connect, payouts)
│   │   │   ├── user/        Customer account endpoints (profile, credits, history, transactions)
│   │   │   ├── payments/    Stripe Checkout session creation (marketplace + AI credits)
│   │   │   ├── webhooks/    stripe/ — the only inbound third-party callback
│   │   │   ├── fulfill/     Token-addressed handover endpoints (confirm, report)
│   │   │   └── …            Public catalogue: products, attractions, local-experiences, …
│   │   ├── admin/           Admin UI pages (English only, excluded from locale routing)
│   │   ├── store-owner/     Seller UI pages (English only)
│   │   ├── dashboard/       Customer account UI (locale-routed)
│   │   ├── ai/              AI planner input/result/success/cancel pages
│   │   ├── shop|cart|checkout|attractions|local-experiences|bike-rentals/  Storefront
│   │   ├── error.tsx · global-error.tsx · not-found.tsx   Client-side failure boundaries
│   │   ├── sitemap.ts · robots.ts                          Generated SEO artefacts
│   │   └── layout.tsx · globals.css                        Root shell, Tailwind v4 entry
│   ├── components/          Presentational and interactive React components, domain-grouped
│   │   ├── ui/              8 cross-domain primitives (Button, Input, LocalizedLink, …)
│   │   ├── admin/ store-owner/ dashboard/ shop/ cart/ checkout/ ai/ ai-result/
│   │   ├── attractions/ localExperiences/ bikeRentals/ home/ fulfill/
│   │   └── layout/          Header, footers, sidebars, ConnectivityBanner
│   ├── lib/                 Server-side utilities and single-purpose collaborators
│   │   ├── auth.ts          NextAuth options: 3 providers, session/JWT callbacks
│   │   ├── mongodb.ts       Cached Mongoose connection (serverless-safe singleton)
│   │   ├── buildOrderFromStripeSession.ts   Shared order construction (§3.3)
│   │   ├── emailTemplates/  9 files: shared.ts + 8 concrete templates (§3.6)
│   │   ├── email.ts cloudinary.ts rateLimit.ts tokens.ts decrementStock.ts
│   │   └── localePath.ts localizeContent.ts slugifyCategory.ts creditStore.ts
│   ├── models/              12 Mongoose schemas, one per file, plus index.ts barrel (§8)
│   ├── services/ai/         Provider abstraction over Gemini (§3.1)
│   ├── store/               Redux Toolkit store + slices/ (cartSlice, commonSlice)
│   ├── providers/           React context providers (Auth, Language, Redux)
│   ├── i18n/                index.ts + en/fr/es/pt.json dictionaries
│   ├── hooks/               useFavorite.ts (the only shared hook)
│   ├── types/               next-auth.d.ts (session/JWT augmentation)
│   ├── utils/               cn.ts and three pure formatting/badge helpers
│   ├── assets/              141 MB of design source images, committed
│   └── proxy.ts             Locale-prefix rewriting (Next.js 16's renamed middleware)
├── docs/                    9 Markdown files, 568 lines — the real project record (§10)
├── scripts/                 4 plain-Node maintenance scripts + scripts/data/ translations
├── public/                  Static assets incl. a 4.3 MB hero video
├── backend/                 DEAD — two zero-byte files (§1.3)
├── hash.js · models_debug.json                              Loose debris (§8)
└── eslint.config.mjs · tsconfig.json · jsconfig.json · tailwind.config.js · .hintrc
```

### 1.2 The organising principle

The codebase is **domain-grouped, not layer-grouped**. There is no top-level `controllers/`, `services/`, `views/` split. Instead:

- The URL is the primary index. `src/app/api/store-owner/orders/[orderId]/items/[itemId]/dispatch/route.ts` is found by knowing the endpoint, not by knowing which layer it sits in. Next.js App Router enforces this — file path *is* route.
- `src/components/` mirrors the same domains (`admin/`, `store-owner/`, `dashboard/`, `shop/`, `cart/`, `checkout/`, `ai/`, `attractions/`, `localExperiences/`, `bikeRentals/`, `fulfill/`, `home/`), with `ui/` as the single cross-domain escape hatch.
- Layer-shaped directories exist only where the abstraction is real and shared: `lib/` (server collaborators), `models/` (persistence), `services/ai/` (external-provider abstraction).

The consequence is that a change confined to one domain touches one branch of the tree. Adding the dispute-resolution feature (the baseline commit) touched `app/api/admin/disputes/**`, `app/admin/disputes/`, `models/Order.ts`, and `lib/emailTemplates/disputeResolved.ts` — four locations, all named after the thing being changed. See `03-ARCHITECTURE` §2 for how this maps onto the logical module boundaries.

The cost is that there is no compiler-enforced layering. Nothing prevents a page component from importing a Mongoose model directly, and in fact the `[slug]/layout.tsx` files do exactly that (deliberately, so `generateMetadata` and the JSON-LD render share one `React.cache`-wrapped query). That is a considered exception, not a leak, but the pattern is only held in place by convention.

### 1.3 The dead `backend/` directory — DELETE

```
backend/Dockerfile     0 bytes, tracked
backend/package.json   0 bytes, tracked
```

Both files are empty and both are committed (`git ls-files backend` returns exactly these two). Git does not track empty directories, so any `src/` and `tests/` subdirectories that exist in a working copy are not in the repository at all.

This is a fossil of a rejected architecture: a separate Express service, containerised, deployed independently. `README.md` still describes it — under "Tech Stack → Backend" it lists "Node.js, Express.js", and under "Frontend" it lists "GSAP / Framer Motion". Neither Express nor GSAP nor Framer Motion appears anywhere in `package.json`. The actual architecture is a Next.js monolith where the API routes *are* the backend (`03-ARCHITECTURE` §2).

**Verdict: delete `backend/` and correct the README stack section in the same commit.** Cost to fix is two minutes. Cost of carrying is that the first thing a new engineer sees when they scan the root is a directory implying a service that does not exist, next to a README asserting the same thing. That is an active misdirection, not inert clutter.

---

## 2. Coding standards

### 2.1 TypeScript configuration

`tsconfig.json` (verbatim settings of consequence):

| Option | Value | Effect |
|---|---|---|
| `strict` | `true` | Enables `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes`, and the rest of the strict family |
| `target` | `ES2017` | Conservative output target |
| `allowJs` | `true` | `.js` files compile — needed for `scripts/` and the config files |
| `skipLibCheck` | `true` | Third-party `.d.ts` files are not checked |
| `noEmit` | `true` | `tsc` is a checker only; Next.js/SWC does the transpilation |
| `moduleResolution` | `node` | **Deprecated.** `tsc --noEmit` currently emits `TS5107` and `TS5101` (for `baseUrl`) — both stop functioning in TypeScript 7.0 |
| `paths` | `{"@/*": ["src/*"]}` | The import alias, see §2.4 |

What `strict: true` does *not* do: it does not forbid explicit `any`. `noImplicitAny` only catches *inferred* `any`. Every one of the 76 explicit `: any` annotations in the codebase passes `strict` cleanly. Nor are the sharper options enabled — there is no `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noUnusedLocals`, or `noUnusedParameters`.

**`typescript` is not declared in `package.json` at all.** Neither as a dependency nor a devDependency. Next.js installs it on first run and writes `next-env.d.ts`. This works, but it means the TypeScript version used to check this codebase is not pinned, not recorded, and not reproducible from the lockfile — and the two deprecation errors above are exactly the class of thing a silent version bump introduces.

### 2.2 ESLint

`eslint.config.mjs` is nine lines of flat config. It spreads `eslint-config-next/core-web-vitals` and re-declares the default ignores. That is the whole of it.

| Not configured | Consequence |
|---|---|
| `@typescript-eslint` rules | No `no-explicit-any`, no `no-floating-promises`, no `no-unsafe-*` |
| `import/order` or equivalent | Import ordering is convention only (§2.4) |
| `no-console` | The 39 `console.*` calls in `src/` are not flagged (§5) |
| Prettier / formatting | No `.prettierrc`, no `.editorconfig`; formatting is whatever the editor did |

The `lint` script is the bare word `eslint` — no target path, no `--max-warnings 0`. There is no `typecheck` script, no `test` script, and no `format` script. `npm run lint` is therefore the only quality gate that exists as a command, and nothing runs it automatically (§9).

`.hintrc` configures webhint (`extends: ["development"]`, with two axe form rules disabled). It is not referenced by any npm script and webhint is not a dependency; it only takes effect inside an editor that has the extension installed. It is editor configuration masquerading as project configuration.

### 2.3 Naming conventions actually observed

| Artefact | Convention | Enforced by | Exceptions found |
|---|---|---|---|
| React components | `PascalCase.tsx`, default export | Convention | None |
| Mongoose models | `PascalCase.ts`, one schema per file, default export | Convention | None |
| Library modules | `camelCase.ts` | Convention | None |
| Route handlers | `route.ts` with exported `GET`/`POST`/`PUT` | **Next.js — hard requirement** | n/a |
| Pages / layouts | `page.tsx`, `layout.tsx` | **Next.js — hard requirement** | n/a |
| Directories | `kebab-case` for URL segments; `camelCase` for non-routed component groups (`localExperiences/`, `bikeRentals/`) | Convention | Mixed by design — URL segments must be kebab |
| Model re-registration guard | `models.X \|\| model("X", schema)` | Convention, documented in `docs/STYLE_GUIDE.md` | Applied in all 12 models |

The one genuinely inconsistent file is `src/components/admin/AdminGuard.tsx`: four-space indentation where the rest of the repository uses two, plus leftover authoring commentary committed as source —

```ts
// If lucide-react is not available, I can just use text. Let's assume it might not be and use simple loading text for now or verify later.
// Actually checking package.json, only @heroicons/react is there. I should use heroicons.
```

followed by six further lines of unresolved deliberation about where the guard should live. Its later sibling `src/components/store-owner/StoreOwnerGuard.tsx` is the same component written cleanly at two-space indentation with no commentary. One other stray marker survives in `src/app/api/store-owner/orders/[orderId]/ship/route.ts:14` — `const { orderId } = await context.params; // ✅ FIX`. With no formatter and no review step, nothing catches these.

### 2.4 Imports and path aliasing

`@/` aliasing is used near-universally: **581** `@/…` imports against **30** `./…` and **14** `../…`. Inspection of all 14 parent-relative imports shows they are exclusively binary image imports from `src/assets/` in `Header.tsx`, `error.tsx`, `not-found.tsx` and `page.tsx`. The `./` imports are same-directory siblings (`services/ai/*`, `store/slices/*`, `emailTemplates/*`), which is the correct use. There is no meaningful inconsistency here.

Import *ordering* is alphabetical-by-module-specifier in most files (`@/lib/auth`, `@/lib/mongodb`, `@/models/Order`, `next-auth`, `next/server` — the pattern in `src/app/api/admin/disputes/route.ts`, `src/app/api/favorites/route.ts` and most route handlers). This is IDE organise-imports output, not a lint rule. Files touched by hand drift from it. Status: **convention only**.

### 2.5 Enforced vs conventional — summary

| Standard | Enforced by tooling | Convention only |
|---|---|---|
| Type correctness under `strict` | Yes — `tsc` (not automated, §9) | |
| No explicit `any` | | Not even a convention — 107 occurrences |
| Next.js/React correctness rules | Yes — `eslint-config-next` | |
| Route/page file naming | Yes — enforced by the Next.js router | |
| `@/` path alias resolves | Yes — `tsconfig` `paths` | |
| Import ordering | | Convention only |
| Formatting, indentation | | Convention only, and it has already slipped |
| Component/model naming | | Convention only (documented in `docs/STYLE_GUIDE.md`) |
| Auth check before DB access in routes | | Convention only (documented; see `07-SECURITY` §3.2) |

---

## 3. Design patterns in use

Each entry names a real file and states the problem the pattern was chosen to solve.

### 3.1 Provider / Strategy — `src/services/ai/aiProvider.ts` + `geminiProvider.ts`

`aiProvider.ts` declares `interface AIProvider { generate(input: AIInput): Promise<AIOutput> }` plus the `AIInput`/`AIOutput` shapes. `geminiProvider.ts` implements it: `export class GeminiProvider implements AIProvider`. `services/ai/index.ts` instantiates exactly one — `const provider = new GeminiProvider(process.env.GEMINI_API_KEY!)` — and the rest of the application only ever calls `generateAIResponse({ systemPrompt, userInput })`.

**Why.** The AI vendor is the single most likely component to be replaced, and the README lists "Replaceable providers (AI, DB, Payments)" as an explicit technical goal. The Gemini-specific surface — the `@google/generative-ai` client, the pinned `gemini-3.7-flash` model name, `responseMimeType: "application/json"`, the 429-detection string matching, the one-retry-with-2s-delay loop — is confined to 59 lines in one file. Swapping to another vendor is one new class and one changed line in `index.ts`. Nothing else in the 24,586-line codebase imports `@google/generative-ai`.

The interface also carries the rate-limit policy boundary: `isRateLimitError()` inspects a vendor-specific error string and rethrows it as the vendor-neutral `AIRateLimitError` declared in `aiProvider.ts` (§4.2), so the calling route handles a domain concept rather than a Google error shape.

### 3.2 Repository-ish — `src/models/*.ts`

Each of the 12 models exports a configured Mongoose model guarded against re-registration (`models.X || model("X", schema)`). Callers query through the model, never through a raw driver — `mongodb` is a declared dependency but is imported nowhere in `src/`.

**Why.** This is a repository in effect, not by construction: query composition still happens at the call site (`Order.find({ "items.fulfillmentStatus": "issue_reported" })` sits in the route handler, not behind a named method). The benefit taken is schema centralisation and connection reuse; the benefit forgone is testability — there is no seam to substitute for persistence, which is one reason there is no test suite (`09-QUALITY` §5). Calling it "Repository-ish" is accurate: the file boundary exists, the abstraction does not.

### 3.3 Shared builder to prevent logic drift — `src/lib/buildOrderFromStripeSession.ts`

An order can be created down **two independent paths**:

| Path | File | Trigger |
|---|---|---|
| Webhook (authoritative) | `src/app/api/webhooks/stripe/route.ts:78` | Stripe `checkout.session.completed` |
| Confirm (instant feedback) | `src/app/api/orders/confirm/route.ts:42` | Browser returns to `/checkout/success` |

Both call `buildOrderFromStripeSession(session)`. Nothing else does; `grep` returns exactly those two call sites plus the definition.

**Why.** This is the highest-consequence duplication risk in the system. The function computes `commissionRateSnapshot`, `platformFeeAmount`, `storeOwnerAmount`, per-item `fulfillmentToken`s, and the delivery-fee exclusion from commission. Two hand-written copies would diverge the first time a commission rule changed, and the divergence would be invisible — whichever path won the race would decide how much money the platform kept. Extracting the builder makes the two paths structurally incapable of disagreeing about the money. Idempotency is then a separate, single concern handled by the unique sparse index on `Order.stripeSessionId`.

### 3.4 Guard components — `AdminGuard.tsx`, `StoreOwnerGuard.tsx`

Both are `"use client"` components that read `useSession()`, redirect on `unauthenticated`, redirect on wrong role, render a spinner while `loading`, exempt their own login path by `usePathname()`, and otherwise render `children`. `admin/layout.tsx` and `store-owner/layout.tsx` each wrap their subtree in one.

**Why.** Before `StoreOwnerGuard` existed, `store-owner/layout.tsx` used the session only to decide whether to show the sidebar, so a logged-out visitor got the full dashboard shell with all-zero figures (recorded in `docs/CHANGELOG.md`, 2026-08-12). The guard makes the authenticated-shell decision one component that every page under the route inherits, instead of a check each page must remember. Note the scope honestly: these guards are **UX**, not authorisation. The actual authorisation is the `getServerSession(authOptions)` + role check present in 37 of the 54 route handlers — see `07-SECURITY` §3.2.

### 3.5 Drop-in safe default — `src/components/ui/LocalizedLink.tsx`

31 lines. Default export is *named* `Link`, so adopting it is a one-line import swap: `import Link from "@/components/ui/LocalizedLink"` in place of `import Link from "next/link"`. It reads the active locale from `useLanguage()` and prefixes internal hrefs, passing through external URLs, `#anchors`, `mailto:` and `tel:` untouched.

**Why.** The bug it replaced was systemic: essentially every internal `<Link href="/…">` in the app predated locale routing, so a French visitor lost their language on the next click, on every page (`docs/CHANGELOG.md`, 2026-08-14). The fix could have been 33 files of hand-edited `href={`/${lang}/shop`}` — which would have re-introduced the same bug at the 34th call site. Instead the *default* was made safe. After the swap, writing `<Link href="/shop">` produces correct behaviour, and producing the old bug requires deliberately importing `next/link` instead. The class of defect is now structurally unavailable rather than merely fixed.

### 3.6 Template method — `src/lib/emailTemplates/shared.ts`

`shared.ts` exports the invariant parts — `colors`, `logoUrl`, `baseLayout(bodyHtml)`, `button(label, href)`, `formatEUR(amount)` — and `metaBar(cols)`, which renders the bordered label/value info box. All eight concrete templates (`orderConfirmation`, `orderShipped`, `orderDispatched`, `orderReadyForPickup`, `creditReceipt`, `welcome`, `contactMessage`, `disputeResolved`) import from it and supply only their own body.

**Why.** HTML email cannot use a stylesheet; every brand decision must be inlined into every template. Without a shared skeleton, a palette change is an eight-file edit that will be done seven times. `metaBar()` in particular was extracted after the fact: the bordered info box existed only in the order-confirmation template while the other three were plain text and a button, and promoting it to a helper brought all of them to one standard in one change (`docs/TODO.md`, 2026-08-05).

### 3.7 Aggregate root — `src/models/Order.ts`

120 lines. `OrderSchema` owns four embedded sub-schemas (`AddressSchema`, `IssueReportSchema`, `ResolutionSchema`, `LegalExceptionSchema`) and an `items[]` array in which each element carries its own `fulfillmentToken` (uniquely indexed, sparse), `fulfillmentStatus` (seven-value enum), `transferId`, `transferAmount`, `transferError`, `issueReport`, `resolution` and `legalException`.

**Why.** The money invariants are per-item but only meaningful in the context of the whole order: a per-item Stripe transfer must not exceed that item's share, the sum of transfers plus refunds plus platform fee must reconcile against `total`, and a dispute resolution on one item must not disturb another's already-completed transfer. Modelling items as a separate collection would put those invariants across a document boundary that MongoDB will not enforce transactionally by default. Keeping them embedded means the whole consistency boundary is one document and one atomic write. The cost is a wide document and an unbounded array — acceptable at the planning assumption of 100 users over five years, and flagged in `11-EVOLUTION` §2 as the thing to revisit if order volume ever makes the array size a real constraint.

---

## 4. Error handling conventions

### 4.1 Server-side — the inconsistency, quantified

**27 of the 54 route handlers contain a `try {` block. 27 do not.** Exactly half.

The two styles produce different observable behaviour on failure:

| Style | Example | Failure behaviour |
|---|---|---|
| Wrapped | `src/app/api/admin/orders/route.ts` — whole handler in `try/catch`, `console.error`, returns `NextResponse.json({error}, {status:500})` | Controlled JSON error body |
| Unwrapped | `src/app/api/admin/disputes/route.ts`, `src/app/api/payments/checkout/route.ts`, `src/app/api/store-owner/products/route.ts`, `src/app/api/upload/route.ts`, `src/app/api/favorites/route.ts` | Exception propagates to Next.js, which returns its own opaque 500; the client gets no parseable `error` field |

Notably, **payment-path routes are on both sides of the line.** `src/app/api/webhooks/stripe/route.ts` and `src/app/api/orders/confirm/route.ts` are wrapped; `src/app/api/payments/checkout/route.ts`, `src/app/api/payments/ai-credits/route.ts`, `src/app/api/store-owner/orders/[orderId]/ship/route.ts` and `.../items/[itemId]/dispatch/route.ts` are not. This is not a considered policy — it is the residue of who wrote which route on which day.

The uniform parts, by contrast, are genuinely uniform. Every protected route follows the sequence documented in `docs/STYLE_GUIDE.md`:

```ts
const session = await getServerSession(authOptions);
if (!session || session.user.role !== "STORE_OWNER") {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
await connectDB();
```

Explicit status codes (401/400/404) with a JSON `{ error }` body are used consistently on the *expected* error paths in all 54 routes. It is only the *unexpected* path that is inconsistent.

**Recommendation:** a single `withRoute(handler)` wrapper applied to all 54 handlers would make the unexpected path uniform in one change, and would be the natural place to attach the correlation ID that §5 says is missing.

### 4.2 Typed domain errors

There is exactly one. `grep -rn "extends Error" src` returns a single hit:

```
src/services/ai/aiProvider.ts:18:export class AIRateLimitError extends Error {
```

It exists because the caller needs to distinguish "Gemini refused, retry shortly" from "something broke", so that `POST /api/ai/preview` can return 429 with a "high demand" message rather than a generic 500 (`docs/CHANGELOG.md`, 2026-08-13). Everywhere else — payment failures, Cloudinary upload failures, Stripe Connect failures, Mongo failures — errors are untyped `Error`s discriminated, where at all, by string inspection. That is the same technique `isRateLimitError()` uses internally (`message.includes("429")`), and it is fragile for the same reason: a vendor rewording an error message silently changes control flow.

### 4.3 Client-side boundaries

| File | Role | Notes |
|---|---|---|
| `src/app/error.tsx` | Route-segment boundary | Branded, i18n via `t(lang, "error.*")`, offers `reset()` and a home link; calls `console.error(error)` in an effect |
| `src/app/global-error.tsx` | Root-layout boundary | Deliberately self-contained — no providers, no i18n, hardcoded English, plain `<a>` with an `eslint-disable` and a written justification, because whatever failed may be the provider tree itself |
| `src/app/not-found.tsx` | 404 | Branded, i18n |
| `src/components/layout/ConnectivityBanner.tsx` | Offline detection | `online`/`offline` events plus a 20s `HEAD /robots.txt` poll; renders through the shared toast instance; icon inlined as a base64 data URI so it renders with zero network |

The `global-error.tsx` design is the right instinct: a last-resort boundary that depends on nothing it might itself be recovering from.

### 4.4 User feedback

`react-hot-toast` is imported in **38 files** — the single, consistent channel for transient user feedback across storefront, dashboard, admin and store-owner UIs. `ConnectivityBanner` routes through the same instance rather than inventing a fixed-position bar, so offline notification is visually consistent with every other message for free.

---

## 5. Logging

### 5.1 What exists

| Call | Count |
|---|---|
| `console.error` | 25 |
| `console.log` | 10 |
| `console.warn` | 4 |
| **Total in `src/`** | **39** |

That is the entirety of the logging strategy. Status: **PARTIAL** — arguably **absent**, if "logging" is taken to mean anything beyond print statements.

The ten `console.log` calls sit in five files, three of them on production paths:

| File | Path type |
|---|---|
| `src/app/api/store-owner/orders/route.ts` | Production API |
| `src/app/api/user/credits/add/route.ts` | Production API — credit mutation |
| `src/lib/email.ts` | Production library — every transactional send |
| `src/app/ai/success/page.tsx` | Client component — logs into the user's browser console |

### 5.2 What does not exist

| Capability | Status | Consequence |
|---|---|---|
| Structured (JSON) logs | Absent | Nothing is queryable by field; investigation is substring search |
| Log levels | Absent | No way to raise or lower verbosity without editing and redeploying |
| Correlation / request IDs | Absent | A single failed checkout cannot be reconstructed across the checkout route, the Stripe webhook, and the confirm route — three separate invocations with nothing linking them |
| Aggregation / retention | Absent | Logs land in Vercel's runtime log viewer only; the Hobby plan's retention is short and there is no export |
| Alerting on error rate | Absent | A failing webhook is discovered by a customer complaint or by opening the Stripe dashboard |
| Redaction policy | Absent | Nothing prevents a future `console.error(err)` from printing a Stripe object containing customer detail |

For a system that moves money between three parties, the correlation-ID gap is the sharpest of these: the money path is deliberately split across two order-creation routes (§3.3), and there is currently no way to tie the two together in the logs. See `10-OPERATIONS` §4.4 for the operational view and the proposed remediation order.

---

## 6. Configuration management

### 6.1 Environment variables referenced in code

Enumerated by `grep -rho "process\.env\.[A-Z_0-9]*" src scripts next.config.mjs`:

| Variable | References | Purpose |
|---|---|---|
| `NEXTAUTH_URL` | 12 | Absolute-URL base for Stripe redirects and email links |
| `STRIPE_SECRET_KEY_LIVE` | 11 | Server-side Stripe client construction — as of the live-payments cutover, this covers shop checkout, order confirm, refunds, dispute resolution, fulfillment-confirm, payouts, and Connect onboarding, not just AI credits |
| `NEXT_PUBLIC_BASE_URL` | 8 | Client-visible base URL |
| `MONGODB_URI` | 7 | Atlas connection string |
| `GEMINI_API_KEY` | 3 | Gemini client (incl. `scripts/`) |
| `GROQ_API_KEY` | 1 | Active AI itinerary provider (`src/services/ai/index.ts`) — coexists with `GEMINI_API_KEY` above; which one is actually in the critical path is worth confirming if this surprises you |
| `SUPPORT_EMAIL` | 2 | Contact-form destination |
| `STRIPE_WEBHOOK_SECRET_LIVE` | 2 | Live-mode webhook signature verification |
| `RESEND_API_KEY` | 2 | Transactional email |
| `STRIPE_WEBHOOK_SECRET` | 1 | Test-mode webhook signature verification (the shop-checkout webhook destination still tries this first, then falls back to the live secret — see `03-ARCHITECTURE`) |
| `STRIPE_SECRET_KEY` | 1 | Test-mode-only Stripe client, remaining solely in the webhook route's test-mode signature verification branch |
| `NEXT_PUBLIC_SHOP_ENABLED` | 1 | Feature flag gating shop browsing/cart/checkout (`src/lib/marketplace.ts`, enforced in `src/proxy.ts`) |
| `CRON_SECRET` | 1 | Authenticates Vercel Cron's daily call to `/api/cron/check-stale-fulfillments` — must be set in Vercel project env vars, Vercel sends it automatically as a bearer token |
| `NEXT_PUBLIC_GOOGLE_REVIEW_URL` | 1 | Optional review-prompt link in post-purchase/credit emails |
| `GOOGLE_CLIENT_ID` | 1 | Google OAuth |
| `GOOGLE_CLIENT_SECRET` | 1 | Google OAuth |
| `EMAIL_FROM` | 1 | Sender identity |
| `ADMIN_EMAIL` | 1 | New-user, payout, and dispute-alert notification destination (defaults to `admin@gowithporto.pt`) |
| `CLOUDINARY_CLOUD_NAME` | 1 | Image hosting |
| `CLOUDINARY_API_KEY` | 1 | Image hosting |
| `CLOUDINARY_API_SECRET` | 1 | Image hosting |

Twenty distinct variables (up from fifteen, largely from the live-payments cutover and the two features that shipped alongside it). `NEXTAUTH_SECRET` is required by NextAuth but never appears in application code — it is read by the library itself, so it does not show up in this grep and would not be caught by a naive audit of `process.env` usage.

Supply: `.env.local` in development (`.gitignore` line 34 excludes `.env*`, verified — no `.env` file is tracked), Vercel project environment variables in production. `scripts/*.js` are run with `node --env-file=.env.local`.

### 6.2 There is no validation at boot

This is the material gap. Only one variable has any guard at all:

```ts
// src/lib/mongodb.ts
const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env.local");
}
```

and even that fires at *module load of `lib/mongodb`* — the first time a request touches the database — not at application startup. Everything else uses a bare non-null assertion, most visibly `new GeminiProvider(process.env.GEMINI_API_KEY!)` in `src/services/ai/index.ts`, where `!` silences the compiler about a value TypeScript cannot know anything about.

The failure mode this produces: a missing or mistyped Vercel environment variable does not fail the build and does not fail the deploy. It fails on the first request that reaches the code path that reads it — in production, as a 500, possibly weeks later, possibly mid-checkout. `STRIPE_WEBHOOK_SECRET` has exactly one reference in the entire codebase; if it were absent, the first symptom would be a silently non-functioning payment webhook.

**Recommendation (Fix now, ~1 hour).** Add `src/lib/env.ts` that reads every one of the fifteen variables (the fourteen above plus `NEXTAUTH_SECRET`) once, fails loudly listing all missing names, and exports a typed frozen object. Import it from `src/app/layout.tsx` and from `src/proxy.ts` so it executes on any request path. Every `process.env.X!` in the codebase then becomes `env.X` with a real type and no assertion. A schema library is not required for fifteen strings; a hand-written check is sufficient and adds no dependency.

### 6.3 Runtime-configurable settings — `GlobalConfig`

`src/models/GlobalConfig.ts` is a deliberately generic key/value collection:

```ts
{ key: { type: String, required: true, unique: true },  // e.g. "AI_SETTINGS", "PLATFORM_SETTINGS"
  value: { type: Schema.Types.Mixed } }
```

It is read and written by `GET/PUT /api/admin/ai-settings` and `/api/admin/config`, surfaced in the `/admin/ai-settings` UI. This is the correct split: settings an operator changes (AI prompt configuration, platform settings) live in the database and change without a deploy; secrets and connection strings live in the environment and change with one. The `Mixed` type means the shape is unvalidated — acceptable while the only writer is the admin UI, and worth typing per key if the collection grows.

---

## 7. Dependency management

npm, with `package-lock.json` committed (286 KB, tracked). **19 production dependencies and 9 development dependencies** — note that this is fewer than the 20/10 sometimes quoted; the actual counts from `package.json` are 19 and 9.

### 7.1 Production dependencies by purpose

| Purpose | Packages |
|---|---|
| Framework / runtime | `next@16.1.1`, `react@19.2.3`, `react-dom@19.2.3` |
| Persistence | `mongoose@^9.1.2`, `mongodb@^7.0.0` |
| Payments | `stripe@^20.1.0`, `@stripe/stripe-js@^8.6.1` |
| Auth | `next-auth@^4.24.13`, `bcryptjs@^3.0.3`, `@types/bcryptjs@^2.4.6` |
| AI | `@google/generative-ai@^0.21.0` |
| Media | `cloudinary@^2.10.0` |
| Email | `resend@^6.18.1` |
| State | `@reduxjs/toolkit@^2.11.2`, `react-redux@^9.2.0` |
| UI | `@heroicons/react@^2.2.0`, `react-icons@^5.5.0`, `react-hot-toast@^2.6.0` |
| Fulfilment | `qrcode@^1.5.4` |

### 7.2 Development dependencies

| Purpose | Packages |
|---|---|
| Styling | `tailwindcss@^4.1.18`, `@tailwindcss/postcss@^4.1.18`, `postcss@^8.5.6`, `autoprefixer@^10.4.23` |
| Linting | `eslint@^9`, `eslint-config-next@16.1.1` |
| Types | `@types/node@25.0.3`, `@types/react@19.2.7`, `@types/qrcode@^1.5.6` |

### 7.3 Observations

- **`mongodb@^7.0.0` is declared but never imported.** `grep -rn 'from "mongodb"' src scripts` returns nothing; Mongoose bundles its own driver. Removing it eliminates a version-skew hazard between two copies of the driver.
- **`autoprefixer` is declared but not wired.** `postcss.config.mjs` lists only `@tailwindcss/postcss`. Tailwind v4 handles prefixing internally.
- **`@types/bcryptjs` sits in `dependencies`, not `devDependencies`** — harmless, but it ships type definitions to production.
- **`typescript` is absent entirely** (§2.1).
- **`@types/react-dom` is absent** while `@types/react` is present.

### 7.4 Pinning discipline

Exact-pinned (no range operator): `next@16.1.1`, `react@19.2.3`, `react-dom@19.2.3`, `eslint-config-next@16.1.1`, `@types/node@25.0.3`, `@types/react@19.2.7`. Everything else uses caret ranges.

Is this deliberate? **Partly, and by inheritance rather than by decision.** `create-next-app` scaffolds exactly this set — framework and React exact, `@types/*` for node and react exact, everything the developer adds later on a caret. The six pinned packages are precisely the ones the generator writes; every package added since (`stripe`, `mongoose`, `next-auth`, `resend`, `@google/generative-ai`, …) carries a caret. So the *effect* is defensible — the framework, which breaks hardest on minor bumps, is frozen — but no decision produced it. `docs/DECISIONS.md` records nine deliberate technology choices and contains no entry on version pinning, which is consistent with the pattern being inherited rather than chosen.

The gap that matters more: **`stripe@^20.1.0` and `mongoose@^9.1.2` are on carets.** A `npm install` on a clean machine can pull a different minor version of the payments SDK than the one running in production. `package-lock.json` protects CI and Vercel builds (which use `npm ci` semantics), so this is a developer-machine and contributor-onboarding risk rather than a production one — but it is the payments SDK.

### 7.5 Not present

No Dependabot or Renovate configuration (there is no `.github/` directory at all). No `npm audit` step anywhere — not in a script, not in CI, because there is no CI. No `engines` field pinning a Node version, and no `.nvmrc`. Vulnerability discovery is currently manual and unscheduled.

---

## 8. Technical debt register

| Item | Location | Cost of carrying | Cost to fix | Verdict |
|---|---|---|---|---|
| Dead `backend/` directory — two 0-byte tracked files, matching a stale README "Express.js" stack claim | `backend/Dockerfile`, `backend/package.json`, `README.md` | Actively misleads any reader about the architecture | 5 min (delete + README edit) | **Fix now** |
| `models/index.ts` registers 9 of 12 models — omits `Category`, `GlobalConfig`, **`Order`** | `src/models/index.ts`, used by 10 routes via `import "@/models"` | Latent `MissingSchemaError`, see below | 10 min | **Fix now** |
| Two routes `.populate("storeId")` without importing `Store` or the barrel | `src/app/api/admin/orders/route.ts:28`, `src/app/api/admin/disputes/route.ts:18` | On a cold serverless instance where nothing has yet registered `Store`, Mongoose throws `MissingSchemaError`. `/api/admin/disputes` has no `try/catch`, so it surfaces as an opaque 500 | 2 min (add `import "@/models"`) | **Fix now** |
| `hash.js` in repo root — tracked, contains a hardcoded plaintext password `"mm1234"` and prints a bcrypt hash | `hash.js` | A committed credential-shaped artefact; trains the habit of leaving them around. See `07-SECURITY` §5.1 | 1 min (delete) | **Fix now** |
| `models_debug.json` in repo root — 22 KB dump of the Gemini `models.list` API response | `models_debug.json` | Stale within weeks; noise at the top level of the tree | 1 min (delete) | **Fix now** |
| `tsconfig.tsbuildinfo` | — | **Not an issue.** `.gitignore:40` (`*.tsbuildinfo`) covers it, `git ls-files` confirms it is untracked, and it is not present in the clone. Reported here because it was flagged; no action required | — | **Accept (already correct)** |
| 141 MB of design-source PNGs committed under `src/assets/`, incl. a 6.1 MB `Fav Icon.png` and a duplicated `zzHelper assests/` folder | `src/assets/` (107 tracked files); `.git` is 120 MB | Every clone pays 120 MB; the duplicated helper folder is pure waste | ~1 h (move to external storage; history rewrite is optional and riskier) | **Fix at trigger** — when a second engineer has to clone |
| 107 `any` tokens: 76 `: any` annotations, 5 `as any`, 7 `Record<string, any>`, across 67 files. Concentrated in `src/app` (69 of the `: any`) | `src/app/**` mostly; also `lib/`, `components/`, `services/`, `store/`, `utils/` | Each is a hole in `strict`. Highest-value cases are Mongoose documents in money paths (`buildOrderFromStripeSession.ts` uses `(v: any)` on variants) | Incremental; enable `@typescript-eslint/no-explicit-any` as a warning first | **Fix at trigger** — type new code strictly; convert money paths first |
| 39 `console.*` calls; 3 `console.log` on production paths incl. a credit mutation and every email send | §5.1 | No structured logs, no correlation, short Vercel retention | 2–3 h for a minimal logger + request ID | **Fix at trigger** — before first real money |
| Hand-rolled validation; no `zod`/`yup`/`joi`/`valibot` anywhere. `POST /api/store-owner/products` does `Product.create({ ...body, storeId, active: true })` — unvalidated mass assignment | `src/app/api/store-owner/products/route.ts:36` and similar | Client controls every field Mongoose will accept. Contrast `PUT /api/admin/stores/[id]`, which whitelists exactly 4 fields | ~1 day for the ~15 write routes | **Fix at trigger** — see `07-SECURITY` §3.2 |
| Redux Toolkit carrying a single `cart` slice; `commonSlice.ts` exists but is not registered in `store/index.ts` | `src/store/` (95 lines total) | Two libraries (`@reduxjs/toolkit`, `react-redux`) and a provider for state that `useContext` + `localStorage` would cover. Removing it now costs more than it saves | Delete `commonSlice.ts`: 1 min. Remove Redux entirely: ~half a day | **Accept** the store; **Fix now** the dead slice |
| Legacy whole-order `ship` route coexisting with per-item `dispatch` | `.../[orderId]/ship/route.ts` (80 lines) and `.../items/[itemId]/dispatch/route.ts` (85 lines); both wired from `src/app/store-owner/orders/page.tsx` lines 162 and 185 | Two fulfilment code paths. Mitigated: `ship` returns 400 "use per-item fulfillment" when `order.paymentIntentId` is set, so it only serves pre-migration orders | Retire once no legacy orders remain: ~1 h | **Fix at trigger** — when the last pre-`paymentIntentId` order closes |
| `jsconfig.json` and `tsconfig.json` both present, both declaring `@/*` | root | Next.js reads `tsconfig.json` when present; `jsconfig.json` is inert and can drift from it | 1 min (delete `jsconfig.json`) | **Fix now** |
| `tailwind.config.js` is a v3-style config that Tailwind v4 never loads — `globals.css` uses `@import "tailwindcss"` with no `@config`. Its palette (`#1B3936`, `#57BAEA`, `#F1EDE1`) also contradicts the real palette in `docs/STYLE_GUIDE.md` (`#1d3d5c`, `#2c6e9b`, `#eab657`) | `tailwind.config.js`, `src/app/globals.css` | Dead config asserting wrong brand colours; a new engineer will read it and believe it | 5 min (delete, or port real tokens to a `@theme` block) | **Fix now** |
| `.hintrc` — webhint config with no corresponding dependency or script | `.hintrc` | Editor-only config that reads as project config | 1 min | **Fix now** or document |
| `typescript` undeclared in `package.json`; `moduleResolution: "node"` emits deprecation errors `TS5107`/`TS5101` | `package.json`, `tsconfig.json` | Unpinned checker version; will hard-break on TypeScript 7.0 | 15 min (add `typescript` devDep, move to `bundler` resolution) | **Fix now** |
| `mongodb` and `autoprefixer` declared but unused; `@types/bcryptjs` in `dependencies` | `package.json` | Minor; version-skew hazard on the Mongo driver | 5 min | **Fix now** |
| `AdminGuard.tsx` — leftover authoring commentary and 4-space indentation; `ship/route.ts:14` — `// ✅ FIX` marker | `src/components/admin/AdminGuard.tsx`, `.../ship/route.ts` | Signals absence of a review step to any reader | 10 min | **Fix now** |
| No test suite of any kind; no `test` or `typecheck` script | `package.json` | The dominant quality risk. Treated in full in `09-QUALITY` §5 | See `09-QUALITY` §5 | **Fix at trigger** |

---

## 9. Version control practice

### 9.1 What the repository actually shows

| Property | Observed |
|---|---|
| VCS | Git; remote `https://github.com/gowithporto/gowithporto.git` |
| Branches | **`main` only** at baseline. `git branch -a` returns `main`, `remotes/origin/main`, and the `origin/HEAD` symref. Four merge commits exist in history, so short-lived branches were used at some point; they are not used now |
| Commits | **77**, spanning 2026-01-03 to 2026-08-16 |
| Baseline commit | `3eb178a` — `feat: gate Stripe payouts on buyer-confirmed delivery, add dispute resolution` |
| Author | `almahmudsarker <almahmuds427@gmail.com>` — sole author |
| Tags | **6** — `v0.1.0` … `v0.5.0`. Last tag `v0.5.0` on 2026-07-31; **30 commits since then are untagged** |
| Pull requests | None — direct commits to `main` |
| Code review | None |
| Branch protection | None (no `.github/` directory) |
| CI | None. No workflow files, no `vercel.json`, no pre-commit hooks, no `.husky/` |
| Deployment gate | `main` auto-deploys to Vercel production. Nothing runs between push and live |

### 9.2 Commit-message convention — measured, not assumed

Across all 77 commits, 36 carry a type prefix and 41 do not. The prefixes
themselves are not consistent with each other:

| Prefix | Count |
|---|---|
| `feat:` | 24 |
| `fix:` | 6 |
| `feature:` | 4 |
| `bug:` | 2 |
| Unprefixed — e.g. `font changed`, `update footer options`, `assests file uploaded` | 41 |

Plus one-off variants (`Enhance:`, `feat-enhance:`) belonging to no scheme. **There
is an intention toward Conventional Commits and no enforcement of it**, which is
precisely the outcome a `commit-msg` hook exists to prevent.

The trend, however, is strongly positive and deserves recording. Early commits are
of the `font changed` variety and tell a reader nothing. Recent ones are among the
best writing in the project: the Stripe Connect self-healing commit carries a full
paragraph explaining that `account.updated` events require a separately-registered
Connect-scoped endpoint, and that the code therefore re-verifies directly with
Stripe rather than trusting that endpoint to be configured correctly. That message
will still be useful in two years.

The discipline improved on its own; it was never codified, so it remains a habit
rather than a guarantee. Recommendation: adopt Conventional Commits formally,
enforce only the subject line with a `commit-msg` hook, and change nothing about
the bodies — they are already better than most teams manage.

### 9.3 Cadence

Bursty rather than steady, which is what a part-time solo project alongside a
master's degree actually looks like:

| Period | Commits | Character |
|---|---|---|
| 2026-01-03 → 01-31 | 30 | Initial build. Tags `v0.1.0`–`v0.4.0` all fall here |
| 2026-02 → 2026-05 | 8 | Sparse — design and asset work |
| 2026-07-26 → 07-31 | 9 | Redesign push. Tags `v0.4.1`, `v0.5.0` |
| 2026-08-04 → 08-16 | 30 | Sustained daily work: Connect payouts, transactional email, four-locale i18n, favourites, offline handling, per-item fulfilment and disputes |

The August period runs at roughly one substantial increment per working day and is
where the majority of the system's real engineering was done.

### 9.4 Assessment

For the work as it is done — one person, one machine, one deployment target — branching would add ceremony and no isolation, since there is no second contributor to isolate from. That part is defensible.

What is not defensible is the combination in the last row of the table above. Every push to `main` reaches production immediately, and between the developer's keyboard and a live Stripe integration there is no automated check of any kind: no type check, no lint, no build verification independent of Vercel's own, no test. `npm run lint` and `tsc --noEmit` are run by hand — the CHANGELOG shows them being run diligently, on 2026-08-13 and 2026-08-14, which is good discipline — but "diligently" is a property of a person on a good day, not a property of the pipeline. See §10.4.

---

## 10. Issue tracking and release management

### 10.1 GitHub issues

The GitHub repository carries four issues. All four are open, and all four are dated 2026-01-03 — while the features they describe shipped over the following months and are recorded as complete in `docs/TODO.md`. They were opened once, at project inception, and never touched again.

*Verified* against the public repository on 2026-08-16: issues #1 (AI travel plan generation with free preview and paid unlock), #2 (user dashboard for AI history and orders), #3 (ecommerce product listing, details and checkout) and #4 (admin dashboard for business control) are all open, all authored 2026-01-03, and all four describe functionality that is live in production.

### 10.2 What the real system is

| Function | Nominal home | Actual home | Evidence |
|---|---|---|---|
| Backlog | GitHub Issues | `docs/TODO.md` (55 lines) | Live checkbox list, High/Medium/Low priority, each completed item annotated with a date and a one-to-five-sentence result |
| History | Git log / releases | `docs/CHANGELOG.md` (95 lines) | Dated entries, newest first, each explaining the symptom, the root cause and the fix |
| Rationale | ADRs / PR descriptions | `docs/DECISIONS.md` (43 lines) | Nine dated entries, each with *Alternatives considered* and *Reason chosen* |
| Current state | Wiki / README | `docs/AI_CONTEXT.md` (67 lines) | "Current state only. No daily logs. If something here is stale, fix it, don't append to it." |
| Handover | — | `docs/SESSION_HANDOFF.md` (52 lines) | |
| Conventions | — | `docs/STYLE_GUIDE.md` (48 lines) | Observed conventions, explicitly framed as descriptive |

Nine documents, 568 lines, and they are current. `docs/TODO.md`'s deferred items carry the reason for deferral and, in two cases, an explicit "founder wants to revisit later — don't re-flag unprompted", which is a level of state-tracking most issue trackers do not capture.

### 10.3 The trade, stated honestly

**These files served a solo developer better than GitHub Issues would have.** A `TODO.md` entry can be written in the same edit as the code, needs no context switch to a browser, versions alongside the change, and — critically — has room for the paragraph of reasoning that an issue title cannot hold. `docs/CHANGELOG.md`'s 2026-08-13 entry explains why `<option value="Cheap">` keeps an English value while its label is translated (because `promptBuilder.ts` interpolates the value straight into the Gemini prompt). No issue tracker would have captured that, and it is precisely the fact that prevents a future contributor from "fixing" the untranslated value and silently corrupting the AI prompt.

**And they fail in ways an issue tracker does not.**

| Gap | Consequence |
|---|---|
| Invisible to collaborators | A second engineer cannot be assigned a `TODO.md` line, cannot claim it, and cannot see that someone else has started it. Two people editing one Markdown backlog produce merge conflicts on the backlog itself |
| No traceability requirement → commit | Nothing links a `TODO.md` item to the commit that satisfied it. The 77 commits and the dated backlog entries can be aligned by hand through their dates, and no further than that — there is no reference in either direction |
| No structured state | No labels, no milestones, no assignee, no created/closed timestamps beyond hand-typed dates, no query. "What was outstanding on 12 August" is answerable only by reading a diff of the file |
| No external visibility | An academic reviewer or a prospective collaborator sees four stale January issues on GitHub and, unless they open `docs/`, concludes the project was abandoned in the first week |

### 10.4 Release management

| Practice | Status |
|---|---|
| Semantic versioning | **Started, then abandoned.** Six tags exist — `v0.1.0`, `v0.2.0`, `v0.3.0` (2026-01-20), `v0.4.0` (2026-01-23), `v0.4.1` (2026-07-26), `v0.5.0` (2026-07-31). Nothing has been tagged since |
| Tag / code divergence | **30 commits are untagged**, including every piece of work in the August push: Connect payouts, transactional email, the full i18n programme, favourites, and the entire per-item fulfilment and dispute system. The most consequential release in the project's life is the one with no version number |
| `package.json` version | `"0.1.0"` — never moved, and never matched the tags even while tagging was active |
| Release notes | Absent as such; `docs/CHANGELOG.md` is dated but not versioned, so no changelog entry maps to a tag |
| Release process | Push to `main`. Vercel builds and promotes to production. Tagging, when it happened, was after the fact |
| Rollback | Vercel's "promote previous deployment" only. Not documented, not rehearsed |

The pattern here is more instructive than a plain absence would be. The practice
was set up correctly and then lapsed exactly when the pace of work increased —
which is the normal failure mode for any release ritual that depends on the
developer remembering it at the end of a long day. The five months between
`v0.4.0` and `v0.4.1` and the two-week gap since `v0.5.0` both fall in busy
periods, not quiet ones.

For a payments system, "which version is live, and how do I get back to the last
good one" should be answerable from the repository. Today it is answerable only
from the Vercel dashboard. Remediation is cheap and, more importantly, should be
automated rather than remembered: a release step in CI that tags on merge, bumps
`package.json`, and cuts a `## [x.y.z] — date` section in the existing CHANGELOG.
See `09-QUALITY` §5.

---

## 11. Onboarding a second engineer

### 11.1 What exists to help them, in the order they need it

| # | Need | Provided by | Adequacy |
|---|---|---|---|
| 1 | What is this and why | `README.md` goals/stakeholders; `docs/AI_CONTEXT.md` overview | **PARTIAL** — README's stack section is wrong (Express, GSAP, Framer Motion; §1.3) |
| 2 | Current state, what is done, what is next | `docs/AI_CONTEXT.md` "Features completed" / "Current priorities"; `docs/TODO.md` | **DONE** — current and specific |
| 3 | How the pieces fit | `docs/ARCHITECTURE.md` (65 lines); `03-ARCHITECTURE` | **PARTIAL** |
| 4 | The data model | `docs/DATABASE.md` (100 lines) | **PARTIAL** — 12 schemas in 100 lines |
| 5 | The API surface | `docs/API.md` (43 lines) for 54 routes | **PARTIAL** — index-level only |
| 6 | Conventions to follow | `docs/STYLE_GUIDE.md` — palette, component classes, folder rules, API sequence, and a "What NOT to do" section | **DONE** — the strongest document in the set |
| 7 | Why things are the way they are | `docs/DECISIONS.md` — nine ADR-style entries with alternatives and reasoning | **DONE** |
| 8 | Recent change history | `docs/CHANGELOG.md` | **DONE** in prose; **absent** in Git (§9.2) |
| 9 | Running maintenance tasks | `README.md` "Maintenance Scripts" — each of the four `scripts/` files documented with its exact invocation | **DONE** |

### 11.2 What is missing

| Gap | Impact on day one |
|---|---|
| **No environment-variable manifest.** No `.env.example`. The fifteen required variables (§6.1) must be reconstructed by grepping `process.env.` | Blocking. And because nothing validates at boot (§6.2), a missed variable does not announce itself — the app starts and fails later at the route that needs it |
| **No local setup instructions.** README has no "install and run" section at all; no Node version, no `npm install` step, no note that Atlas/Stripe/Cloudinary/Resend/Gemini accounts are all required | Blocking |
| **No test suite.** Nothing to run that says "your environment is correct" or "you have not broken anything". See `09-QUALITY` §5 | Blocking for confidence; they will not know whether their first change is safe |
| **Weak `git blame`.** 41 of 77 commit subjects carry no type prefix and several say nothing usable, so blame often lands on a commit whose message does not explain the change | High. The normal first move — "who wrote this and why" — returns nothing |
| **No CI to imitate.** No pipeline defines what "ready to merge" means | High. They must infer the standard from prose |
| **No seeded local data.** The only seed path, `src/lib/seedProducts.ts` (products only), was deleted 2026-08-17 along with the unauthenticated route that exposed it (`07-SECURITY` §1, SEC-1); nothing replaced it, and attractions, experiences, stores and orders were never seeded either | Medium. Most of the app renders empty |
| **120 MB clone** because of committed design assets (§8) | Low, but a poor first impression |
| **Stale README stack section** and the `backend/` fossil | Medium. Their first mental model will be wrong |

### 11.3 Honest first-day estimate

Assume a competent engineer already fluent in Next.js App Router, TypeScript and Mongoose.

| Activity | Estimate |
|---|---|
| Clone (120 MB), install, read `README.md` + `docs/AI_CONTEXT.md` + `docs/DECISIONS.md` | 1.5 h |
| Reconstruct the environment-variable list by grep, then obtain values from the founder | 1 h, plus **blocked** waiting on account access |
| Provision or be granted access to Atlas, Stripe test mode, Cloudinary, Resend, Gemini | 2–4 h, largely not in their control |
| Get `npm run dev` rendering a working page with real data | 1 h |
| Read `docs/STYLE_GUIDE.md`, `ARCHITECTURE.md`, `DATABASE.md`, `API.md` | 1.5 h |
| Trace one end-to-end flow in code (checkout → Stripe → webhook → order → email) | 2 h |

**Realistic time to first safe commit: one full day if credentials are ready and the founder is available; two to three days if either is not.** The bottleneck is not code comprehension — the domain grouping and `docs/STYLE_GUIDE.md` make the code unusually readable for a solo project. The bottleneck is environment provisioning, and the fact that nothing tells them when their environment is finally correct.

Three changes would cut that materially: an `.env.example` listing all fifteen variables with comments; the boot-time validator from §6.2; and a ten-line "Local setup" section in the README. Perhaps two hours of work to remove most of a day from every future onboarding.

---

## Trade-offs recorded

**No code review and direct commits to `main` on a payments system is the weakest part of this engineering practice, and the usual solo-developer defence does not answer it.** The defence is "who would review it?" — and as an argument about *human* review it is correct: there is no second engineer, and inventing a self-approved pull request would be ceremony that catches nothing. But human review is not the only reviewer available. **CI is a reviewer that never gets tired.** It does not get bored on the eighth consecutive shipping day, it does not skip the check because the change looked small, and it does not forget on the evening a payout bug is being chased. This repository already contains the two commands a reviewer would run — `tsc --noEmit` and `eslint` — and `docs/CHANGELOG.md` shows them being run manually and conscientiously on 2026-08-13 and 2026-08-14. Manual conscientiousness is exactly what a pipeline is for: a twenty-line GitHub Actions workflow running install, type check, lint and build on every push, with branch protection requiring it to pass, would convert a good habit into a guarantee at a cost of roughly one hour. Until that exists, the honest description of the deployment gate on a system that moves real money between buyers, sellers and the platform is: there is not one.

**Domain grouping over layer grouping was the right call at this size, and it is the choice that will be tested first if the team grows.** Grouping by feature keeps a change local: the dispute-resolution work in the baseline commit touched four locations, all named after the thing being changed, and none of them a shared `controllers/` file that every other feature also edits. For one developer holding the whole system in their head, that locality is worth more than layer purity. The cost is that no boundary is enforced — a page component can import a Mongoose model, and several deliberately do. With one developer that discipline holds because there is one memory to hold it in. With three, the first thing to erode will be the implicit rule that persistence stays behind `models/` and `lib/`. The mitigation is not restructuring but enforcement: an ESLint `no-restricted-imports` rule forbidding `@/models/*` from `src/components/**` would encode the boundary in tooling before it is needed, at a cost measured in minutes. `11-EVOLUTION` §2 treats the fuller version of this question.

**Markdown documents beat an issue tracker for a solo developer, and that advantage inverts the moment a second person arrives.** `docs/TODO.md`, `CHANGELOG.md` and `DECISIONS.md` do something GitHub Issues does badly: they hold the paragraph of reasoning that explains why a decision is not the obvious one. The note that Gemini prompt values must stay English while their labels are translated is the kind of fact that prevents a future well-intentioned regression, and it survives in prose because prose had room for it. But the same files have no assignee, no state machine, no query, and no link to the commits that satisfied them, so nothing traces a requirement to the code that met it in either direction. The stale artefact makes this concrete: four GitHub issues frozen at 2026-01-03 while the real backlog moved daily in a file that only someone who opens `docs/` will find. The correct resolution is not to abandon the documents, which are the better record, but to add the thin layer they lack — tagged releases, commit references in CHANGELOG entries, and a README pointer telling a newcomer that `docs/` is the real project record.

**Configuration correctness was left to runtime, and that is the cheapest unfixed risk in the codebase.** Fifteen environment variables gate the database, payments, authentication, AI, image hosting and email. Exactly one of them — `MONGODB_URI` — has a guard, and even that fires on first database use rather than at startup. Everything else is a bare `!` non-null assertion, which tells the compiler to stop asking a question it cannot answer. In development this is invisible: `.env.local` is either complete or the failure is immediate and local. In production it means a mistyped Vercel variable produces a green deployment, a healthy-looking site, and then a 500 on the first request that reaches the affected path — possibly a checkout, possibly weeks later. `STRIPE_WEBHOOK_SECRET` has one reference in 24,586 lines; if it were wrong, the first symptom would be orders quietly not being recorded. The fix is one file, about fifty lines, no new dependency, and roughly an hour: read all fifteen at boot, fail loudly with every missing name listed, export them typed. It is listed as **Fix now** in §8 because it is the item with the largest ratio of risk removed to effort spent anywhere in this document.
