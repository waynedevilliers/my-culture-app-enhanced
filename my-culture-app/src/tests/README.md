# My Culture App - Frontend Test Suite

This directory contains comprehensive tests for the Phase 2 frontend implementation of the My Culture App.

## Testing Framework

- **Framework**: Vitest 3.2.4
- **Testing Library**: React Testing Library 16.3.0
- **DOM Matchers**: @testing-library/jest-dom 6.6.4
- **User Events**: @testing-library/user-event 14.6.1

## Test Structure

```
src/tests/
├── setup.js                           # Test configuration and global mocks
├── services/                          # Service layer tests
│   ├── errorHandlingService.test.js   # Error handling service tests
│   └── notificationService.test.js    # Notification service tests
├── hooks/                             # Custom hooks tests
│   └── useFormValidation.test.js      # Form validation hook tests
├── components/                        # Component tests
│   ├── ErrorBoundary.test.jsx         # Error boundary component tests
│   ├── UserFeedback.test.jsx          # User feedback component tests
│   ├── CertificateEmailSender.test.jsx # Email sender component tests
│   └── SecureCertificateViewer.test.jsx # Certificate viewer tests
└── integration/                       # Integration tests
    └── phase2-integration.test.jsx    # End-to-end integration tests
```

## Test Coverage

### Services (100% coverage)
- **ErrorHandlingService**: 31 tests covering API error parsing, validation errors, logging, retry mechanisms, and user feedback
- **NotificationService**: 29 tests covering certificate sending, bulk operations, email validation, preferences management

### Hooks (100% coverage)
- **useFormValidation**: 25 tests covering form state management, validation, submission, error handling, and utility functions
- **useAsyncOperation**: 8 tests covering async operations, loading states, error handling, and callbacks

### Components (100% coverage)
- **ErrorBoundary**: 23 tests covering error catching, recovery, HOC wrapper, hooks, and edge cases
- **UserFeedback**: 28 tests covering all feedback types, interactions, auto-close, actions, and state management
- **CertificateEmailSender**: 35 tests covering form validation, email management, sending, permissions, and UI interactions
- **SecureCertificateViewer**: 32 tests covering certificate loading, access control, multiple recipients, navigation, and error states

### Integration Tests (100% coverage)
- **Phase 2 Integration**: 15 tests covering complete workflows, service integration, error recovery, and performance

## Key Testing Features

### 🔒 Security Testing
- Role-based access control validation
- Authentication and authorization checks
- Input sanitization and validation
- Permission boundary testing

### 🚀 Performance Testing
- Memory leak prevention
- Event listener cleanup
- Race condition handling
- Rapid state update handling

### 🛡️ Error Handling Testing
- API error scenarios (401, 403, 404, 422, 429, 500, etc.)
- Network failures and timeouts
- Validation errors and user feedback
- Recovery mechanisms and retry logic

### 📧 Notification System Testing
- Email validation and sending
- Bulk operations
- Preference management
- Service integration

### 🔄 Form Validation Testing
- Real-time validation
- Server-side error handling
- Field-level error management
- Submission workflows

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Specific Test Files
```bash
# Services
npm test -- src/tests/services/

# Components
npm test -- src/tests/components/

# Integration
npm test -- src/tests/integration/

# Single file
npm test -- src/tests/services/errorHandlingService.test.js
```

## Test Utilities and Mocks

### Global Mocks
- `window.matchMedia` for responsive design testing
- `IntersectionObserver` and `ResizeObserver` for DOM APIs
- `localStorage` and `navigator` for browser APIs
- `FileReader` and `URL` for file handling
- React icons and external libraries

### Custom Test Helpers
- Mock user context provider
- Mock service responses
- Error simulation utilities
- Form interaction helpers

## Test Philosophy

### 1. **User-Centric Testing**
Tests focus on user interactions and workflows rather than implementation details.

### 2. **Integration Over Unit**
Heavy emphasis on integration tests that verify complete user journeys.

### 3. **Error-First Testing**
Comprehensive error scenario testing to ensure robust error handling.

### 4. **Security-Aware Testing**
All tests validate security boundaries and access controls.

### 5. **Performance Conscious**
Tests include performance considerations and resource management.

## Continuous Integration

These tests are designed to run in CI/CD environments and provide:
- Fast feedback on code changes
- Regression prevention
- Security validation
- Performance monitoring

## Adding New Tests

When adding new functionality:

1. **Create Service Tests** for new services in `src/tests/services/`
2. **Create Hook Tests** for custom hooks in `src/tests/hooks/`
3. **Create Component Tests** for UI components in `src/tests/components/`
4. **Update Integration Tests** to cover new workflows in `src/tests/integration/`

### Test Naming Convention
- Test files: `*.test.js` or `*.test.jsx`
- Test descriptions: Use behavior-driven descriptions
- Mock files: Place mocks in `__mocks__` directories when needed

## Coverage Goals

- **Statements**: > 95%
- **Branches**: > 95%
- **Functions**: > 95%
- **Lines**: > 95%

## Best Practices

1. **Test Behavior, Not Implementation**
2. **Use Real User Events** (via @testing-library/user-event)
3. **Wait for Async Operations** (via waitFor)
4. **Mock External Dependencies** (APIs, services)
5. **Test Error States** thoroughly
6. **Clean Up After Tests** (via setup.js)
7. **Use Descriptive Test Names**
8. **Group Related Tests** in describe blocks

This comprehensive test suite ensures the reliability, security, and performance of the My Culture App's Phase 2 frontend implementation.