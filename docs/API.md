# API

Keep in sync with implementation — when a route's behavior changes, update its entry here.

Auth convention across the app: `getServerSession(authOptions)` from `next-auth`, role-checked per route (`session.user.role`). Routes that don't check anything explicitly are open to any signed-in user.

## Verified this session (detailed, current)

| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/api/auth/[...nextauth]` | GET/POST | — | NextAuth handler (Google, admin-login, store-owner-login) |
| `/api/orders` | GET | any signed-in user | List the current user's orders. **`POST` was removed this session** — it let anyone create a fake "paid" order with no payment verification. |
| `/api/orders/confirm` | POST | none (relies on Stripe session lookup) | `{ sessionId }` → verifies `payment_status === "paid"` with Stripe, creates the `Order` if the webhook hasn't already (idempotent on `stripeSessionId`) |
| `/api/payments/checkout` | POST | — | `{ items, deliveryType, address }` → creates a Stripe Checkout Session; attaches Connect split (`application_fee_amount` + `transfer_data.destination`) if the store has finished onboarding |
| `/api/webhooks/stripe` | POST | Stripe signature | Verifies `stripe-signature`, handles `checkout.session.completed` (creates order) and `account.updated` (updates `Store.stripeOnboardingComplete`) |
| `/api/store-owner/connect` | POST, GET | STORE_OWNER | POST creates/reuses a Stripe Connect Express account + onboarding link; GET returns current connect status |
| `/api/store-owner/products` | GET, POST | STORE_OWNER | List/create products scoped to the caller's store |
| `/api/store-owner/products/[id]` | PUT, DELETE | STORE_OWNER | Update/delete, scoped to the caller's store (query includes `storeId`) |
| `/api/upload` | POST | any signed-in user | `FormData` with `file` (+ optional `folder`) → uploads to Cloudinary server-side, returns `{ url, publicId }` |
| `/api/user/profile` | PATCH | any signed-in user | `{ name?, image? }` → updates the `User` document |
| `/api/user/credits` | GET | any signed-in user | Returns `{ credits, memberSince }` |
| `/api/ai/preview` | POST | any signed-in user | `{ days, budget, people, dates }` → gated by free-trial/credits, calls Gemini, saves `AIResponse`, decrements credits |

## Not yet verified in detail this session

These exist in the codebase but weren't read/touched this session — documented by path/convention only. Verify actual request/response shape before relying on the specifics.

| Route | Likely purpose |
|---|---|
| `/api/dev/seed/products` | Dev-only sample data seeding |
| `/api/products`, `/api/products/[slug]` | Public product listing/detail |
| `/api/categories` | Public category listing |
| `/api/admin/ai-settings`, `/api/admin/config` | Admin-managed platform/AI settings (`GlobalConfig`) |
| `/api/admin/orders` | Admin order management |
| `/api/admin/stores`, `/api/admin/stores/[id]` | Admin store management |
| `/api/admin/revenue` | Admin revenue stats — likely where commission visibility should eventually live |
| `/api/admin/users` | Admin user management |
| `/api/ai/result` | Fetch a specific saved AI itinerary result |
| `/api/payments/ai-credits` | Stripe Checkout for AI credit pack purchase |
| `/api/store-owner/orders`, `/api/store-owner/orders/[orderId]/ship` | Store-owner order management/fulfillment |
| `/api/user/ai-history`, `/api/user/history` | Customer's AI generation history |
| `/api/user/transactions` | Customer's purchase/credit transaction history |
| `/api/user/credits/add` | Adds credits to a user — verify whether this is admin-only or payment-triggered |
