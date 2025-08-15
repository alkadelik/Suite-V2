# Suite v2 - Business Management Application

A modern, modular business management application built with Vue 3, TypeScript, and Vite. Suite v2 provides comprehensive tools for managing customers, inventory, orders, and business operations.

## 🚀 Features

- **Modular Architecture**: Clean, organized modules for different business functions
- **Modern Tech Stack**: Vue 3 with Composition API, TypeScript, and Vite
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Authentication System**: Secure user authentication and authorization
- **Business Management**: Complete tools for inventory, orders, and customer management

## 🏗️ Architecture

The application follows a modular architecture with separate modules for different business domains:

### Core Modules

- **🔐 [Auth Module](src/modules/auth/README.md)** - User authentication and authorization
- **👥 [Customers Module](src/modules/customers/README.md)** - Customer relationship management
- **📦 [Inventory Module](src/modules/inventory/README.md)** - Product and stock management
- **🛒 [Orders Module](src/modules/orders/README.md)** - Order processing and fulfillment
- **💬 [Popups Module](src/modules/popups/README.md)** - Modal dialogs and notifications

### Layouts

- **HomeLayout** - Landing page and public content
- **AuthLayout** - Authentication pages (login, register, signup)
- **MainLayout** - Main application interface for authenticated users

## 🛠️ Tech Stack

- **Framework**: Vue 3 with Composition API
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **Routing**: Vue Router 4
- **Code Quality**: ESLint + Prettier
- **Fonts**: Custom Sato font family

## 📁 Project Structure

```
suite-v2/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images, fonts, and styles
│   ├── components/        # Shared components
│   ├── layouts/           # Application layouts
│   ├── modules/           # Feature modules
│   │   ├── auth/          # Authentication
│   │   ├── customers/     # Customer management
│   │   ├── inventory/     # Inventory management
│   │   ├── orders/        # Order processing
│   │   ├── popups/        # Modal system
│   │   └── others/        # Utility pages (404, home)
│   ├── router/            # Routing configuration
│   ├── utils/             # Utility functions
│   ├── App.vue           # Root component
│   └── main.ts           # Application entry point
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## 🚦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone [repository-url]
cd suite-v2
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and visit `http://localhost:5173`

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 🎨 Styling

The application uses Tailwind CSS v4 for styling with a custom design system:

- **Typography**: Custom Sato font family (Light, Regular, Medium, Semi, Bold, Heavy)
- **Theme**: Customizable color scheme and spacing
- **Components**: Consistent styling across all modules

## 🔧 Development

### Module Development

Each module is self-contained with its own:

- Routes configuration
- Components
- Views
- README documentation

When adding new features:

1. Choose the appropriate module or create a new one
2. Follow the established patterns
3. Update module documentation
4. Ensure proper TypeScript typing

### Code Quality

The project enforces code quality through:

- **TypeScript**: Strong typing for better development experience
- **ESLint**: Code linting with Vue and TypeScript rules
- **Prettier**: Consistent code formatting
- **Vue 3 Standards**: Modern Vue.js best practices

## 🚀 Deployment

The application is configured for deployment on Vercel with the included `vercel.json` configuration. You can also deploy to any static hosting service by running:

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 📋 Todo & Roadmap

### Authentication

- [ ] Backend integration
- [ ] Form validation
- [ ] Password recovery
- [ ] Social login options

### Business Modules

- [ ] Customer database implementation
- [ ] Inventory tracking system
- [ ] Order processing workflow
- [ ] Payment gateway integration
- [ ] Reporting dashboard

### System Features

- [ ] Dark mode support
- [ ] Offline functionality
- [ ] Real-time notifications
- [ ] Advanced search
- [ ] Data export/import

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions, please refer to the individual module documentation or create an issue in the repository.
