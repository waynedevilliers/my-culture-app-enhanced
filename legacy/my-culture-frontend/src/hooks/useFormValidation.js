import { useState, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import errorHandlingService from '../services/errorHandlingService';

/**
 * Comprehensive form validation and error handling hook
 */
export const useFormValidation = (initialValues = {}, validationSchema = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  
  const validationSchemaRef = useRef(validationSchema);
  
  // Update validation schema if it changes
  if (validationSchemaRef.current !== validationSchema) {
    validationSchemaRef.current = validationSchema;
  }

  /**
   * Validate a single field
   */
  const validateField = useCallback(async (fieldName, value) => {
    if (!validationSchemaRef.current) return null;

    try {
      // For Zod schemas
      if (validationSchemaRef.current.parseAsync) {
        await validationSchemaRef.current.parseAsync({ [fieldName]: value });
        return null;
      }
      
      // For custom validation functions
      if (typeof validationSchemaRef.current[fieldName] === 'function') {
        const result = await validationSchemaRef.current[fieldName](value);
        return result || null;
      }
      
      return null;
    } catch (error) {
      if (error.errors && Array.isArray(error.errors)) {
        const fieldError = error.errors.find(e => e.path && e.path[0] === fieldName);
        return fieldError ? fieldError.message : null;
      }
      return error.message || 'Invalid value';
    }
  }, []);

  /**
   * Validate all fields
   */
  const validateForm = useCallback(async () => {
    if (!validationSchemaRef.current) return true;

    try {
      // For Zod schemas
      if (validationSchemaRef.current.parseAsync) {
        await validationSchemaRef.current.parseAsync(values);
        setErrors({});
        setIsValid(true);
        return true;
      }
      
      // For custom validation functions
      if (typeof validationSchemaRef.current === 'object') {
        const newErrors = {};
        
        for (const [fieldName, validator] of Object.entries(validationSchemaRef.current)) {
          if (typeof validator === 'function') {
            try {
              const error = await validator(values[fieldName]);
              if (error) {
                newErrors[fieldName] = error;
              }
            } catch (error) {
              newErrors[fieldName] = error.message || 'Invalid value';
            }
          }
        }
        
        setErrors(newErrors);
        const valid = Object.keys(newErrors).length === 0;
        setIsValid(valid);
        return valid;
      }
      
      return true;
    } catch (error) {
      const validationInfo = errorHandlingService.handleValidationErrors(error.errors || error, values);
      setErrors(validationInfo.fieldErrors);
      setIsValid(false);
      return false;
    }
  }, [values]);

  /**
   * Handle input changes
   */
  const handleChange = useCallback(async (event) => {
    const { name, value, type, checked, files } = event.target;
    
    let newValue = value;
    
    // Handle different input types
    if (type === 'checkbox') {
      newValue = checked;
    } else if (type === 'file') {
      newValue = files;
    } else if (type === 'number') {
      newValue = value === '' ? '' : Number(value);
    }
    
    setValues(prev => ({ ...prev, [name]: newValue }));
    
    // Clear error when user starts typing (if they've been touched)
    if (touched[name] && errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Only validate on change if form has been submitted (not just touched)
    if (submitAttempted) {
      const fieldError = await validateField(name, newValue);
      setErrors(prev => ({ ...prev, [name]: fieldError || '' }));
    }
  }, [submitAttempted, validateField]);

  /**
   * Handle field blur
   */
  const handleBlur = useCallback(async (event) => {
    const { name, value } = event.target;
    
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate field on blur
    const fieldError = await validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: fieldError || '' }));
  }, [validateField]);

  /**
   * Set a specific field value
   */
  const setFieldValue = useCallback(async (fieldName, value, shouldValidate = true) => {
    setValues(prev => ({ ...prev, [fieldName]: value }));
    
    if (shouldValidate && (submitAttempted || touched[fieldName])) {
      const fieldError = await validateField(fieldName, value);
      setErrors(prev => ({ ...prev, [fieldName]: fieldError || '' }));
    }
  }, [submitAttempted, touched, validateField]);

  /**
   * Set a specific field error
   */
  const setFieldError = useCallback((fieldName, error) => {
    setErrors(prev => ({ ...prev, [fieldName]: error }));
    setIsValid(false);
  }, []);

  /**
   * Clear a specific field error
   */
  const clearFieldError = useCallback((fieldName) => {
    setErrors(prev => ({ ...prev, [fieldName]: '' }));
  }, []);

  /**
   * Set multiple values at once
   */
  const setMultipleValues = useCallback((newValues, shouldValidate = false) => {
    setValues(prev => ({ ...prev, ...newValues }));
    
    if (shouldValidate) {
      setTimeout(() => validateForm(), 0);
    }
  }, [validateForm]);

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback((newInitialValues = null) => {
    const resetValues = newInitialValues || initialValues;
    setValues(resetValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setIsValid(true);
    setSubmitAttempted(false);
  }, [initialValues]);

  /**
   * Submit form with validation and error handling
   */
  const handleSubmit = useCallback(async (submitFunction) => {
    setSubmitAttempted(true);
    setIsSubmitting(true);
    
    try {
      // Validate form
      const isFormValid = await validateForm();
      
      if (!isFormValid) {
        toast.error('Please fix the form errors before submitting');
        setIsSubmitting(false);
        return { success: false, error: 'Validation failed' };
      }
      
      // Submit form
      const result = await submitFunction(values);
      
      if (result && result.success === false) {
        // Handle server-side validation errors
        if (result.fieldErrors) {
          setErrors(prev => ({ ...prev, ...result.fieldErrors }));
        }
        
        if (result.message) {
          toast.error(result.message);
        }
        
        setIsSubmitting(false);
        return result;
      }
      
      // Success
      setIsSubmitting(false);
      return result || { success: true };
      
    } catch (error) {
      const errorInfo = errorHandlingService.handleApiError(error, {
        formValues: values,
        formName: 'form-submission'
      });
      
      // Handle validation errors from server
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const serverErrors = error.response.data.errors;
        if (Array.isArray(serverErrors)) {
          const validationInfo = errorHandlingService.handleValidationErrors(serverErrors, values);
          setErrors(prev => ({ ...prev, ...validationInfo.fieldErrors }));
        } else if (typeof serverErrors === 'object') {
          setErrors(prev => ({ ...prev, ...serverErrors }));
        }
      }
      
      setIsSubmitting(false);
      return { success: false, error: errorInfo.userMessage };
    }
  }, [values, validateForm]);

  /**
   * Get field props for easy integration with inputs
   */
  const getFieldProps = useCallback((fieldName) => {
    return {
      name: fieldName,
      value: values[fieldName] || '',
      onChange: handleChange,
      onBlur: handleBlur,
      error: errors[fieldName],
      touched: touched[fieldName]
    };
  }, [values, handleChange, handleBlur, errors, touched]);

  /**
   * Check if a field has an error
   */
  const hasFieldError = useCallback((fieldName) => {
    return !!(errors[fieldName] && touched[fieldName]);
  }, [errors, touched]);

  /**
   * Get field error message
   */
  const getFieldError = useCallback((fieldName) => {
    return hasFieldError(fieldName) ? errors[fieldName] : '';
  }, [hasFieldError, errors]);

  return {
    // Values and state
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    submitAttempted,
    
    // Handlers
    handleChange,
    handleBlur,
    handleSubmit,
    
    // Utilities
    setFieldValue,
    setFieldError,
    clearFieldError,
    setMultipleValues,
    resetForm,
    validateForm,
    validateField,
    
    // Helpers
    getFieldProps,
    hasFieldError,
    getFieldError
  };
};

/**
 * Hook for handling async operations with loading states and error handling
 */
export const useAsyncOperation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = useCallback(async (asyncFunction, options = {}) => {
    const {
      onSuccess,
      onError,
      showSuccessToast = false,
      showErrorToast = true,
      successMessage = 'Operation completed successfully',
      retries = 0
    } = options;

    setLoading(true);
    setError(null);

    try {
      let result;
      
      if (retries > 0) {
        result = await errorHandlingService.withRetry(asyncFunction, retries);
      } else {
        result = await asyncFunction();
      }
      
      setData(result);
      
      if (showSuccessToast) {
        toast.success(successMessage);
      }
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return { success: true, data: result };
      
    } catch (error) {
      const errorInfo = errorHandlingService.handleApiError(error);
      setError(errorInfo);
      
      if (showErrorToast) {
        toast.error(errorInfo.userMessage);
      }
      
      if (onError) {
        onError(errorInfo);
      }
      
      return { success: false, error: errorInfo };
      
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    loading,
    error,
    data,
    execute,
    reset
  };
};

export default useFormValidation;