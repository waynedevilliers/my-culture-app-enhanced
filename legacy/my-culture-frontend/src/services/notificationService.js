import axios from 'axios';
import { toast } from 'react-toastify';

class NotificationService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_BACKEND;
    this.apiClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000, // 30 seconds timeout for email operations
    });

    // Add request interceptor for authentication
    this.apiClient.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  /**
   * Send certificate via email to recipients
   */
  async sendCertificate(certificateId, recipientEmails = [], options = {}) {
    try {
      const { 
        includeDownloadLink = true,
        customMessage = null,
        priority = 'normal' // 'high', 'normal', 'low'
      } = options;

      const response = await this.apiClient.post(`/api/certificates/send-certificate/${certificateId}`, {
        recipientEmails,
        includeDownloadLink,
        customMessage,
        priority
      });

      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Certificate sent successfully'
      };
    } catch (error) {
      console.error('Error sending certificate:', error);
      
      let errorMessage = 'Failed to send certificate';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 403) {
        errorMessage = 'You don\'t have permission to send this certificate';
      } else if (error.response?.status === 404) {
        errorMessage = 'Certificate not found';
      } else if (error.response?.status === 429) {
        errorMessage = 'Rate limit exceeded. Please try again later';
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Send bulk certificates
   */
  async sendBulkCertificates(certificateIds, options = {}) {
    try {
      const response = await this.apiClient.post('/api/certificates/send-bulk', {
        certificateIds,
        ...options
      });

      return {
        success: true,
        data: response.data,
        sentCount: response.data.sentCount || 0,
        failedCount: response.data.failedCount || 0,
        message: response.data.message || 'Bulk certificates sent'
      };
    } catch (error) {
      console.error('Error sending bulk certificates:', error);
      
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to send bulk certificates'
      };
    }
  }

  /**
   * Send organization application notification
   */
  async sendApplicationNotification(applicationId, type = 'approved', customMessage = null) {
    try {
      const response = await this.apiClient.post(`/api/organizations/applications/${applicationId}/notify`, {
        type, // 'approved', 'rejected', 'pending'
        customMessage
      });

      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Notification sent successfully'
      };
    } catch (error) {
      console.error('Error sending application notification:', error);
      
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to send notification'
      };
    }
  }

  /**
   * Send newsletter to subscribers
   */
  async sendNewsletter(newsletterId, recipientGroups = ['all']) {
    try {
      const response = await this.apiClient.post(`/api/newsletter/send/${newsletterId}`, {
        recipientGroups
      });

      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Newsletter sent successfully'
      };
    } catch (error) {
      console.error('Error sending newsletter:', error);
      
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to send newsletter'
      };
    }
  }

  /**
   * Get email delivery status
   */
  async getEmailStatus(emailId) {
    try {
      const response = await this.apiClient.get(`/api/emails/status/${emailId}`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error getting email status:', error);
      
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get email status'
      };
    }
  }

  /**
   * Get notification preferences for user
   */
  async getNotificationPreferences(userId = null) {
    try {
      const url = userId ? `/api/users/${userId}/notifications` : '/api/users/notifications';
      const response = await this.apiClient.get(url);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get preferences'
      };
    }
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(preferences) {
    try {
      const response = await this.apiClient.put('/api/users/notifications', preferences);
      
      return {
        success: true,
        data: response.data,
        message: 'Notification preferences updated successfully'
      };
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update preferences'
      };
    }
  }

  /**
   * Validate email addresses
   */
  validateEmails(emails) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const results = {
      valid: [],
      invalid: []
    };

    emails.forEach(email => {
      if (typeof email === 'string' && emailRegex.test(email.trim())) {
        results.valid.push(email.trim());
      } else {
        results.invalid.push(email);
      }
    });

    return results;
  }

  /**
   * Show appropriate toast notification based on result
   */
  showNotificationResult(result, defaultSuccessMessage = 'Operation completed successfully') {
    if (result.success) {
      toast.success(result.message || defaultSuccessMessage);
    } else {
      toast.error(result.error || 'Operation failed');
    }
    
    return result;
  }
}

// Create singleton instance
const notificationService = new NotificationService();

export default notificationService;