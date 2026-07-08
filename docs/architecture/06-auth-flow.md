# 6. Authentication Flow

## Registration Flow

```
Client                    Server                        MongoDB
  |                         |                             |
  |  POST /auth/register    |                             |
  |  {email,password,name}  |                             |
  | ----------------------->|                             |
  |                         |  Validate input             |
  |                         |  Check duplicates           |
  |                         |  Hash password (bcrypt,12)  |
  |                         |  Create User document       |------> Users
  |                         |  Create Profile document    |------> Profiles
  |                         |  Generate JWT pair          |
  |                         |  (access + refresh)         |
  |                         |  Hash refresh token         |------> User.refresh_token
  |                         |                             |
  | <-----------------------|                             |
  |  201 {                  |                             |
  |    access_token,        |                             |
  |    refresh_token,       |                             |
  |    user: {id, email,    |                             |
  |    role, profile}       |                             |
  |  }                      |                             |
```

## Login Flow

```
Client                    Server                        MongoDB
  |                         |                             |
  |  POST /auth/login       |                             |
  |  {email, password}      |                             |
  | ----------------------->|                             |
  |                         |  Find user by email/phone   |------> Users
  |                         |  (include password field)   |
  |                         |  bcrypt.compare(password)   |
  |                         |  Check is_banned            |
  |                         |  Generate new JWT pair      |
  |                         |  Hash + save refresh token  |------> User.refresh_token
  |                         |                             |
  | <-----------------------|                             |
  |  200 {                  |                             |
  |    access_token,        |                             |
  |    refresh_token,       |                             |
  |    user: {...}          |                             |
  |  }                      |                             |
```

## Token Refresh Flow

```
Client                    Server                        MongoDB
  |                         |                             |
  |  POST /auth/refresh     |                             |
  |  {refreshToken}         |                             |
  | ----------------------->|                             |
  |                         |  Verify JWT signature       |
  |                         |  Find user by decoded.id    |------> Users (+refresh_token)
  |                         |  bcrypt.compare(token,      |
  |                         |    stored hash)             |
  |                         |  Generate new tokens        |
  |                         |  Hash + save new refresh    |------> User.refresh_token
  |                         |                             |
  | <-----------------------|                             |
  |  200 {                  |                             |
  |    access_token,        |                             |
  |    refresh_token        |                             |
  |  }                      |                             |
```

## Protected Route Request

```
Client                    Server                        MongoDB
  |                         |                             |
  |  GET /api/posts         |                             |
  |  Authorization:         |                             |
  |  Bearer <access_token>  |                             |
  | ----------------------->|                             |
  |                         |  middleware: protect()      |
  |                         |  |-- Extract Bearer token   |
  |                         |  |-- jwt.verify(token)      |
  |                         |  |-- Find user by decoded.id|------> Users
  |                         |  |-- Check is_banned        |
  |                         |  +-- Attach req.user        |
  |                         |                             |
  |                         |  controller: getPosts()     |
  |                         |  |-- Parse query params     |
  |                         |  |-- Build MongoDB filter   |
  |                         |  |-- .find().sort().skip()  |------> Posts
  |                         |  |-- Populate profile       |
  |                         |  +-- Return paginated       |
  |                         |                             |
  | <-----------------------|                             |
  |  200 {                  |                             |
  |    data: [...],         |                             |
  |    pagination: {...}    |                             |
  |  }                      |                             |
```

## Admin Restricted Route

```
Client                    Server                        MongoDB
  |                         |                             |
  |  GET /api/admin/stats   |                             |
  |  Bearer <admin_token>   |                             |
  | ----------------------->|                             |
  |                         |  protect() -> req.user      |
  |                         |  restrictTo('admin')        |
  |                         |  +-- req.user.role !==      |
  |                         |       'admin' -> 403        |
  |                         |                             |
  | <-----------------------|                             |
  |  200 {stats}            |     OR                      |
  |                         |                             |
  | <-----------------------|                             |
  |  403 {message:          |                             |
  |  "You do not have       |                             |
  |  permission..."}        |                             |
```

## JWT Token Format

```
Access Token (24h expiry):
  Header: { alg: "HS256", typ: "JWT" }
  Payload: { id: user._id, iat: timestamp, exp: timestamp }
  Signature: HMAC-SHA256(base64url(header) + "." + base64url(payload), JWT_SECRET)

Refresh Token (7d expiry):
  Header: { alg: "HS256", typ: "JWT" }
  Payload: { id: user._id, iat: timestamp, exp: timestamp }
  Signature: HMAC-SHA256(base64url(header) + "." + base64url(payload), JWT_REFRESH_SECRET)
```

## Password Flow

- **Hashing:** bcrypt with 12 salt rounds (User.js pre-save hook)
- **Verification:** `user.comparePassword(candidate)` compares against stored hash
- **Reset:** crypto.randomBytes token, stored hashed with 1h expiry
- **Change:** Requires `current_password` for verification before accepting `new_password`
