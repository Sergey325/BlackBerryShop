@AGENTS.md
# BlackBerry Shop — Storefront

Customer-facing storefront application for the BlackBerry Shop e-commerce platform.
The admin panel is a separate project and is not part of this repository.

## Stack

- **Next.js 15 (App Router)** — note that `params` is now a `Promise` and must be `await`ed
- **Tailwind CSS v4**
- **Prisma 7** with `@prisma/adapter-pg`
- **Supabase / PostgreSQL**
- **Zustand** (with `persist` middleware) — client-side state management
- **React Hook Form** — forms, integrated with custom components via `Controller`
- **Cloudinary** — image storage and uploads
- **react-multi-carousel** — storefront carousels
- **Monobank Acquiring API** — payment processing with Checkbox fiscalization
- **Nova Poshta API** — shipping, TTNs (waybills), warehouses

## Data Architecture (Prisma)

### Products
- **Color-first** variant hierarchy: `Product → ProductColor → ProductImage[] + ProductSize[]`
  (important: not size-first — this was a deliberate decision made after a mid-project refactor)
- `ProductRelation` — self-referential many-to-many for related products:
  `fromProductId`, `toProductId`, `order`, `reason`
- EAV pattern for dynamic category filters: `CategoryAttribute` / `ProductAttributeValue`
- `CategoryRelation` — self-join for cross-category relationships
- Product category is saved via the scalar FK `categoryId`, not `connect`/`disconnect`

### Orders
- `Order` / `OrderItem`, cascade delete
- Idempotency/tracking fields on `Order`:
    - `confirmationEmailSentAt` — guards against duplicate emails on Monobank webhook retries
    - the same idempotency pattern should be applied to SMS/Viber notifications
    - `_fbp`, `_fbc` (nullable) — Facebook cookies, captured **at order creation time**, not in the webhook
    - client IP (`x-forwarded-for`) and user-agent — also captured at order creation time

### Cart
- Cart item key: `productColorId + size` (not just `productId`)

### Shipping
- `NovaPoshtaCity` — fuzzy city search via `pg_trgm`
- Only `warehouseRef` is stored; the human-readable warehouse name must be fetched separately for display in emails

## TypeScript

- Annotate return types and variable types explicitly — this catches shape mismatches with Prisma `select` results early
- Interfaces like `IRelatedProduct`, `IRelatedProductCategory`, `IProductWithRelated extends IProduct` — pattern for avoiding recursive type conflicts on nested Prisma queries involving self-relations
- Design types around the specific `select`/`include` shape being queried, not the full model

## Integrations

### Monobank
- With Checkbox fiscalization: `basketOrder` must be nested **inside** `merchantPaymInfo`
- For COD (cash on delivery) prepayment: `basketOrder` must contain **exactly one** line item matching `amount` precisely
- The Facebook Purchase event is sent **server-side**, not from the frontend — via the Conversions API directly inside the Monobank webhook handler, for reliability and to avoid ad-blocker losses

### Facebook Conversions API (CAPI)
- `lib/fbHash.ts` — hashes email/phone per Meta's normalization rules using Node.js `crypto`, no external dependencies

### Nova Poshta
- Automatic TTN creation on webhook: the recipient is first created as a counterparty via `Counterparty/save`
- `RecipientAddress` uses the already-stored `warehouseRef`

## UI Components & Patterns

- `Dropdown.tsx` — custom select component: controlled/uncontrolled modes, keyboard navigation, outside-click-to-close, adaptive open direction, RHF `Controller` integration via the `error` prop
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
- Prefer explicit typing wherever a Prisma query could produce a non-obvious data shape
- Before major schema refactors (like the size-first → color-first switch) — explicitly discuss the trade-offs

---
*This file is meant for an IDE coding agent (Claude Code): it provides architectural context and prior decisions so patterns aren't reinvented and known gotchas aren't hit again. Keep it updated as the project evolves.*