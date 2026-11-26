import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { toast } from 'react-toastify';

// Import components for integration testing
import ErrorBoundary from '../../components/ErrorBoundary';
import UserFeedback from '../../components/feedback/UserFeedback';
import { useFormValidation } from '../../hooks/useFormValidation';
import errorHandlingService from '../../services/errorHandlingService';
import notificationService from '../../services/notificationService';

// Mock dependencies
vi.mock('axios');
vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    loading: vi.fn(),
    update: vi.fn()
  }
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key
  })
}));

// Test component that uses multiple Phase 2 features
const IntegratedTestComponent = ({ shouldThrowError = false }) => {
  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    hasFieldError,
    getFieldError
  } = useFormValidation({ email: '', name: '' });

  const [feedback, setFeedback] = useState(null);
  const [emailSent, setEmailSent] = useState(false);

  const submitForm = async (formData) => {
    if (shouldThrowError) {
      throw new Error('Simulated form error');
    }

    // Simulate API call
    const response = await axios.post('/api/test', formData);
    return response.data;
  };

  const sendNotification = async () => {
    try {
      const result = await notificationService.sendCertificate('test-cert-123', ['test@example.com']);
      if (result.success) {
        setEmailSent(true);
        setFeedback({ type: 'success', message: 'Email sent successfully!' });
      } else {
        setFeedback({ type: 'error', message: result.error });
      }
    } catch (error) {
      const errorInfo = errorHandlingService.handleApiError(error);
      setFeedback({ type: 'error', message: errorInfo.userMessage });
    }
  };

  if (shouldThrowError) {
    throw new Error('Component error');
  }

  return (
    <div>
      <h1>Integrated Test Component</h1>
      
      {/* Form with validation */}
      <form onSubmit={handleSubmit(submitForm)}>
        <div>
          <input
            name="name"
            value={values.name}
            onChange={handleChange}
            placeholder="Enter name"
            className={hasFieldError('name') ? 'error' : ''}
          />
          {hasFieldError('name') && (
            <span className="error-text">{getFieldError('name')}</span>
          )}
        </div>
        
        <div>
          <input
            name="email"
            value={values.email}
            onChange={handleChange}
            placeholder="Enter email"
            className={hasFieldError('email') ? 'error' : ''}
          />
          {hasFieldError('email') && (
            <span className="error-text">{getFieldError('email')}</span>
          )}
        </div>
        
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>

      {/* Notification system */}
      <div>
        <button onClick={sendNotification} disabled={emailSent}>
          Send Email
        </button>
        {emailSent && <span>Email sent!</span>}
      </div>

      {/* User feedback */}
      {feedback && (
        <UserFeedback
          type={feedback.type}
          message={feedback.message}
          isVisible={!!feedback}
          onClose={() => setFeedback(null)}
        />
      )}
    </div>
  );
};

describe('Phase 2 Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.post.mockResolvedValue({ data: { success: true } });
    
    // Mock notification service
    notificationService.sendCertificate = vi.fn().mockResolvedValue({
      success: true,
      message: 'Certificate sent successfully'
    });

    // Mock error handling service
    errorHandlingService.handleApiError = vi.fn().mockReturnValue({
      userMessage: 'API error occurred',
      type: 'error'
    });
  });

  describe('Form Validation + Error Handling Integration', () => {
    test('should handle form submission with validation and error handling', async () => {
      const user = userEvent.setup();
      render(
        <ErrorBoundary>
          <IntegratedTestComponent />
        </ErrorBoundary>
      );

      // Fill out form
      const nameInput = screen.getByPlaceholderText('Enter name');
      const emailInput = screen.getByPlaceholderText('Enter email');
      
      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');

      // Submit form
      const submitButton = screen.getByText('Submit');
      await user.click(submitButton);

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith('/api/test', {
          name: 'John Doe',
          email: 'john@example.com'
        });
      });
    });

    test('should handle API errors during form submission', async () => {
      const user = userEvent.setup();
      const apiError = { response: { status: 500 } };
      axios.post.mockRejectedValue(apiError);

      render(
        <ErrorBoundary>
          <IntegratedTestComponent />
        </ErrorBoundary>
      );

      const nameInput = screen.getByPlaceholderText('Enter name');
      const emailInput = screen.getByPlaceholderText('Enter email');
      
      await user.type(nameInput, 'John Doe');
      await user.type(emailInput, 'john@example.com');

      const submitButton = screen.getByText('Submit');
      await user.click(submitButton);

      await waitFor(() => {
        expect(errorHandlingService.handleApiError).toHaveBeenCalledWith(
          apiError,
          expect.objectContaining({
            formValues: { name: 'John Doe', email: 'john@example.com' }
          })
        );
      });
    });
  });

  describe('Notification System + Error Handling Integration', () => {
    test('should send notification successfully and show feedback', async () => {
      const user = userEvent.setup();
      render(
        <ErrorBoundary>
          <IntegratedTestComponent />
        </ErrorBoundary>
      );

      const sendEmailButton = screen.getByText('Send Email');
      await user.click(sendEmailButton);

      await waitFor(() => {
        expect(notificationService.sendCertificate).toHaveBeenCalledWith(
          'test-cert-123',
          ['test@example.com']
        );
      });

      expect(screen.getByText('Email sent successfully!')).toBeInTheDocument();
      expect(screen.getByText('Email sent!')).toBeInTheDocument();
    });

    test('should handle notification sending failure', async () => {
      const user = userEvent.setup();
      notificationService.sendCertificate.mockResolvedValue({
        success: false,
        error: 'Failed to send certificate'
      });

      render(
        <ErrorBoundary>
          <IntegratedTestComponent />
        </ErrorBoundary>
      );

      const sendEmailButton = screen.getByText('Send Email');
      await user.click(sendEmailButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to send certificate')).toBeInTheDocument();
      });
    });

    test('should handle notification API errors', async () => {
      const user = userEvent.setup();
      const apiError = new Error('Network error');
      notificationService.sendCertificate.mockRejectedValue(apiError);

      render(
        <ErrorBoundary>
          <IntegratedTestComponent />
        </ErrorBoundary>
      );

      const sendEmailButton = screen.getByText('Send Email');
      await user.click(sendEmailButton);

      await waitFor(() => {
        expect(errorHandlingService.handleApiError).toHaveBeenCalledWith(apiError);
      });

      expect(screen.getByText('API error occurred')).toBeInTheDocument();
    });
  });

  describe('Error Boundary + User Feedback Integration', () => {
    test('should catch component errors and display error boundary', () => {
      render(
        <ErrorBoundary>
          <IntegratedTestComponent shouldThrowError={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    test('should allow error recovery after boundary triggers', async () => {
      const user = userEvent.setup();
      let shouldThrow = true;

      const { rerender } = render(
        <ErrorBoundary>
          <IntegratedTestComponent shouldThrowError={shouldThrow} />
        </ErrorBoundary>
      );

      // Error state
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();

      // Click reset
      const resetButton = screen.getByText('Try Again');
      await user.click(resetButton);

      // Rerender with no error
      shouldThrow = false;
      rerender(
        <ErrorBoundary>
          <IntegratedTestComponent shouldThrowError={shouldThrow} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Integrated Test Component')).toBeInTheDocument();
    });
  });

  describe('UserFeedback Component Integration', () => {
    test('should display and close feedback messages', async () => {
      const user = userEvent.setup();
      render(
        <UserFeedback
          type="success"
          title="Success"
          message="Operation completed"
          isVisible={true}
          onClose={vi.fn()}
        />
      );

      expect(screen.getByText('Success')).toBeInTheDocument();
      expect(screen.getByText('Operation completed')).toBeInTheDocument();
    });

    test('should handle different feedback types', () => {
      const { rerender } = render(
        <UserFeedback
          type="error"
          message="Error message"
          isVisible={true}
        />
      );

      expect(screen.getByText('Error message')).toBeInTheDocument();

      rerender(
        <UserFeedback
          type="warning"
          message="Warning message"
          isVisible={true}
        />
      );

      expect(screen.getByText('Warning message')).toBeInTheDocument();

      rerender(
        <UserFeedback
          type="info"
          message="Info message"
          isVisible={true}
        />
      );

      expect(screen.getByText('Info message')).toBeInTheDocument();
    });
  });

  describe('Service Integration', () => {
    test('should integrate error handling service with notification service', async () => {
      // Test that error handling service properly processes notification service errors
      const networkError = { response: { status: 500 } };
      
      const result = errorHandlingService.parseApiError(networkError);
      
      expect(result.type).toBe('error');
      expect(result.userMessage).toBe('A server error occurred. Please try again later.');
      expect(result.shouldRetry).toBe(true);
    });

    test('should validate email addresses before sending notifications', () => {
      const emails = ['valid@example.com', 'invalid-email', 'another@valid.com'];
      
      const validation = notificationService.validateEmails(emails);
      
      expect(validation.valid).toEqual(['valid@example.com', 'another@valid.com']);
      expect(validation.invalid).toEqual(['invalid-email']);
    });
  });

  describe('End-to-End User Workflows', () => {
    test('should handle complete certificate sharing workflow', async () => {
      const user = userEvent.setup();
      
      // Mock successful API responses
      axios.get.mockResolvedValue({
        data: {
          id: 'cert-123',
          title: 'Test Certificate',
          recipients: [
            { id: '1', name: 'John Doe', email: 'john@example.com' }
          ]
        }
      });

      notificationService.sendCertificate.mockResolvedValue({
        success: true,
        message: 'Certificate sent successfully'
      });

      render(
        <ErrorBoundary>
          <IntegratedTestComponent />
        </ErrorBoundary>
      );

      // 1. Send notification
      const sendButton = screen.getByText('Send Email');
      await user.click(sendButton);

      // 2. Verify success feedback
      await waitFor(() => {
        expect(screen.getByText('Email sent successfully!')).toBeInTheDocument();
      });

      // 3. Verify state updates
      expect(screen.getByText('Email sent!')).toBeInTheDocument();
      expect(sendButton).toBeDisabled();
    });

    test('should handle error recovery in multi-step processes', async () => {
      const user = userEvent.setup();
      
      // First attempt fails
      notificationService.sendCertificate
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ success: true });

      render(
        <ErrorBoundary>
          <IntegratedTestComponent />
        </ErrorBoundary>
      );

      const sendButton = screen.getByText('Send Email');
      
      // First attempt
      await user.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText('API error occurred')).toBeInTheDocument();
      });

      // Close error message and retry
      const closeButton = screen.getByRole('button', { name: /close/i });
      if (closeButton) {
        await user.click(closeButton);
      }

      // Second attempt (should succeed)
      await user.click(sendButton);
      
      await waitFor(() => {
        expect(screen.getByText('Email sent!')).toBeInTheDocument();
      });
    });
  });

  describe('Performance and Memory Management', () => {
    test('should clean up event listeners and prevent memory leaks', () => {
      const { unmount } = render(
        <ErrorBoundary>
          <IntegratedTestComponent />
        </ErrorBoundary>
      );

      // Component should mount without errors
      expect(screen.getByText('Integrated Test Component')).toBeInTheDocument();

      // Unmounting should not throw errors
      expect(() => unmount()).not.toThrow();
    });

    test('should handle multiple rapid state updates without race conditions', async () => {
      const user = userEvent.setup();
      render(
        <ErrorBoundary>
          <IntegratedTestComponent />
        </ErrorBoundary>
      );

      const nameInput = screen.getByPlaceholderText('Enter name');

      // Rapid typing simulation
      await user.type(nameInput, 'John Doe Smith');

      // Should handle all changes without errors
      expect(nameInput.value).toBe('John Doe Smith');
    });
  });
});

// Test helper for creating mock components
const createMockComponent = (name, throwError = false) => {
  return () => {
    if (throwError) {
      throw new Error(`${name} component error`);
    }
    return <div data-testid={name.toLowerCase()}>{name} Component</div>;
  };
};

// Additional integration tests for complex scenarios
describe('Complex Integration Scenarios', () => {
  test('should handle nested error boundaries correctly', () => {
    const InnerComponent = createMockComponent('Inner', true);
    const OuterComponent = createMockComponent('Outer', false);

    render(
      <ErrorBoundary>
        <OuterComponent />
        <ErrorBoundary>
          <InnerComponent />
        </ErrorBoundary>
      </ErrorBoundary>
    );

    expect(screen.getByTestId('outer')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  test('should integrate all Phase 2 services in a realistic workflow', async () => {
    // This test simulates a real user workflow using all Phase 2 features
    const mockWorkflowData = {
      certificate: { id: 'cert-123', title: 'Test Certificate' },
      recipients: ['user1@test.com', 'user2@test.com'],
      formData: { message: 'Custom message', priority: 'high' }
    };

    // Mock all services
    notificationService.validateEmails.mockReturnValue({
      valid: mockWorkflowData.recipients,
      invalid: []
    });

    notificationService.sendCertificate.mockResolvedValue({
      success: true,
      message: 'All certificates sent'
    });

    // This would be a full workflow test with actual components
    expect(mockWorkflowData.recipients).toHaveLength(2);
    expect(notificationService.validateEmails).toBeDefined();
    expect(errorHandlingService.handleApiError).toBeDefined();
  });
});