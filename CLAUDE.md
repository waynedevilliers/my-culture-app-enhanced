# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

My Culture App is a full-stack application for a cultural organization management system. It includes event management, blog posting, certificate generation, newsletter distribution, and organization management features.

**Architecture**: Monorepo with separate frontend and backend applications
- **Backend**: Express.js REST API with Sequelize ORM (`my-culture-backend/`)
- **Frontend**: React + Vite SPA with TypeScript (`my-culture-frontend/`)

## Development Commands

### Backend (`my-culture-backend/`)
```bash
cd my-culture-backend
npm install                    # Install dependencies
npm run server                 # Start development server with --watch and .env
npm run start                  # Start without .env file
npm run seed                   # Seed database with test data
```

### Frontend (`my-culture-frontend/`)
```bash
cd my-culture-frontend
npm install                    # Install dependencies
npm run dev                    # Start Vite development server
npm run build                  # Build for production
npm run preview                # Preview production build
```

## Environment Setup

Both applications require `.env` files based on their respective `example.env` templates:

**Backend** requires: `DB` (PostgreSQL connection), `SECRET` (JWT), email config (`EMAIL_*`), Cloudinary config (`CLOUD_*`), `URL`, `PORT`

**Frontend** requires: `VITE_BACKEND` (backend API URL)

## Key Architecture Components

### Backend Structure
- **Models**: Sequelize models with relationships (User, Event, Organization, Blog, Certificate, etc.)
- **Routes**: RESTful API routes with dynamic CRUD operations via `/:model` pattern
- **Middleware**: Authentication, authorization, validation, file upload, pagination
- **Controllers**: Generic CRUD controller + specialized controllers for complex operations
- **Database**: PostgreSQL with Sequelize ORM, relationships defined in `db.js`

### Frontend Structure
- **React Router**: Nested routing with protected routes and role-based authorization
- **Components**: Organized by feature (admin/, events/, organization/, etc.)
- **Context**: UserContext for authentication state
- **Styling**: Tailwind CSS + DaisyUI components
- **Rich Text**: BlockNote editor for content creation

### Key Features
- **Authentication**: JWT-based with role-based access control (admin/user)
- **File Management**: Cloudinary integration for image uploads
- **Certificate System**: HTML template generation with email distribution
- **Newsletter**: Email distribution system with subscriber management
- **Event Management**: Events with categories, locations, and image galleries
- **Internationalization**: Multi-language support (German/English) with react-i18next

## Database Models & Relationships
- Users create Events and Blogs
- Events have Images, Locations, and Categories (many-to-many)
- Images belong to Galleries (many-to-many via ImageGallery)
- Organizations have Images
- Certificates have multiple Recipients

## Ports & URLs
- **Backend**: http://localhost:3001 (or process.env.PORT)
- **Frontend**: http://localhost:5173 (Vite default)

## Internationalization (i18n) System

### Overview
The frontend uses **react-i18next** for comprehensive multi-language support with German as the primary language and English as secondary.

### Technical Implementation

#### Libraries Used
- **react-i18next**: v15.6.0 - React integration for i18next
- **i18next**: v25.3.2 - Core internationalization framework
- **i18next-browser-languagedetector**: v8.2.0 - Automatic language detection

#### Configuration
- **Config File**: `src/i18n/i18n.js`
- **Default Language**: German (`de`)
- **Fallback Language**: German (`de`)
- **Detection Order**: localStorage → navigator → htmlTag
- **Storage**: Language preference persisted in localStorage

#### Translation Files
- **Location**: `src/i18n/locales/`
- **German**: `src/i18n/locales/de.json`
- **English**: `src/i18n/locales/en.json`

#### Translation Structure
```json
{
  "nav": { ... },           // Navigation items
  "hero": { ... },          // Hero section content
  "organizations": { ... }, // Organizations pages
  "footer": { ... },        // Footer content
  "admin": {                // Admin dashboard translations
    "dashboard": "Dashboard",
    "navigation": { ... },   // Admin navigation items
    "pages": { ... },        // Admin page titles
    "tables": { ... },       // Table headers and actions
    "forms": { ... },        // Form labels and placeholders
    "pagination": { ... },   // Pagination messages
    "messages": { ... }      // Success/error messages
  },
  "common": { ... }         // Shared translations
}
```

### Usage Patterns

#### Component Integration
```javascript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('admin.pages.users')}</h1>
      <button>{t('admin.forms.save')}</button>
    </div>
  );
};
```

#### Language Switching
- **Component**: `src/components/common/LanguageSwitcher.jsx`
- **UI**: Globe icon with language abbreviation (DE/EN)
- **Integration**: Included in main navigation
- **Functionality**: Toggle between German and English

### Coverage Status

#### ✅ Fully Translated Areas
- **Public Pages**: Hero, organizations, join us, footer
- **Admin Navigation**: All menu items and navigation elements
- **Admin Pages**: Dashboard, users, organizations, certificates, help
- **Admin Components**: Tables, forms, pagination, messages
- **Footer**: Contact information, social media, legal links

#### Component List (Admin Area)
- `components/admin/Navigation.jsx` - Main admin navigation
- `components/admin/NavigationSidebar.jsx` - Sidebar navigation
- `components/admin/UserList.jsx` - User management table
- `components/admin/OrganizationList.jsx` - Organization management
- `components/admin/NewOrganization.jsx` - Organization creation form
- `components/common/Pagination.jsx` - Pagination component
- `sections/Footer.jsx` - Main footer component
- `pages/admin/*.jsx` - All admin page headers

### Translation Key Conventions
- **Nested Structure**: `section.subsection.key`
- **Admin Keys**: `admin.navigation.users`, `admin.forms.save`
- **Table Keys**: `admin.tables.search`, `admin.tables.edit`
- **Message Keys**: `admin.messages.success`, `admin.messages.error`
- **Interpolation**: `admin.pages.usersCount` uses `{{count}}` placeholder

### Adding New Translations

1. **Add Keys**: Update both `de.json` and `en.json` files
2. **Import Hook**: Add `import { useTranslation } from 'react-i18next';`
3. **Get Function**: Add `const { t } = useTranslation();` in component
4. **Use Translation**: Replace hardcoded text with `{t('key.path')}`
5. **Interpolation**: Use `{t('key', { variable: value })}` for dynamic content

### Best Practices
- **Consistent Naming**: Use descriptive, hierarchical key names
- **Placeholder Syntax**: Use `{{variable}}` for interpolation in JSON
- **Default Values**: Always provide both German and English translations
- **Testing**: Validate JSON syntax after updates
- **Context**: Group related translations under logical sections

### Language Files Maintenance
- **German First**: German is primary, so write German translations first
- **English Second**: Provide accurate English equivalents
- **Validation**: Use `python3 -m json.tool file.json` to validate syntax
- **Backup**: Translation files are version controlled with git