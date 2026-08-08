# DATABASE

MongoDB via Mongoose. Cluster: `gowithporto` org, `Cluster0`, free M0, `eu-west-3`, under the business Google account. Two DB users: `atlas_admin` (personal use, full access — never used by the app) and `gowithporto_app` (`readWrite` scoped to the `gowithporto` database only — this is what the app actually connects with).

## Models

### User (`src/models/User.ts`)
| Field | Type | Notes |
|---|---|---|
| name | String | |
| email | String | unique, required |
| password | String | `select: false` — admin login only |
| role | String | `USER` \| `ADMIN` \| `STORE_OWNER`, default `USER` |
| image | String | Cloudinary URL or Google avatar URL |
| credits | Number | AI itinerary credits, default 0 |
| freeUsed | Boolean | first AI generation is free, default false |

### Store (`src/models/Store.ts`)
| Field | Type | Notes |
|---|---|---|
| name, slug, location | String | slug unique |
| active | Boolean | default true |
| storeCode, passwordHash | String | login credentials |
| role | String | always `STORE_OWNER` |
| deliveryFee | Number | default 0 |
| **stripeAccountId** | String | Stripe Connect account id, set on first onboarding attempt |
| **stripeOnboardingComplete** | Boolean | default false, set via `account.updated` webhook |
| **commissionRate** | Number | percent kept by platform, default 10, **per-store not global** |

### Product (`src/models/Product.ts`)
| Field | Type | Notes |
|---|---|---|
| title, slug, description | String | slug unique |
| price | Number | |
| images | [String] | Cloudinary URLs, uploaded via `/api/upload` |
| category | String | |
| quantity | Number | default 0 |
| storeId | ObjectId → Store | |
| active | Boolean | default true |

### Order (`src/models/Order.ts`)
| Field | Type | Notes |
|---|---|---|
| userEmail | String | |
| storeId | ObjectId → Store | |
| **stripeSessionId** | String | unique, sparse — idempotency key across webhook + confirm-route |
| items | [{ productId, title, price, quantity, image }] | |
| total | Number | |
| **platformFeeAmount** | Number | what the platform kept |
| **storeOwnerAmount** | Number | what transferred to the store's Connect account |
| **storeStripeAccountId** | String | which connected account received it |
| address | { name, street, city, postalCode, country } | |
| status | String | default `"paid"` |

### AIResponse (`src/models/AIResponse.ts`)
| Field | Type | Notes |
|---|---|---|
| userEmail | String | required, indexed |
| prompt | Object | raw itinerary request |
| response | Object | raw Gemini output |

### Transaction (`src/models/Transaction.ts`)
AI credit purchases specifically (not marketplace orders).
| Field | Type | Notes |
|---|---|---|
| userEmail | String | required, indexed |
| stripeSessionId | String | required |
| amount, currency | Number, String | currency default `"eur"` |
| creditsAdded | Number | required |
| cardBrand, cardLast4 | String | for display in transaction history |

### BikeRentalProvider (`src/models/BikeRentalProvider.ts`)
Directory of third-party bike rental shops promoted on `/bike-rentals` — no booking/pricing, just a listing that links out to the shop's Google Maps location.
| Field | Type | Notes |
|---|---|---|
| name | String | required |
| coverImage | String | required, Cloudinary URL |
| address | String | shown as area/address text on the card |
| googleMapsUrl | String | required, the card links out here |
| startingPrice | String | free text, e.g. `"From €10/day"` |
| rating, reviewCount | Number | admin-entered manually, not pulled from Google |
| order | Number | manual sort order, default 0 |
| active | Boolean | default true |

### GlobalConfig (`src/models/GlobalConfig.ts`)
Generic key/value store for platform-wide settings.
| Field | Type | Notes |
|---|---|---|
| key | String | unique, e.g. `"AI_SETTINGS"`, `"PLATFORM_SETTINGS"` |
| value | Mixed | arbitrary JSON |

## Relationships

- `Order.storeId` → `Store`
- `Product.storeId` → `Store`
- Everything else (`AIResponse`, `Transaction`) keys on `userEmail`, not a `User` ObjectId ref — worth knowing if you're ever tempted to `.populate()` those, it won't work as written.

## Database decisions

See DECISIONS.md for the reasoning — short version: fresh cluster under the business account (not migrated from the old personal-account cluster, dev data wasn't worth carrying over), scoped app user instead of admin-level credentials, no `0.0.0.0/0` network rule.
