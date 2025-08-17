# Popups Module

This module manages popup events for the Suite v2 application.

## Structure

```
popups/
├── README.md
├── routes.ts          # Popup routing configuration
├── components/        # Popup components
└── views/
    └── index.vue      # Main popups management page
```

## Routes

- `/popups` - Main popups management page (authenticated access)

## Layout: MainLayout

The popups module uses the `MainLayout` for the authenticated application interface. This layout provides the full application navigation and user interface for managing popup events.
