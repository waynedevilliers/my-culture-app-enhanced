import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My Culture API',
      version: '1.0.0',
      description: 'API documentation for My Culture application - a cultural organization management platform',
      contact: {
        name: 'Wayne de Villiers',
        email: 'contact@myculture.com',
      },
    },
    servers: [
      {
        url: process.env.URL || 'http://localhost:3001',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'User ID' },
            firstName: { type: 'string', description: 'First name' },
            lastName: { type: 'string', description: 'Last name' },
            email: { type: 'string', format: 'email', description: 'Email address' },
            phoneNumber: { type: 'string', description: 'Phone number' },
            role: { type: 'string', enum: ['user', 'admin'], description: 'User role' },
            newsletter: { type: 'boolean', description: 'Newsletter subscription' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Event: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'Event ID' },
            title: { type: 'string', description: 'Event title' },
            date: { type: 'string', format: 'date-time', description: 'Event date' },
            content: { type: 'object', description: 'Event content (JSONB)' },
            conclusion: { type: 'string', description: 'Event conclusion' },
            discountedPrice: { type: 'number', description: 'Discounted price' },
            abendkassePrice: { type: 'number', description: 'Box office price' },
            prebookedPrice: { type: 'number', description: 'Pre-booking price' },
            bookingLink: { type: 'string', format: 'uri', description: 'Booking link' },
            published: { type: 'boolean', description: 'Publication status' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Certificate: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'Certificate ID' },
            title: { type: 'string', description: 'Certificate title' },
            description: { type: 'string', description: 'Certificate description' },
            issuedDate: { type: 'string', format: 'date', description: 'Issue date' },
            issuedFrom: { type: 'string', description: 'Issuing organization' },
            certificateUrl: { type: 'string', description: 'Certificate URL' },
            published: { type: 'boolean', description: 'Publication status' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            totalCount: { type: 'integer', description: 'Total number of items' },
            totalPages: { type: 'integer', description: 'Total number of pages' },
            currentPage: { type: 'integer', description: 'Current page number' },
            hasNextPage: { type: 'boolean', description: 'Has next page' },
            hasPreviousPage: { type: 'boolean', description: 'Has previous page' },
            results: { type: 'array', items: {}, description: 'Page results' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string', description: 'Error message' },
            error: { type: 'string', description: 'Error details' },
          },
        },
      },
    },
    tags: [
      { name: 'Authentication', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User management' },
      { name: 'Events', description: 'Event management' },
      { name: 'Certificates', description: 'Certificate management' },
      { name: 'Blogs', description: 'Blog management' },
      { name: 'Galleries', description: 'Gallery management' },
      { name: 'Organizations', description: 'Organization management' },
    ],
  },
  apis: ['./routes/*.js', './controllers/*.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };