import { z } from 'zod';
import { validateZod, validateMultiple, validateOptional } from '../middlewares/zodValidation.js';

// Mock Express request/response objects
const mockRequest = (data = {}, source = 'body') => ({
  body: source === 'body' ? data : {},
  query: source === 'query' ? data : {},
  params: source === 'params' ? data : {}
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

describe('Zod Validation Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateZod', () => {
    const testSchema = z.object({
      name: z.string().min(1),
      email: z.string().email(),
      age: z.number().int().positive().optional()
    });

    test('should pass validation with valid data', () => {
      const req = mockRequest({
        name: 'John Doe',
        email: 'john@example.com',
        age: 30
      });
      const res = mockResponse();
      
      const middleware = validateZod(testSchema);
      middleware(req, res, mockNext);
      
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(res.status).not.toHaveBeenCalled();
      expect(req.body).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
        age: 30
      });
    });

    test('should fail validation with invalid data', () => {
      const req = mockRequest({
        name: '',
        email: 'invalid-email',
        age: -5
      });
      const res = mockResponse();
      
      const middleware = validateZod(testSchema);
      middleware(req, res, mockNext);
      
      expect(mockNext).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: expect.arrayContaining([
          expect.objectContaining({
            field: 'name',
            message: expect.any(String)
          }),
          expect.objectContaining({
            field: 'email',
            message: 'Invalid email'
          })
        ])
      });
    });

    test('should validate query parameters', () => {
      const querySchema = z.object({
        page: z.string().regex(/^\d+$/).transform(val => parseInt(val)),
        limit: z.string().regex(/^\d+$/).transform(val => parseInt(val))
      });

      const req = mockRequest({ page: '1', limit: '10' }, 'query');
      const res = mockResponse();
      
      const middleware = validateZod(querySchema, 'query');
      middleware(req, res, mockNext);
      
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(req.query).toEqual({ page: 1, limit: 10 });
    });
  });

  describe('validateMultiple', () => {
    test('should validate multiple sources', () => {
      const schemas = {
        body: z.object({
          name: z.string().min(1)
        }),
        query: z.object({
          page: z.string().regex(/^\d+$/).transform(val => parseInt(val))
        }),
        params: z.object({
          id: z.string().regex(/^\d+$/).transform(val => parseInt(val))
        })
      };

      const req = {
        body: { name: 'John' },
        query: { page: '2' },
        params: { id: '123' }
      };
      const res = mockResponse();
      
      const middleware = validateMultiple(schemas);
      middleware(req, res, mockNext);
      
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(req.body).toEqual({ name: 'John' });
      expect(req.query).toEqual({ page: 2 });
      expect(req.params).toEqual({ id: 123 });
    });
  });

  describe('validateOptional', () => {
    const testSchema = z.object({
      name: z.string().min(1).optional(),
      email: z.string().email().optional()
    });

    test('should pass with empty data', () => {
      const req = mockRequest({});
      const res = mockResponse();
      
      const middleware = validateOptional(testSchema);
      middleware(req, res, mockNext);
      
      expect(mockNext).toHaveBeenCalledTimes(1);
    });

    test('should validate when data is present', () => {
      const req = mockRequest({
        name: 'John',
        email: 'john@example.com'
      });
      const res = mockResponse();
      
      const middleware = validateOptional(testSchema);
      middleware(req, res, mockNext);
      
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(req.body).toEqual({
        name: 'John',
        email: 'john@example.com'
      });
    });
  });
});

// Integration test example
describe('Zod Schema Validation', () => {
  test('createUserSchema should validate user creation data', () => {
    const createUserSchema = z.object({
      name: z.string().min(1).max(100),
      email: z.string().email().max(255),
      password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    });

    const validData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'Password123'
    };

    const result = createUserSchema.safeParse(validData);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(validData);
  });

  test('should reject invalid user data', () => {
    const createUserSchema = z.object({
      name: z.string().min(1).max(100),
      email: z.string().email().max(255),
      password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    });

    const invalidData = {
      name: '',
      email: 'invalid-email',
      password: 'weak'
    };

    const result = createUserSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    expect(result.error?.errors).toBeDefined();
    expect(result.error.errors.length).toBeGreaterThan(0);
  });
});