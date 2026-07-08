# LUXREAR Business Club — Architecture Design Document

> Complete system architecture for the LUXREAR Business Club PWA.
> Covers Days 1–10 implementation.

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Frontend Architecture](02-frontend-architecture.md)
3. [Backend Architecture](03-backend-architecture.md)
4. [Database Schema (ERD)](04-database-schema.md)
5. [API Route Map](05-api-route-map.md)
6. [Authentication Flow](06-auth-flow.md)
7. [Notification Flow](07-notification-flow.md)
8. [Data Flow Examples](08-data-flows.md)
9. [Security Architecture](09-security.md)
10. [Error Handling Strategy](10-error-handling.md)
11. [Deployment Architecture](11-deployment.md)
12. [Key Architectural Decisions](12-decisions.md)

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   CLIENT (Browser)                           │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐   │
│  │ Landing  │  │  Auth    │  │Dashboard │  │  Profile  │   │
│  │  Page    │  │ Pages    │  │  Layout  │  │  Page     │   │
│  └──────────┘  └──────────┘  └──────────┘  └───────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              React Router v7                          │    │
│  │   /  /login  /register  /dashboard/*                  │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              AuthContext (React Context)               │    │
│  │         user | tokens | login | logout | loading       │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              Axios Client (services/)                  │    │
│  │      api.js  |  authService.js  |  postService.js      │    │
│  └──────────────────────────────────────────────────────┘    │
└───────────────────────┬──────────────────────────────────────┘
                        │ HTTPS / JSON
                        │ VITE_API_URL (e.g. https://api.luxrear.com)
                        ▼
┌───────────────────────────────────────────────────────────────┐
│                    EXPRESS SERVER (Render)                     │
│                                                               │
│   ┌───────────────────────────────────────────────────────┐   │
│   │             Middleware Pipeline                         │   │
│   │  helmet → cors → rateLimit → morgan → json()          │   │
│   │                                         │              │   │
│   │   ┌──────────────────────────────────────┘             │   │
│   │   ▼                                                     │   │
│   │   Router (/api)                                         │   │
│   │   ┌──────┬──────┬──────┬────────┬────────┬──────┐      │   │
│   │   │ auth │prof  │posts │comments│reactions│conn  │      │   │
│   │   ├──────┼──────┼──────┼────────┼────────┼──────┤      │   │
│   │   │notif │admin │categ │        │        │       │      │   │
│   │   └──────┴──────┴──────┴────────┴────────┴──────┘      │   │
│   │                                         │               │   │
│   │   ┌──────────────────────────────────────┘              │   │
│   │   ▼                                                     │   │
│   │   Controllers → Services → Models → MongoDB             │   │
│   │                                         │               │   │
│   │   ┌──────────────────────────────────────┘              │   │
│   │   ▼                                                     │   │
│   │   Error Handler (global — last middleware)               │   │
│   └───────────────────────────────────────────────────────┘   │
│                                                               │
│   ┌──────────┐  ┌───────────┐  ┌───────────┐                │
│   │Cloudinary│  │Nodemailer │  │  JWT      │                │
│   │(Images)  │  │(Emails)   │  │ (Auth)    │                │
│   └──────────┘  └───────────┘  └───────────┘                │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────────────────┐
│                    MONGODB ATLAS                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │  Users   │ │ Profiles │ │  Posts   │ │Comments  │        │
│  ├──────────┤ ├──────────┤ ├──────────┤ ├──────────┤        │
│  │  _id     │ │  _id     │ │  _id     │ │  _id     │        │
│  │  email   │ │ user_id  │ │profile_id│ │ post_id  │        │
│  │  phone   │ │full_name │ │  type    │ │parent_id │        │
│  │  role    │ │ business │ │  title   │ │ content  │        │
│  │ password │ │ location │ │ category │ │          │        │
│  │ is_banned│ │ industry │ │ tags     │ │          │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│                                                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │Reactions │ │Connection│ │Notificat.│ │  Report  │        │
│  ├──────────┤ ├──────────┤ ├──────────┤ ├──────────┤        │
│  │ user_id  │ │requester │ │ user_id  │ │ reporter │        │
│  │ post_id  │ │ receiver │ │  type    │ │ post_id  │        │
│  │comment_id│ │ status   │ │ message  │ │ reason   │        │
│  │  type    │ │          │ │ is_read  │ │          │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│                                                               │
│  ┌──────────────┐                                             │
│  │  Categories   │  (standalone taxonomy)                     │
│  │  name | type  │                                             │
│  └──────────────┘                                             │
└───────────────────────────────────────────────────────────────┘
```
