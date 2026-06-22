# LUXREAR Business Club — Backend API

> Private business network for African entrepreneurs and diaspora professionals.

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Create .env file (see .env.example)
cp .env.example .env
# Fill in your values: PORT, MONGODB_URI, JWT secrets, Cloudinary credentials

# 3. Start the server
npm run dev
```

Server runs on `http://localhost:5000` by default.

---

## API Base URL

```
http://localhost:5000/api
```

All endpoints below are relative to this base URL.

---

## Authentication

Most endpoints require a JWT access token. Include it in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

You get the access token from the `/auth/register` or `/auth/login` response.

---

## User Journey (Frontend Flow)

The frontend should guide users through this sequence automatically:

```
1. Register → POST /auth/register
   ↓ (onboarding_complete: false)
2. Onboarding → PATCH /auth/onboarding
   ↓ (onboarding_complete: true)
3. Profile Setup → PUT /profiles/me
   ↓
4. Upload Photo → POST /profiles/me/picture
   ↓
5. Home Feed → GET /posts (coming soon)
```

**How to check:** After login, check `user.onboarding_complete`:
- `false` → redirect to onboarding page
- `true` → redirect to home feed

---

## Response Format

All responses follow this structure:

### Success
```json
{
  "success": true,
  "message": "Description of what happened.",
  "data": { ... }
}
```

### Paginated
```json
{
  "success": true,
  "message": "Items fetched.",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

### Error
```json
{
  "success": false,
  "message": "Error description.",
  "errors": [ ... ]   // only for validation errors
}
```

---

## Auth Endpoints

### POST /auth/register

Create a new account. A profile is automatically created with `full_name`.

**Body:**
```json
{
  "full_name": "John Doe",          // required
  "email": "john@example.com",      // required if no phone
  "phone": "08012345678",           // required if no email
  "password": "Password123"         // min 8 chars, must have uppercase, lowercase, and number
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Account created. Please verify your email.",
  "data": {
    "access_token": "eyJhbG...",
    "refresh_token": "eyJhbG...",
    "user": {
      "id": "6856...",
      "email": "john@example.com",
      "phone": null,
      "role": "founder",
      "is_verified": false,
      "onboarding_complete": false
    }
  }
}
```

**Validation errors (400):**
- `full_name` is required
- Either `email` or `phone` is required
- `password` must be at least 8 characters with uppercase, lowercase, and number
- Email must be valid format
- Phone must be valid mobile number

**Conflict (409):**
- Email or phone already registered

---

### POST /auth/login

Login with email or phone + password.

**Body:**
```json
{
  "email": "john@example.com",    // or use "phone": "08012345678"
  "password": "Password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "access_token": "eyJhbG...",
    "refresh_token": "eyJhbG...",
    "user": {
      "id": "6856...",
      "email": "john@example.com",
      "phone": null,
      "role": "founder",
      "is_verified": false,
      "onboarding_complete": false
    }
  }
}
```

**Error (401):** Invalid credentials
**Error (403):** Account has been banned

---

### POST /auth/refresh

Get a new access token using your refresh token.

**Body:**
```json
{
  "refresh_token": "eyJhbG..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed.",
  "data": {
    "access_token": "eyJhbG..."    // new access token
  }
}
```

---

### POST /auth/logout 🔒

Invalidate the refresh token. Requires authentication.

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully."
}
```

> **Note:** The access token remains valid until it expires (15 min by default). For full logout, the frontend should also delete the stored tokens on the client side.

---

### GET /auth/verify-email?token=xxx

Verify a user's email address. Usually opened from a link in the verification email.

**Query params:** `token` (required)

**Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully."
}
```

---

### POST /auth/forgot-password

Request a password reset link sent to the user's email.

**Body:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):** Always returns success (prevents email enumeration):
```json
{
  "success": true,
  "message": "If that email exists, a reset link has been sent."
}
```

---

### PATCH /auth/reset-password

Reset password using the token from the reset email.

**Body:**
```json
{
  "token": "abc123...",
  "password": "NewPassword123"     // min 8 chars, uppercase, lowercase, number
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successful. Please log in."
}
```

---

### PATCH /auth/change-password 🔒

Change password while logged in (requires current password).

**Headers:** `Authorization: Bearer <access_token>`

**Body:**
```json
{
  "current_password": "OldPassword123",
  "new_password": "NewPassword456"    // min 8 chars, uppercase, lowercase, number
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password updated successfully."
}
```

---

### PATCH /auth/onboarding 🔒

Complete onboarding (set country, business type, and role).

**Headers:** `Authorization: Bearer <access_token>`

**Body:**
```json
{
  "country": "Nigeria",
  "business_type": "Retail",
  "role": "founder"              // must be: founder, investor, service_provider, or student
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Onboarding complete.",
  "data": {
    "user": {
      "id": "6856...",
      "role": "founder",
      "country": "Nigeria",
      "business_type": "Retail",
      "onboarding_complete": true
    }
  }
}
```

---

### GET /auth/me 🔒

Get the current authenticated user with their profile.

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Current user fetched.",
  "data": {
    "user": {
      "id": "6856...",
      "email": "john@example.com",
      "phone": null,
      "role": "founder",
      "country": "Nigeria",
      "business_type": "Retail",
      "is_verified": false,
      "onboarding_complete": true,
      "created_at": "2026-06-22T..."
    },
    "profile": {
      "_id": "6856...",
      "user_id": "6856...",
      "full_name": "John Doe",
      "business_name": null,
      "profile_picture": null,
      "description": null,
      "industry": null,
      "location": null,
      "services": [],
      "origin_country": null,
      "current_country": null,
      "show_in_diaspora": false,
      "website": null,
      "linkedin": null,
      "whatsapp": null,
      "created_at": "2026-06-22T...",
      "updated_at": "2026-06-22T..."
    }
  }
}
```

---

## Profile Endpoints

All profile endpoints require authentication.

**Headers:** `Authorization: Bearer <access_token>`

---

### GET /profiles/me

Get your own profile.

**Response (200):**
```json
{
  "success": true,
  "message": "Profile fetched.",
  "data": {
    "profile": {
      "_id": "6856...",
      "user_id": "6856...",
      "full_name": "John Doe",
      "business_name": null,
      "profile_picture": null,
      "description": null,
      "industry": null,
      "location": null,
      "services": [],
      "origin_country": null,
      "current_country": null,
      "show_in_diaspora": false,
      "website": null,
      "linkedin": null,
      "whatsapp": null,
      "created_at": "...",
      "updated_at": "..."
    }
  }
}
```

---

### PUT /profiles/me

Update your profile. Send only the fields you want to change.

**Body (all fields optional):**
```json
{
  "full_name": "John Doe",
  "business_name": "Doe Enterprises",
  "description": "Building the future of African trade",
  "industry": "Tech",
  "location": "Lagos, Nigeria",
  "services": ["Consulting", "Import/Export"],
  "origin_country": "Nigeria",
  "current_country": "Ghana",
  "show_in_diaspora": true,
  "website": "https://doe.com",
  "linkedin": "johndoe",
  "whatsapp": "+2348012345678"
}
```

**Validation:**
- `full_name` — max 100 chars, cannot be empty
- `business_name` — max 150 chars
- `description` — max 1000 chars
- `services` — must be an array of strings
- `show_in_diaspora` — must be boolean (true/false)
- `website` — must be a valid URL

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated.",
  "data": {
    "profile": { ... updated profile ... }
  }
}
```

---

### POST /profiles/me/picture

Upload a profile picture. Sends image to Cloudinary.

**Content-Type:** `multipart/form-data`

**Body:** `profile_picture` (image file: jpg, jpeg, png, webp, max 5MB)

**Response (200):**
```json
{
  "success": true,
  "message": "Profile picture uploaded.",
  "data": {
    "profile_picture": "https://res.cloudinary.com/.../luxrear/profiles/abc123.jpg",
    "profile": { ... updated profile ... }
  }
}
```

---

### DELETE /profiles/me/picture

Remove your profile picture.

**Response (200):**
```json
{
  "success": true,
  "message": "Profile picture removed.",
  "data": {
    "profile": { ... profile with picture set to null ... }
  }
}
```

---

### GET /profiles?page=1&limit=20&industry=Tech&country=Nigeria

Browse all profiles with pagination and filters.

**Query params (all optional):**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page (max 100) |
| `industry` | string | — | Filter by industry (case-insensitive, partial match) |
| `country` | string | — | Filter by location/country (case-insensitive, partial match) |

**Response (200):**
```json
{
  "success": true,
  "message": "Profiles fetched.",
  "data": [ ... array of profiles ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

---

### GET /profiles/:id

Get a single profile by its ID.

**URL:** `/profiles/6856abc123...`

**Response (200):**
```json
{
  "success": true,
  "message": "Profile fetched.",
  "data": {
    "profile": { ... }
  }
}
```

**Error (400):** Invalid profile ID
**Error (404):** Profile not found

---

## Coming Soon (Not Yet Built)

These endpoints are planned but not yet implemented:

| Module | Endpoints | Status |
|--------|-----------|--------|
| Posts (Feed, Exchange, Learning, Community, Diaspora, Support) | CRUD + filters | 🔜 Day 5-9 |
| Comments | CRUD, nested replies | 🔜 Day 7 |
| Reactions | Like/Love/Insightful/Support | 🔜 Day 7 |
| Connections | Send/Accept/Reject/Block | 🔜 Day 9 |
| Notifications | List, Mark read | 🔜 Day 10 |
| Categories | List by type | 🔜 Day 5 |
| Admin | Ban/Verify users, Moderate posts | 🔜 Day 10 |

---

## Error Handling

All errors return this format:

```json
{
  "success": false,
  "message": "Error description."
}
```

Validation errors include details:

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": [
    { "field": "email", "message": "Invalid email address" },
    { "field": "password", "message": "Password must be at least 8 characters" }
  ]
}
```

**Common HTTP status codes:**
| Code | Meaning |
|------|---------|
| 400 | Bad request / validation error |
| 401 | Not authenticated / invalid credentials |
| 403 | Forbidden / banned account |
| 404 | Not found |
| 409 | Conflict (duplicate email/phone) |
| 500 | Server error |

---

## Rate Limiting

- **Global:** 200 requests per 15 minutes
- **Auth endpoints** (login, register, forgot-password): 20 requests per 15 minutes (200 in development)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB Atlas |
| File Storage | Cloudinary |
| Auth | JWT (access + refresh tokens) |
| Validation | express-validator |

---

## Project Structure

```
server/
├── src/
│   ├── config/          # Database & Cloudinary config
│   ├── controllers/     # Route handlers
│   ├── middleware/       # Auth, validation, upload, error handler
│   ├── models/          # Mongoose schemas (9 collections)
│   ├── routes/          # Express route definitions
│   └── utils/           # JWT, email, API response helpers
├── .env.example         # Environment variable template
├── package.json
└── README.md            # This file
```