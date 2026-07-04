# 2. Frontend Architecture

## Component Tree

```
App.jsx
├── AuthContext.Provider (stores user, tokens, login/logout)
│   └── AppRoutes.jsx (React Router v7)
│       ├── Public Routes
│       │   ├── LandingPage         --  /
│       │   ├── LoginPage           --  /login
│       │   ├── RegisterPage        --  /register
│       │   ├── ForgotPasswordPage  --  /forgottenpassword
│       │   ├── ResetPasswordPage   --  /reset-password
│       │   └── OnboardingPage      --  /onboarding
│       │
│       └── Protected Routes (behind DashboardLayout)
│           ├── DashboardLayout     --  /dashboard
│           │   ├── Navbar
│           │   ├── Sidebar
│           │   ├── <Outlet />      --  nested route content
│           │   └── Footer
│           │
│           └── Nested Pages
│               ├── HomeFeedPage    --  /dashboard        (index)
│               ├── ProfilePage     --  /dashboard/profile
│               ├── ExchangePage    --  /dashboard/exchange
│               ├── CommunityPage   --  /dashboard/community
│               ├── DiasporaPage    --  /dashboard/diaspora
│               ├── SupportPage     --  /dashboard/support
│               ├── AdminPage       --  /dashboard/admin
│               ├── LearningPage    --  (in routes but unused)
│               └── NotificationPage -- (in routes but unused)
```

## Directory Layout

```
src/
├── assets/             # Images, SVGs, static files
├── components/
│   ├── common/         # Button, Input, Loader, Modal
│   └── layout/         # Navbar, Sidebar, DashboardLayout, Footer
├── context/
│   └── AuthContext.jsx  # Global auth state (React Context)
├── pages/
│   ├── Auth/           # Login, Register, Forgot, Reset, Onboarding
│   ├── Landing/        # LandingPage
│   ├── Dashboard/      # HomeFeedPage (placeholder)
│   ├── Profiles/       # Profile (561 lines -- fully built)
│   ├── Feed/           # (empty dir)
│   ├── Exchange/       # ExchangePage (placeholder)
│   ├── Community/      # CommunityPage (placeholder)
│   ├── Learning/       # (empty dir)
│   ├── Diaspora/       # DiasporaPage (placeholder)
│   ├── Support/        # SupportPage (placeholder)
│   ├── Admin/          # AdminPage (placeholder)
│   └── Notification/   # (empty dir)
├── routes/
│   ├── AppRoutes.jsx   # All route definitions
│   └── ProtectedRoutes.jsx # Auth guard wrapper
├── services/
│   ├── api.js          # Axios instance (baseURL from VITE_API_URL)
│   ├── authService.js  # Token management, logout
│   ├── postService.js  # Post CRUD service
│   └── useCurrentUser.js # Custom hook for current user
├── App.jsx             # Root component
├── App.css             # Global styles
├── index.css           # Tailwind imports
└── main.jsx            # Entry point
```

## State Management Strategy

| Concern | Mechanism | Location |
|---------|-----------|----------|
| Auth state (user, tokens) | React Context | AuthContext.jsx |
| Persistent token storage | localStorage / sessionStorage | authService.js |
| API requests | Axios instance | api.js |
| Local UI state | React useState/useEffect | Per component |
| Protected route guard | AuthContext + ProtectedRoutes | ProtectedRoutes.jsx |

## Token Storage Strategy

- **"Remember me" checked** -- tokens stored in `localStorage` (persists across tabs)
- **"Remember me" unchecked** -- tokens stored in `sessionStorage` (cleared on tab close)
- `getAccessToken()` / `getRefreshToken()` -- reads from both storages, returns the first found
- `clearTokens()` -- removes from both storages
