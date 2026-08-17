# ARCHITECTURE — superseded

> **This document is no longer maintained.** It is superseded by
> [`03-ARCHITECTURE.md`](03-ARCHITECTURE.md), which covers technical analysis and system architecture and is
> verified against the codebase at commit `3eb178a`.
>
> It described money splitting at checkout via Stripe `application_fee_amount` and `transfer_data.destination`. That model was replaced on 2026-08-16 by confirmation-gated settlement, and the document was not updated — a two-day drift on the most financially sensitive logic in the system, and the reason the current documentation set exists.

See [`00-INDEX.md`](00-INDEX.md) for the full documentation map.

**This file should be removed** (`git rm docs/ARCHITECTURE.md`). It is left as a stub only
so that existing links do not lead a reader to stale content.
