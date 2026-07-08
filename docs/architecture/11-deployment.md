# 11. Deployment Architecture

## Target Platforms

| Component | Platform | Purpose |
|-----------|----------|---------|
| Frontend | Vercel | Static site hosting (Vite build output) |
| Backend | Render | Node.js Express web service |
| Database | MongoDB Atlas | Managed MongoDB (free tier M0) |
| File Storage | Cloudinary | Image upload CDN |
| Email | Nodemailer (SMTP) | Verification + password reset emails |

## Deployment Diagram

```
+------------------+     +------------------+
|   Vercel          |     |   Render          |
|   (Frontend)     |     |   (Backend)       |
|                  |     |                  |
|  Vite build ->   |     |  Node.js Express  |
|  static files    |     |  server.js        |
|                  |     |                  |
|  Environment:    |     |  Environment:     |
|  VITE_API_URL    |---->|  MONGODB_URI      |
|                  |     |  JWT_SECRET       |
|                  |     |  CLOUDINARY_*     |
|                  |     |  NODE_ENV=prod    |
|                  |     |  CLIENT_URL       |
+------------------+     +--------+---------+
                                   |
                                   v
                          +------------------+
                          |  MongoDB Atlas    |
                          |  (Database)       |
                          |                  |
                          |  Free tier M0     |
                          |  IP whitelist     |
                          |  Auth: SCRAM     |
                          +------------------+
```

## Environment Variables

### Frontend (Vercel)

```
VITE_API_URL=https://luxrear-api.onrender.com/api
```

### Backend (Render)

```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.xxxxx.mongodb.net/luxrear?retryWrites=true&w=majority
JWT_SECRET=<random-64-char-string>
JWT_REFRESH_SECRET=<random-64-char-string>
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=https://luxrear.vercel.app
CLOUDINARY_CLOUD_NAME=<cloud-name>
CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=no-reply@luxrear.com
SMTP_PASS=<app-password>
EMAIL_FROM=LUXREAR <no-reply@luxrear.com>
NODE_ENV=production
```

## Build & Deploy Commands

### Frontend Build

```bash
npm run build   # Outputs to dist/
# Deploy: connect Vercel to GitHub repo, set VITE_API_URL
```

### Backend Build

```bash
# Render auto-deploys from GitHub
# Start command: npm start
# Node version: 18+
```

## Production Checklist

| Task | Status |
|------|--------|
| Set NODE_ENV=production | Done (in Render env) |
| Enable MongoDB Atlas IP whitelist | Pending |
| Configure custom domain (Vercel) | Pending |
| Configure custom domain (Render) | Pending |
| Set up Cloudinary production account | Pending |
| Configure SMTP for production email | Pending |
| Enable HTTPS (automatic on Vercel/Render) | Automatic |
| Run test suite against production | Pending |
| Set up monitoring / logging | Pending |
```
