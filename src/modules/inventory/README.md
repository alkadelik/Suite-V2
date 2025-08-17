# Inventory Module

This module handles inventory management functionality for the Suite v2 application.

## Structure

```
inventory/
├── README.md
├── routes.ts          # Inventory routing configuration
├── components/
│   └── ProductCard.vue # Product display component
└── views/
    └── index.vue      # Main inventory page
```

## Routes

- `/inventory` - Main inventory page (authenticated access)

## Layout: MainLayout

The inventory module uses the `MainLayout` for the authenticated application interface. This layout provides the full application navigation and user interface for managing inventory items.
