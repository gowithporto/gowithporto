# GoWithPorto — Wiki

> **Paste this as the Wiki `Home` page, then delete the other five wiki pages
> (Architecture Overview, Design Patterns, Final Folder Structure, Iteration
> History, System Diagrams). They date from 3 January 2026 and describe an
> architecture that no longer exists — a separate Express backend, a five-locale
> setup, checkout-time payout splitting. This file is not part of the repository
> documentation; it exists only to be copied into the wiki.**

---

## The documentation lives in the repository

Engineering documentation for GoWithPorto is versioned alongside the code, in
[`docs/`](https://github.com/gowithporto/gowithporto/tree/main/docs). It is
reviewed with the changes it describes and cannot drift silently from them.

**Start here → [`docs/00-INDEX.md`](https://github.com/gowithporto/gowithporto/blob/main/docs/00-INDEX.md)**

That file contains a traceability matrix mapping all 21 software-lifecycle stages
to the document that covers each one, with an honest status — implemented,
partial, specified-but-not-built, or deliberately out of scope with the reasoning.

This wiki is retained only as a pointer. Nothing here is maintained.

---

## Quick links

**Understanding the system**

- [Product and requirements](https://github.com/gowithporto/gowithporto/blob/main/docs/01-PRODUCT.md) — problem, personas, 41 functional requirements, risk register
- [Architecture](https://github.com/gowithporto/gowithporto/blob/main/docs/03-ARCHITECTURE.md) — modular monolith, capacity model, technology evaluation
- [Domain and business logic](https://github.com/gowithporto/gowithporto/blob/main/docs/04-DOMAIN.md) — the fulfilment state machine, escrowed settlement, dispute resolution
- [Decisions](https://github.com/gowithporto/gowithporto/blob/main/docs/DECISIONS.md) — architecture decision records with alternatives considered

**Working on it**

- [Implementation and version control](https://github.com/gowithporto/gowithporto/blob/main/docs/08-ENGINEERING.md)
- [API reference](https://github.com/gowithporto/gowithporto/blob/main/docs/06-API.md)
- [Data model](https://github.com/gowithporto/gowithporto/blob/main/docs/05-DATA.md)
- [Backlog](https://github.com/gowithporto/gowithporto/blob/main/docs/TODO.md) — the real backlog. GitHub Issues is not maintained

**Assessing it**

- [Security](https://github.com/gowithporto/gowithporto/blob/main/docs/07-SECURITY.md) — threat model, OWASP mapping, open findings
- [Quality and CI](https://github.com/gowithporto/gowithporto/blob/main/docs/09-QUALITY.md) — test strategy, currently a specification rather than a record
- [Operations](https://github.com/gowithporto/gowithporto/blob/main/docs/10-OPERATIONS.md) — infrastructure, deployment, monitoring, incident runbooks
- [Governance](https://github.com/gowithporto/gowithporto/blob/main/docs/12-GOVERNANCE.md) — EU regulatory obligations

---

## What this project is

An AI trip planner and local marketplace for Porto, built and operated by one
person. Visitors generate an itinerary shaped by their dates, budget, group and
interests, and buy goods from small Porto producers.

The distinctive engineering is in how sellers get paid. Money does not split at
checkout — the full charge lands on the platform balance, and the seller's share
transfers only once the buyer confirms they received the goods. The buyer holds a
per-item QR token; the store holds a PIN; neither can complete a handover alone.
A buyer may instead report a problem, freezing that item's settlement until it is
resolved as seller fault, buyer fault, or a percentage split.

Live at [www.gowithporto.pt](https://www.gowithporto.pt).
