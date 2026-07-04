# LUXREAR Business Club (LBC)

> **A mobile-first private business network** where African entrepreneurs and diaspora professionals connect, generate opportunities, solve business problems, and grow together in one trusted ecosystem.

---

## Overview

LUXREAR is a **Progressive Web App (PWA)** that creates a trusted private business ecosystem. It is NOT a marketplace (Jumia), NOT corporate networking (LinkedIn), and NOT social media (Facebook). It's a private business club built specifically for the African market.

### Who It's For

| Member Type | Description |
|-------------|-------------|
| **Founders** | Business owners seeking partners, funding, and growth |
| **Investors** | Angels and VCs looking for African opportunities |
| **Service Providers** | Consultants, agencies, professionals offering services |
| **Students** | Aspiring entrepreneurs learning the ropes |
| **Diaspora Professionals** | Africans abroad looking to invest or partner locally |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + Vite 8 + Tailwind CSS 4 |
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB Atlas |
| **Auth** | JWT (access + refresh tokens, bcrypt) |
| **File Storage** | Cloudinary |
| **Validation** | express-validator + Zod |
| **HTTP Security** | Helmet + CORS + Rate Limiting |
| **Icons** | lucide-react |

---

## Project Structure

```
luxrear-client/
├── public/                  # Static assets
├── server/                  # Backend API (Express)
│   ├── src/
│   │   ├── config/          # MongoDB + Cloudinary connection
│   │   ├── controllers/     # 9 controllers (one per module)
│   │   ├── middleware/       # auth, validation, upload, error handler
│   │   ├── models/          # 9 Mongoose schemas
│   │   ├── routes/          # 9 route files
│   │   └── utils/           # JWT, email, API response, notifications
│   ├── test-api.sh          # Complete API test suite
│   ├── curl-reference.sh    # Copy-pasteable curl commands
│   ├── .env.example
│   ├── package.json
│   └── README.md            # Full API documentation
├── src/                     # Frontend (React + Vite)
│   ├── components/          # Reusable UI components
│   ├── pages/               # Page components (9 feature pages)
│   ├── routes/              # App routing + protected routes config
│   ├── services/            # API services + auth helpers
│   └── context/             # Auth context (state management)
├── index.html
├── vite.config.js
├── package.json
└── README.md                # This file
```

---

## Quick Start

### Prerequisites
- **Node.js** ≥ 20
- **npm** ≥ 9
- **MongoDB Atlas** account (or local MongoDB)
- **Cloudinary** account (for image uploads)

### Backend

```bash
cd server
cp .env.example .env      # Fill in your MongoDB URI, JWT secrets, Cloudinary keys
npm install
npm run dev                # Starts on http://localhost:5000
```

See **[server/README.md](./server/README.md)** for complete API docs.

### Frontend

```bash
# At project root
cp .env.example .env       # Set VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                # Starts on http://localhost:5173
```

---

## 12-Day Build Plan (Status)

| Day | Module | Backend | Frontend |
|-----|--------|---------|----------|
| 1 | Kickoff & Architecture | ✅ Done | ✅ Done |
| 2 | Database Design | ✅ 9 models done | — |
| 3 | Auth + Design System | ✅ Auth endpoints | ✅ Login/Register/Onboarding pages |
| 4 | Member Profile | ✅ Profile CRUD | ✅ Profile page (561 lines) |
| 5 | Home Feed + Posts | ✅ Posts API | ⏳ Placeholder |
| 6 | Business Exchange | ✅ Exchange types | ⏳ Placeholder |
| 7 | Community Boards | ✅ Comments + Reactions | ⏳ Placeholder |
| 8 | Learning Section | ✅ Learning posts | ⏳ Placeholder |
| 9 | Diaspora Hub + Support | ✅ Diaspora + Support types | ⏳ Placeholder |
| 10 | Notifications + Admin | ✅ Notifications + Admin API | ⏳ Not started |
| 11 | PWA Optimization | — | ⏳ Not started |
| 12 | Deployment | — | ⏳ Not started |

---

## Features (10 Modules)

1. **Auth** — Email/Phone register/login, JWT access+refresh tokens, email verification, password reset, onboarding
2. **Member Profile (Business Passport)** — Full profile CRUD, Cloudinary photo upload, diaspora toggle, services listing
3. **Home Feed** — Paginated feed with 14 post types, tags, location, search filters
4. **Business Exchange** — Need Help, Investment, Partnership, Supplier, Offer, Job posts
5. **Community Boards** — Categories, threaded comments (1-level nesting), 4 reaction types
6. **Learning Section** — Articles, training posts with learning categories
7. **Diaspora Hub** — Diaspora member discovery, partner/investor matching posts
8. **Support Board** — Business support requests with expert responses
9. **Notifications** — Comment, reaction, connection, verification alerts with read tracking
10. **Admin Panel** — User management, content moderation, reporting system, dashboard stats

---

## Deployment

| Component | Platform | 
|-----------|----------|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |

---

## License

Private — LUXREAR Business Club
