# Orders Module

This module handles order management functionality for the Suite v2 application.

## Structure

```
orders/
├── README.md
├── routes.ts          # Orders routing configuration
├── types.ts           # Order-related type definitions
├── components/
│   └── OrderCard.vue  # Order display component
└── views/
    └── index.vue      # Main orders page
```

## Routes

- `/orders` - Main orders page (authenticated access)

## Layout: MainLayout

The orders module uses the `MainLayout` for the authenticated application interface. This layout provides the full application navigation and user interface for managing orders.
