# STYLE_GUIDE

Observed conventions — follow these for consistency rather than introducing new patterns per feature.

## Color palette (Tailwind arbitrary values, not theme tokens)

- Headings / primary text: `#1d3d5c`, `#173d5c` (dark navy)
- Accent / links: `#2c6e9b`
- Premium/gold accents: `#eab657`, `#b8863a`
- Theme-aware body text: `text-[var(--text)]`

## Typography

- `font-serif` for all headings/titles
- Default sans for body text (Tailwind default stack)

## Component patterns

- **Card**: `rounded-2xl border border-black/5 bg-white p-6 shadow-sm`
- **Small pill/badge**: `rounded-full px-2.5 py-1 text-xs font-medium` with semantic background/text color pairs (e.g. `bg-emerald-50 text-emerald-600`)
- **Primary button**: `rounded-xl bg-[#1d3d5c] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1d3d5c]/90`
- Icons: `@heroicons/react/24/outline` primarily, `react-icons/fa6` / `react-icons/fa` for a few specific ones

## Folder / naming conventions

- Pages: `src/app/<role>/<feature>/page.tsx` (App Router)
- API routes: `src/app/api/<domain>/[...]/route.ts`, grouped by role/domain (`admin/`, `store-owner/`, `user/`, `payments/`, `webhooks/`)
- Shared server utilities: `src/lib/` (e.g. `auth.ts`, `mongodb.ts`, `cloudinary.ts`, `rateLimit.ts`, `buildOrderFromStripeSession.ts`)
- Reusable client components: `src/components/ui/`
- Domain-specific components: `src/components/<domain>/` (e.g. `dashboard/`, `store-owner/`)
- Mongoose models: `src/models/<Name>.ts`, PascalCase, one export per file (`models.X || model("X", schema)` pattern — always guard against re-registration)

## API conventions

- Every protected route: `const session = await getServerSession(authOptions);` then check `session.user.role` if role-specific
- Always `await connectDB();` before any Mongoose query
- Return `NextResponse.json(...)` with explicit status codes on error paths (401, 404, 400)
- Idempotency for anything Stripe-triggered: dedupe on a unique field (see `Order.stripeSessionId`), never assume a webhook fires exactly once

## TypeScript practices

- Mongoose schemas are mostly untyped/`any` in older code (`Order`, `Product`) but newer additions (`Store`) use a typed `Document` interface — prefer the typed pattern going forward
- Route handlers type `req: Request` (Web standard), not `NextApiRequest`

## What NOT to do

- Don't add a paid service/account when a free one covers the actual need — flag the tradeoff instead of defaulting to "better" tooling
- Don't add AI/Claude attribution anywhere in commits, PRs, or code comments
