# GoWithPorto — Engineering Documentation

**Project:** GoWithPorto — AI trip planning + local marketplace for Porto, Portugal
**Repository:** `github.com/gowithporto/gowithporto`
**Production:** `https://www.gowithporto.pt`
**Team:** one engineer (Al Mahmud), solo founder
**Documentation baseline:** commit `3eb178a`, 2026-08-16

---

> ### Critical finding — RESOLVED
>
> This audit identified one issue that needed fixing before anything else in this
> documentation was acted on. `GET /api/dev/seed/products` was live in production
> with no authentication and no environment guard, and called
> `Product.deleteMany({})` — a single unauthenticated HTTP request could destroy
> the entire product catalogue, with no restore path because Atlas M0 has no
> continuous backup. Because it was a `GET`, it could have been triggered by a
> crawler or a link-preview bot without any attacker involved.
>
> **Fixed 2026-08-17: `src/app/api/dev/seed/` and its `seedProducts()` helper were
> deleted.** Full analysis in [`07-SECURITY`](07-SECURITY.md) §1, SEC-1.

---

## How to read this documentation

This is the engineering record for a production system built and operated by one
person. It is organised against a 22-point software lifecycle (stages 0–21 plus
engineering judgement). Related stages are merged where a separate document would
have been padding; §[Traceability](#sdlc-traceability-matrix) maps every stage to
the document that covers it.

Two conventions matter when reading:

**1. This documentation describes what exists, not what was planned.** Where the
built system diverges from an earlier intention, the divergence is documented and
the reason recorded, rather than the document being quietly aligned to the plan.
The [GitHub Wiki](https://github.com/gowithporto/gowithporto/wiki) — last edited
2026-01-03 — is superseded by this set and is retained only as a historical
snapshot of the original design; §[Known divergences](#known-divergences-from-earlier-design)
lists what it now gets wrong.

**2. Gaps are stated, not hidden.** Every stage carries a status. Where a stage is
unimplemented, the document says so and says why. Where a stage is deliberately out
of scope for a single-operator system at this scale, the reasoning is recorded so a
future reader can judge whether the trade-off still holds.

Status vocabulary, used consistently throughout:

| Marker | Meaning |
|---|---|
| **DONE** | Implemented and verified against the codebase at the baseline commit |
| **PARTIAL** | Implemented, with named limitations recorded in the owning document |
| **SPEC** | Specified here in enough detail to build; not yet implemented |
| **OUT OF SCOPE** | Deliberately excluded, with the reason and the condition that would reverse the decision |

---

## Document set

| Doc | Covers | Update when |
|---|---|---|
| [`00-INDEX.md`](00-INDEX.md) | This file — map, matrix, conventions | Any document is added, renamed, or its status changes |
| [`01-PRODUCT.md`](01-PRODUCT.md) | Problem, goals, stakeholders, personas, metrics, requirements, user stories, business rules, risk register, MVP scope | Scope changes or a requirement is added/dropped |
| [`02-UX.md`](02-UX.md) | Journeys, flows, information architecture, accessibility, responsive behaviour, empty/loading/error states | A user-facing flow changes shape |
| [`03-ARCHITECTURE.md`](03-ARCHITECTURE.md) | Technical analysis, architecture style, components, data flow, deployment topology, scalability, availability | The architecture itself changes — not for feature work |
| [`04-DOMAIN.md`](04-DOMAIN.md) | Domain model, entities, aggregates, business rules, state machines, workflows, boundaries | An entity, a state, or a money rule changes |
| [`05-DATA.md`](05-DATA.md) | Schema, indexes, consistency, transactions, caching, migrations, backup, recovery, retention | A schema or a data-lifecycle policy changes |
| [`06-API.md`](06-API.md) | Endpoint reference, contracts, validation, error handling, authn/authz, rate limiting, idempotency, webhooks | An endpoint is added, removed, or its contract changes |
| [`07-SECURITY.md`](07-SECURITY.md) | Threat model, authorisation matrix, secrets, encryption, OWASP mapping, dependency security, privacy | A trust boundary moves or a new threat is identified |
| [`08-ENGINEERING.md`](08-ENGINEERING.md) | Repository structure, coding standards, patterns, logging, configuration, dependencies, version control, release process, technical debt | A standard or a workflow changes |
| [`09-QUALITY.md`](09-QUALITY.md) | Test strategy, test inventory, quality gates, CI pipeline specification | A gate is added or the test strategy shifts |
| [`10-OPERATIONS.md`](10-OPERATIONS.md) | Infrastructure, environments, deployment, rollback, monitoring, alerting, SLOs, incident runbook | Infrastructure, an alert, or a runbook step changes |
| [`11-EVOLUTION.md`](11-EVOLUTION.md) | Maintenance policy, dependency policy, roadmap, scaling triggers, backward compatibility, retirement | The roadmap or a scaling threshold changes |
| [`12-GOVERNANCE.md`](12-GOVERNANCE.md) | Standards, EU regulatory obligations, licensing, audit, risk management, decision process | A regulatory obligation or policy changes |
| [`DECISIONS.md`](DECISIONS.md) | Architecture decision records — the *why*, with alternatives considered | A non-obvious decision is made. Append-only |
| [`CHANGELOG.md`](CHANGELOG.md) | Dated record of every substantive change | Every working session |
| [`TODO.md`](TODO.md) | Live backlog, priority-ordered | A task completes or is identified |
| [`STYLE_GUIDE.md`](STYLE_GUIDE.md) | Visual/UI conventions | A design token or convention changes |
| [`AI_CONTEXT.md`](AI_CONTEXT.md) | Working context for AI-assisted development sessions | The working method changes |

---

## SDLC traceability matrix

Every stage of the lifecycle, where it is documented, and its honest status.

### Phase A — Problem and requirements

| # | Stage | Documented in | Status | Note |
|---|---|---|---|---|
| 0 | Idea / problem | `01-PRODUCT` §1–2 | DONE | Problem, business goals, stakeholders, personas, success metrics, constraints, feasibility, build-vs-buy |
| 1 | Discovery / requirements | `01-PRODUCT` §3–9 | DONE | 41 functional requirements, 12 non-functional, user stories with acceptance criteria, business rules, assumptions, dependency and risk registers, MVP boundary |

### Phase B — Design

| # | Stage | Documented in | Status | Note |
|---|---|---|---|---|
| 2 | Product / UX | `02-UX` | PARTIAL | Flows, IA, states and responsive behaviour documented and built. **Gap:** no accessibility audit has been run, and no UX validation with real users — comps were designed, not tested |
| 3 | Technical analysis | `03-ARCHITECTURE` §1 | DONE | Feasibility, constraints, capacity model, performance targets, cost model, technology evaluation |
| 4 | System architecture | `03-ARCHITECTURE` §2–7, `DECISIONS` | DONE | Modular monolith; 12 ADRs recorded with alternatives considered |
| 5 | Domain / business logic | `04-DOMAIN` | DONE | 12 entities, 2 aggregates, the fulfilment state machine (7 states), the money-settlement workflow, the dispute workflow |

### Phase C — Build

| # | Stage | Documented in | Status | Note |
|---|---|---|---|---|
| 6 | Data engineering | `05-DATA` | PARTIAL | Schema, relationships, indexes, consistency model documented. **Gaps:** Atlas M0 has no continuous backup (point-in-time recovery impossible today); no data retention policy; migrations are ad-hoc scripts with no versioning |
| 7 | API / communication | `06-API` | PARTIAL | 54 route handlers (53 application endpoints plus the NextAuth catch-all) documented with contracts, auth, error semantics, idempotency strategy. **Gaps:** validation is hand-rolled per route rather than schema-driven; no API versioning (deliberate — see doc); rate limiting covers auth and fulfilment only |
| 8 | Security | `07-SECURITY` | PARTIAL | Trust boundaries, STRIDE analysis, authorisation matrix and OWASP Top 10 mapping documented; authentication, authorisation and money-path integrity are sound. The CRITICAL finding (unauthenticated catalogue-wipe endpoint) is resolved — see the callout at the top of this file and `07-SECURITY` §1. **Four open findings remain**: no dependency scanning, no security headers, no MFA on the operator account, and no security event logging |
| 9 | Implementation | `08-ENGINEERING` §1–7 | DONE | Repository structure, standards, patterns in use, error handling, configuration, dependency management, technical-debt register |
| 10 | Version control / team | `08-ENGINEERING` §9–10 | PARTIAL | 77 commits over seven months, with recent commit bodies of high quality. **Gaps:** the Conventional Commits convention is intended but unenforced — 41 of 77 subjects carry no prefix; release tagging started well and lapsed at `v0.5.0`, leaving the entire August programme untagged; no branching model, no pull requests, no review; the four GitHub issues date from 2026-01-03 and no longer reflect the backlog, which lives in `TODO.md` |
| 11 | Testing / quality | `09-QUALITY` | SPEC | **Nothing is implemented.** No test runner, no test files. The document specifies the 19 tests that must exist before launch and the reasoning for that scope |
| 12 | Build / CI | `09-QUALITY` §5–6 | SPEC | **No CI exists.** No `.github/workflows`. `main` deploys to production with no automated gate. The document specifies the pipeline |

### Phase D — Run

| # | Stage | Documented in | Status | Note |
|---|---|---|---|---|
| 13 | Infrastructure | `10-OPERATIONS` §1–2 | DONE | Fully managed PaaS (Vercel, Atlas, Cloudflare, Cloudinary, Stripe, Resend). Containers, orchestration and IaC are **OUT OF SCOPE** with reasoning |
| 14 | Deployment / release | `10-OPERATIONS` §1–3 | PARTIAL | Production live on a custom domain, automated from `main`, with Vercel instant rollback available. **Gaps:** no staging environment; rollback has never been rehearsed; no feature-flag mechanism |
| 15 | Operations | `10-OPERATIONS` §4–7 | SPEC | **Nothing is implemented.** No error tracking, no alerting, no uptime monitoring, no SLOs measured. Detection today is "a user complains." The document specifies the minimum viable setup |
| 16 | Incidents | `10-OPERATIONS` §6 | SPEC | Runbook written for the five most likely failures; never exercised |

### Phase E — Sustain

| # | Stage | Documented in | Status | Note |
|---|---|---|---|---|
| 17 | Maintenance | `11-EVOLUTION` §1–3 | PARTIAL | Bug-fix and refactoring practice is active and logged in `CHANGELOG`. **Gap:** no dependency-update policy and no automated security patching |
| 18 | Evolution | `11-EVOLUTION` §4–7 | DONE | Roadmap, scaling triggers, planned architecture changes, backward-compatibility policy |
| 19 | Governance | `12-GOVERNANCE` | PARTIAL | Standards, licensing, audit trail and risk management documented. **Gap — the largest open risk in the project:** EU regulatory obligations (GDPR, ePrivacy, consumer withdrawal rights, VAT/IVA, DAC7 platform reporting) are identified and scoped here but **not yet satisfied** |
| 20 | Documentation | This set | DONE | 13 lifecycle documents plus ADRs, changelog and backlog |
| 21 | Retirement | `11-EVOLUTION` §8 | SPEC | Deprecation, data-migration and shutdown policy defined. Correctly unexercised |

### Cross-cutting

| Topic | Documented in | Status |
|---|---|---|
| Engineering judgement — trade-offs, cost vs value, complexity vs simplicity, build vs buy, short vs long term, risk vs reward | `DECISIONS.md` (12 ADRs) plus a *Trade-offs* section in every document | DONE |

---

## Status summary

| Status | Stages | Count |
|---|---|---|
| DONE | 0, 1, 3, 4, 5, 9, 13, 18, 20 | 9 |
| PARTIAL | 2, 6, 7, 8, 10, 14, 17, 19 | 8 |
| SPEC (documented, not built) | 11, 12, 15, 16, 21 | 5 |

The five SPEC stages are not an accident of neglect: 11, 12, 15 and 16 form a
single cluster — **automated quality gates and operational visibility** — which is
the deliberate next block of work, and the one thing that must close before the
platform accepts money from a member of the public who is not a test user.
Stage 21 is correctly unbuilt.

---

## Known divergences from earlier design

Recorded because a reviewer comparing this documentation against the repository's
history or its GitHub Wiki will otherwise find contradictions and reasonably
wonder which is true. **This set is true; the items below are superseded.**

| Earlier design said | Reality at baseline | Why it changed |
|---|---|---|
| Separate Node.js/Express backend service (`backend/`, own `Dockerfile`) | Single Next.js application; route handlers are the backend. `backend/` contains only two zero-byte placeholder files and is dead | A separate service bought deployment complexity and a network hop for no benefit at this scale. See `DECISIONS` and `03-ARCHITECTURE` §2 |
| AI provider "ChatGPT / Gemini" | Google Gemini only, pinned to `gemini-3.7-flash`, behind a provider interface that keeps the swap cheap | Cost and a single vendor relationship. The abstraction (`services/ai/aiProvider.ts`) preserves the option |
| Money splits at checkout via Stripe `application_fee_amount` + `transfer_data.destination` | Full charge lands on the platform balance; the seller's share transfers **only after the buyer confirms delivery or pickup**, keyed by `transfer_group = orderId` | Atomic checkout-time splitting paid sellers before the buyer had received anything, leaving no funds under platform control to refund a legitimate complaint. Replaced 2026-08-16 with delayed, confirmation-gated settlement plus a dispute-resolution path. **`docs/ARCHITECTURE.md` as it stood before this documentation set still described the old model** — a two-day documentation drift on the most financially sensitive logic in the system, and the direct reason this set exists |
| Five locales including German | Four: `en`, `fr`, `es`, `pt` | German had no demand signal; carrying an unused dictionary is maintenance cost |
| GitHub issues #1–#4 track feature delivery | All four are open, dated 2026-01-03, and all four features shipped months ago | Issue tracking was abandoned in favour of `TODO.md`. See `08-ENGINEERING` §10 for the decision and its cost |

---

## Reading paths

**Hiring engineer, 15 minutes:** this file → `DECISIONS.md` → `04-DOMAIN` §3–5
(the fulfilment state machine and money settlement — the part of the system with
real design content) → `09-QUALITY` and `10-OPERATIONS` (the honest gaps).

**Academic reviewer:** this file → `01-PRODUCT` → `03-ARCHITECTURE` →
`04-DOMAIN` → `07-SECURITY` → `12-GOVERNANCE`.

**A future engineer joining the project:** `AI_CONTEXT.md` → `08-ENGINEERING` →
`03-ARCHITECTURE` → `05-DATA` → `06-API` → `TODO.md`.

**Someone auditing whether this is safe to launch:** `07-SECURITY` →
`12-GOVERNANCE` §2 (EU obligations) → `09-QUALITY` → `10-OPERATIONS` →
`11-EVOLUTION` §4 (the launch gate).
