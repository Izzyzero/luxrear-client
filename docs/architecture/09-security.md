# 9. Security Architecture

## Layers of Defense

```
Layer 1: Network
|-- HTTPS (TLS) -- all traffic encrypted
|-- rate-limiting -- 200 req/15min global, 20/15min auth routes
+-- CORS -- only CLIENT_URL origin allowed

Layer 2: HTTP Headers (Helmet)
|-- Content-Security-Policy (CSP)
|-- X-Content-Type-Options: nosniff
|-- X-Frame-Options: DENY
|-- X-XSS-Protection: 0
|-- Strict-Transport-Security
+-- Referrer-Policy

Layer 3: Authentication
|-- Passwords: bcrypt, 12 rounds
|-- JWTs: HMAC-SHA256 signed
|-- Access tokens: short-lived (24h default)
|-- Refresh tokens: longer-lived (7d), stored hashed
|-- Email verification tokens: random crypto bytes
|-- Password reset tokens: random crypto bytes + 1h expiry
+-- Token expiry checked in middleware

Layer 4: Authorization
|-- protect middleware: verifies JWT, checks user exists & not banned
|-- restrictTo middleware: role-based access
|-- Owner checks: controller verifies profile_id matches req.user
+-- Sensitive fields excluded from queries (select: false)

Layer 5: Input Validation
|-- express-validator: checks all inputs before controller
|-- Mongoose schema validation (required, enum, maxlength)
|-- Multer file validation (size limit: 5MB, allowed MIME types)
+-- Rate limiting prevents brute force

Layer 6: Error Handling
|-- Global error handler catches all exceptions
|-- No stack traces in production responses
|-- Duplicate key -> 409 (not 500)
|-- Validation errors -> 400 with field-level messages
+-- CastError (invalid ObjectId) -> 400
```

## Security Measures Checklist

| Measure | Implemented | Location |
|---------|-------------|----------|
| Password hashing (bcrypt, 12 rounds) | Yes | User.js (pre-save hook) |
| JWT with expiry | Yes | utils/jwt.js |
| Refresh token rotation | Yes | authController.js |
| Email verification | Yes | authController.js |
| Password reset with expiry | Yes | User model (fields + middleware) |
| Rate limiting | Yes | app.js (global + auth-specific) |
| Helmet security headers | Yes | app.js |
| CORS whitelist | Yes | app.js |
| Input validation | Yes | Route files (express-validator) |
| MongoDB injection prevention | Yes | Mongoose parameterized queries |
| Ban check on every request | Yes | auth.js (protect middleware) |
| Owner-only resource modification | Yes | Each controller |
| Role-based admin access | Yes | auth.js (restrictTo) |
| No stack traces in production | Yes | errorHandler.js |
| Token not in query params | Yes | Only Authorization header |
| File upload validation | Yes | upload.js (multer + limits) |

## CSP Headers (via Helmet)

Helmet's default CSP is applied, which includes:
- Script sources: self (inline scripts allowed with nonce)
- Style sources: self (inline styles allowed)
- Font sources: self
- Image sources: self and data:
- Connect sources: self (and CLIENT_URL in development)
- Frame sources: none (X-Frame-Options: DENY equivalent)

## Rate Limiting Configuration

| Limiter | Requests | Window | Applied To |
|---------|----------|--------|------------|
| Global | 200 | 15 minutes | All /api/* routes |
| Auth | 20 (200 in dev) | 15 minutes | /api/auth/* |

## Mongoose Field Security

Fields with `select: false` in User model:
- `password` -- never returned in queries
- `email_verification_token` -- never returned
- `email_verification_expires` -- never returned
- `password_reset_token` -- never returned
- `password_reset_expires` -- never returned
- `refresh_token` -- never returned

These must be explicitly selected with `.select('+password')` when needed (e.g., login).
