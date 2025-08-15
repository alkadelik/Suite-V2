# Customers Module

This module manages customer data, relationships, and interactions within the Suite v2 application.

## Features

- **Customer Database**: Comprehensive customer information management
- **Customer Profiles**: Detailed customer profiles with contact information
- **Communication History**: Track all interactions with customers
- **Customer Analytics**: Reports and insights on customer behavior
- **Search & Filter**: Advanced customer search and filtering capabilities

## Structure

```
customers/
├── README.md
├── routes.ts          # Customer routing configuration
├── components/        # Shared customer components (to be added)
└── views/
    └── index.vue      # Main customers page
```

## Routes

- `/customers` - Main customers management page (requires authentication)

## Implementation Status

- ✅ Basic page structure
- ✅ Customer routing setup
- ✅ Main layout integration
- ⏳ Customer list functionality
- ⏳ Customer profile management
- ⏳ Search and filtering
- ⏳ Communication tracking
- ⏳ Analytics dashboard

## Planned Features

### Customer List & Search

- Display paginated list of customers
- Advanced search functionality
- Filter by various criteria (status, location, etc.)
- Sort by different fields

### Customer Profiles

- Complete customer information forms
- Contact details management
- Customer notes and history
- Document attachments

### Communication History

- Email communication tracking
- Phone call logs
- Meeting notes
- Follow-up reminders

### Analytics & Reports

- Customer acquisition metrics
- Customer lifetime value
- Geographic distribution
- Interaction frequency reports

## Usage

This module integrates with the `MainLayout` and requires user authentication. All customer data operations will be performed through this module.

## Todo

- [ ] Implement customer data models
- [ ] Create customer list component
- [ ] Add customer creation/editing forms
- [ ] Implement search and filtering
- [ ] Add communication tracking
- [ ] Create analytics dashboard
- [ ] Add export functionality
- [ ] Implement customer import from CSV
