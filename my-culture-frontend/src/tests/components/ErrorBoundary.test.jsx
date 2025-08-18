import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorBoundary, { withErrorBoundary, useErrorHandler, AsyncErrorBoundary } from '../../components/ErrorBoundary';
import errorHandlingService from '../../services/errorHandlingService';

// Mock the errorHandlingService
vi.mock('../../services/errorHandlingService', () => ({
  default: {
    logError: vi.fn()
  }
}));

// Mock console.error to avoid error output during tests
vi.spyOn(console, 'error').mockImplementation(() => {});

// Component that throws an error for testing
const ThrowError = ({ shouldThrow = false, error = new Error('Test error') }) => {
  if (shouldThrow) {
    throw error;
  }
  return <div>No error</div>;
};

// Component that throws async error
const AsyncError = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    Promise.reject(new Error('Async error'));
  }
  return <div>No async error</div>;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ErrorBoundary', () => {
  describe('basic functionality', () => {
    test('should render children when there is no error', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
    });

    test('should render error fallback when child component throws', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    test('should log error when child component throws', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(errorHandlingService.logError).toHaveBeenCalledWith(
        'React Error Boundary',
        expect.any(Error),
        expect.objectContaining({
          type: 'react_error',
          componentStack: expect.any(String)
        })
      );
    });
  });

  describe('custom fallback', () => {
    test('should render custom fallback when provided', () => {
      const customFallback = (error, resetError) => (
        <div>
          <h1>Custom Error</h1>
          <p>Error: {error.message}</p>
          <button onClick={resetError}>Custom Reset</button>
        </div>
      );

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Custom Error')).toBeInTheDocument();
      expect(screen.getByText('Error: Test error')).toBeInTheDocument();
      expect(screen.getByText('Custom Reset')).toBeInTheDocument();
    });
  });

  describe('error callbacks', () => {
    test('should call onError callback when error occurs', () => {
      const onError = vi.fn();

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String)
        })
      );
    });

    test('should call onReset callback when error is reset', async () => {
      const user = userEvent.setup();
      const onReset = vi.fn();

      render(
        <ErrorBoundary onReset={onReset}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      const resetButton = screen.getByText('Try Again');
      await user.click(resetButton);

      expect(onReset).toHaveBeenCalled();
    });
  });

  describe('error reset functionality', () => {
    test('should reset error and render children again', async () => {
      const user = userEvent.setup();
      let shouldThrow = true;

      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={shouldThrow} />
        </ErrorBoundary>
      );

      // Error state
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Click reset
      const resetButton = screen.getByText('Try Again');
      await user.click(resetButton);

      // Update component to not throw
      shouldThrow = false;
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={shouldThrow} />
        </ErrorBoundary>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
    });
  });

  describe('different error types', () => {
    test('should handle different error objects', () => {
      const customError = new Error('Custom error message');
      customError.stack = 'Custom stack trace';

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} error={customError} />
        </ErrorBoundary>
      );

      expect(errorHandlingService.logError).toHaveBeenCalledWith(
        'React Error Boundary',
        customError,
        expect.any(Object)
      );
    });
  });
});

describe('withErrorBoundary HOC', () => {
  test('should wrap component with error boundary', () => {
    const TestComponent = () => <div>Test Component</div>;
    const WrappedComponent = withErrorBoundary(TestComponent);

    render(<WrappedComponent />);

    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });

  test('should handle errors in wrapped component', () => {
    const ErrorComponent = () => {
      throw new Error('HOC error');
    };
    const WrappedComponent = withErrorBoundary(ErrorComponent);

    render(<WrappedComponent />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  test('should pass error boundary props to wrapper', () => {
    const onError = vi.fn();
    const TestComponent = () => {
      throw new Error('Props error');
    };
    const WrappedComponent = withErrorBoundary(TestComponent, { onError });

    render(<WrappedComponent />);

    expect(onError).toHaveBeenCalled();
  });

  test('should set correct display name', () => {
    const TestComponent = () => <div>Test</div>;
    TestComponent.displayName = 'TestComponent';
    
    const WrappedComponent = withErrorBoundary(TestComponent);

    expect(WrappedComponent.displayName).toBe('withErrorBoundary(TestComponent)');
  });

  test('should use component name when displayName is not available', () => {
    const TestComponent = () => <div>Test</div>;
    const WrappedComponent = withErrorBoundary(TestComponent);

    expect(WrappedComponent.displayName).toBe('withErrorBoundary(TestComponent)');
  });
});

describe('useErrorHandler', () => {
  test('should handle API errors', () => {
    const TestComponent = () => {
      const handleError = useErrorHandler();
      const error = { response: { status: 500 } };
      
      const result = handleError(error, { context: 'test' });
      
      return (
        <div>
          <span>Error handled</span>
          <span data-testid="result">{JSON.stringify(result)}</span>
        </div>
      );
    };

    // Mock the error handling service
    errorHandlingService.handleApiError = vi.fn().mockReturnValue({
      userMessage: 'Server error',
      statusCode: 500
    });

    render(<TestComponent />);

    expect(screen.getByText('Error handled')).toBeInTheDocument();
    expect(errorHandlingService.handleApiError).toHaveBeenCalledWith(
      { response: { status: 500 } },
      { context: 'test' }
    );
  });

  test('should throw error to error boundary when configured', () => {
    const TestComponent = () => {
      const handleError = useErrorHandler();
      const error = new Error('Should throw');
      
      try {
        handleError(error, { throwToErrorBoundary: true });
      } catch (e) {
        return <div>Error thrown: {e.message}</div>;
      }
      
      return <div>No error</div>;
    };

    render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});

describe('AsyncErrorBoundary', () => {
  beforeEach(() => {
    // Reset any existing unhandledrejection listeners
    window.removeEventListener('unhandledrejection', () => {});
  });

  test('should render children when no async error', () => {
    render(
      <AsyncErrorBoundary>
        <AsyncError shouldThrow={false} />
      </AsyncErrorBoundary>
    );

    expect(screen.getByText('No async error')).toBeInTheDocument();
  });

  test('should handle unhandled promise rejections', () => {
    const onError = vi.fn();

    render(
      <AsyncErrorBoundary onError={onError}>
        <AsyncError shouldThrow={false} />
      </AsyncErrorBoundary>
    );

    // Simulate unhandled rejection
    const rejectionEvent = new Event('unhandledrejection');
    rejectionEvent.reason = new Error('Async error');
    
    window.dispatchEvent(rejectionEvent);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(onError).toHaveBeenCalledWith(new Error('Async error'));
  });

  test('should reset async error state', async () => {
    const user = userEvent.setup();

    render(
      <AsyncErrorBoundary>
        <AsyncError shouldThrow={false} />
      </AsyncErrorBoundary>
    );

    // Trigger async error
    const rejectionEvent = new Event('unhandledrejection');
    rejectionEvent.reason = new Error('Async error');
    window.dispatchEvent(rejectionEvent);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    // Reset error
    const resetButton = screen.getByText('Try Again');
    await user.click(resetButton);

    expect(screen.getByText('No async error')).toBeInTheDocument();
  });

  test('should clean up event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = render(
      <AsyncErrorBoundary>
        <div>Test</div>
      </AsyncErrorBoundary>
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'unhandledrejection',
      expect.any(Function)
    );

    removeEventListenerSpy.mockRestore();
  });
});

describe('Error Boundary integration', () => {
  test('should work with multiple nested error boundaries', () => {
    const InnerError = () => {
      throw new Error('Inner error');
    };

    const OuterComponent = () => (
      <div>
        <span>Outer component</span>
        <ErrorBoundary fallback={(error) => <div>Inner boundary: {error.message}</div>}>
          <InnerError />
        </ErrorBoundary>
      </div>
    );

    render(
      <ErrorBoundary>
        <OuterComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Outer component')).toBeInTheDocument();
    expect(screen.getByText('Inner boundary: Inner error')).toBeInTheDocument();
  });

  test('should bubble error to parent boundary if child boundary fails', () => {
    const BrokenErrorBoundary = () => {
      throw new Error('Error boundary failed');
    };

    const ErrorComponent = () => {
      throw new Error('Component error');
    };

    render(
      <ErrorBoundary>
        <ErrorBoundary fallback={() => <BrokenErrorBoundary />}>
          <ErrorComponent />
        </ErrorBoundary>
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});

describe('Error Boundary edge cases', () => {
  test('should handle null/undefined errors gracefully', () => {
    const NullError = () => {
      throw null;
    };

    render(
      <ErrorBoundary>
        <NullError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(errorHandlingService.logError).toHaveBeenCalled();
  });

  test('should handle string errors', () => {
    const StringError = () => {
      throw 'String error message';
    };

    render(
      <ErrorBoundary>
        <StringError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  test('should handle errors during render phase', () => {
    const RenderError = ({ shouldError }) => {
      if (shouldError) {
        throw new Error('Render error');
      }
      return <div>Rendered successfully</div>;
    };

    const { rerender } = render(
      <ErrorBoundary>
        <RenderError shouldError={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Rendered successfully')).toBeInTheDocument();

    rerender(
      <ErrorBoundary>
        <RenderError shouldError={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});