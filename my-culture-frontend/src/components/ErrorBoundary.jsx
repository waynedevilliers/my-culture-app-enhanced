import React from 'react';
import { ErrorBoundaryFallback } from './feedback/UserFeedback';
import errorHandlingService from '../services/errorHandlingService';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error
    this.setState({
      error,
      errorInfo
    });

    // Log to our error handling service
    errorHandlingService.logError('React Error Boundary', error, {
      type: 'react_error',
      componentStack: errorInfo.componentStack,
      errorBoundary: this.constructor.name
    });

    // Call onError prop if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null 
    });
    
    // Call onReset prop if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided, otherwise use default
      if (this.props.fallback) {
        return this.props.fallback(
          this.state.error, 
          this.handleReset,
          this.state.errorInfo
        );
      }

      return (
        <ErrorBoundaryFallback
          error={this.state.error}
          resetError={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component for wrapping components with error boundary
 */
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

/**
 * Hook for handling errors in functional components
 */
export const useErrorHandler = () => {
  const handleError = React.useCallback((error, context = {}) => {
    // Handle the error using our error handling service
    const errorInfo = errorHandlingService.handleApiError(error, context);
    
    // Optionally throw the error to let error boundaries catch it
    if (context.throwToErrorBoundary) {
      throw error;
    }
    
    return errorInfo;
  }, []);

  return handleError;
};

/**
 * Component for catching async errors in functional components
 */
export const AsyncErrorBoundary = ({ children, onError }) => {
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const handleUnhandledRejection = (event) => {
      setError(event.reason);
      if (onError) {
        onError(event.reason);
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [onError]);

  const handleReset = () => {
    setError(null);
  };

  if (error) {
    return (
      <ErrorBoundaryFallback
        error={error}
        resetError={handleReset}
      />
    );
  }

  return children;
};

export default ErrorBoundary;