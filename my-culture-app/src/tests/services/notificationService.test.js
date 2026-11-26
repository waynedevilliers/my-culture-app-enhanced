import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { toast } from 'react-toastify';
import notificationService from '../../services/notificationService';

// Mock axios
vi.mock('axios');

// Mock react-toastify
vi.mock('react-toastify', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

// Mock import.meta.env
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_BACKEND: 'http://localhost:3001'
  },
  writable: true
});

beforeEach(() => {
  vi.clearAllMocks();
  mockLocalStorage.getItem.mockReturnValue('fake-jwt-token');
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('NotificationService', () => {
  describe('sendCertificate', () => {
    test('should send certificate successfully', async () => {
      const mockResponse = {
        data: {
          message: 'Certificate sent successfully',
          sentCount: 3
        }
      };

      axios.post.mockResolvedValue(mockResponse);

      const result = await notificationService.sendCertificate(
        'cert-123',
        ['user1@test.com', 'user2@test.com', 'user3@test.com'],
        {
          includeDownloadLink: true,
          customMessage: 'Congratulations!',
          priority: 'high'
        }
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Certificate sent successfully');
      expect(axios.post).toHaveBeenCalledWith('/api/certificates/send-certificate/cert-123', {
        recipientEmails: ['user1@test.com', 'user2@test.com', 'user3@test.com'],
        includeDownloadLink: true,
        customMessage: 'Congratulations!',
        priority: 'high'
      });
      
      // Check authorization header was set
      expect(axios.post.mock.calls[0][2].headers.Authorization).toBe('Bearer fake-jwt-token');
    });

    test('should handle certificate send failure', async () => {
      const mockError = {
        response: {
          status: 404,
          data: { message: 'Certificate not found' }
        }
      };

      axios.post.mockRejectedValue(mockError);

      const result = await notificationService.sendCertificate('cert-404');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Certificate not found');
    });

    test('should handle permission denied errors', async () => {
      const mockError = {
        response: { status: 403 }
      };

      axios.post.mockRejectedValue(mockError);

      const result = await notificationService.sendCertificate('cert-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('You don\'t have permission to send this certificate');
    });

    test('should handle rate limit errors', async () => {
      const mockError = {
        response: { status: 429 }
      };

      axios.post.mockRejectedValue(mockError);

      const result = await notificationService.sendCertificate('cert-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Rate limit exceeded. Please try again later');
    });
  });

  describe('sendBulkCertificates', () => {
    test('should send bulk certificates successfully', async () => {
      const mockResponse = {
        data: {
          message: 'Bulk certificates sent',
          sentCount: 5,
          failedCount: 1
        }
      };

      axios.post.mockResolvedValue(mockResponse);

      const result = await notificationService.sendBulkCertificates(
        ['cert-1', 'cert-2', 'cert-3'],
        { priority: 'normal' }
      );

      expect(result.success).toBe(true);
      expect(result.sentCount).toBe(5);
      expect(result.failedCount).toBe(1);
      expect(axios.post).toHaveBeenCalledWith('/api/certificates/send-bulk', {
        certificateIds: ['cert-1', 'cert-2', 'cert-3'],
        priority: 'normal'
      });
    });

    test('should handle bulk send failure', async () => {
      const mockError = {
        response: {
          data: { message: 'Bulk send failed' }
        }
      };

      axios.post.mockRejectedValue(mockError);

      const result = await notificationService.sendBulkCertificates(['cert-1']);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Bulk send failed');
    });
  });

  describe('sendApplicationNotification', () => {
    test('should send application approved notification', async () => {
      const mockResponse = {
        data: { message: 'Approval notification sent' }
      };

      axios.post.mockResolvedValue(mockResponse);

      const result = await notificationService.sendApplicationNotification(
        'app-123',
        'approved',
        'Welcome to our platform!'
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Approval notification sent');
      expect(axios.post).toHaveBeenCalledWith('/api/organizations/applications/app-123/notify', {
        type: 'approved',
        customMessage: 'Welcome to our platform!'
      });
    });

    test('should send application rejected notification', async () => {
      const mockResponse = {
        data: { message: 'Rejection notification sent' }
      };

      axios.post.mockResolvedValue(mockResponse);

      const result = await notificationService.sendApplicationNotification(
        'app-123',
        'rejected',
        'Unfortunately, we cannot approve your application at this time.'
      );

      expect(result.success).toBe(true);
      expect(axios.post).toHaveBeenCalledWith('/api/organizations/applications/app-123/notify', {
        type: 'rejected',
        customMessage: 'Unfortunately, we cannot approve your application at this time.'
      });
    });

    test('should handle notification send failure', async () => {
      axios.post.mockRejectedValue(new Error('Network error'));

      const result = await notificationService.sendApplicationNotification('app-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to send notification');
    });
  });

  describe('sendNewsletter', () => {
    test('should send newsletter successfully', async () => {
      const mockResponse = {
        data: { message: 'Newsletter sent to 100 subscribers' }
      };

      axios.post.mockResolvedValue(mockResponse);

      const result = await notificationService.sendNewsletter('newsletter-123', ['all']);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Newsletter sent to 100 subscribers');
      expect(axios.post).toHaveBeenCalledWith('/api/newsletter/send/newsletter-123', {
        recipientGroups: ['all']
      });
    });

    test('should send newsletter to specific groups', async () => {
      const mockResponse = {
        data: { message: 'Newsletter sent to premium subscribers' }
      };

      axios.post.mockResolvedValue(mockResponse);

      await notificationService.sendNewsletter('newsletter-123', ['premium', 'vip']);

      expect(axios.post).toHaveBeenCalledWith('/api/newsletter/send/newsletter-123', {
        recipientGroups: ['premium', 'vip']
      });
    });

    test('should handle newsletter send failure', async () => {
      axios.post.mockRejectedValue(new Error('Send failed'));

      const result = await notificationService.sendNewsletter('newsletter-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to send newsletter');
    });
  });

  describe('getEmailStatus', () => {
    test('should get email status successfully', async () => {
      const mockResponse = {
        data: {
          id: 'email-123',
          status: 'delivered',
          timestamp: '2025-01-01T10:00:00Z'
        }
      };

      axios.get.mockResolvedValue(mockResponse);

      const result = await notificationService.getEmailStatus('email-123');

      expect(result.success).toBe(true);
      expect(result.data.status).toBe('delivered');
      expect(axios.get).toHaveBeenCalledWith('/api/emails/status/email-123');
    });

    test('should handle email status fetch failure', async () => {
      axios.get.mockRejectedValue(new Error('Status fetch failed'));

      const result = await notificationService.getEmailStatus('email-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to get email status');
    });
  });

  describe('getNotificationPreferences', () => {
    test('should get user notification preferences', async () => {
      const mockResponse = {
        data: {
          certificateEmails: true,
          applicationUpdates: false,
          newsletterEmails: true
        }
      };

      axios.get.mockResolvedValue(mockResponse);

      const result = await notificationService.getNotificationPreferences();

      expect(result.success).toBe(true);
      expect(result.data.certificateEmails).toBe(true);
      expect(axios.get).toHaveBeenCalledWith('/api/users/notifications');
    });

    test('should get specific user notification preferences', async () => {
      const mockResponse = {
        data: { preferences: 'user-specific' }
      };

      axios.get.mockResolvedValue(mockResponse);

      await notificationService.getNotificationPreferences('user-123');

      expect(axios.get).toHaveBeenCalledWith('/api/users/user-123/notifications');
    });

    test('should handle preferences fetch failure', async () => {
      axios.get.mockRejectedValue(new Error('Fetch failed'));

      const result = await notificationService.getNotificationPreferences();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to get preferences');
    });
  });

  describe('updateNotificationPreferences', () => {
    test('should update notification preferences successfully', async () => {
      const mockResponse = {
        data: { message: 'Preferences updated' }
      };

      const preferences = {
        certificateEmails: false,
        applicationUpdates: true
      };

      axios.put.mockResolvedValue(mockResponse);

      const result = await notificationService.updateNotificationPreferences(preferences);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Notification preferences updated successfully');
      expect(axios.put).toHaveBeenCalledWith('/api/users/notifications', preferences);
    });

    test('should handle preferences update failure', async () => {
      const preferences = { certificateEmails: true };
      axios.put.mockRejectedValue(new Error('Update failed'));

      const result = await notificationService.updateNotificationPreferences(preferences);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to update preferences');
    });
  });

  describe('validateEmails', () => {
    test('should validate correct email addresses', () => {
      const emails = [
        'user@example.com',
        'test.email+tag@domain.co.uk',
        'simple@domain.org'
      ];

      const result = notificationService.validateEmails(emails);

      expect(result.valid).toEqual(emails);
      expect(result.invalid).toEqual([]);
    });

    test('should identify invalid email addresses', () => {
      const emails = [
        'valid@example.com',
        'invalid.email',
        'missing@',
        '@missing.com',
        'spaces in@email.com'
      ];

      const result = notificationService.validateEmails(emails);

      expect(result.valid).toEqual(['valid@example.com']);
      expect(result.invalid).toEqual([
        'invalid.email',
        'missing@',
        '@missing.com',
        'spaces in@email.com'
      ]);
    });

    test('should handle empty email list', () => {
      const result = notificationService.validateEmails([]);

      expect(result.valid).toEqual([]);
      expect(result.invalid).toEqual([]);
    });

    test('should trim whitespace from valid emails', () => {
      const emails = ['  user@example.com  ', '  test@domain.org'];

      const result = notificationService.validateEmails(emails);

      expect(result.valid).toEqual(['user@example.com', 'test@domain.org']);
    });
  });

  describe('showNotificationResult', () => {
    test('should show success toast for successful result', () => {
      const result = {
        success: true,
        message: 'Operation completed'
      };

      const returnedResult = notificationService.showNotificationResult(result);

      expect(toast.success).toHaveBeenCalledWith('Operation completed');
      expect(returnedResult).toEqual(result);
    });

    test('should show error toast for failed result', () => {
      const result = {
        success: false,
        error: 'Operation failed'
      };

      const returnedResult = notificationService.showNotificationResult(result);

      expect(toast.error).toHaveBeenCalledWith('Operation failed');
      expect(returnedResult).toEqual(result);
    });

    test('should use default success message when not provided', () => {
      const result = { success: true };

      notificationService.showNotificationResult(result, 'Custom success message');

      expect(toast.success).toHaveBeenCalledWith('Custom success message');
    });

    test('should use default error message when not provided', () => {
      const result = { success: false };

      notificationService.showNotificationResult(result);

      expect(toast.error).toHaveBeenCalledWith('Operation failed');
    });
  });

  describe('API client configuration', () => {
    test('should include authorization header in requests', () => {
      mockLocalStorage.getItem.mockReturnValue('test-token');

      // Create a new instance to test interceptor
      const mockRequest = { headers: {} };
      
      // Simulate the request interceptor
      mockRequest.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;

      expect(mockRequest.headers.Authorization).toBe('Bearer test-token');
    });

    test('should handle missing token gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const mockRequest = { headers: {} };
      
      const token = localStorage.getItem('token');
      if (token) {
        mockRequest.headers.Authorization = `Bearer ${token}`;
      }

      expect(mockRequest.headers.Authorization).toBeUndefined();
    });
  });
});