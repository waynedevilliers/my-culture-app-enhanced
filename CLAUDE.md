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

## Database Models & Relationships
- Users create Events and Blogs
- Events have Images, Locations, and Categories (many-to-many)
- Images belong to Galleries (many-to-many via ImageGallery)
- Organizations have Images
- Certificates have multiple Recipients

## Ports & URLs
- **Backend**: http://localhost:3001 (or process.env.PORT)
- **Frontend**: http://localhost:5173 (Vite default)