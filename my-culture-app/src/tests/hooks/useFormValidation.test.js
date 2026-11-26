import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { toast } from 'react-toastify';
import { useFormValidation, useAsyncOperation } from '../../hooks/useFormValidation';
import errorHandlingService from '../../services/errorHandlingService';

// Mock dependencies
vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn()
  }
}));

vi.mock('../../services/errorHandlingService', () => ({
  default: {
    handleApiError: vi.fn(),
    withRetry: vi.fn(),
    handleValidationErrors: vi.fn()
  }
}));

// Mock Zod schema for testing
const mockValidationSchema = {
  parseAsync: vi.fn(),
  parse: vi.fn()
};

const createMockEvent = (name, value, type = 'text') => ({
  target: { name, value, type, checked: type === 'checkbox' ? value : undefined }
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useFormValidation', () => {
  const initialValues = {
    name: '',
    email: '',
    age: 0
  };

  describe('initialization', () => {
    test('should initialize with provided initial values', () => {
      const { result } = renderHook(() =>
        useFormValidation(initialValues)
      );

      expect(result.current.values).toEqual(initialValues);
      expect(result.current.errors).toEqual({});
      expect(result.current.touched).toEqual({});
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.isValid).toBe(true);
      expect(result.current.submitAttempted).toBe(false);
    });

    test('should initialize with empty object when no initial values provided', () => {
      const { result } = renderHook(() => useFormValidation());

      expect(result.current.values).toEqual({});
    });
  });

  describe('handleChange', () => {
    test('should update field value on change', async () => {
      const { result } = renderHook(() =>
        useFormValidation(initialValues)
      );

      act(() => {
        result.current.handleChange(createMockEvent('name', 'John Doe'));
      });

      expect(result.current.values.name).toBe('John Doe');
    });

    test('should handle checkbox input type', async () => {
      const { result } = renderHook(() =>
        useFormValidation({ terms: false })
      );

      act(() => {
        result.current.handleChange(createMockEvent('terms', true, 'checkbox'));
      });

      expect(result.current.values.terms).toBe(true);
    });

    test('should handle number input type', async () => {
      const { result } = renderHook(() =>
        useFormValidation(initialValues)
      );

      act(() => {
        result.current.handleChange(createMockEvent('age', '25', 'number'));
      });

      expect(result.current.values.age).toBe(25);
    });

    test('should clear field error when user starts typing', async () => {
      const { result } = renderHook(() =>
        useFormValidation(initialValues, mockValidationSchema)
      );

      // Set initial error and touched state
      act(() => {
        result.current.setFieldError('name', 'Name is required');
      });

      // Touch the field
      act(() => {
        result.current.handleBlur(createMockEvent('name', ''));
      });

      // Now change should clear the error
      act(() => {
        result.current.handleChange(createMockEvent('name', 'John'));
      });

      await waitFor(() => {
        expect(result.current.errors.name).toBe('');
      });
    });
  });

  describe('handleBlur', () => {
    test('should mark field as touched on blur', () => {
      const { result } = renderHook(() =>
        useFormValidation(initialValues)
      );

      act(() => {
        result.current.handleBlur(createMockEvent('name', 'John'));
      });

      expect(result.current.touched.name).toBe(true);
    });

    test('should validate field on blur with validation schema', async () => {
      mockValidationSchema.parseAsync.mockRejectedValue({
        errors: [{ path: ['name'], message: 'Name is too short' }]
      });

      const { result } = renderHook(() =>
        useFormValidation(initialValues, mockValidationSchema)
      );

      act(() => {
        result.current.handleBlur(createMockEvent('name', 'Jo'));
      });

      await waitFor(() => {
        expect(result.current.errors.name).toBe('Name is too short');
      });
    });
  });

  describe('validateForm', () => {
    test('should validate all fields with Zod schema', async () => {
      mockValidationSchema.parseAsync.mockResolvedValue(initialValues);

      const { result } = renderHook(() =>
        useFormValidation(initialValues, mockValidationSchema)
      );

      let isValid;
      await act(async () => {
        isValid = await result.current.validateForm();
      });

      expect(isValid).toBe(true);
      expect(result.current.isValid).toBe(true);
      expect(result.current.errors).toEqual({});
    });

    test('should handle validation errors with Zod schema', async () => {
      const validationErrors = {
        errors: [
          { path: ['name'], message: 'Name is required' },
          { path: ['email'], message: 'Invalid email' }
        ]
      };

      mockValidationSchema.parseAsync.mockRejectedValue(validationErrors);
      errorHandlingService.handleValidationErrors.mockReturnValue({
        fieldErrors: {
          name: 'Name is required',
          email: 'Invalid email'
        }
      });

      const { result } = renderHook(() =>
        useFormValidation(initialValues, mockValidationSchema)
      );

      let isValid;
      await act(async () => {
        isValid = await result.current.validateForm();
      });

      expect(isValid).toBe(false);
      expect(result.current.isValid).toBe(false);
      expect(result.current.errors).toEqual({
        name: 'Name is required',
        email: 'Invalid email'
      });
    });

    test('should return true when no validation schema provided', async () => {
      const { result } = renderHook(() =>
        useFormValidation(initialValues)
      );

      let isValid;
      await act(async () => {
        isValid = await result.current.validateForm();
      });

      expect(isValid).toBe(true);
    });
  });

  describe('setFieldValue', () => {
    test('should set field value programmatically', async () => {
      const { result } = renderHook(() =>
        useFormValidation(initialValues)
      );

      await act(async () => {
        await result.current.setFieldValue('name', 'Programmatically Set');
      });

      expect(result.current.values.name).toBe('Programmatically Set');
    });

    test('should validate field when shouldValidate is true', async () => {
      mockValidationSchema.parseAsync.mockRejectedValue({
        errors: [{ path: ['name'], message: 'Name is invalid' }]
      });

      const { result } = renderHook(() =>
        useFormValidation(initialValues, mockValidationSchema)
      );

      // Mark field as touched first
      act(() => {
        result.current.handleBlur(createMockEvent('name', ''));
      });

      await act(async () => {
        await result.current.setFieldValue('name', 'Invalid', true);
      });

      await waitFor(() => {
        expect(result.current.errors.name).toBe('Name is invalid');
      });
    });
  });

  describe('handleSubmit', () => {
    test('should submit form when validation passes', async () => {
      mockValidationSchema.parseAsync.mockResolvedValue(initialValues);
      const mockSubmitFunction = vi.fn().mockResolvedValue({ success: true });

      const { result } = renderHook(() =>
        useFormValidation(initialValues, mockValidationSchema)
      );

      let submitResult;
      await act(async () => {
        submitResult = await result.current.handleSubmit(mockSubmitFunction);
      });

      expect(submitResult.success).toBe(true);
      expect(mockSubmitFunction).toHaveBeenCalledWith(initialValues);
      expect(result.current.submitAttempted).toBe(true);
      expect(result.current.isSubmitting).toBe(false);
    });

    test('should not submit when validation fails', async () => {
      mockValidationSchema.parseAsync.mockRejectedValue({
        errors: [{ path: ['name'], message: 'Name is required' }]
      });
      errorHandlingService.handleValidationErrors.mockReturnValue({
        fieldErrors: { name: 'Name is required' }
      });

      const mockSubmitFunction = vi.fn();

      const { result } = renderHook(() =>
        useFormValidation(initialValues, mockValidationSchema)
      );

      let submitResult;
      await act(async () => {
        submitResult = await result.current.handleSubmit(mockSubmitFunction);
      });

      expect(submitResult.success).toBe(false);
      expect(mockSubmitFunction).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith('Please fix the form errors before submitting');
    });

    test('should handle API errors during submission', async () => {
      mockValidationSchema.parseAsync.mockResolvedValue(initialValues);
      const apiError = { response: { status: 500 } };
      const mockSubmitFunction = vi.fn().mockRejectedValue(apiError);

      errorHandlingService.handleApiError.mockReturnValue({
        userMessage: 'Server error occurred'
      });

      const { result } = renderHook(() =>
        useFormValidation(initialValues, mockValidationSchema)
      );

      let submitResult;
      await act(async () => {
        submitResult = await result.current.handleSubmit(mockSubmitFunction);
      });

      expect(submitResult.success).toBe(false);
      expect(submitResult.error).toBe('Server error occurred');
      expect(errorHandlingService.handleApiError).toHaveBeenCalledWith(apiError, {
        formValues: initialValues,
        formName: 'form-submission'
      });
    });

    test('should handle server-side validation errors (422)', async () => {
      mockValidationSchema.parseAsync.mockResolvedValue(initialValues);
      const validationError = {
        response: {
          status: 422,
          data: {
            errors: [{ path: ['email'], message: 'Email already exists' }]
          }
        }
      };
      const mockSubmitFunction = vi.fn().mockRejectedValue(validationError);

      errorHandlingService.handleApiError.mockReturnValue({
        userMessage: 'Validation failed'
      });

      errorHandlingService.handleValidationErrors.mockReturnValue({
        fieldErrors: { email: 'Email already exists' }
      });

      const { result } = renderHook(() =>
        useFormValidation(initialValues, mockValidationSchema)
      );

      let submitResult;
      await act(async () => {
        submitResult = await result.current.handleSubmit(mockSubmitFunction);
      });

      expect(submitResult.success).toBe(false);
      expect(result.current.errors.email).toBe('Email already exists');
    });
  });

  describe('resetForm', () => {
    test('should reset form to initial state', () => {
      const { result } = renderHook(() =>
        useFormValidation(initialValues)
      );

      // Modify form state
      act(() => {
        result.current.handleChange(createMockEvent('name', 'Modified'));
        result.current.setFieldError('name', 'Some error');
      });

      // Reset form
      act(() => {
        result.current.resetForm();
      });

      expect(result.current.values).toEqual(initialValues);
      expect(result.current.errors).toEqual({});
      expect(result.current.touched).toEqual({});
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.submitAttempted).toBe(false);
    });

    test('should reset to new initial values when provided', () => {
      const newInitialValues = { name: 'New Default', email: 'new@example.com' };

      const { result } = renderHook(() =>
        useFormValidation(initialValues)
      );

      act(() => {
        result.current.resetForm(newInitialValues);
      });

      expect(result.current.values).toEqual(newInitialValues);
    });
  });

  describe('getFieldProps', () => {
    test('should return proper field props', () => {
      const { result } = renderHook(() =>
        useFormValidation(initialValues)
      );

      const fieldProps = result.current.getFieldProps('name');

      expect(fieldProps).toEqual({
        name: 'name',
        value: '',
        onChange: expect.any(Function),
        onBlur: expect.any(Function),
        error: undefined,
        touched: undefined
      });
    });

    test('should include error and touched state when available', () => {
      const { result } = renderHook(() =>
        useFormValidation(initialValues)
      );

      // Set error and touched state
      act(() => {
        result.current.setFieldError('name', 'Name is required');
        result.current.handleBlur(createMockEvent('name', ''));
      });

      const fieldProps = result.current.getFieldProps('name');

      expect(fieldProps.error).toBe('Name is required');
      expect(fieldProps.touched).toBe(true);
    });
  });

  describe('utility methods', () => {
    test('hasFieldError should return true when field has error and is touched', () => {
      const { result } = renderHook(() =>
        useFormValidation(initialValues)
      );

      act(() => {
        result.current.setFieldError('name', 'Name is required');
        result.current.handleBlur(createMockEvent('name', ''));
      });

      expect(result.current.hasFieldError('name')).toBe(true);
    });

    test('hasFieldError should return false when field has error but is not touched', () => {
      const { result } = renderHook(() =>
        useFormValidation(initialValues)
      );

      act(() => {
        result.current.setFieldError('name', 'Name is required');
      });

      expect(result.current.hasFieldError('name')).toBe(false);
    });

    test('getFieldError should return error message when field has error and is touched', () => {
      const { result } = renderHook(() =>
        useFormValidation(initialValues)
      );

      act(() => {
        result.current.setFieldError('name', 'Name is required');
        result.current.handleBlur(createMockEvent('name', ''));
      });

      expect(result.current.getFieldError('name')).toBe('Name is required');
    });

    test('clearFieldError should clear field error', () => {
      const { result } = renderHook(() =>
        useFormValidation(initialValues)
      );

      act(() => {
        result.current.setFieldError('name', 'Name is required');
        result.current.clearFieldError('name');
      });

      expect(result.current.errors.name).toBe('');
    });
  });
});

describe('useAsyncOperation', () => {
  test('should execute async operation successfully', async () => {
    const mockOperation = vi.fn().mockResolvedValue('success result');

    const { result } = renderHook(() => useAsyncOperation());

    let executeResult;
    await act(async () => {
      executeResult = await result.current.execute(mockOperation);
    });

    expect(executeResult.success).toBe(true);
    expect(executeResult.data).toBe('success result');
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBe('success result');
    expect(result.current.error).toBe(null);
  });

  test('should handle async operation failure', async () => {
    const mockError = new Error('Operation failed');
    const mockOperation = vi.fn().mockRejectedValue(mockError);

    errorHandlingService.handleApiError.mockReturnValue({
      userMessage: 'Operation failed'
    });

    const { result } = renderHook(() => useAsyncOperation());

    let executeResult;
    await act(async () => {
      executeResult = await result.current.execute(mockOperation, {
        showErrorToast: false
      });
    });

    expect(executeResult.success).toBe(false);
    expect(executeResult.error.userMessage).toBe('Operation failed');
    expect(result.current.loading).toBe(false);
    expect(result.current.error.userMessage).toBe('Operation failed');
  });

  test('should show success toast when configured', async () => {
    const mockOperation = vi.fn().mockResolvedValue('result');

    const { result } = renderHook(() => useAsyncOperation());

    await act(async () => {
      await result.current.execute(mockOperation, {
        showSuccessToast: true,
        successMessage: 'Operation completed!'
      });
    });

    expect(toast.success).toHaveBeenCalledWith('Operation completed!');
  });

  test('should execute with retry when configured', async () => {
    const mockOperation = vi.fn().mockResolvedValue('result');
    const mockWithRetry = vi.fn().mockResolvedValue('retry result');
    errorHandlingService.withRetry = mockWithRetry;

    const { result } = renderHook(() => useAsyncOperation());

    await act(async () => {
      await result.current.execute(mockOperation, { retries: 3 });
    });

    expect(errorHandlingService.withRetry).toHaveBeenCalledWith(mockOperation, 3);
  });

  test('should call onSuccess callback when provided', async () => {
    const mockOperation = vi.fn().mockResolvedValue('result');
    const onSuccess = vi.fn();

    const { result } = renderHook(() => useAsyncOperation());

    await act(async () => {
      await result.current.execute(mockOperation, { onSuccess });
    });

    expect(onSuccess).toHaveBeenCalledWith('result');
  });

  test('should call onError callback when provided', async () => {
    const mockError = new Error('Failed');
    const mockOperation = vi.fn().mockRejectedValue(mockError);
    const onError = vi.fn();

    errorHandlingService.handleApiError.mockReturnValue({
      userMessage: 'Failed'
    });

    const { result } = renderHook(() => useAsyncOperation());

    await act(async () => {
      await result.current.execute(mockOperation, {
        onError,
        showErrorToast: false
      });
    });

    expect(onError).toHaveBeenCalledWith({ userMessage: 'Failed' });
  });

  test('should reset state correctly', () => {
    const { result } = renderHook(() => useAsyncOperation());

    // Set some state
    act(() => {
      result.current.data = 'some data';
      result.current.error = 'some error';
      result.current.loading = true;
    });

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);
    expect(result.current.loading).toBe(false);
  });
});