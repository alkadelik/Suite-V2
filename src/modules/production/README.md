# Production Module

This module handles production functionality for the Suite v2 application.

## Structure

```
production/
├── README.md
├── routes.ts          # Production routing configuration
├── types.ts           # Production-related type definitions
├── components/
│   └── RawMaterialCard.vue  # Raw material display component
└── views/
    └── raw-materials.vue      # Raw materials page
```

## Routes

- `/raw-materials` - Raw materials page (authenticated access)

## Layout: MainLayout

The production module uses the `MainLayout` for the authenticated application interface. activities.
