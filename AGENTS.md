# BlackBerry Shop — Storefront

Customer-facing storefront application for the BlackBerry Shop e-commerce platform.
The admin panel is a separate project and is not part of this repository.

## Stack

- **Next.js 16 (App Router), React 19** — note that `params` is now a `Promise` and must be `await`ed
- **Tailwind CSS v4**
- **Prisma 7** with `@prisma/adapter-pg`
- **Supabase / PostgreSQL**
- **Zustand** (with `persist` middleware) — client-side state management
- **Cloudinary** — image storage and uploads
- **react-multi-carousel** — storefront carousels
- **Sentry** — error monitoring
- **Monobank Acquiring API** — payment processing with Checkbox fiscalization
- **Nova Poshta API** — shipping, TTNs (waybills), warehouses

## Data Architecture (Prisma)

### Products
- **Color-first** variant hierarchy: `Product → ProductColor → ProductImage[] + ProductSize[]`
  (important: not size-first — this was a deliberate decision made after a mid-project refactor)
- `ProductRelation` — self-referential many-to-many for related products:
  `fromProductId`, `toProductId`, `order`, `reason`
- Category specifications: `CategorySpecification` / `ProductSpecificationOverride`
- Catalog color filters: `CatalogColor` / `ProductColorFilter`
- Product category is saved via the scalar FK `categoryId`, not `connect`/`disconnect`

- The temporary product mutation API and `DevCreateProductBtn` were removed. Product administration belongs in the separate admin project; do not restore unauthenticated mutation routes.

### Orders
- `Order` / `OrderItem`, cascade delete
- Payment/tracking fields on `Order`:
    - `paidAt` — guards the first paid transition and associated inventory/promo-code accounting
    - `publicToken` — UUID for public order status lookup
    - `fbp`, `fbc` (nullable) — Facebook cookies, captured **at order creation time**, not in the webhook
    - client IP (`x-forwarded-for`) and user-agent — also captured at order creation time

### Cart
- Cart item key: `productColorId + size + lining` (not just `productId`)

### Shipping
- `NovaPoshtaCity` — fuzzy city search via `pg_trgm`
- Orders store `warehouseRef`, warehouse display text and number. TTN creation uses the reference.

## TypeScript

- Prefer TypeScript inference when the type is clear from the initializer or surrounding context. Do not annotate every variable, callback parameter, or return value.
- Use explicit types for component props, function inputs without contextual types, shared data contracts, and declarations where inference is too narrow or ambiguous (such as an empty array or nullable React state).
- Add return types when they enforce a meaningful contract or clarify a complex function. Simple helpers, React components, and map/filter callbacks do not need redundant return annotations.
- Avoid `any` as a shortcut around type errors. This does **not** mean adding annotations everywhere: inferred types are fully typed. For untrusted input, use `unknown` and validate/narrow it; a type assertion does not validate runtime data.
- Let Prisma infer query results. For reusable query shapes, prefer `satisfies Prisma.ProductSelect` (or the appropriate model) and `Prisma.ProductGetPayload` over manually duplicating the result type. Design separate DTOs around the actual selected fields when a separate contract is needed.
- Do not add casts, non-null assertions, or duplicate interfaces solely to satisfy an unnecessary annotation. Do not rewrite unrelated code just to add or remove types.

```ts
// Inference is sufficient here.
const quantity = 1;
const ids = products.map(product => product.id);
const isPaid = (status: OrderStatus) => status === "PAID";

// An explicit type is useful when the initializer is not enough.
const [selectedSize, setSelectedSize] = useState<string | null>(null);
const payload: unknown = await request.json(); // Validate before use.
```

## Integrations

### Monobank
- Verify webhook `X-Sign` (ECDSA/SHA-256) against the original request bytes before parsing JSON or accessing orders. `lib/monobankWebhook.ts` fetches and caches the bank public key using `MONOBANK_TOKEN`; key-fetch failures must fail closed. Invalid/missing signatures return 401; key-fetch failures return 500 without processing the order.
- With Checkbox fiscalization: `basketOrder` must be nested **inside** `merchantPaymInfo`
- For COD (cash on delivery) prepayment: `basketOrder` must contain **exactly one** line item matching `amount` precisely
- The Facebook Purchase event is sent **server-side**, not from the frontend — via the Conversions API directly inside the Monobank webhook handler, for reliability and to avoid ad-blocker losses

### Facebook Conversions API (CAPI)
- `lib/fbHash.ts` trims, lowercases and hashes input using Node.js `crypto`. Normalize phone numbers separately before hashing; this helper does not remove phone punctuation.

### Nova Poshta
- Automatic TTN creation on webhook: the recipient is first created as a counterparty via `Counterparty/save`
- `RecipientAddress` uses the already-stored `warehouseRef`

### Notifications and fiscalization
- `lib/telegram.ts` sends order notifications to Telegram admins and escapes user-supplied HTML.
- `lib/orderFiscalization.ts` and `lib/checkbox.ts` handle Checkbox receipts with deterministic IDs per order and receipt kind. This does not make TTN creation or notifications idempotent.
- Monobank invoice creation supplies `customerEmails`. Resend/react-email and React Hook Form are not current dependencies; do not assume historical integrations still exist.

## UI Components & Patterns

- `DropDown.tsx` — custom select component: controlled/uncontrolled modes, keyboard navigation, outside-click-to-close, adaptive open direction, an `error` prop
- `EmptyState` — reused in `error.tsx` and similar empty/error states
- `TestimonialCard` — warm/handmade aesthetic, `react-icons/fa` plus inline SVG for decorative elements not available in icon packs
- Seasonal particle effects on the catalog page: `SnowParticles`, `PetalParticles`, `SunRays`, `SunlightMotes` — implemented via **canvas**, not DOM/CSS animations (DOM-based versions had mobile compositing performance issues); shared `useParticleCanvas` hook

## Known Gotchas / Fixes

- **Tailwind v4**: the `font-bold` class resets `font-family` — use `font-semibold` instead in affected spots
- **Stale closure** in `useCallback` during Cloudinary upload — fixed with `useRef`
- `productId` from route params/forms — remember to coerce string → int
- `DATABASE_URL`: special characters in the password must be URL-encoded
- Local dev with ngrok — requires `allowedDevOrigins` in the Next.js config
- Click handler bug: `onClick={() => onClick || router.push('/')}` **does not call** the function (it just evaluates an expression) — correct version: `onClick={() => onClick ? onClick() : router.push('/')}`

## Code Style Preferences

- Keep axios calls **inline**, don't extract them into separate hooks/services unless explicitly requested
- Follow the TypeScript inference guidelines above; explicit annotations should add useful information or enforce a contract.
- Before major schema refactors (like the size-first → color-first switch) — explicitly discuss the trade-offs

---
*Shared instructions for coding agents. CLAUDE.md imports this file instead of duplicating it. Keep factual context aligned with the current code and package.json.*
