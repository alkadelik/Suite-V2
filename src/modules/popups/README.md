# Popups Module

This module manages modal dialogs, notifications, and popup interfaces throughout the Suite v2 application.

## Features

- **Modal Management**: Centralized modal dialog system
- **Notifications**: Toast notifications and alerts
- **Confirmation Dialogs**: User confirmation popups
- **Form Modals**: Modal forms for quick data entry
- **Image Galleries**: Lightbox and image viewer modals
- **Quick Actions**: Context-sensitive popup menus

## Structure

```
popups/
├── README.md
├── routes.ts          # Popup routing configuration
├── components/        # Reusable popup components (to be added)
└── views/
    └── index.vue      # Popup management page
```

## Routes

- `/popups` - Popup management and configuration page (requires authentication)

## Implementation Status

- ✅ Basic page structure
- ✅ Popup routing setup
- ✅ Main layout integration
- ⏳ Modal dialog system
- ⏳ Notification system
- ⏳ Popup component library
- ⏳ Global popup state management

## Planned Components

### Modal Components

- **BaseModal**: Generic modal container with overlay
- **ConfirmModal**: Confirmation dialog with yes/no options
- **FormModal**: Modal wrapper for forms
- **InfoModal**: Information display modal
- **ImageModal**: Image viewer with zoom and navigation

### Notification Components

- **Toast**: Temporary notification messages
- **Alert**: Persistent alert messages
- **Snackbar**: Action-oriented notifications
- **Banner**: Page-wide announcement banners

### Interactive Popups

- **ContextMenu**: Right-click context menus
- **Dropdown**: Custom dropdown menus
- **Tooltip**: Hover information tooltips
- **Popover**: Click-triggered information popups

## Popup Types

### System Notifications

- Success messages
- Error alerts
- Warning notifications
- Information updates

### User Interactions

- Confirmation requests
- Form submissions
- Quick actions
- Help tooltips

### Data Display

- Image galleries
- Data previews
- Quick information
- Status updates

## Usage Patterns

### Global Popup State

```typescript
// Example usage (to be implemented)
import { usePopup } from "@/composables/usePopup"

const { showModal, showToast, showConfirm } = usePopup()

// Show confirmation modal
const confirmed = await showConfirm("Delete this item?")

// Show success toast
showToast("Item saved successfully", "success")
```

### Component Integration

Popups can be triggered from any component throughout the application and are managed centrally for consistent behavior and styling.

## Integration Points

- **All Modules**: Popup functionality used across the entire application
- **Form Validation**: Error and success notifications
- **Data Operations**: Confirmation dialogs for destructive actions
- **User Feedback**: Status updates and notifications

## Todo

- [ ] Design popup state management system
- [ ] Create base modal components
- [ ] Implement notification system
- [ ] Add confirmation dialog patterns
- [ ] Create form modal templates
- [ ] Implement image gallery modals
- [ ] Add keyboard navigation support
- [ ] Create popup animation system
- [ ] Add accessibility features (ARIA, focus management)
- [ ] Implement popup stacking and z-index management
