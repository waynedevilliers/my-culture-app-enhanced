import { toast } from 'react-toastify';

class ErrorHandlingService {
  constructor() {
    this.errorLog = [];
    this.maxLogSize = 100;
    
    // Set up global error handlers
    this.setupGlobalErrorHandlers();
  }

  /**
   * Set up global error handlers for unhandled errors
   */
  setupGlobalErrorHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.logError('Unhandled Promise Rejection', event.reason, {
        type: 'unhandled_promise',
        promise: event.promise
      });
      
      // Prevent the default browser error handling
      event.preventDefault();
      
      // Show user-friendly error message
      this.showUserError('An unexpected error occurred. Please try again.');
    });

    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      this.logError('JavaScript Error', event.error, {
        type: 'javascript_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
      
      // Show user-friendly error message for critical errors
      if (event.error && !event.error.handled) {
        this.showUserError('A technical error occurred. Please refresh the page.');
      }
    });
  }

  /**
   * Handle API errors with appropriate user feedback
   */
  handleApiError(error, context = {}) {
    const errorInfo = this.parseApiError(error);
    
    // Log the error
    this.logError('API Error', error, {
      ...context,
      type: 'api_error',
      status: error.response?.status,
      endpoint: error.config?.url,
      method: error.config?.method
    });

    // Show appropriate user message
    this.showUserError(errorInfo.userMessage, errorInfo.type);

    return errorInfo;
  }

  /**
   * Parse API errors into structured information
   */
  parseApiError(error) {
    const defaultError = {
      type: 'error',
      userMessage: 'An unexpected error occurred. Please try again.',
      technicalMessage: 'Unknown error',
      statusCode: null,
      shouldRetry: true
    };

    if (!error.response) {
      // Network error
      return {
        ...defaultError,
        type: 'warning',
        userMessage: 'Unable to connect to the server. Please check your internet connection.',
        technicalMessage: 'Network error',
        shouldRetry: true
      };
    }

    const status = error.response.status;
    const data = error.response.data;
    const message = data?.message || data?.error || error.message;

    switch (status) {
      case 400:
        return {
          type: 'error',
          userMessage: message || 'Invalid request. Please check your input.',
          technicalMessage: message,
          statusCode: 400,
          shouldRetry: false
        };

      case 401:
        return {
          type: 'warning',
          userMessage: 'Your session has expired. Please log in again.',
          technicalMessage: 'Authentication failed',
          statusCode: 401,
          shouldRetry: false,
          requiresReauth: true
        };

      case 403:
        return {
          type: 'error',
          userMessage: 'You don\'t have permission to perform this action.',
          technicalMessage: 'Access forbidden',
          statusCode: 403,
          shouldRetry: false
        };

      case 404:
        return {
          type: 'error',
          userMessage: 'The requested item was not found.',
          technicalMessage: 'Resource not found',
          statusCode: 404,
          shouldRetry: false
        };

      case 409:
        return {
          type: 'warning',
          userMessage: message || 'This item already exists or conflicts with existing data.',
          technicalMessage: 'Conflict error',
          statusCode: 409,
          shouldRetry: false
        };

      case 413:
        return {
          type: 'error',
          userMessage: 'The file you\'re trying to upload is too large.',
          technicalMessage: 'Payload too large',
          statusCode: 413,
          shouldRetry: false
        };

      case 422:
        return {
          type: 'error',
          userMessage: message || 'Please check your input and try again.',
          technicalMessage: 'Validation error',
          statusCode: 422,
          shouldRetry: false
        };

      case 429:
        return {
          type: 'warning',
          userMessage: 'Too many requests. Please wait a moment before trying again.',
          technicalMessage: 'Rate limit exceeded',
          statusCode: 429,
          shouldRetry: true
        };

      case 500:
        return {
          type: 'error',
          userMessage: 'A server error occurred. Please try again later.',
          technicalMessage: 'Internal server error',
          statusCode: 500,
          shouldRetry: true
        };

      case 502:
      case 503:
      case 504:
        return {
          type: 'warning',
          userMessage: 'The service is temporarily unavailable. Please try again in a few minutes.',
          technicalMessage: 'Service unavailable',
          statusCode: status,
          shouldRetry: true
        };

      default:
        return {
          ...defaultError,
          statusCode: status,
          technicalMessage: message || `HTTP ${status} error`
        };
    }
  }

  /**
   * Handle form validation errors
   */
  handleValidationErrors(errors, formFields = {}) {
    const validationInfo = {
      fieldErrors: {},
      generalErrors: [],
      hasErrors: false
    };

    if (Array.isArray(errors)) {
      // Zod-style errors
      errors.forEach(error => {
        if (error.path && error.path.length > 0) {
          const fieldName = error.path[0];
          validationInfo.fieldErrors[fieldName] = error.message;
          validationInfo.hasErrors = true;
        } else {
          validationInfo.generalErrors.push(error.message);
          validationInfo.hasErrors = true;
        }
      });
    } else if (typeof errors === 'object') {
      // Object-style errors
      Object.keys(errors).forEach(key => {
        if (key === 'general' || key === '_general') {
          validationInfo.generalErrors.push(errors[key]);
        } else {
          validationInfo.fieldErrors[key] = errors[key];
        }
        validationInfo.hasErrors = true;
      });
    } else if (typeof errors === 'string') {
      validationInfo.generalErrors.push(errors);
      validationInfo.hasErrors = true;
    }

    // Show user feedback
    if (validationInfo.generalErrors.length > 0) {
      validationInfo.generalErrors.forEach(error => {
        toast.error(error);
      });
    }

    if (Object.keys(validationInfo.fieldErrors).length > 0) {
      toast.error('Please check the form for errors.');
    }

    // Log validation errors
    this.logError('Validation Error', errors, {
      type: 'validation_error',
      formFields: Object.keys(formFields)
    });

    return validationInfo;
  }

  /**
   * Show user-friendly error messages
   */
  showUserError(message, type = 'error') {
    switch (type) {
      case 'warning':
        toast.warning(message);
        break;
      case 'info':
        toast.info(message);
        break;
      case 'success':
        toast.success(message);
        break;
      default:
        toast.error(message);
    }
  }

  /**
   * Show success messages
   */
  showSuccess(message) {
    toast.success(message);
  }

  /**
   * Show loading/progress feedback
   */
  showLoading(message = 'Loading...') {
    return toast.loading(message);
  }

  /**
   * Update a loading toast to success or error
   */
  updateToast(toastId, message, type = 'success') {
    const options = {
      render: message,
      type: type,
      isLoading: false,
      autoClose: 5000
    };

    toast.update(toastId, options);
  }

  /**
   * Log errors for debugging and monitoring
   */
  logError(title, error, context = {}) {
    const errorEntry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      title,
      error: this.serializeError(error),
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Add to local error log
    this.errorLog.unshift(errorEntry);
    
    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }

    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 ${title}`);
      console.error('Error:', error);
      console.log('Context:', context);
      console.log('Full Error Entry:', errorEntry);
      console.groupEnd();
    }

    // In production, you might want to send to a logging service
    // this.sendToLoggingService(errorEntry);
  }

  /**
   * Serialize error objects for logging
   */
  serializeError(error) {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause
      };
    }
    
    if (error && typeof error === 'object') {
      try {
        return JSON.parse(JSON.stringify(error));
      } catch (e) {
        return { message: String(error) };
      }
    }
    
    return { message: String(error) };
  }

  /**
   * Get recent error logs (for debugging)
   */
  getErrorLog(limit = 20) {
    return this.errorLog.slice(0, limit);
  }

  /**
   * Clear error log
   */
  clearErrorLog() {
    this.errorLog = [];
  }

  /**
   * Handle file upload errors specifically
   */
  handleFileUploadError(error, fileName = '') {
    const errorInfo = this.parseApiError(error);
    
    if (error.response?.status === 413) {
      this.showUserError(`File "${fileName}" is too large. Please choose a smaller file.`);
    } else if (error.response?.status === 415) {
      this.showUserError(`File type not supported for "${fileName}". Please choose a different file format.`);
    } else {
      this.showUserError(errorInfo.userMessage);
    }

    this.logError('File Upload Error', error, {
      type: 'file_upload_error',
      fileName,
      fileSize: error.config?.data?.size
    });

    return errorInfo;
  }

  /**
   * Create a retry mechanism for failed operations
   */
  async withRetry(operation, maxRetries = 3, delay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        const errorInfo = this.parseApiError(error);
        
        if (!errorInfo.shouldRetry || attempt === maxRetries) {
          throw error;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
        
        this.logError('Retry Attempt', error, {
          type: 'retry',
          attempt,
          maxRetries
        });
      }
    }
    
    throw lastError;
  }

  /**
   * Provide user feedback for long-running operations
   */
  async withProgress(operation, options = {}) {
    const {
      loadingMessage = 'Processing...',
      successMessage = 'Operation completed successfully',
      errorMessage = 'Operation failed'
    } = options;

    const toastId = this.showLoading(loadingMessage);
    
    try {
      const result = await operation();
      this.updateToast(toastId, successMessage, 'success');
      return result;
    } catch (error) {
      const errorInfo = this.handleApiError(error);
      this.updateToast(toastId, errorMessage, 'error');
      throw error;
    }
  }
}

// Create singleton instance
const errorHandlingService = new ErrorHandlingService();

export default errorHandlingService;