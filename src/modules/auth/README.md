# Authentication Module

This module handles all authentication-related functionality for the Suite v2 application.

## Features

- **Login**: User authentication with email and password
- **Register**: New user account creation
- **Signup**: User onboarding process
- **Remember Me**: Persistent login sessions
- **Password Recovery**: Forgot password functionality (coming soon)

## Structure

```
auth/
├── README.md
├── routes.ts          # Authentication routing configuration
├── components/
│   └── AuthHeader.vue # Shared authentication header component
└── views/
    ├── login.vue      # Login page
    ├── register.vue   # Registration page
    └── signup.vue     # Signup page
```

## Routes

- `/login` - User login page
- `/register` - User registration page
- `/signup` - User signup page

## Components

### AuthHeader.vue

Reusable header component for authentication pages with consistent styling and branding.

## Implementation Status

- ✅ Login form UI
- ✅ Registration form UI
- ✅ Signup form UI
- ✅ Authentication routing
- ⏳ Backend authentication integration
- ⏳ Form validation
- ⏳ Password recovery
- ⏳ Social login options

## Usage

The authentication module uses the `AuthLayout` for consistent styling across all auth pages. All authentication routes are configured to use this layout in the main router.

## Todo

- [ ] Implement actual login logic
- [ ] Add form validation
- [ ] Integrate with backend authentication API
- [ ] Add password strength validation
- [ ] Implement forgot password functionality
- [ ] Add social login options (Google, GitHub, etc.)
