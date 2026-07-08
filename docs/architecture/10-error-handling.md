# 10. Error Handling Strategy

## Standard Error Response Format

```json
{
  "success": false,
  "message": "Human-readable error description.",
  "errors": [
    { "field": "email", "message": "Valid email is required." }
  ]
}
```

## Error Classification

| Error Type | HTTP Code | Example |
|-----------|-----------|---------|
| Validation | 400 | Missing required field, invalid email format |
| Unauthorized | 401 | No token, expired token, invalid signature |
| Forbidden | 403 | Not resource owner, banned user, not admin |
| Not Found | 404 | Post doesn't exist, user not found |
| Conflict | 409 | Duplicate email, duplicate phone |
| Rate Limited | 429 | Too many auth attempts in window |
| Server Error | 500 | Unhandled exception, DB connection lost |

## Error Flow

```
Any layer throws
       |
       v
Global errorHandler (errorHandler.js)
  |-- Maps error.name/code to HTTP status
  |      Mongoose duplicate key (1100) -> 409
  |      Mongoose ValidationError -> 400
  |      Mongoose CastError -> 400
  |      JsonWebTokenError -> 401
  |      TokenExpiredError -> 401
  |-- Normalizes to { success: false, message }
  |-- Attaches field errors if validation middleware
  |-- Includes stack trace in development only
  +-- Returns JSON response
```

## Validation Error Flow (express-validator)

```
Route defines validation chain
       |
       v
Request arrives
       |
       v
validate.js middleware
  |-- Runs validationResult(req)
  |-- If errors -> returns 400 with field-level array
  +-- If clean -> calls next()
       |
       v
Controller executes
```

## Common Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| email | isEmail(), normalizeEmail() | "Please provide a valid email address." |
| password | isLength({ min: 8 }), matches(has uppercase + number) | "Password must be at least 8 characters..." |
| phone | matches(/^\+?[\d\s-]{7,15}$/) | "Please provide a valid phone number." |
| post type | isIn(POST_TYPES) | "Invalid post type." |
| reaction type | isIn(['like', 'love', 'insightful', 'support']) | "Invalid reaction type." |
| comment content | notEmpty(), trim() | "Comment content is required." |
```
