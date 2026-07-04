# 5. API Route Map

Legend: (none) = public, [Auth] = login required, [Admin] = admin role required

## Auth (/api/auth) -- 10 endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /register | -- | Create user + profile, return tokens |
| POST | /login | -- | Verify credentials, return tokens |
| POST | /refresh | -- | Swap refresh token for new access token |
| POST | /logout | [Auth] | Invalidate refresh token |
| GET | /verify-email | -- | Verify email via token query param |
| POST | /forgot-password | -- | Send reset email (always 200) |
| PATCH | /reset-password | -- | Reset password with token |
| PATCH | /change-password | [Auth] | Change password (needs old password) |
| PATCH | /onboarding | [Auth] | Set role/country/business_type |
| GET | /me | [Auth] | Get current user + profile |

## Profiles (/api/profiles) -- 6 endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | / | [Auth] | List profiles (paginated, filterable) |
| GET | /me | [Auth] | Get own profile |
| PUT | /me | [Auth] | Update own profile |
| POST | /me/picture | [Auth] | Upload profile picture (multipart) |
| DELETE | /me/picture | [Auth] | Remove profile picture |
| GET | /:id | [Auth] | Get profile by ID |

## Posts (/api/posts) -- 7 endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | / | [Auth] | Create post (14 types) |
| GET | / | [Auth] | List posts (type/tags/search/location filters + pagination) |
| GET | /my | [Auth] | List current user's posts |
| GET | /:id | [Auth] | Get single post |
| PUT | /:id | [Auth] | Update own post |
| DELETE | /:id | [Auth] | Delete own post |
| POST | /:id/image | [Auth] | Upload post image (multipart) |

## Categories (/api/categories) -- 2 endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | / | [Auth] | List categories (filter by type: community/learning/exchange) |
| GET | /:id | [Auth] | Get single category |

## Comments (/api/comments) -- 5 endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | / | [Auth] | Create comment (top-level or reply with parent_id) |
| GET | / | [Auth] | List comments for a post (with nested replies) |
| GET | /:id | [Auth] | Get comment + its replies |
| PUT | /:id | [Auth] | Update own comment |
| DELETE | /:id | [Auth] | Delete own comment + its replies |

## Reactions (/api/reactions) -- 2 endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | / | [Auth] | Toggle reaction (creates/updates/removes) |
| GET | / | [Auth] | Get reactions for a post or comment |

## Connections (/api/connections) -- 5 endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | / | [Auth] | Send connection request |
| GET | / | [Auth] | List connections (filter by status) |
| GET | /pending | [Auth] | List pending requests (sent to current user) |
| PATCH | /:id | [Auth] | Accept or reject request |
| DELETE | /:id | [Auth] | Remove/disconnect |

## Notifications (/api/notifications) -- 4 endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | / | [Auth] | List notifications (unread filter, paginated) |
| PATCH | /:id/read | [Auth] | Mark single notification as read |
| PATCH | /read-all | [Auth] | Mark all as read |
| DELETE | /:id | [Auth] | Delete notification |

## Admin (/api/admin) -- 10 endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /stats | [Admin] | Dashboard statistics (counts) |
| GET | /users | [Admin] | List users (role/verify/ban/search filters) |
| PATCH | /users/:id/ban | [Admin] | Toggle user ban (cannot ban admins) |
| PATCH | /users/:id/verify | [Admin] | Toggle verification badge |
| GET | /posts | [Admin] | List all posts (flag/type/search filters) |
| PATCH | /posts/:id/flag | [Admin] | Toggle post flag (moderate content) |
| PATCH | /posts/:id/feature | [Admin] | Toggle featured status |
| DELETE | /posts/:id | [Admin] | Delete any post |
| GET | /reports | [Admin] | List reports (filter by resolved status) |
| PATCH | /reports/:id/resolve | [Admin] | Mark report resolved |

**Total: 51 API endpoints across 9 route modules**
