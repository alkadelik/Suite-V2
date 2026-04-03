# Shared Module

This module contains shared functionality and common views used across the Suite v2 application.

## Structure

```
shared/
├── README.md
├── api.ts             # Shared API functions
├── routes.ts          # Shared routing configuration
└── views/             # Shared pages
    ├── dashboard.vue  # Main dashboard page
    ├── notifications.vue # Notifications page
    └── onboarding.vue # User onboarding flow
```

## Routes

- `/dashboard` - Main dashboard page
- `/onboarding` - User onboarding flow (requires authentication)
- `/notifications` - Notifications page

## Layout

The shared module pages use the `MainLayout` for the authenticated application interface.
