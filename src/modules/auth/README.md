# Authentication Module

This module handles all authentication-related functionality for the Suite v2 application.

## Structure

```
auth/
├── README.md
├── routes.ts          # Authentication routing configuration
├── components/        # Components shared across the auth module
│   └── AuthHeader.vue
└── views/             # Pages under the AuthModule
    ├── login.vue      # Login page
    └── signup.vue     # Signup page
```

## Routes

- `/login` - User login page
- `/signup` - User signup page

## Layout: AuthLayout

The authentication module uses the `AuthLayout` for consistent styling across all auth pages. All authentication routes are configured to use this layout in the main router.
