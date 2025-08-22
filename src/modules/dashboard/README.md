# Customers Module

This module handles all customer-related functionality for the Suite v2 application.

## Structure

```
customers/
├── README.md
├── routes.ts          # Customer routing configuration
└── views/             # Pages under the customers module
    └── index.vue      # Customer management page
```

## Routes

- `/customers` - Customer management page

## Layout: MainLayout

The customers module uses the `MainLayout` for consistent styling across all customer pages. All customer routes are configured to use this layout in the main router.
