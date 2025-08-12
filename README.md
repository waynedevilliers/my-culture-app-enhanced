# My Culture App

A full-stack cultural organization management system built with React and Express.js. This application provides event management, blog posting, certificate generation, newsletter distribution, and comprehensive organization management features.

## Architecture

**Monorepo Structure**: Separate frontend and backend applications
- **Backend**: Express.js REST API with Sequelize ORM (`my-culture-backend/`)
- **Frontend**: React + Vite SPA with TypeScript (`my-culture-frontend/`)

## Technology Stack

| Component | Technology | Version | Status |
|-----------|------------|---------|--------|
| **Backend** | Express.js + Node.js | Latest | Stable |
| **Frontend** | React + Vite + TypeScript | 18.3.1 / 6.0.1 | Modern |
| **Database** | PostgreSQL + Sequelize ORM | 8.13.1 / 6.37.5 | Robust |
| **Authentication** | JWT + bcrypt | jsonwebtoken 9.0.2 | Secure |
| **Styling** | Tailwind CSS + DaisyUI | 3.4.16 | Modern |
| **File Storage** | Cloudinary + Multer | 2.5.1 | Scalable |
| **Email** | Nodemailer | 6.10.0 | Reliable |
| **PDF Generation** | Puppeteer | Latest | Professional |
| **i18n** | react-i18next | 15.6.0 | Complete |
| **Validation** | Zod | 4.0.17 | Type-safe |

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/)
- PostgreSQL database
- Cloudinary account (for image storage)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/waynedevilliers/my-culture-app-enhanced.git
cd myCultureApp
```

### 2. Backend Setup

```bash
cd my-culture-backend
npm install

# Copy environment template
cp example.env .env
# Edit .env with your database and service credentials

# Seed database with test data
npm run seed

# Start development server
npm run server
```

The backend will run on [http://localhost:3001](http://localhost:3001)

### 3. Frontend Setup

```bash
cd my-culture-frontend
npm install

# Copy environment template
cp example.env .env
# Edit .env with your backend URL (usually http://localhost:3001)

# Start development server
npm run dev
```

The frontend will run on [http://localhost:5173](http://localhost:5173)

## Environment Configuration

### Backend Environment Variables

Create `my-culture-backend/.env` with:

```env
# Database
DB=postgresql://username:password@localhost:5432/database_name

# JWT Secret
SECRET=your-jwt-secret-key

# Email Configuration
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-email-password
EMAIL_FROM=your-email@domain.com

# Cloudinary (Image Storage)
CLOUD_NAME=your-cloudinary-name
CLOUD_API_KEY=your-api-key
CLOUD_API_SECRET=your-api-secret

# Application
URL=http://localhost:3001
PORT=3001
```

### Frontend Environment Variables

Create `my-culture-frontend/.env` with:

```env
VITE_BACKEND=http://localhost:3001
```

## Features

### Core Functionality
- **User Management**: Registration, authentication, role-based access control
- **Organization Management**: Self-registration with email verification
- **Event Management**: Create, manage, and track cultural events
- **Certificate System**: Generate and distribute certificates with custom templates
- **Blog System**: Content management with rich text editor
- **Newsletter**: Email distribution system with subscriber management
- **File Management**: Image uploads with Cloudinary integration

### Key Capabilities
- **Multi-language Support**: German and English with react-i18next
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Role-based Access**: Super admin, admin, and user roles
- **Email Verification**: Secure organization registration process
- **PDF Generation**: Professional certificate generation
- **Real-time Updates**: Dynamic content management

## Development

### Available Scripts

**Backend** (`my-culture-backend/`):
```bash
npm run server      # Start development server with --watch and .env
npm run start       # Start without .env file
npm run seed        # Seed database with test data
npm test            # Run Jest tests
npm run test:watch  # Run tests in watch mode
npm run test:coverage # Generate test coverage report
```

**Frontend** (`my-culture-frontend/`):
```bash
npm run dev         # Start Vite development server
npm run build       # Build for production
npm run preview     # Preview production build
npm test            # Run Vitest tests
npm run test:watch  # Run tests in watch mode
npm run test:coverage # Generate test coverage report
```

### Database Models & Relationships
- Users create Events and Blogs
- Events have Images, Locations, and Categories (many-to-many)
- Images belong to Galleries (many-to-many via ImageGallery)
- Organizations have Images
- Certificates have multiple Recipients

### Code Quality Standards
- **Security**: Zod validation, JWT authentication, role-based authorization
- **Testing**: Jest (backend), Vitest (frontend), minimum 80% coverage
- **Code Style**: ESLint, Prettier, consistent naming conventions
- **Documentation**: JSDoc for complex functions, README files
- **Git Workflow**: Atomic commits, descriptive messages, feature branches

## API Documentation

The backend provides a RESTful API with Swagger documentation available at:
- **Development**: http://localhost:3001/api-docs
- **Endpoints**: `/api/auth`, `/api/users`, `/api/organizations`, `/api/events`, `/api/certificates`

## Deployment

### Production Build

**Frontend**:
```bash
cd my-culture-frontend
npm run build
# Serve from dist/ directory
```

**Backend**:
```bash
cd my-culture-backend
# Set production environment variables
npm run start
```

### Environment Setup
- Use environment-specific `.env` files
- Configure PostgreSQL database
- Set up Cloudinary for image storage
- Configure email service (SMTP)
- Set secure JWT secrets

## Testing

### Backend Tests
```bash
cd my-culture-backend
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report
```

### Frontend Tests
```bash
cd my-culture-frontend
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report
```

## Contributing

1. **Code Standards**: Follow established patterns and conventions
2. **Testing**: Write tests for new features and bug fixes
3. **Documentation**: Update README and inline documentation
4. **Security**: Use Zod validation, sanitize inputs
5. **Commits**: Use descriptive commit messages

## Security

- **Input Validation**: Zod schemas for all user inputs
- **Authentication**: JWT tokens with secure secrets
- **Authorization**: Role-based access control
- **Data Sanitization**: Sanitize HTML inputs
- **Rate Limiting**: API rate limiting implemented
- **HTTPS**: Use HTTPS in production

## Internationalization

The application supports German (primary) and English with:
- **Libraries**: react-i18next, i18next-browser-languagedetector
- **Storage**: Language preference in localStorage
- **Coverage**: Complete UI translation including admin interface
- **Files**: `src/i18n/locales/de.json` and `src/i18n/locales/en.json`

## License

This project is licensed under the ISC License.

## Support

For issues and questions:
1. Check existing documentation
2. Review the codebase structure
3. Create an issue with detailed information

---

**Version**: 1.0.0  
**Last Updated**: 2025  
**Author**: Wayne de Villiers