# Expenses Module

This module handles expense management functionality for the Suite v2 application.

## Structure

```
expenses/
├── README.md
├── routes.ts          # Expenses routing configuration
├── types.ts           # Expense-related type definitions
├── components/
│   └── ExpenseCard.vue  # Expense display component
└── views/
    └── index.vue      # Main expenses page
```

## Routes

- `/expenses` - Main expenses page (authenticated access)

## Layout: MainLayout

The expenses module uses the `MainLayout` for the authenticated application interface. This layout provides the full application navigation and user interface for managing expenses.
