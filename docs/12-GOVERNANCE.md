# 12 — Governance, Compliance and Risk

> **SDLC stage:** 19. Governance
> **Status:** PARTIAL — standards, licensing and risk process are defined; **EU regulatory obligations are identified but not satisfied, and this is the largest open risk in the project**
> **Baseline:** commit `3eb178a`, 2026-08-16
> **Update when:** a regulatory obligation or a policy changes.

> ### Important qualification
>
> **This document is not legal or tax advice, and its author is not a lawyer or an
> accountant.** It is an engineer's inventory of obligations that appear to apply,
> written so that a qualified Portuguese adviser can be briefed efficiently rather
> than starting from nothing. Every item in §2 should be confirmed with a
> *solicitador* or *advogado* and a *contabilista certificado* before the platform
> accepts money from a member of the public. Where a figure or a threshold is
> given, it is cited; thresholds change, and the citation is there so the reader
> can check whether it still holds.

---

## 1. Governance model

One person holds every role. There is no board, no architecture review body, no
change advisory board, and creating any of them would be theatre.

What replaces them is a **written record with a rule about when it must be
written**, so that a decision made alone is still a decision that can be
challenged later — by a collaborator, by a supervisor, or by the same person in
six months who no longer remembers the reasoning.

| Function | Mechanism | Trigger to record |
|---|---|---|
| Architecture decisions | `DECISIONS.md` — append-only ADRs with alternatives considered | Any decision where a competent engineer might reasonably have chosen otherwise |
| Change history | `CHANGELOG.md` — dated, with symptom, root cause and fix | Every working session |
| Priorities | `TODO.md` — priority-ordered, deferrals annotated with a reason | A task completes or is identified |
| Standards | `08-ENGINEERING`, `STYLE_GUIDE.md` | A convention is established or changed |
| Risk | `01-PRODUCT` §8.6 risk register; this document §5 | A new risk is identified or a score changes |
| Regulatory | This document §2 | An obligation is identified, satisfied, or changes |

### 1.1 Honest assessment of this model

It works well for what it is designed to do — capture reasoning — and it has one
structural weakness that a real governance body would not have: **nothing forces
the record to be made.** The decision to write an ADR is taken by the same person
who would have to write it, at the end of a working day. The evidence that this
matters is already in the project: `DECISIONS.md` has no entry after 2026-08-03,
while decision-grade reasoning for the `translations` overlay, the Gemini model
pin, and keeping `<select>` values in English all ended up in `CHANGELOG.md`
instead. The rationale record stopped being the place to look for rationale.

The remedy is the same as everywhere else in this project: make the correct
behaviour the default rather than an act of discipline. A pull-request template
with an "Is this an ADR?" checkbox costs nothing and asks the question at the
moment it can still be answered cheaply (`09-QUALITY` §5.4).

---

## 2. EU and Portuguese regulatory obligations

The platform is established in Portugal, sells to consumers across the EU,
processes personal data, facilitates payments to third-party sellers, and sends
user input to a third-country AI provider. Each of those facts attracts
obligations.

**None of the items below is currently satisfied.** The table in §2.8 summarises
status; the sections explain why each applies.

### 2.1 GDPR — Regulation (EU) 2016/679

The platform is a **data controller** for buyers, store owners and contact-form
correspondents.

| Obligation | Article | Status | What is needed |
|---|---|---|---|
| Lawful basis for each processing purpose | Art. 6 | **Not documented** | Contract for orders and accounts; legitimate interest for abuse prevention; consent for anything marketing-related |
| Transparent information to data subjects | Arts. 12–14 | **Weak** | A privacy page exists but has never been reviewed against actual processing. It does not disclose the Gemini transfer (§2.2) |
| Right of access | Art. 15 | **Absent** | No export mechanism. A request today would be fulfilled by hand from the database |
| Right to erasure | Art. 17 | **Absent** | No deletion path exists for any collection (`05-DATA` §10). Complicated by orders that must be retained for tax purposes — erasure and retention obligations conflict and the resolution must be written down |
| Data portability | Art. 20 | **Absent** | |
| Storage limitation | Art. 5(1)(e) | **Absent** | No retention period is defined for any personal data |
| Record of processing activities | Art. 30 | **Absent** | A micro-enterprise exemption exists but is narrow and unlikely to apply where processing is regular and includes payment data |
| Processor agreements | Art. 28 | **Absent** | Required with Stripe, Atlas, Vercel, Cloudinary, Resend and Google. Each publishes a standard DPA; none has been accepted or filed |
| Third-country transfer safeguards | Ch. V | **Not assessed** | Vercel and Google are US-headquartered |
| Breach notification within 72 hours | Arts. 33–34 | **Impossible today** | With no monitoring (`10-OPERATIONS` §4), a breach would not be detected, let alone notified inside 72 hours. This is a compliance consequence of an engineering gap |
| Data protection by design | Art. 25 | Partial | Minimal data is collected and no card data is stored, which is real. It was an engineering instinct rather than a documented assessment |

The supervisory authority is the **CNPD** (Comissão Nacional de Proteção de
Dados).

### 2.2 The AI transfer — the most exposed single item

When a user generates an itinerary, their travel dates, group composition, budget
band and stated interests are transmitted to Google's Gemini API. That is personal
data — it relates to an identified user and describes their movements and
circumstances — sent to a third-party processor, potentially outside the EEA.

**Nothing in the interface, the privacy page, or the planner form tells the user
this happens.**

What is needed: a disclosure at the point of collection, a lawful basis, the
processor relationship documented, the transfer mechanism assessed, and a
retention period for `AIResponse.prompt` (which currently grows without bound and
is never deleted).

This is the item most likely to be noticed by a reviewer, because it is visible
from the product itself rather than requiring an audit.

### 2.3 ePrivacy and cookie consent

Directive 2002/58/EC, transposed in Portugal by Lei 41/2004. Consent is required
before storing or accessing information on a user's device, except where strictly
necessary for a service the user requested.

| Item | Assessment |
|---|---|
| NextAuth session cookie | Arguably strictly necessary — the user asked to be signed in |
| Cart state | Client-side; needs review as to storage mechanism |
| Analytics, when added (`10-OPERATIONS` M-7) | **Requires consent unless a genuinely cookieless, non-identifying tool is used.** Choosing such a tool at the outset avoids a consent banner entirely, and is the reason Plausible is proposed rather than a cookie-based alternative |

No consent mechanism exists. The current position may be defensible while there
is no analytics and no marketing tag, and it must be reassessed the moment either
is added.

### 2.4 Consumer protection — distance selling

Directive 2011/83/EU, transposed in Portugal by Decreto-Lei 24/2014.

| Obligation | Status | Note |
|---|---|---|
| Pre-contractual information before the buyer is bound | **Partial** | Price, delivery type and fee are shown. Trader identity, complaint handling, and the withdrawal right are not presented as required |
| **14-day right of withdrawal** | **Not implemented** | No notice, no model withdrawal form, no process. The `legal-refund` route (`04-DOMAIN` §5.4) is the *mechanism* to honour one; the legal wrapper around it does not exist |
| Exceptions to withdrawal | **Not assessed** | Perishable goods and personalised items are exempt. Some of this catalogue — food products, made-to-order items — may qualify. This needs a per-category determination, not a blanket policy |
| Confirmation of contract on a durable medium | Satisfied in substance | The order-confirmation email serves; its content has not been checked against the required particulars |
| Statutory conformity guarantee | **Not stated anywhere** | Directive (EU) 2019/771; **Portugal's transposition (DL 84/2021) provides a longer period than the EU minimum for movable goods — confirm the current period and who bears it, platform or seller** |
| Who owes these duties — platform or seller? | **Unresolved, and it is the central question** | The platform takes payment, sets terms and holds funds in escrow. Whether it is an intermediary or a co-trader determines who the buyer's counterparty is. This must be settled before launch and reflected in the terms |

That last row is the most consequential legal question in the project, and it is
an engineering question too: the answer determines whose name goes on the order
confirmation, who the refund obligation falls to, and whether the escrow design
helps or hinders.

### 2.5 DAC7 — platform tax reporting

Council Directive (EU) 2021/514. The platform facilitates the sale of goods by
third-party sellers and is established in Portugal, which places it squarely in
scope as a Reporting Platform Operator.

| Element | Requirement |
|---|---|
| Excluded sellers | A seller of goods with **fewer than 30 transactions and under €2,000 in total consideration** in the calendar year is excluded from reporting |
| Data to collect | Seller name, address, **tax identification number (NIF)**, VAT number where applicable, business registration number, the financial account identifier used for payment, and consideration and fees per quarter |
| Reporting deadline | **31 January** following the calendar year |
| Where | The Portuguese tax authority (AT) |

**The engineering consequence is concrete and is not currently met.** The `Store`
model holds `name`, `slug`, `location`, `storeCode`, a password hash, a Stripe
account ID and a commission rate. It holds **no NIF, no legal entity name, no
registered address and no business registration number.** None of the identifying
data DAC7 requires is collected at onboarding.

This is the clearest example in the whole project of a legal obligation with a
direct schema implication. Adding the fields later means going back to every store
owner to collect data they were never asked for — and DAC7 requires reasonable
steps to obtain it, including account closure for persistent non-response.
Collecting it at onboarding costs one form; collecting it retrospectively costs a
relationship.

The excluded-seller threshold means that at the platform's planned scale most
sellers will fall below it in year one. That reduces the reporting burden. It does
**not** remove the obligation to collect and verify the data, because the platform
cannot know which sellers will cross the threshold until the year has ended.

### 2.6 VAT / IVA

Two distinct questions, and the second is the one most likely to be missed.

**The platform's own supplies.** Commission charged to store owners is a supply of
services. Portugal's Article 53 exemption applies below **€15,000** in annual
national turnover, with immediate registration required if turnover exceeds
**€18,750** — a hard ceiling that ends the exemption within 15 working days of the
transaction that breaches it. At planned scale (~€300 commission in year one) the
platform sits far below both. It must still be registered for activity with the AT
and must issue compliant invoices.

**AI credits sold to consumers — the non-obvious exposure.** Credits are an
electronically supplied service sold B2C. Cross-border B2C digital supplies within
the EU are taxed in the customer's member state once the EU-wide threshold
(€10,000) is exceeded, which is what the One-Stop Shop exists to simplify. The
platform sells credits to visitors from across the EU. Volumes are currently
nowhere near the threshold, but **this is a different tax treatment from the
marketplace commission, and nothing in the system distinguishes them.** A
Portuguese accountant should confirm the position now, while it is cheap, rather
than after the threshold is crossed.

**Marketplace deemed-supplier rules** (which make a platform liable for the VAT on
underlying goods sales) apply principally to imports of consignments up to €150 and
to sales facilitated for non-EU-established sellers. If every seller is
Portuguese-established, these should not bite — but "should not" is an
engineer's assessment and needs an accountant's confirmation.

### 2.7 Other instruments in scope

| Instrument | Applies because | Assessment |
|---|---|---|
| **P2B Regulation (EU) 2019/1150** | The platform provides online intermediation services to business users (store owners) | Requires plain-language terms and conditions, notice periods for changes, transparency about ranking parameters, and an internal complaint-handling system. **No store-owner terms exist at all.** Likely the second-most-urgent item after GDPR |
| **Digital Services Act (EU) 2022/2065** | The platform is an online platform allowing consumers to conclude distance contracts with traders | Micro and small enterprises are exempted from several obligation sets, including trader traceability. That exemption is very likely to apply here, and **relying on an exemption without confirming it is not a compliance position.** Confirm and record |
| **European Accessibility Act — Directive (EU) 2019/882** | E-commerce services fall in scope from 2025 | Microenterprises providing services are exempted. The exemption very likely applies, and it does not make the accessibility gap in `02-UX` §7 acceptable — a buyer who cannot present a QR code cannot receive goods they paid for, which is a product failure regardless of whether it is a legal one |
| **Payment services regulation** | The platform routes third-party funds | **Avoided by design.** Stripe Connect means the platform never holds funds outside Stripe's regulated rails and never touches a seller's bank details. This was the explicit reason for choosing Connect over any custom payout mechanism (ADR 2026-08-03), and it is the single best compliance decision in the project |

### 2.8 Status summary

| Obligation | Applies | Satisfied | Urgency |
|---|---|---|---|
| GDPR — lawful basis, notices, subject rights, retention | Yes | **No** | **Before launch** |
| GDPR — processor agreements | Yes | **No** | **Before launch** |
| AI transfer disclosure | Yes | **No** | **Before launch** |
| Consumer withdrawal rights and pre-contractual information | Yes | **No** | **Before launch** |
| Platform vs seller — who is the buyer's counterparty | Yes | **Unresolved** | **Before launch** |
| P2B — store-owner terms and complaint handling | Yes | **No** | **Before launch** |
| DAC7 — collect seller NIF and identifying data | Yes | **No — schema change required** | **Before onboarding the next store** |
| DAC7 — annual report | Yes | Not yet due | By 31 January following the first reporting year |
| VAT — platform registration and invoicing | Yes | **Unconfirmed** | Before revenue |
| VAT — treatment of AI credits | Yes | **Unconfirmed** | Before meaningful volume |
| ePrivacy — cookie consent | Conditionally | N/A today | Before adding analytics |
| DSA — micro-enterprise exemption | Yes | **Unconfirmed** | Confirm and record |
| Accessibility Act — micro-enterprise exemption | Yes | **Unconfirmed** | Confirm and record |
| Payment services authorisation | **No** | Avoided by design | — |

---

## 3. Licensing

### 3.1 The project's own licence — a gap

**The repository is public and contains no `LICENSE` file.** `package.json`
declares `"private": true` and no `license` field.

Under copyright law the default for a work published without a licence is that all
rights are reserved: nobody may copy, modify or reuse it. That is a coherent
position for a commercial product, and it is almost certainly the intended one.
But it is being communicated by silence rather than by statement, and silence is
ambiguous to a reader — a public repository with no licence reads to many
engineers as an oversight rather than a decision.

Two coherent options, and the project should pick one deliberately:

- **Keep all rights reserved**, and say so in a short `LICENSE` file and a README
  line. Costs five minutes and removes the ambiguity.
- **Make the repository private** and publish only the documentation, if the
  intent is a portfolio artefact rather than an open codebase.

The current state — public source, no licence, no statement — is the only option
that communicates nothing.

### 3.2 Dependency licences

19 production and 9 development dependencies, predominantly MIT with some
Apache-2.0 and ISC. All are permissive and compatible with commercial use. No
copyleft licence (GPL, AGPL) appears in the direct dependency set.

**No automated licence scanning is in place.** A transitive AGPL dependency would
not be detected. Adding `license-checker` to CI is a ten-minute job and belongs
alongside the dependency audit in `09-QUALITY` §5.1.

### 3.3 Content and assets

| Asset | Provenance | Position |
|---|---|---|
| Site imagery, banners, illustrations | AI-generated | Ownership and licensing of AI-generated images vary by jurisdiction and by the generating service's terms. **Not assessed.** Worth confirming, since these are used commercially |
| Attraction and experience descriptions | Written for the project, then machine-translated | Original work; translations are derivative of it |
| Product imagery | Uploaded by store owners | **The store-owner terms that would grant the platform a licence to display them do not exist** (§2.7, P2B). The platform currently displays third-party content with no written permission |
| Logo and brand | Original | No trade mark registration |

---

## 4. Commercial and contractual position

| Item | Status |
|---|---|
| Legal entity | **Not confirmed in this documentation.** Whether the business is registered, and in what form, determines liability, tax treatment and who signs the DPAs. This should be recorded here |
| Terms of service for buyers | **None** |
| Terms for store owners | **None** — also a P2B breach (§2.7) |
| Privacy policy | Page exists; never legally reviewed |
| Cookie policy | None |
| Commission agreement with store owners | Not written. The rate is a database field with no contract behind it |
| **Vercel Hobby plan** | The plan's terms exclude commercial use. The platform has a live domain, live Stripe keys and a commission model. **The current deployment is out of compliance with its own hosting agreement**, and remains so until the Pro upgrade. Deferred by the founder; recorded as R-6 |
| Insurance | None |

The commission agreement row deserves emphasis. `Store.commissionRate` defaults
to 10 and can be edited by the operator from the admin console. There is no
contract fixing it, no notice period for changing it, and no record of what a
given store agreed to — only a snapshot on each order (BR-4), which protects
historical arithmetic but is not a contract. P2B requires notice before changing
terms with business users. A one-page store-owner agreement would close a
regulatory obligation and a commercial ambiguity at the same time.

---

## 5. Risk management

### 5.1 Process

Risks are recorded in `01-PRODUCT` §8.6 with likelihood and impact scored 1–5,
reviewed when a risk changes state or a new one is identified. There is no formal
review cadence; for a one-person project the register is reviewed when the backlog
is.

### 5.2 Risks specific to governance

| ID | Risk | L | I | Score | State |
|---|---|---|---|---|---|
| G-1 | Regulatory non-compliance at launch — GDPR, consumer rights, P2B | 4 | 5 | **20** | **OPEN** |
| G-2 | DAC7 seller data not collected; retrospective collection damages store relationships | 4 | 3 | 12 | **OPEN — schema change needed now** |
| G-3 | Hosting plan terms breached by commercial use | 3 | 4 | 12 | **OPEN — deferred** |
| G-4 | Platform found to be the buyer's counterparty rather than an intermediary, inheriting refund and conformity liability for goods it did not make | 3 | 4 | 12 | **OPEN — unresolved** |
| G-5 | No written store-owner terms; a dispute over commission or a payout has no contractual reference | 3 | 3 | 9 | **OPEN** |
| G-6 | Personal data breach undetectable, making 72-hour notification impossible | 3 | 4 | 12 | **OPEN — depends on `10-OPERATIONS` §4.3** |
| G-7 | AI transfer undisclosed to users | 4 | 3 | 12 | **OPEN** |
| G-8 | No licence on a public repository creates ambiguity about reuse | 2 | 2 | 4 | **OPEN — five-minute fix** |

### 5.3 Audit trail — what the system can and cannot evidence

| Evidenced | Not evidenced |
|---|---|
| Every dispute resolution: outcome, amounts, Stripe IDs, resolver identity, timestamp, notes | Any administrative action on the catalogue, stores or users |
| Every legal-exception refund: reason, amount, reversal and refund IDs, who processed it, when | Who viewed personal data, and when |
| Every settlement transfer: Stripe transfer ID, amount, timestamp, `transfer_group` | Consent events, since no consent is captured |
| Every credit purchase: `Transaction` records are immutable | Login history and authentication events |
| Every design decision: `DECISIONS.md` and `CHANGELOG.md` | Sign-off, since there is one person |

The money trail is strong — strong enough to answer a regulator's question about
any individual transaction. The **personal-data trail is absent**, which is the
half a data-protection authority would ask about.

---

## 6. Remediation plan

Ordered by the longest lead time first, because the legal items cannot be
compressed by working harder on the last day.

| # | Action | Owner | Lead time | Blocks launch |
|---|---|---|---|---|
| 1 | **Brief a Portuguese lawyer.** Bring §2 of this document. Questions: platform vs seller status (§2.4); consumer withdrawal implementation; buyer and store-owner terms; DSA and Accessibility Act exemptions | External | **Weeks — start first** | **Yes** |
| 2 | **Brief a Portuguese accountant.** Questions: activity registration; invoicing; commission VAT treatment; AI credits as electronically supplied services and OSS; DAC7 filing mechanics | External | Weeks | **Yes** |
| 3 | **Add DAC7 fields to the `Store` schema** — legal name, NIF, registered address, business registration number — and collect them at onboarding | Engineering | Half a day | **Yes** — before the next store |
| 4 | Accept and file the standard DPAs for Stripe, Atlas, Vercel, Cloudinary, Resend and Google | Founder | 2 hours | **Yes** |
| 5 | Disclose the Gemini transfer at the point of collection and in the privacy notice | Engineering | 1 hour | **Yes** |
| 6 | Define retention periods per collection; implement erasure, starting with a TTL on `AIResponse` | Engineering | 1 day | **Yes** |
| 7 | Write buyer terms, store-owner terms and a P2B complaint route | Founder + lawyer | With #1 | **Yes** |
| 8 | Upgrade the hosting plan | Founder | 10 min | **Yes** |
| 9 | Implement data subject access and export | Engineering | 1 day | No — but the process must exist |
| 10 | Add `LICENSE` and a README statement | Founder | 5 min | No |
| 11 | Add `license-checker` to CI | Engineering | 10 min | No |
| 12 | Record the legal entity and its details in this document | Founder | 10 min | No |

**Items 1 and 2 should be started this week.** Every other item on this list is
either quick or waiting on their answers, and the engineering items cannot be
specified correctly until the platform-versus-seller question in §2.4 is settled.

---

## Trade-offs recorded

**Compliance deferred behind product completeness.** Seven months went into
building a marketplace before any regulatory obligation was examined. The
defensible half of this: with no users and no transactions, most obligations were
not yet engaged, and premature legal spend on a product that might never launch is
a poor use of a student's money. The indefensible half: DAC7 has a **schema**
implication, and schema decisions are cheap at design time and expensive after
stores have onboarded. Reading the obligations early would have cost an afternoon
and changed one model. It is now a migration and a set of awkward conversations.

**Stripe Connect over any custom payout mechanism.** The best decision in this
document. It removed an entire regulatory category — payment services
authorisation, safeguarding of client funds, seller KYC — by refusing to hold
other people's money outside a regulated provider. It cost flexibility in payout
timing and a dependency that is now deeply embedded in the domain. Given that the
alternative was a student operating an unlicensed money-transmission business, the
trade is not close.

**Markdown governance over a governance process.** Append-only ADRs, a dated
changelog and an annotated backlog capture more reasoning than most small teams
retain, and they cost nothing to run. They also depend entirely on one person
choosing to write them at the end of a working day — and `DECISIONS.md` going
quiet after 2026-08-03 while the reasoning migrated into `CHANGELOG.md` is the
evidence that the dependency is real. Governance that relies on discipline decays
exactly when the project is busiest, which is when it matters most.

**Writing this inventory rather than obtaining advice.** This document is an
engineer's reading of a set of legal instruments, and it will contain errors of
emphasis and possibly of substance. Producing it is still worth more than waiting:
a lawyer briefed with a structured inventory of what the system actually does with
money and data will reach a useful answer in one meeting, where a lawyer briefed
with "I built a marketplace" will spend that meeting discovering the facts. The
document is a briefing instrument, not a substitute for the briefing — and it
should be read as the list of questions to ask, not the list of answers.

---

**Sources for the regulatory thresholds cited above:**
[DAC7 reporting obligations for online platforms — Fonoa](https://www.fonoa.com/resources/blog/dac7overview) ·
[Portugal VAT exemption: the €15,000 limit and the €18,750 trap — Worktugal](https://worktugal.com/portugal-vat-exemption-limit-trap/) ·
[Portugal comprehensive VAT guide 2026 — VATupdate](https://www.vatupdate.com/2026/01/31/portugal-comprehensive-vat-guide-2026/)
