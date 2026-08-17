# GoWithPorto

AI trip planning and a local marketplace for Porto, Portugal. Visitors generate an
itinerary shaped by their dates, budget, group and interests, and buy goods from
small Porto producers who are paid only once the buyer confirms they received them.

**Production:** [www.gowithporto.pt](https://www.gowithporto.pt)
**Status:** feature-complete, pre-launch. See [`docs/00-INDEX.md`](docs/00-INDEX.md) §Status summary for an honest per-stage assessment.
**Team:** one engineer.

---

## Documentation

**The engineering record lives in [`docs/`](docs/), and it is the source of truth.**
The [GitHub Wiki](https://github.com/gowithporto/gowithporto/wiki) is a historical
snapshot from January 2026 and is superseded — where the two disagree, `docs/` is
correct.

Start at **[`docs/00-INDEX.md`](docs/00-INDEX.md)**: it maps all 21 lifecycle stages
to the document covering them, with a status for each, and offers reading paths for
different audiences.

| | |
|---|---|
| [`01-PRODUCT`](docs/01-PRODUCT.md) | Problem, personas, 41 functional and 12 non-functional requirements, business rules, risk register, launch gate |
| [`02-UX`](docs/02-UX.md) | Journeys, information architecture, localisation, accessibility |
| [`03-ARCHITECTURE`](docs/03-ARCHITECTURE.md) | Technical analysis, architecture, capacity and cost models |
| [`04-DOMAIN`](docs/04-DOMAIN.md) | The fulfilment state machine, money settlement, dispute resolution |
| [`05-DATA`](docs/05-DATA.md) | Schema, indexes, consistency, backup, retention |
| [`06-API`](docs/06-API.md) | All 54 route handlers, contracts, idempotency |
| [`07-SECURITY`](docs/07-SECURITY.md) | Threat model, OWASP mapping, open findings |
| [`08-ENGINEERING`](docs/08-ENGINEERING.md) | Standards, patterns, version control, technical debt |
| [`09-QUALITY`](docs/09-QUALITY.md) | Test strategy and CI specification |
| [`10-OPERATIONS`](docs/10-OPERATIONS.md) | Infrastructure, deployment, monitoring, incident runbooks |
| [`11-EVOLUTION`](docs/11-EVOLUTION.md) | Maintenance, scaling triggers, roadmap, retirement |
| [`12-GOVERNANCE`](docs/12-GOVERNANCE.md) | EU regulatory obligations, licensing, risk |
| [`DECISIONS`](docs/DECISIONS.md) | Architecture decision records, append-only |
| [`CHANGELOG`](docs/CHANGELOG.md) · [`TODO`](docs/TODO.md) | History and live backlog |

---

## Architecture in one paragraph

A single Next.js 16 application — App Router, TypeScript, server components with
client islands — deployed as serverless functions on Vercel. The route handlers
*are* the backend; there is no separate service. MongoDB Atlas via Mongoose for
persistence, Stripe Checkout and Connect Express for money, Google Gemini for
itinerary generation behind a provider interface, Cloudinary for media, Resend for
transactional email, NextAuth for identity. Four locales at prefixed URLs.
Reasoning for each choice is in [`03-ARCHITECTURE`](docs/03-ARCHITECTURE.md) §1.5
and [`DECISIONS.md`](docs/DECISIONS.md).

### The part worth reading

Money does not split at checkout. The full charge lands on the platform balance
with `transfer_group = orderId`; the seller's share transfers only when a handover
is confirmed — the buyer presents a per-item QR token, the handler enters the
store's PIN, and neither party can complete it alone. A buyer can instead report an
issue, freezing settlement for that item until the operator resolves it as seller
fault, buyer fault, or a percentage split. Settlement is per item, so one order can
have one item paid out, one disputed and one still pending.
[`04-DOMAIN`](docs/04-DOMAIN.md) §3–5.

---

## Running locally

```bash
npm install
cp .env.local.example .env.local   # then fill in — see docs/08-ENGINEERING.md §6
npm run dev
```

> **Point `MONGODB_URI` at a development cluster, not production.** This is
> currently not the case in the founder's environment and is a P0 item in
> [`TODO.md`](docs/TODO.md).

| Script | |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Type check — run before every push; there is no CI gate yet |

### Maintenance scripts

Plain Node, outside the Next.js build. Run with
`node --env-file=.env.local scripts/<file>.js`.

- `create-admin.js <email> <password>` — create or promote a user to `ADMIN`
- `translate-content.js` — backfill fr/es/pt translations via Gemini. Idempotent; skips already-translated documents. The Gemini free tier caps at 20 requests/day, so a large backfill may span several days
- `apply-manual-translations.js` — apply hand-written translations from `scripts/data/` directly, bypassing Gemini

---

## Known gaps

Stated here rather than discovered later. Full detail in the linked documents.

- **No automated tests and no CI.** `main` deploys to production with no gate. [`09-QUALITY`](docs/09-QUALITY.md)
- **No monitoring or alerting.** A production failure is detected when a user complains. [`10-OPERATIONS`](docs/10-OPERATIONS.md) §4
- **No database backups.** Atlas M0 offers no point-in-time recovery. [`05-DATA`](docs/05-DATA.md) §7
- **Open security findings, one critical.** [`07-SECURITY`](docs/07-SECURITY.md) §1
- **EU regulatory obligations identified but unmet** — GDPR, consumer withdrawal rights, P2B terms, DAC7 seller data. [`12-GOVERNANCE`](docs/12-GOVERNANCE.md) §2
- **No accessibility audit.** [`02-UX`](docs/02-UX.md) §7

None of these blocks the software from running. All of them block taking money from
a member of the public — see the launch gate in
[`01-PRODUCT`](docs/01-PRODUCT.md) §9.3.

---

## Licence

Not yet stated. Until a `LICENSE` file exists, all rights are reserved by default.
