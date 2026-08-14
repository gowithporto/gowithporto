# GoWithPorto

GoWithPorto is an AI-powered travel planning and ecommerce platform focused on Porto, Portugal.
It helps tourists plan trips, book experiences, and buy authentic local souvenirs using AI-driven recommendations.

---

## Project Goals

### Business Goals
- Provide personalized AI-based travel plans for Porto
- Monetize AI recommendations (paid unlock)
- Sell local products and experiences
- Support multi-language EU tourists

### Technical Goals
- Scalable fullstack architecture
- Replaceable services (AI, DB, payments)
- SEO-friendly frontend
- Industry-grade software engineering practices

---

## Stakeholders

- **Tourist User**
  - Wants fast, clear travel planning
  - Budget-aware, multi-language support

- **Admin / Business Owner**
  - Manage products, guides, hotels
  - Track revenue, AI usage, growth

- **Future Engineering Team**
  - Needs clean architecture
  - Easy onboarding and extensibility

---

## Core Features

- AI Travel Plan Generator (free preview + paid unlock)
- User Dashboard (AI history, orders)
- Ecommerce (souvenirs, checkout)
- Guide & Bike Rental
- Admin Dashboard
- Multi-language & theme support

---

## Tech Stack

**Frontend**
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Redux Toolkit
- GSAP / Framer Motion

**Backend**
- Node.js
- Express.js
- MongoDB Atlas
- Stripe Payments
- AI (ChatGPT / Gemini)

---

## Architecture Principles

- Modular & domain-based structure
- Stateless backend services
- Replaceable providers (AI, DB, Payments)
- CI/CD ready

---

## Maintenance Scripts

One-off/re-runnable scripts live in `scripts/` (plain Node, not part of the Next.js build). Run with `node --env-file=.env.local scripts/<file>.js` from the project root.

- `scripts/create-admin.js <email> <password>` — creates or promotes a user to `ADMIN` directly in MongoDB.
- `scripts/translate-content.js` — AI-backfills French/Spanish/Portuguese translations for Product/Attraction/LocalExperience content (via Gemini) into each document's `translations` field. Idempotent: skips any doc/locale that's already translated, so it's safe to re-run whenever new products/attractions/experiences are added — it will only translate what's missing, not the whole catalog again.
  ```
  node --env-file=.env.local scripts/translate-content.js
  ```

## Documentation
- See **GitHub Wiki** for architecture, folder structure, and decisions.
