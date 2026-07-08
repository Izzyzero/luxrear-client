# 3. Backend Architecture

## Middleware Pipeline (order matters)

```
Request
  |
  v
helmet()              --  Sets security HTTP headers (CSP, XSS, etc.)
  |
  v
cors()                --  Allows frontend origin (CLIENT_URL env)
  |
  v
rateLimit()           --  200 req/15min global, 20/15min for auth
  |
  v
morgan('dev')         --  HTTP request logging
  |
  v
express.json()        --  Parse JSON bodies
  |
  v
Router: /api/*        --  9 route modules
  |
  v
errorHandler          --  Global error handler (catches everything)
```

## Module Organization

```
server/src/
├── config/              # Infrastructure setup
│   ├── db.js            #   MongoDB connection via Mongoose
│   └── cloudinary.js    #   Cloudinary SDK config
├── middleware/          # Express middleware
│   ├── auth.js          #   protect, restrictTo, optionalAuth
│   ├── validate.js      #   express-validator result checker
│   ├── upload.js        #   Multer + Cloudinary streaming upload
│   └── errorHandler.js  #   Global error normalization
├── controllers/         # Request handlers
│   ├── authController.js
│   ├── profileController.js
│   ├── postController.js
│   ├── categoryController.js
│   ├── commentController.js
│   ├── reactionController.js
│   ├── connectionController.js
│   ├── notificationController.js
│   └── adminController.js
├── models/              # Mongoose schemas (9 total)
│   ├── User.js
│   ├── Profile.js
│   ├── Category.js
│   ├── Post.js
│   ├── Comment.js
│   ├── Reaction.js
│   ├── Connection.js
│   ├── Notification.js
│   └── Report.js
├── routes/              # Express Router definitions
│   ├── index.js         #   Aggregates all route modules
│   ├── authRoutes.js
│   ├── profileRoutes.js
│   ├── postRoutes.js
│   ├── categoryRoutes.js
│   ├── commentRoutes.js
│   ├── reactionRoutes.js
│   ├── connectionRoutes.js
│   ├── notificationRoutes.js
│   └── adminRoutes.js
├── utils/               # Shared utilities
│   ├── jwt.js
│   ├── email.js
│   ├── apiResponse.js
│   ├── seedCategories.js
│   └── notificationService.js
├── server.js            # Entry point
└── app.js               # Express app factory (for testability)
```

## Controller Pattern

```
Controller receives (req, res, next)
  |
  |-- 1. Extract data from req.body/req.params/req.query/req.user
  |
  |-- 2. Call Mongoose model methods (CRUD)
  |
  |-- 3. For create/update: trigger side effects (notifications)
  |
  |-- 4. Return standardized response via apiResponse helpers
  |       +-- successResponse(res, 200, msg, data)
  |       +-- errorResponse(res, 400, msg, errors?)
  |       +-- paginatedResponse(res, msg, data, pagination)
  |
  +-- 5. On error: pass to next(error) -> caught by errorHandler
```

## Response Helpers (apiResponse.js)

| Function | Description |
|----------|-------------|
| `successResponse(res, statusCode, message, data)` | Single-object success |
| `errorResponse(res, statusCode, message, errors)` | Error with optional field array |
| `paginatedResponse(res, message, data, pagination)` | Paginated list response |

All responses use the envelope: `{ success: boolean, message: string, data?, errors?, pagination? }`

## Auth Middleware

| Function | Description |
|----------|-------------|
| `protect` | Requires valid Bearer token. Checks user exists + not banned. Attaches `req.user` |
| `restrictTo(...roles)` | Checks `req.user.role` is in allowed roles list |
| `optionalAuth` | Attaches `req.user` if valid token present, but does not block anonymous requests |
