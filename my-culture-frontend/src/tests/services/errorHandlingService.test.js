import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { toast } from 'react-toastify';
import errorHandlingService from '../../services/errorHandlingService';

// Mock react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
    loading: vi.fn(),
    update: vi.fn()
  }
}));

// Mock window.addEventListener
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();

// Store original methods
const originalAddEventListener = window.addEventListener;
const originalRemoveEventListener = window.removeEventListener;

beforeEach(() => {
  // Reset mocks
  vi.clearAllMocks();
  
  // Mock window methods
  window.addEventListener = mockAddEventListener;
  window.removeEventListener = mockRemoveEventListener;
  
  // Clear error log
  errorHandlingService.clearErrorLog();
});

afterEach(() => {
  // Restore original methods
  window.addEventListener = originalAddEventListener;
  window.removeEventListener = originalRemoveEventListener;
});

describe('ErrorHandlingService', () => {
  describe('parseApiError', () => {
    test('should parse network errors correctly', () => {
      const networkError = {
        message: 'Network Error'
      };

      const result = errorHandlingService.parseApiError(networkError);

      expect(result.type).toBe('warning');
      expect(result.userMessage).toBe('Unable to connect to the server. Please check your internet connection.');
      expect(result.shouldRetry).toBe(true);
    });

    test('should parse 401 errors correctly', () => {
      const authError = {
        response: {
          status: 401,
          data: { message: 'Unauthorized access' }
        }
      };

      const result = errorHandlingService.parseApiError(authError);

      expect(result.type).toBe('warning');
      expect(result.userMessage).toBe('Your session has expired. Please log in again.');
      expect(result.statusCode).toBe(401);
      expect(result.requiresReauth).toBe(true);
      expect(result.shouldRetry).toBe(false);
    });

    test('should parse 403 errors correctly', () => {
      const forbiddenError = {
        response: {
          status: 403,
          data: { message: 'Access forbidden' }
        }
      };

      const result = errorHandlingService.parseApiError(forbiddenError);

      expect(result.type).toBe('error');
      expect(result.userMessage).toBe('You don\'t have permission to perform this action.');
      expect(result.statusCode).toBe(403);
      expect(result.shouldRetry).toBe(false);
    });

    test('should parse 404 errors correctly', () => {
      const notFoundError = {
        response: {
          status: 404,
          data: { message: 'Resource not found' }
        }
      };

      const result = errorHandlingService.parseApiError(notFoundError);

      expect(result.type).toBe('error');
      expect(result.userMessage).toBe('The requested item was not found.');
      expect(result.statusCode).toBe(404);
      expect(result.shouldRetry).toBe(false);
    });

    test('should parse 422 validation errors correctly', () => {
      const validationError = {
        response: {
          status: 422,
          data: { message: 'Validation failed' }
        }
      };

      const result = errorHandlingService.parseApiError(validationError);

      expect(result.type).toBe('error');
      expect(result.userMessage).toBe('Validation failed');
      expect(result.statusCode).toBe(422);
      expect(result.shouldRetry).toBe(false);
    });

    test('should parse 429 rate limit errors correctly', () => {
      const rateLimitError = {
        response: {
          status: 429,
          data: { message: 'Too many requests' }
        }
      };

      const result = errorHandlingService.parseApiError(rateLimitError);

      expect(result.type).toBe('warning');
      expect(result.userMessage).toBe('Too many requests. Please wait a moment before trying again.');
      expect(result.statusCode).toBe(429);
      expect(result.shouldRetry).toBe(true);
    });

    test('should parse 500 server errors correctly', () => {
      const serverError = {
        response: {
          status: 500,
          data: { message: 'Internal server error' }
        }
      };

      const result = errorHandlingService.parseApiError(serverError);

      expect(result.type).toBe('error');
      expect(result.userMessage).toBe('A server error occurred. Please try again later.');
      expect(result.statusCode).toBe(500);
      expect(result.shouldRetry).toBe(true);
    });
  });

  describe('handleValidationErrors', () => {
    test('should handle Zod-style validation errors', () => {
      const zodErrors = [
        { path: ['name'], message: 'Name is required' },
        { path: ['email'], message: 'Invalid email format' },
        { path: [], message: 'General validation error' }
      ];

      const result = errorHandlingService.handleValidationErrors(zodErrors);

      expect(result.hasErrors).toBe(true);
      expect(result.fieldErrors.name).toBe('Name is required');
      expect(result.fieldErrors.email).toBe('Invalid email format');
      expect(result.generalErrors).toContain('General validation error');
    });

    test('should handle object-style validation errors', () => {
      const objectErrors = {
        name: 'Name is required',
        email: 'Invalid email',
        general: 'General error'
      };

      const result = errorHandlingService.handleValidationErrors(objectErrors);

      expect(result.hasErrors).toBe(true);
      expect(result.fieldErrors.name).toBe('Name is required');
      expect(result.fieldErrors.email).toBe('Invalid email');
      expect(result.generalErrors).toContain('General error');
    });

    test('should handle string errors', () => {
      const stringError = 'Something went wrong';

      const result = errorHandlingService.handleValidationErrors(stringError);

      expect(result.hasErrors).toBe(true);
      expect(result.generalErrors).toContain('Something went wrong');
    });

    test('should show appropriate toast messages', () => {
      const errors = [
        { path: ['name'], message: 'Name is required' }
      ];

      errorHandlingService.handleValidationErrors(errors);

      expect(toast.error).toHaveBeenCalledWith('Please check the form for errors.');
    });
  });

  describe('showUserError', () => {
    test('should show error toast for error type', () => {
      errorHandlingService.showUserError('Test error message', 'error');
      expect(toast.error).toHaveBeenCalledWith('Test error message');
    });

    test('should show warning toast for warning type', () => {
      errorHandlingService.showUserError('Test warning message', 'warning');
      expect(toast.warning).toHaveBeenCalledWith('Test warning message');
    });

    test('should show info toast for info type', () => {
      errorHandlingService.showUserError('Test info message', 'info');
      expect(toast.info).toHaveBeenCalledWith('Test info message');
    });

    test('should default to error toast for unknown type', () => {
      errorHandlingService.showUserError('Test message', 'unknown');
      expect(toast.error).toHaveBeenCalledWith('Test message');
    });
  });

  describe('logError', () => {
    test('should log error with context', () => {
      const error = new Error('Test error');
      const context = { type: 'test', userId: '123' };

      errorHandlingService.logError('Test Error', error, context);

      const errorLog = errorHandlingService.getErrorLog();
      expect(errorLog).toHaveLength(1);
      expect(errorLog[0].title).toBe('Test Error');
      expect(errorLog[0].error.message).toBe('Test error');
      expect(errorLog[0].context).toEqual(context);
    });

    test('should maintain error log size limit', () => {
      // Add more errors than the max size
      for (let i = 0; i < 150; i++) {
        errorHandlingService.logError(`Error ${i}`, new Error(`Error ${i}`));
      }

      const errorLog = errorHandlingService.getErrorLog();
      expect(errorLog.length).toBeLessThanOrEqual(100);
    });
  });

  describe('handleFileUploadError', () => {
    test('should handle file size errors (413)', () => {
      const sizeError = {
        response: { status: 413 },
        config: { data: { size: 15000000 } }
      };

      errorHandlingService.handleFileUploadError(sizeError, 'test.jpg');

      expect(toast.error).toHaveBeenCalledWith(
        'File "test.jpg" is too large. Please choose a smaller file.'
      );
    });

    test('should handle unsupported file type errors (415)', () => {
      const typeError = {
        response: { status: 415 }
      };

      errorHandlingService.handleFileUploadError(typeError, 'test.exe');

      expect(toast.error).toHaveBeenCalledWith(
        'File type not supported for "test.exe". Please choose a different file format.'
      );
    });

    test('should handle other upload errors', () => {
      const genericError = {
        response: { status: 500 }
      };

      errorHandlingService.handleFileUploadError(genericError, 'test.jpg');

      expect(toast.error).toHaveBeenCalledWith(
        'A server error occurred. Please try again later.'
      );
    });
  });

  describe('withRetry', () => {
    test('should succeed on first attempt', async () => {
      const operation = vi.fn().mockResolvedValue('success');

      const result = await errorHandlingService.withRetry(operation, 3);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    test('should retry on failure and eventually succeed', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValue('success');

      const result = await errorHandlingService.withRetry(operation, 3, 10);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    test('should fail after max retries', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Always fails'));

      await expect(
        errorHandlingService.withRetry(operation, 2, 10)
      ).rejects.toThrow('Always fails');

      expect(operation).toHaveBeenCalledTimes(2);
    });

    test('should not retry non-retryable errors', async () => {
      const nonRetryableError = {
        response: { status: 404 }
      };
      const operation = vi.fn().mockRejectedValue(nonRetryableError);

      await expect(
        errorHandlingService.withRetry(operation, 3)
      ).rejects.toEqual(nonRetryableError);

      expect(operation).toHaveBeenCalledTimes(1);
    });
  });

  describe('withProgress', () => {
    test('should show loading and success toasts for successful operation', async () => {
      const operation = vi.fn().mockResolvedValue('result');
      toast.loading.mockReturnValue('toast-id');

      const result = await errorHandlingService.withProgress(operation, {
        loadingMessage: 'Loading test...',
        successMessage: 'Test completed!'
      });

      expect(result).toBe('result');
      expect(toast.loading).toHaveBeenCalledWith('Loading test...');
      expect(toast.update).toHaveBeenCalledWith('toast-id', {
        render: 'Test completed!',
        type: 'success',
        isLoading: false,
        autoClose: 5000
      });
    });

    test('should show loading and error toasts for failed operation', async () => {
      const error = { response: { status: 500 } };
      const operation = vi.fn().mockRejectedValue(error);
      toast.loading.mockReturnValue('toast-id');

      await expect(
        errorHandlingService.withProgress(operation, {
          errorMessage: 'Test failed!'
        })
      ).rejects.toEqual(error);

      expect(toast.loading).toHaveBeenCalled();
      expect(toast.update).toHaveBeenCalledWith('toast-id', {
        render: 'Test failed!',
        type: 'error',
        isLoading: false,
        autoClose: 5000
      });
    });
  });

  describe('serializeError', () => {
    test('should serialize Error objects', () => {
      const error = new Error('Test error');
      error.stack = 'Error stack trace';

      const serialized = errorHandlingService.serializeError(error);

      expect(serialized.name).toBe('Error');
      expect(serialized.message).toBe('Test error');
      expect(serialized.stack).toBe('Error stack trace');
    });

    test('should serialize plain objects', () => {
      const error = { message: 'Plain object error', code: 500 };

      const serialized = errorHandlingService.serializeError(error);

      expect(serialized).toEqual({ message: 'Plain object error', code: 500 });
    });

    test('should handle non-object errors', () => {
      const stringError = 'String error';
      const serialized = errorHandlingService.serializeError(stringError);

      expect(serialized).toEqual({ message: 'String error' });
    });
  });

  describe('error log management', () => {
    test('should get error log with limit', () => {
      // Add some errors
      for (let i = 0; i < 10; i++) {
        errorHandlingService.logError(`Error ${i}`, new Error(`Error ${i}`));
      }

      const limitedLog = errorHandlingService.getErrorLog(5);
      expect(limitedLog).toHaveLength(5);
    });

    test('should clear error log', () => {
      errorHandlingService.logError('Test Error', new Error('Test'));
      expect(errorHandlingService.getErrorLog()).toHaveLength(1);

      errorHandlingService.clearErrorLog();
      expect(errorHandlingService.getErrorLog()).toHaveLength(0);
    });
  });
});