# My Culture App - Backend

Express.js REST API backend for the My Culture App platform with Sequelize ORM, JWT authentication, and comprehensive validation.

## Quick Start

```bash
npm install
cp example.env .env
# Edit .env with your configuration
npm run seed
npm run server
```

## Available Scripts

- `npm run server` - Start development server with --watch and .env
- `npm run start` - Start without .env file
- `npm run seed` - Seed database with test data
- `npm test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report

## Environment Configuration

Copy `example.env` to `.env` and configure:

```env
DB=postgresql://username:password@localhost:5432/database_name
SECRET=your-jwt-secret-key
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-email-password
EMAIL_FROM=your-email@domain.com
CLOUD_NAME=your-cloudinary-name
CLOUD_API_KEY=your-api-key
CLOUD_API_SECRET=your-api-secret
URL=http://localhost:3001
PORT=3001
```

## Architecture

- **Models**: Sequelize models with relationships
- **Routes**: RESTful API routes with dynamic CRUD operations
- **Middleware**: Authentication, authorization, validation, file upload
- **Controllers**: Generic CRUD + specialized controllers
- **Schemas**: Zod validation schemas for type-safe input validation
- **Utils**: Helper functions and services

## API Documentation

Swagger documentation available at: `http://localhost:3001/api-docs`

## Testing

- **Framework**: Jest with Supertest
- **Coverage**: Minimum 80% target
- **Files**: Located in `tests/` directory
