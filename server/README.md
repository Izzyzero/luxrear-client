# LUXREAR Business Club — Backend API (Days 1–10)

> Private business network API built over 10 days. Each day adds a new module.
> Base URL: `http://localhost:5000/api`

---

## Table of Contents

- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [MongoDB Architecture](#mongodb-architecture)
- [Auth & Response Format](#auth--response-format)
- [Day 3: Auth System](#day-3-auth-system)
- [Day 4: Member Profile](#day-4-member-profile)
- [Day 5: Posts & Categories](#day-5-posts--categories)
- [Day 6: Business Exchange](#day-6-business-exchange)
- [Day 7: Comments & Reactions](#day-7-comments--reactions)
- [Day 8: Learning Section](#day-8-learning-section)
- [Day 9: Diaspora Hub & Support Board](#day-9-diaspora-hub--support-board)
- [Day 10: Connections, Notifications & Admin](#day-10-connections-notifications--admin)
- [Testing Your API](#testing-your-api)
- [Error Codes](#error-codes)

---

## Quick Start

```bash
npm install
cp .env.example .env    # Fill in your credentials
npm run dev             # → http://localhost:5000
```

### Environment Variables (.env)

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret for access tokens |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens |
| `JWT_EXPIRES_IN` | Access token expiry (default: 24h) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry (default: 7d) |
| `CLIENT_URL` | Frontend URL for CORS (default: http://localhost:5173) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Email sending |
| `EMAIL_FROM` | Sender email address |
| `NODE_ENV` | `development` or `production` |

---

## Project Structure

```
server/
├── src/
│   ├── config/
│   │   ├── db.js                  # MongoDB connection
│   │   └── cloudinary.js          # Cloudinary configuration
│   ├── controllers/
│   │   ├── authController.js      # Day 3: Register, login, tokens, password mgmt
│   │   ├── profileController.js   # Day 4: Profile CRUD + picture upload
│   │   ├── postController.js      # Day 5: Posts CRUD + feed with filters
│   │   ├── categoryController.js  # Day 5: Category listing by type
│   │   ├── commentController.js   # Day 7: Nested comments + notification trigger
│   │   ├── reactionController.js  # Day 7: Toggle reactions + notification trigger
│   │   ├── connectionController.js# Day 10: Send/accept/list connections
│   │   ├── notificationController.js# Day 10: User notification management
│   │   └── adminController.js     # Day 10: User/post/report moderation
│   ├── middleware/
│   │   ├── auth.js                # JWT verification + role-based access
│   │   ├── validate.js            # Validates express-validator results
│   │   ├── upload.js              # Multer + Cloudinary image upload
│   │   └── errorHandler.js        # Global error handler
│   ├── models/                    # 9 Mongoose schemas
│   │   ├── User.js                # email/phone, password, role, verification
│   │   ├── Profile.js             # 1:1 with User: name, business, diaspora fields
│   │   ├── Category.js            # Filter taxonomy (community/learning/exchange)
│   │   ├── Post.js                # 14 types across all sections
│   │   ├── Comment.js             # 1-level nesting via parent_id
│   │   ├── Reaction.js            # like/love/insightful/support on post/comment
│   │   ├── Connection.js          # requester ↔ receiver with status
│   │   ├── Notification.js        # 9 types with read tracking
│   │   └── Report.js              # Content moderation reports
│   ├── routes/
│   │   ├── index.js               # Route aggregator
│   │   ├── authRoutes.js          # 12 endpoints
│   │   ├── profileRoutes.js       # 6 endpoints
│   │   ├── postRoutes.js          # 7 endpoints
│   │   ├── categoryRoutes.js      # 3 endpoints
│   │   ├── commentRoutes.js       # 6 endpoints
│   │   ├── reactionRoutes.js      # 2 endpoints
│   │   ├── connectionRoutes.js    # 5 endpoints
│   │   ├── notificationRoutes.js  # 4 endpoints
│   │   └── adminRoutes.js         # 10 endpoints
│   └── utils/
│       ├── jwt.js                 # Token generation + verification
│       ├── email.js               # Email sending (verification, password reset)
│       ├── apiResponse.js         # Standardized response helpers
│       ├── seedCategories.js      # Auto-seeds DB with categories on startup
│       └── notificationService.js # Reusable notification creation helper
├── test-api.sh                    # Automated test suite (all 50+ tests)
├── curl-reference.sh              # Copy-pasteable curl examples
├── .env.example
├── package.json
└── README.md
```

---

## MongoDB Architecture

### 9 Collections

```
users ──────────────────── 1:1 ──── profiles
  │                                      │
  │                                      │
  ├── posts (profile_id) ◄───────────────┘
  │     │
  │     ├── comments (post_id)
  │     │     └── parent_id (1-level nesting)
  │     │
  │     └── reactions (post_id or comment_id)
  │
  ├── connections (requester_id, receiver_id)
  │
  ├── notifications (user_id)
  │
  ├── reports (post_id, comment_id, profile_id)
  │
  └── categories (standalone taxonomy)
```

---

## Auth & Response Format

### 🔒 Auth Required

Endpoints marked with 🔒 require a Bearer token:

```bash
Authorization: Bearer <access_token>
```

### Response Format

**Success:**
```json
{ "success": true, "message": "...", "data": { ... } }
```

**Paginated:**
```json
{ "success": true, "message": "...", "data": [ ... ], "pagination": { "page": 1, "limit": 20, "total": 50, "pages": 3 } }
```

**Error:**
```json
{ "success": false, "message": "Error description." }
```

**Validation Error:**
```json
{ "success": false, "message": "Validation failed.", "errors": [ { "field": "...", "message": "..." } ] }
```

### Role Enum

`founder` | `investor` | `service_provider` | `student` | `admin`

---

## Day 3: Auth System

### POST /auth/register

Register a new user. Auto-creates a Profile with `full_name`.

```json
{ "full_name": "John Doe", "email": "john@example.com", "password": "Test1234!" }
// OR phone-only: "phone": "+2348012345678"
```

**Response:** `201` — Returns `access_token`, `refresh_token`, user object.

### POST /auth/login

```json
{ "email": "john@example.com", "password": "Test1234!" }
// OR: { "phone": "+2348012345678", "password": "Test1234!" }
```

**Response:** `200` — Returns `access_token`, `refresh_token`, user object.

### POST /auth/refresh

Get a new access token using your refresh token.

```json
{ "refreshToken": "eyJhbG..." }
```

### POST /auth/logout 🔒

Invalidates the refresh token (access token remains valid until expiry).

### GET /auth/verify-email?token=xxx

Verify email address via token from verification email.

### POST /auth/forgot-password

Always returns 200 (prevents email enumeration).

```json
{ "email": "john@example.com" }
```

### PATCH /auth/reset-password

```json
{ "token": "abc123...", "password": "NewPass1234!" }
```

### PATCH /auth/change-password 🔒

```json
{ "current_password": "OldPass123!", "new_password": "NewPass456!" }
```

### PATCH /auth/onboarding 🔒

Sets country, business_type, and role. Sets `onboarding_complete: true`.

```json
{ "country": "Nigeria", "business_type": "Technology", "role": "founder" }
```

### GET /auth/me 🔒

Returns the current user + their profile in one call.

---

## Day 4: Member Profile

All 🔒. Base: `/profiles`

### GET /profiles/me 🔒
### PUT /profiles/me 🔒

Update any profile fields:
```json
{ "full_name": "John Doe", "business_name": "Doe Ventures", "description": "Building...", "industry": "Tech", "location": "Lagos, Nigeria", "services": ["Consulting", "Import/Export"], "origin_country": "Nigeria", "current_country": "Ghana", "show_in_diaspora": true, "website": "https://example.com", "linkedin": "johndoe", "whatsapp": "+2348012345678" }
```

### POST /profiles/me/picture 🔒

Content-Type: `multipart/form-data`. Field: `profile` (jpg/jpeg/png/webp, max 5MB).

### DELETE /profiles/me/picture 🔒

Removes profile picture.

### GET /profiles?page=1&limit=20&industry=Tech&country=Nigeria 🔒

Browse profiles with pagination + filters.

### GET /profiles/:id 🔒

Get single profile by ID.

---

## Day 5: Posts & Categories

All 🔒. Base: `/posts` and `/categories`

### Post Types (14 enums)

| Section | Types |
|---------|-------|
| **Home Feed** | `OPPORTUNITY`, `UPDATE`, `DEAL`, `ANNOUNCEMENT` |
| **Business Exchange** | `NEED_HELP`, `INVESTMENT`, `PARTNERSHIP`, `SUPPLIER_REQUEST`, `BUSINESS_OFFER`, `JOB` |
| **Learning** | `LEARNING` |
| **Support** | `SUPPORT_REQUEST` |
| **Diaspora** | `DIASPORA_PARTNER`, `DIASPORA_INVESTOR` |

### POST /posts 🔒

```json
{ "type": "OPPORTUNITY", "title": "Business opportunity", "description": "Looking for partners...", "category_id": "...", "video_url": "https://...", "location": "Lagos, Nigeria", "tags": ["retail", "lagos"] }
```

### GET /posts?page=1&limit=20&type=OPPORTUNITY&category=general-business&search=lagos&tags=retail,startup&location=Lagos&featured=true 🔒

Paginated feed with filters. Featured posts sort first, then by newest.

### GET /posts/:id 🔒
### PUT /posts/:id 🔒 (owner only)
### DELETE /posts/:id 🔒 (owner only)
### GET /posts/my?page=1&limit=20 🔒 (current user's posts)
### POST /posts/:id/image 🔒 (owner only, Cloudinary upload)

### GET /categories?type=community|learning|exchange 🔒
### GET /categories/:id 🔒

---

## Day 6: Business Exchange

No new endpoints — the existing posts system handles exchange via type filter:

```bash
GET /posts?type=NEED_HELP        # Need Help posts
GET /posts?type=INVESTMENT       # Investment opportunities
GET /posts?type=PARTNERSHIP      # Partnership requests
GET /posts?type=SUPPLIER_REQUEST # Supplier requests
GET /posts?type=BUSINESS_OFFER   # Business offers
GET /posts?type=JOB              # Job listings
```

---

## Day 7: Comments & Reactions

All 🔒. Base: `/comments` and `/reactions`

### Comments

| Endpoint | Description |
|----------|-------------|
| `POST /comments` | Create comment. Body: `{ post_id, content, parent_id? }` |
| `GET /comments?post_id=xxx&page=1&limit=20` | Get comments for a post (top-level + nested replies) |
| `GET /comments/:id` | Get single comment with its replies |
| `PUT /comments/:id` | Update own comment |
| `DELETE /comments/:id` | Delete own comment + its replies |

**Comment nesting:** 1 level deep. Set `parent_id` for replies.

### Reactions

| Endpoint | Description |
|----------|-------------|
| `POST /reactions` | Toggle reaction. Body: `{ type, post_id?|comment_id? }` |
| `GET /reactions?post_id=xxx` | Get reactions for a post |
| `GET /reactions?comment_id=xxx` | Get reactions for a comment |

**Reaction types:** `like` | `love` | `insightful` | `support`

**Toggle logic:** Same type → removes it. Different type → updates it. New → creates it.

### 🔔 Notification Triggers (auto-created)

- **Comment on your post** → `post_comment` notification
- **Reply to your comment** → `comment_reply` notification  
- **Reaction on your post** → `post_reaction` notification

---

## Day 8: Learning Section

No new endpoints — filter posts by type:

```bash
GET /posts?type=LEARNING&category=business-growth
```

Learning categories auto-seeded: `Business Growth`, `Sales & Marketing`, `Finance`, `Export/Trade`.

---

## Day 9: Diaspora Hub & Support Board

No new endpoints — filter by type:

```bash
GET /posts?type=DIASPORA_PARTNER   # Diaspora partners
GET /posts?type=DIASPORA_INVESTOR  # Diaspora investors
GET /posts?type=SUPPORT_REQUEST    # Business support
```

---

## Day 10: Connections, Notifications & Admin

### Connections 🔒

Base: `/connections`

| Endpoint | Description |
|----------|-------------|
| `POST /connections` | Send request. Body: `{ receiver_id }` |
| `GET /connections?status=pending&page=1&limit=20` | List your connections |
| `GET /connections/pending` | Get pending requests sent to you |
| `PATCH /connections/:id` | Accept/reject. Body: `{ status: "accepted"|"rejected" }` |
| `DELETE /connections/:id` | Remove/disconnect |

**🔔 Notification triggers:** `connection_request` on send, `connection_accepted` on accept.

### Notifications 🔒

Base: `/notifications`

| Endpoint | Description |
|----------|-------------|
| `GET /notifications?page=1&limit=20&unread=true` | List your notifications (newest first, unread first) |
| `PATCH /notifications/:id/read` | Mark one as read |
| `PATCH /notifications/read-all` | Mark all as read |
| `DELETE /notifications/:id` | Delete a notification |

**Notification types:** `new_opportunity` | `post_comment` | `comment_reply` | `post_reaction` | `connection_request` | `connection_accepted` | `member_verified` | `post_featured` | `system`

### Admin Panel 🔒 (admin role only)

Base: `/admin`

| Endpoint | Description |
|----------|-------------|
| `GET /admin/stats` | Dashboard stats (users, posts, reports, etc.) |
| `GET /admin/users?page=1&limit=20&role=founder&is_verified=true&is_banned=false&search=john` | List/manage users |
| `PATCH /admin/users/:id/ban` | Toggle ban (admins can't ban other admins) |
| `PATCH /admin/users/:id/verify` | Toggle verification badge |
| `GET /admin/posts?page=1&limit=20&is_flagged=true&type=OPPORTUNITY&search=keyword` | List all posts |
| `PATCH /admin/posts/:id/flag` | Toggle flag (moderate content) |
| `PATCH /admin/posts/:id/feature` | Toggle featured status |
| `DELETE /admin/posts/:id` | Delete any post |
| `GET /admin/reports?is_resolved=false` | View reports |
| `PATCH /admin/reports/:id/resolve` | Mark report resolved |

---

## Testing Your API

### Option 1: Automated Test Suite

```bash
cd server
bash test-api.sh
```

This runs 50+ tests: registers users, creates posts (all 14 types), tests filters, pagination, comments (with nesting), reactions (toggle), connections, notifications, admin operations, validation errors, and auth checks.

### Option 2: Curl Reference

```bash
cd server
bash curl-reference.sh    # Interactive — setup once, then run any command
```

### Option 3: Test Individual Days

```bash
# Day 3 — Auth
curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!","full_name":"Tester"}' | python3 -m json.tool

# Day 4 — Profile
curl -s http://localhost:5000/api/profiles/me \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# Day 5 — Create a post
curl -s -X POST http://localhost:5000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"type":"OPPORTUNITY","title":"Test post","description":"Testing"}' | python3 -m json.tool

# Day 7 — Comment on the post
curl -s -X POST http://localhost:5000/api/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"post_id":"POST_ID","content":"Nice post!"}' | python3 -m json.tool

# Day 7 — React to the post
curl -s -X POST http://localhost:5000/api/reactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"type":"like","post_id":"POST_ID"}' | python3 -m json.tool

# Day 10 — Send connection request
curl -s -X POST http://localhost:5000/api/connections \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"receiver_id":"OTHER_PROFILE_ID"}' | python3 -m json.tool

# Day 10 — Check notifications
curl -s http://localhost:5000/api/notifications \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# Day 10 — Admin (requires admin role)
curl -s http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer $ADMIN_TOKEN" | python3 -m json.tool
```

---

## Error Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| `400` | Bad Request | Validation errors, missing fields, invalid type |
| `401` | Unauthorized | Missing/invalid/expired token |
| `403` | Forbidden | Not the owner, banned account, not admin |
| `404` | Not Found | Post/comment/user/profile doesn't exist |
| `409` | Conflict | Duplicate email or phone |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Server Error | Something went wrong on our end |

---

## Rate Limiting

| Scope | Limit | Applies To |
|-------|-------|------------|
| **Global** | 200 req / 15 min | All endpoints |
| **Auth** | 20 req / 15 min (200 in dev) | Login, register, forgot-password |

---

## Key Design Decisions

1. **Single `posts` collection** powers Feed, Exchange, Community, Learning, Diaspora Hub, and Support Board — differentiated by the `type` enum (14 values)

2. **1-level comment nesting** — `parent_id` on Comment model. Replies can only exist at depth 1 (no nested replies to replies)

3. **Reactions** — Uses either `post_id` or `comment_id` (never both), enforced at schema + controller level

4. **Denormalized counters** — `comment_count` and `reaction_count` on the Post model for fast reads without aggregation

5. **Notification triggers** — Built into comment/reaction/connection controllers. The `notificationService.js` utility keeps creation clean

6. **JWT access tokens are stateless** — They remain valid until expiry. `/logout` only invalidates the refresh token. For full invalidation, use short expiry (15 min recommended in production) or add a token blacklist

7. **Admin role** — Protected by `restrictTo('admin')` middleware. Admin users are created via MongoDB direct update (not through the API for security)
