# My Culture App - Frontend

React + Vite + TypeScript frontend for the My Culture App platform with Tailwind CSS, multi-language support, and comprehensive form validation.

## Quick Start

```bash
npm install
cp example.env .env
# Edit .env with your backend URL
npm run dev
```

## Available Scripts

- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run Vitest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report

## Environment Configuration

Copy `example.env` to `.env` and configure:

```env
VITE_BACKEND=http://localhost:3001
```

## Architecture

- **React Router**: Nested routing with protected routes and role-based authorization
- **Components**: Organized by feature (admin/, events/, organization/, etc.)
- **Context**: UserContext for authentication state
- **Styling**: Tailwind CSS + DaisyUI components
- **Rich Text**: BlockNote editor for content creation
- **Validation**: Zod schemas with react-hook-form integration
- **i18n**: Complete German/English translation support

## Key Features

- **Multi-language**: German (primary) and English with react-i18next
- **Role-based UI**: Different interfaces for super admin, admin, and users
- **Form Validation**: Zod schemas for type-safe validation
- **Responsive Design**: Mobile-first with Tailwind CSS
- **Rich Text Editing**: BlockNote editor for blog posts and content

## Testing

- **Framework**: Vitest with React Testing Library
- **Coverage**: Minimum 80% target
- **Files**: Located in `src/tests/` directory
