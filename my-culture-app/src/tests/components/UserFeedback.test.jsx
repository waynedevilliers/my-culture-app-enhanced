import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserFeedback, { 
  LoadingFeedback, 
  EmptyState, 
  ErrorBoundaryFallback, 
  ConnectionStatus,
  FloatingNotification 
} from '../../components/feedback/UserFeedback';
import { FaUser, FaPlus } from 'react-icons/fa6';

// Mock icons
vi.mock('react-icons/fa6', () => ({
  FaCircleCheck: () => <div data-testid="check-icon" />,
  FaTriangleExclamation: () => <div data-testid="warning-icon" />,
  FaCircleExclamation: () => <div data-testid="error-icon" />,
  FaCircleInfo: () => <div data-testid="info-icon" />,
  FaXmark: () => <div data-testid="close-icon" />,
  FaSpinner: () => <div data-testid="spinner-icon" />,
  FaArrowRotateRight: () => <div data-testid="retry-icon" />,
  FaUser: () => <div data-testid="user-icon" />,
  FaPlus: () => <div data-testid="plus-icon" />,
  FaArrowUpRightFromSquare: () => <div data-testid="external-link-icon" />
}));

describe('UserFeedback', () => {
  const defaultProps = {
    title: 'Test Title',
    message: 'Test message',
    isVisible: true
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('basic rendering', () => {
    test('should render with title and message', () => {
      render(<UserFeedback {...defaultProps} />);

      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test message')).toBeInTheDocument();
    });

    test('should not render when isVisible is false', () => {
      render(<UserFeedback {...defaultProps} isVisible={false} />);

      expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
    });

    test('should render without title', () => {
      render(<UserFeedback message="Just a message" isVisible={true} />);

      expect(screen.getByText('Just a message')).toBeInTheDocument();
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    test('should render with custom className', () => {
      const { container } = render(
        <UserFeedback {...defaultProps} className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('feedback types', () => {
    test('should render success type correctly', () => {
      render(<UserFeedback {...defaultProps} type="success" />);

      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
      expect(screen.getByText('Test Title')).toHaveClass('text-green-800');
    });

    test('should render warning type correctly', () => {
      render(<UserFeedback {...defaultProps} type="warning" />);

      expect(screen.getByTestId('warning-icon')).toBeInTheDocument();
      expect(screen.getByText('Test Title')).toHaveClass('text-yellow-800');
    });

    test('should render error type correctly', () => {
      render(<UserFeedback {...defaultProps} type="error" />);

      expect(screen.getByTestId('error-icon')).toBeInTheDocument();
      expect(screen.getByText('Test Title')).toHaveClass('text-red-800');
    });

    test('should render loading type correctly', () => {
      render(<UserFeedback {...defaultProps} type="loading" />);

      expect(screen.getByTestId('spinner-icon')).toBeInTheDocument();
      expect(screen.getByText('Test Title')).toHaveClass('text-blue-800');
    });

    test('should default to info type', () => {
      render(<UserFeedback {...defaultProps} />);

      expect(screen.getByTestId('info-icon')).toBeInTheDocument();
      expect(screen.getByText('Test Title')).toHaveClass('text-blue-800');
    });
  });

  describe('icon display', () => {
    test('should show icon by default', () => {
      render(<UserFeedback {...defaultProps} type="success" />);

      expect(screen.getByTestId('check-icon')).toBeInTheDocument();
    });

    test('should hide icon when showIcon is false', () => {
      render(<UserFeedback {...defaultProps} type="success" showIcon={false} />);

      expect(screen.queryByTestId('check-icon')).not.toBeInTheDocument();
    });
  });

  describe('close functionality', () => {
    test('should show close button when onClose is provided', () => {
      const onClose = vi.fn();
      render(<UserFeedback {...defaultProps} onClose={onClose} />);

      expect(screen.getByTestId('close-icon')).toBeInTheDocument();
    });

    test('should not show close button when onClose is not provided', () => {
      render(<UserFeedback {...defaultProps} />);

      expect(screen.queryByTestId('close-icon')).not.toBeInTheDocument();
    });

    test('should call onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<UserFeedback {...defaultProps} onClose={onClose} />);

      const closeButton = screen.getByTestId('close-icon').parentElement;
      await user.click(closeButton);

      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('auto close functionality', () => {
    test('should auto close after specified delay', async () => {
      const onClose = vi.fn();
      render(
        <UserFeedback
          {...defaultProps}
          onClose={onClose}
          autoClose={true}
          autoCloseDelay={1000}
        />
      );

      vi.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });

    test('should not auto close when autoClose is false', async () => {
      const onClose = vi.fn();
      render(
        <UserFeedback
          {...defaultProps}
          onClose={onClose}
          autoClose={false}
        />
      );

      vi.advanceTimersByTime(5000);

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('retry functionality', () => {
    test('should show retry button when onRetry is provided', () => {
      const onRetry = vi.fn();
      render(<UserFeedback {...defaultProps} onRetry={onRetry} />);

      expect(screen.getByText('Try Again')).toBeInTheDocument();
      expect(screen.getByTestId('retry-icon')).toBeInTheDocument();
    });

    test('should call onRetry when retry button is clicked', async () => {
      const user = userEvent.setup();
      const onRetry = vi.fn();
      render(<UserFeedback {...defaultProps} onRetry={onRetry} />);

      const retryButton = screen.getByText('Try Again');
      await user.click(retryButton);

      expect(onRetry).toHaveBeenCalled();
    });
  });

  describe('custom actions', () => {
    test('should render custom action buttons', () => {
      const actions = [
        { label: 'Custom Action', onClick: vi.fn() },
        { label: 'Primary Action', onClick: vi.fn(), variant: 'primary' }
      ];

      render(<UserFeedback {...defaultProps} actions={actions} />);

      expect(screen.getByText('Custom Action')).toBeInTheDocument();
      expect(screen.getByText('Primary Action')).toBeInTheDocument();
    });

    test('should call action onClick when clicked', async () => {
      const user = userEvent.setup();
      const actionHandler = vi.fn();
      const actions = [
        { label: 'Test Action', onClick: actionHandler }
      ];

      render(<UserFeedback {...defaultProps} actions={actions} />);

      const actionButton = screen.getByText('Test Action');
      await user.click(actionButton);

      expect(actionHandler).toHaveBeenCalled();
    });

    test('should render action with icon', () => {
      const actions = [
        { label: 'With Icon', onClick: vi.fn(), icon: FaUser }
      ];

      render(<UserFeedback {...defaultProps} actions={actions} />);

      expect(screen.getByTestId('user-icon')).toBeInTheDocument();
    });
  });

  describe('message content', () => {
    test('should render string message', () => {
      render(<UserFeedback message="String message" isVisible={true} />);

      expect(screen.getByText('String message')).toBeInTheDocument();
    });

    test('should render JSX message', () => {
      const jsxMessage = (
        <div>
          <span>Complex</span> <strong>message</strong>
        </div>
      );

      render(<UserFeedback message={jsxMessage} isVisible={true} />);

      expect(screen.getByText('Complex')).toBeInTheDocument();
      expect(screen.getByText('message')).toBeInTheDocument();
    });
  });
});

describe('LoadingFeedback', () => {
  test('should render with default message and size', () => {
    render(<LoadingFeedback />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.getByTestId('spinner-icon')).toBeInTheDocument();
  });

  test('should render with custom message', () => {
    render(<LoadingFeedback message="Custom loading message" />);

    expect(screen.getByText('Custom loading message')).toBeInTheDocument();
  });

  test('should apply correct size classes', () => {
    const { rerender } = render(<LoadingFeedback size="sm" />);

    expect(screen.getByText('Loading...')).toHaveClass('text-sm');

    rerender(<LoadingFeedback size="lg" />);

    expect(screen.getByText('Loading...')).toHaveClass('text-lg');
  });
});

describe('EmptyState', () => {
  test('should render with default props', () => {
    render(<EmptyState />);

    expect(screen.getByText('No items found')).toBeInTheDocument();
    expect(screen.getByText('There are no items to display.')).toBeInTheDocument();
    expect(screen.getByTestId('info-icon')).toBeInTheDocument();
  });

  test('should render with custom content', () => {
    render(
      <EmptyState
        icon={FaUser}
        title="No users"
        message="No users have been added yet."
      />
    );

    expect(screen.getByText('No users')).toBeInTheDocument();
    expect(screen.getByText('No users have been added yet.')).toBeInTheDocument();
    expect(screen.getByTestId('user-icon')).toBeInTheDocument();
  });

  test('should render with action button', async () => {
    const user = userEvent.setup();
    const actionHandler = vi.fn();
    const action = {
      label: 'Add Item',
      onClick: actionHandler,
      icon: FaPlus
    };

    render(<EmptyState action={action} />);

    const actionButton = screen.getByText('Add Item');
    expect(actionButton).toBeInTheDocument();
    expect(screen.getByTestId('plus-icon')).toBeInTheDocument();

    await user.click(actionButton);
    expect(actionHandler).toHaveBeenCalled();
  });
});

describe('ErrorBoundaryFallback', () => {
  const mockError = new Error('Test error');
  mockError.stack = 'Error stack trace';

  test('should render error message with retry button', async () => {
    const user = userEvent.setup();
    const resetError = vi.fn();

    render(<ErrorBoundaryFallback error={mockError} resetError={resetError} />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/An unexpected error occurred/)).toBeInTheDocument();

    const tryAgainButton = screen.getByText('Try Again');
    await user.click(tryAgainButton);

    expect(resetError).toHaveBeenCalled();
  });

  test('should show refresh page button', async () => {
    // Mock window.location.reload
    const mockReload = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true
    });

    const user = userEvent.setup();
    render(<ErrorBoundaryFallback error={mockError} resetError={vi.fn()} />);

    const refreshButton = screen.getByText('Refresh Page');
    await user.click(refreshButton);

    expect(mockReload).toHaveBeenCalled();
  });

  test('should show error details in development mode', () => {
    // Mock NODE_ENV
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(<ErrorBoundaryFallback error={mockError} resetError={vi.fn()} />);

    expect(screen.getByText('Show Error Details')).toBeInTheDocument();

    // Restore NODE_ENV
    process.env.NODE_ENV = originalEnv;
  });
});

describe('ConnectionStatus', () => {
  beforeEach(() => {
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true
    });
  });

  test('should not render when online and no offline message shown', () => {
    const { container } = render(<ConnectionStatus />);

    expect(container.firstChild).toBeNull();
  });

  test('should show offline message when going offline', async () => {
    const { rerender } = render(<ConnectionStatus />);

    // Simulate going offline
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true });
    fireEvent(window, new Event('offline'));

    rerender(<ConnectionStatus />);

    await waitFor(() => {
      expect(screen.getByText('No Internet Connection')).toBeInTheDocument();
    });
  });

  test('should show back online message when reconnecting', async () => {
    // Start offline
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true });
    const { rerender } = render(<ConnectionStatus />);

    fireEvent(window, new Event('offline'));
    rerender(<ConnectionStatus />);

    // Go back online
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true });
    fireEvent(window, new Event('online'));
    rerender(<ConnectionStatus />);

    await waitFor(() => {
      expect(screen.getByText('Back Online')).toBeInTheDocument();
    });
  });
});

describe('FloatingNotification', () => {
  test('should render in correct position', () => {
    const { container } = render(
      <FloatingNotification
        title="Test"
        message="Test message"
        isVisible={true}
        position="top-left"
      />
    );

    expect(container.firstChild).toHaveClass('top-4', 'left-4');
  });

  test('should auto close after duration', async () => {
    const onClose = vi.fn();
    render(
      <FloatingNotification
        title="Test"
        message="Test message"
        isVisible={true}
        onClose={onClose}
        duration={1000}
      />
    );

    vi.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  test('should not auto close when duration is 0', async () => {
    const onClose = vi.fn();
    render(
      <FloatingNotification
        title="Test"
        message="Test message"
        isVisible={true}
        onClose={onClose}
        duration={0}
      />
    );

    vi.advanceTimersByTime(5000);

    expect(onClose).not.toHaveBeenCalled();
  });
});