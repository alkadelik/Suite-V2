# Leyyow Suite v2

A comprehensive business management web application built with Vue3, TypeScript, Tailwindv4 and Vite.

> Leyyow improves business operational efficiency, - collects data and process them to help businesses make informed decisions.

## 🚀 Features

- **Modular Architecture**: Clean, organized modules for different business functions
- **Core Stack**: Vue 3 with Composition API, TypeScript, and Vite
- **Styling Design**: Responsive mobile friendly design using Tailwind CSS v4

## 🏗️ Architecture

The application follows a modular architecture with separate modules for different parent features:

### Core Modules

- **🔐 [Auth Module](src/modules/auth/README.md)** - User authentication and authorization
- **👥 [Customers Module](src/modules/customers/README.md)** - Customer relationship management
- **📦 [Inventory Module](src/modules/inventory/README.md)** - Product and stock management
- **🛒 [Orders Module](src/modules/orders/README.md)** - Order processing and fulfillment
- **💬 [Popups Module](src/modules/popups/README.md)** - Popup Events management
- **🏡 [Landing Module](src/modules/landing/README.md)** - Landing Page and other public pages

### Layouts

- **LandingLayout** - Landing pages and public content
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
- **State Management**: Pinia

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
│   │   ├── popups/        # Popup events management
│   │   └── landing/       # Landing pages (home, privacy policy, etc)
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
- **Theme**: Customizable color scheme and spacing - assets/css/theme.css
- **Components**: Consistent base styling across all modules

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes using **Conventional Commits** format (`git commit -m 'feat: add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Message Format

This project enforces [Conventional Commits](https://www.conventionalcommits.org/) specification. All commit messages must follow this format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Common Types:**

- `feat` - A new feature
- `fix` - A bug fix
- `docs` - Documentation only changes
- `style` - Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- `refactor` - A code change that neither fixes a bug nor adds a feature
- `perf` - A code change that improves performance
- `test` - Adding missing tests or correcting existing tests
- `build` - Changes that affect the build system or external dependencies
- `ci` - Changes to our CI configuration files and scripts
- `chore` - Other changes that don't modify src or test files
- `revert` - Reverts a previous commit

**Examples:**

- `feat: add user authentication system`
- `feat(auth): implement login with OAuth`
- `fix: resolve inventory calculation bug`
- `fix(orders): correct total price calculation`
- `docs: update installation instructions`
- `docs(api): add endpoint documentation`
- `style: format code with prettier`
- `style(components): fix indentation in ProductCard`
- `refactor: restructure auth module`
- `refactor(utils): simplify currency formatting function`
- `perf: optimize database queries`
- `perf(inventory): cache product search results`
- `test: add unit tests for auth service`
- `test(orders): add integration tests`
- `build: update vite to version 5.0`
- `build(deps): bump vue from 3.3.0 to 3.4.0`
- `ci: add automated deployment workflow`
- `ci(github): update node version in actions`
- `chore: update gitignore`
- `chore(deps): update development dependencies`
- `revert: revert "feat: add experimental feature"`

## 🔗 Preview Links

- Production: [https://suite-v2.vercel.app](https://suite-v2.vercel.app)
- Staging: [https://staging-suite-v2.vercel.app](https://staging-suite-v2.vercel.app)
