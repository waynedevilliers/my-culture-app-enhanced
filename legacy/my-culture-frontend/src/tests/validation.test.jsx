import { describe, test, expect } from 'vitest';
import { 
  loginSchema, 
  registerSchema, 
  organizationSchema, 
  eventSchema,
  validateData,
  formatZodError 
} from '../utils/validation';

describe('Frontend Validation Schemas', () => {
  describe('loginSchema', () => {
    test('should validate correct login data', () => {
      const validData = {
        email: 'user@example.com',
        password: 'password123'
      };

      const result = validateData(loginSchema, validData);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validData);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    test('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123'
      };

      const result = validateData(loginSchema, invalidData);
      expect(result.success).toBe(false);
      expect(result.errors.email).toBe('Invalid email address');
    });

    test('should reject empty password', () => {
      const invalidData = {
        email: 'user@example.com',
        password: ''
      };

      const result = validateData(loginSchema, invalidData);
      expect(result.success).toBe(false);
      expect(result.errors.password).toBe('Password is required');
    });
  });

  describe('registerSchema', () => {
    test('should validate correct registration data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        confirmPassword: 'Password123'
      };

      const result = validateData(registerSchema, validData);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(validData);
    });

    test('should reject weak password', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'weak',
        confirmPassword: 'weak'
      };

      const result = validateData(registerSchema, invalidData);
      expect(result.success).toBe(false);
      expect(result.errors.password).toContain('Password must contain');
    });

    test('should reject mismatched passwords', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        confirmPassword: 'DifferentPassword123'
      };

      const result = validateData(registerSchema, invalidData);
      expect(result.success).toBe(false);
      expect(result.errors.confirmPassword).toBe('Passwords do not match');
    });

    test('should reject empty name', () => {
      const invalidData = {
        name: '',
        email: 'john@example.com',
        password: 'Password123',
        confirmPassword: 'Password123'
      };

      const result = validateData(registerSchema, invalidData);
      expect(result.success).toBe(false);
      expect(result.errors.name).toBe('Name is required');
    });
  });

  describe('organizationSchema', () => {
    test('should validate correct organization data', () => {
      const validData = {
        name: 'My Organization',
        description: 'A great organization',
        website: 'https://example.com',
        email: 'org@example.com',
        phone: '+1234567890',
        address: '123 Main St'
      };

      const result = validateData(organizationSchema, validData);
      expect(result.success).toBe(true);
    });

    test('should accept empty optional fields', () => {
      const validData = {
        name: 'My Organization',
        email: 'org@example.com',
        description: '',
        website: '',
        phone: '',
        address: ''
      };

      const result = validateData(organizationSchema, validData);
      expect(result.success).toBe(true);
    });

    test('should reject invalid website URL', () => {
      const invalidData = {
        name: 'My Organization',
        email: 'org@example.com',
        website: 'not-a-url'
      };

      const result = validateData(organizationSchema, invalidData);
      expect(result.success).toBe(false);
      expect(result.errors.website).toBe('Invalid website URL');
    });

    test('should reject invalid phone number', () => {
      const invalidData = {
        name: 'My Organization',
        email: 'org@example.com',
        phone: 'invalid-phone'
      };

      const result = validateData(organizationSchema, invalidData);
      expect(result.success).toBe(false);
      expect(result.errors.phone).toBe('Invalid phone number format');
    });
  });

  describe('eventSchema', () => {
    test('should validate correct event data', () => {
      const validData = {
        title: 'My Event',
        description: 'A great event',
        startDate: '2025-12-01T10:00:00.000Z',
        endDate: '2025-12-01T12:00:00.000Z',
        location: 'Event Center',
        maxParticipants: '100',
        price: '29.99'
      };

      const result = validateData(eventSchema, validData);
      expect(result.success).toBe(true);
      expect(result.data.maxParticipants).toBe(100);
      expect(result.data.price).toBe(29.99);
    });

    test('should reject end date before start date', () => {
      const invalidData = {
        title: 'My Event',
        startDate: '2025-12-01T12:00:00.000Z',
        endDate: '2025-12-01T10:00:00.000Z'
      };

      const result = validateData(eventSchema, invalidData);
      expect(result.success).toBe(false);
      expect(result.errors.endDate).toBe('End date must be after start date');
    });

    test('should reject invalid start date', () => {
      const invalidData = {
        title: 'My Event',
        startDate: 'invalid-date'
      };

      const result = validateData(eventSchema, invalidData);
      expect(result.success).toBe(false);
      expect(result.errors.startDate).toBe('Invalid start date');
    });

    test('should handle empty optional fields', () => {
      const validData = {
        title: 'My Event',
        startDate: '2025-12-01T10:00:00.000Z',
        description: '',
        endDate: '',
        location: '',
        maxParticipants: '',
        price: ''
      };

      const result = validateData(eventSchema, validData);
      expect(result.success).toBe(true);
      expect(result.data.maxParticipants).toBeUndefined();
      expect(result.data.price).toBeUndefined();
    });
  });

  describe('utility functions', () => {
    test('formatZodError should format errors correctly', () => {
      const mockError = {
        errors: [
          { path: ['name'], message: 'Name is required' },
          { path: ['email'], message: 'Invalid email' },
          { path: ['nested', 'field'], message: 'Nested field error' }
        ]
      };

      const formatted = formatZodError(mockError);
      expect(formatted).toEqual({
        name: 'Name is required',
        email: 'Invalid email',
        'nested.field': 'Nested field error'
      });
    });

    test('formatZodError should handle empty errors', () => {
      const formatted = formatZodError(null);
      expect(formatted).toEqual({});
    });

    test('validateData should return success for valid data', () => {
      const result = validateData(loginSchema, {
        email: 'test@example.com',
        password: 'password'
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    test('validateData should return errors for invalid data', () => {
      const result = validateData(loginSchema, {
        email: 'invalid',
        password: ''
      });

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(Object.keys(result.errors)).toHaveLength(2);
    });
  });

  describe('edge cases', () => {
    test('should handle very long strings', () => {
      const longString = 'a'.repeat(300);
      const result = validateData(organizationSchema, {
        name: longString,
        email: 'test@example.com'
      });

      expect(result.success).toBe(false);
      expect(result.errors.name).toBe('Name must be less than 200 characters');
    });

    test('should handle special characters in name', () => {
      const result = validateData(organizationSchema, {
        name: 'Org with éspecial çharacters & symbols!',
        email: 'test@example.com'
      });

      expect(result.success).toBe(true);
    });

    test('should handle different email formats', () => {
      const emails = [
        'user@domain.com',
        'user.name@domain.com',
        'user+tag@domain.com',
        'user@subdomain.domain.com'
      ];

      emails.forEach(email => {
        const result = validateData(loginSchema, {
          email,
          password: 'password'
        });
        expect(result.success).toBe(true);
      });
    });
  });
});