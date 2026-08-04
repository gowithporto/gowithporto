# SESSION_HANDOFF

> Temporary. Overwritten each session — not a history log. If you need history, check CHANGELOG.md or DECISIONS.md.

## Completed this session

- Migrated all infrastructure (domain, email, MongoDB, Vercel, Google Cloud, Cloudinary, GitHub) to `admin@gowithporto.pt`
- Fixed: fake-order vulnerability, Google sign-in not creating `User`, no login rate limiting
- Built: real Cloudinary upload for store-owner products, user profile settings page, Stripe Connect onboarding + payment split
- Set up a restricted, test-mode Stripe API key (`claude-mcp-dev-test`) for connecting an MCP agent to Stripe during dev/testing
- Established this `/docs` system as the project's source of truth

## What we were doing when we stopped

Just finished writing the full `/docs` folder (AI_CONTEXT, ARCHITECTURE, DATABASE, API, DECISIONS, STYLE_GUIDE, CHANGELOG, TODO, this file). Had not yet moved on to the next infra task.

## Exact next step

**Connect the `gowithporto.pt` custom domain to the Vercel project.** After that: the full env var migration pass (Mongo, NextAuth, OAuth, Stripe sandbox, Gemini, Cloudinary — into Vercel + `.env.local`), then register the Stripe webhook endpoint and test the full flow end-to-end. See TODO.md for the complete ordered list.

## Blockers / things to verify

- Resend account doesn't exist yet — blocks order confirmation / receipt emails
- Local `.env.local` still has old personal-account credentials in places, not yet migrated
- Stripe MCP connector: restricted key was created in Stripe, but actually adding it in the Claude Code (VS Code extension) settings UI was not verified — `claude` CLI isn't available in this environment to confirm the exact registration mechanism
- Admin-panel commission/connected-store visibility not built — currently only checkable via Mongo Data Explorer or the Stripe dashboard directly

## Files modified this session

**New files**: `src/lib/rateLimit.ts`, `src/lib/cloudinary.ts`, `src/lib/buildOrderFromStripeSession.ts`, `src/app/api/webhooks/stripe/route.ts`, `src/app/api/upload/route.ts`, `src/app/api/user/profile/route.ts`, `src/app/api/store-owner/connect/route.ts`, `src/app/dashboard/profile/page.tsx`, `src/components/ui/ImageUploader.tsx`, `src/components/ui/AvatarUploader.tsx`, `docs/*.md` (this file set)

**Edited**: `src/models/Order.ts`, `src/models/Store.ts`, `src/app/api/orders/confirm/route.ts`, `src/app/api/orders/route.ts` (removed unsafe `POST`), `src/lib/auth.ts`, `next.config.mjs`, `src/app/store-owner/products/new/page.tsx`, `src/app/store-owner/products/[id]/edit/page.tsx`, `src/components/dashboard/DashboardSidebar.tsx`, `src/app/api/payments/checkout/route.ts`, `src/app/store-owner/page.tsx`, `package.json` (added `cloudinary`)

**Deleted**: `src/app/api/payments/success/route.ts`

**Other**: local git `origin` remote updated to `github.com/gowithporto/gowithporto.git`

None of this has been committed yet.
