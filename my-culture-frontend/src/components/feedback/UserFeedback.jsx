import { useState, useEffect } from 'react';
import { 
  FaCircleCheck, 
  FaTriangleExclamation, 
  FaCircleExclamation, 
  FaCircleInfo,
  FaXmark,
  FaSpinner,
  FaArrowRotateRight,
  FaArrowUpRightFromSquare
} from 'react-icons/fa6';

/**
 * Enhanced user feedback component for various states and messages
 */
const UserFeedback = ({ 
  type = 'info', 
  title, 
  message, 
  isVisible = true,
  onClose,
  onRetry,
  autoClose = false,
  autoCloseDelay = 5000,
  showIcon = true,
  actions = [],
  className = ''
}) => {
  const [show, setShow] = useState(isVisible);

  useEffect(() => {
    setShow(isVisible);
  }, [isVisible]);

  useEffect(() => {
    if (autoClose && show) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, show]);

  const handleClose = () => {
    setShow(false);
    onClose?.();
  };

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800',
          iconColor: 'text-green-600',
          icon: FaCircleCheck
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600',
          icon: FaTriangleExclamation
        };
      case 'error':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600',
          icon: FaCircleExclamation
        };
      case 'loading':
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600',
          icon: FaSpinner
        };
      default: // info
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600',
          icon: FaCircleInfo
        };
    }
  };

  if (!show) return null;

  const config = getTypeConfig();
  const IconComponent = config.icon;

  return (
    <div className={`
      ${config.bgColor} ${config.borderColor} ${config.textColor}
      border rounded-lg p-4 mb-4 transition-all duration-300 ease-in-out
      ${className}
    `}>
      <div className="flex items-start">
        {showIcon && (
          <div className="flex-shrink-0 mr-3">
            <IconComponent 
              className={`
                w-5 h-5 ${config.iconColor}
                ${type === 'loading' ? 'animate-spin' : ''}
              `} 
            />
          </div>
        )}
        
        <div className="flex-1">
          {title && (
            <h4 className={`font-semibold ${config.textColor} mb-1`}>
              {title}
            </h4>
          )}
          
          {message && (
            <div className={`${config.textColor} ${title ? 'text-sm' : ''}`}>
              {typeof message === 'string' ? (
                <p>{message}</p>
              ) : (
                message
              )}
            </div>
          )}

          {/* Action buttons */}
          {(actions.length > 0 || onRetry) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="inline-flex items-center px-3 py-1 text-sm font-medium bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  <FaArrowRotateRight className="w-3 h-3 mr-1" />
                  Try Again
                </button>
              )}
              
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.onClick}
                  className={`
                    inline-flex items-center px-3 py-1 text-sm font-medium rounded transition-colors
                    ${action.variant === 'primary' 
                      ? 'bg-primary text-white hover:bg-primary-dark'
                      : 'bg-white border border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  {action.icon && <action.icon className="w-3 h-3 mr-1" />}
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {onClose && (
          <div className="flex-shrink-0 ml-3">
            <button
              onClick={handleClose}
              className={`
                ${config.textColor} hover:opacity-75 transition-opacity
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
              `}
            >
              <FaXmark className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Loading state component
 */
export const LoadingFeedback = ({ message = 'Loading...', size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const spinnerSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex items-center space-x-3">
        <FaSpinner className={`${spinnerSizes[size]} text-primary animate-spin`} />
        <span className={`${sizeClasses[size]} text-gray-600`}>
          {message}
        </span>
      </div>
    </div>
  );
};

/**
 * Empty state component
 */
export const EmptyState = ({ 
  icon: IconComponent = FaInfoCircle,
  title = 'No items found',
  message = 'There are no items to display.',
  action,
  className = ''
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <IconComponent className="w-8 h-8 text-gray-400" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {message}
      </p>

      {action && (
        <button
          onClick={action.onClick}
          className="btn btn-primary"
        >
          {action.icon && <action.icon className="w-4 h-4 mr-2" />}
          {action.label}
        </button>
      )}
    </div>
  );
};

/**
 * Error boundary fallback component
 */
export const ErrorBoundaryFallback = ({ error, resetError }) => {
  return (
    <div className="min-h-64 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaExclamationCircle className="w-8 h-8 text-red-600" />
        </div>
        
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          Something went wrong
        </h2>
        
        <p className="text-gray-600 mb-6">
          An unexpected error occurred. Please try refreshing the page or contact support if the problem persists.
        </p>

        <div className="space-y-2">
          <button
            onClick={resetError}
            className="btn btn-primary w-full"
          >
            <FaArrowRotateRight className="w-4 h-4 mr-2" />
            Try Again
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="btn btn-outline w-full"
          >
            Refresh Page
          </button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Show Error Details
            </summary>
            <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-32">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

/**
 * Connection status indicator
 */
export const ConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !showOfflineMessage) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <UserFeedback
        type={isOnline ? 'success' : 'warning'}
        title={isOnline ? 'Back Online' : 'No Internet Connection'}
        message={isOnline 
          ? 'Your connection has been restored.'
          : 'Please check your internet connection.'
        }
        autoClose={isOnline}
        autoCloseDelay={3000}
        onClose={() => setShowOfflineMessage(false)}
        className="max-w-xs"
      />
    </div>
  );
};

/**
 * Toast-like floating notification
 */
export const FloatingNotification = ({ 
  type = 'info',
  title,
  message,
  isVisible,
  onClose,
  position = 'top-right', // 'top-right', 'top-left', 'bottom-right', 'bottom-left'
  duration = 5000
}) => {
  const [show, setShow] = useState(isVisible);

  useEffect(() => {
    setShow(isVisible);
    
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration]);

  const handleClose = () => {
    setShow(false);
    onClose?.();
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      default:
        return 'top-4 right-4';
    }
  };

  if (!show) return null;

  return (
    <div className={`fixed ${getPositionClasses()} z-50 max-w-sm animate-slide-in-right`}>
      <UserFeedback
        type={type}
        title={title}
        message={message}
        onClose={handleClose}
        className="shadow-lg"
      />
    </div>
  );
};

export default UserFeedback;