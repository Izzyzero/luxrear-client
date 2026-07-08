# 12. Key Architectural Decisions

## Decision 1: Single Posts Collection (Polymorphic)

**Decision:** One `posts` collection with a `type` enum (14 values) instead of separate collections for Feed, Exchange, Community, Learning, Diaspora, and Support.

**Alternatives considered:**
- Separate collections per section (more complex queries, harder to maintain)
- Single collection with discriminator key (Mongoose discriminator pattern)

**Why this approach:** Simpler queries -- one set of indexes, one CRUD controller, one route file. Each section is just a filter (`GET /posts?type=INVESTMENT`). Adding a new post type is a one-line schema change.

## Decision 2: 1:1 User and Profile Split

**Decision:** Separate User and Profile collections with a 1:1 relationship via `user_id`.

**Alternatives considered:**
- Embedded profile fields in User document (single collection)
- Single collection with all fields

**Why this approach:** Auth middleware only needs User (lightweight query). Profile data changes (picture upload, business info updates) don't touch the auth document. Cleaner separation of concerns.

## Decision 3: Denormalized Counters

**Decision:** `comment_count` and `reaction_count` stored directly on Post document, updated atomically on each create/delete.

**Alternatives considered:**
- MongoDB aggregation `$count` on every request (correct but slow)
- Redis counters for real-time counts (additional infrastructure)

**Why this approach:** Fast reads with no extra queries. Atomic `$inc` / `$dec` operations prevent race conditions. Acceptable trade-off for eventual consistency.

## Decision 4: 1-Level Comment Nesting

**Decision:** Comments use a `parent_id` field for replies, but replies cannot have their own replies (max depth of 1).

**Alternatives considered:**
- Infinite nesting (complex query logic, recursive rendering)
- Flat comments only (no threading at all)

**Why this approach:** Balanced UX -- users can reply to comments for discussion, but no infinite threading complexity. Query is simply `find({ post_id }).sort({ parent_id: 1, created_at: 1 })` with client-side grouping.

## Decision 5: Inline Notification Triggers in Controllers

**Decision:** Notification creation is called explicitly in comment/reaction/connection controllers, not via Mongoose post-save hooks.

**Alternatives considered:**
- Mongoose post-save hooks on models (automatic but harder to test/debug)
- Event emitter pattern (decoupled but adds complexity)

**Why this approach:** Explicit control over when notifications fire. Error handling is straightforward (try/catch with silent failure). Easier to understand the full flow by reading the controller.

## Decision 6: JWT Stateless Access Tokens

**Decision:** Access tokens are stateless JWTs. Logout only invalidates the refresh token (by clearing it from DB).

**Alternatives considered:**
- Token blacklist for full invalidation (adds DB query per request)
- Session-based auth (requires session store)

**Why this approach:** Simpler implementation, no DB lookup for token validation on every request. Short expiry (24h) limits exposure. Production recommendation: reduce to 15min and implement refresh token rotation more aggressively.

## Decision 7: Axios Direct Calls (No Interceptors Yet)

**Decision:** Frontend uses raw Axios calls. No request/response interceptors for automatic token refresh or error handling.

**Alternatives considered:**
- Axios interceptors with automatic 401 handling and token refresh
- React Query for caching and retry

**Why this approach:** Current state is functional for development. Interceptors should be added before deployment to handle expired token scenarios gracefully.

## Decision 8: Validation in Route Files (express-validator)

**Decision:** Input validation chains are defined in route files, executed by a shared `validate.js` middleware.

**Alternatives considered:**
- Validation in controllers (mixes concerns)
- Zod schemas on both frontend and backend (duplication)

**Why this approach:** Routes are self-documenting (validation rules visible alongside endpoint definition). The shared `validate` middleware keeps controller code clean. express-validator integrates natively with Express.

## Decision 9: Cloudinary for Image Uploads

**Decision:** All image uploads (profile pictures, post images) go through Cloudinary via multer streaming upload.

**Alternatives considered:**
- Local file storage (not scalable, not suitable for serverless)
- AWS S3 (more complex setup, additional SDK)
- Base64 encoding (bad for performance)

**Why this approach:** Cloudinary provides CDN delivery, automatic image optimization, and transformation URLs. Multer streaming upload avoids temp files on disk -- buffer goes directly to Cloudinary.

## Decision 10: Notification Types as Plain Enum Strings

**Decision:** Notification `type` field is a simple string enum (9 values), not a separate collection with templates.

**Alternatives considered:**
- Notification templates in DB (configurable but overengineered)
- Internationalized messages (future concern)

**Why this approach:** Simple, fast, easy to query. Messages are constructed in the controller in plain text. Can be upgraded to template-based or i18n later without schema changes.
```
