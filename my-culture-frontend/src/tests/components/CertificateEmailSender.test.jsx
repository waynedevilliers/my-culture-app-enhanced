import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'react-toastify';
import CertificateEmailSender from '../../components/certificate/CertificateEmailSender';
import notificationService from '../../services/notificationService';

// Mock dependencies
vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn()
  }
}));

vi.mock('../../services/notificationService', () => ({
  default: {
    sendCertificate: vi.fn(),
    validateEmails: vi.fn()
  }
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key
  })
}));

// Mock UserContext
const mockUser = {
  access: 'admin',
  organizationName: 'Test Organization'
};

vi.mock('../../contexts/UserContext', () => ({
  useUser: () => mockUser
}));

// Mock icons
vi.mock('react-icons/fa6', () => ({
  FaEnvelope: () => <div data-testid="envelope-icon" />,
  FaPaperPlane: () => <div data-testid="paperplane-icon" />,
  FaSpinner: () => <div data-testid="spinner-icon" />,
  FaCheck: () => <div data-testid="check-icon" />,
  FaExclamationTriangle: () => <div data-testid="warning-icon" />,
  FaPlus: () => <div data-testid="plus-icon" />,
  FaTrash: () => <div data-testid="trash-icon" />,
  FaCopy: () => <div data-testid="copy-icon" />,
  FaEye: () => <div data-testid="eye-icon" />,
  FaTimes: () => <div data-testid="times-icon" />
}));

const mockCertificate = {
  id: 'cert-123',
  title: 'Test Certificate',
  description: 'Test certificate description',
  issuedFrom: 'Test Organization',
  recipients: [
    { id: '1', name: 'John Doe', email: 'john@example.com', selected: true },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', selected: true }
  ]
};

const defaultProps = {
  certificate: mockCertificate,
  isOpen: true,
  onClose: vi.fn(),
  onSent: vi.fn()
};

beforeEach(() => {
  vi.clearAllMocks();
  
  // Default mock implementations
  notificationService.validateEmails.mockReturnValue({
    valid: ['test@example.com'],
    invalid: []
  });
  
  notificationService.sendCertificate.mockResolvedValue({
    success: true,
    message: 'Certificate sent successfully'
  });
});

describe('CertificateEmailSender', () => {
  describe('rendering', () => {
    test('should render modal when isOpen is true', () => {
      render(<CertificateEmailSender {...defaultProps} />);

      expect(screen.getByText('Send Certificate via Email')).toBeInTheDocument();
      expect(screen.getByText('Test Certificate')).toBeInTheDocument();
    });

    test('should not render when isOpen is false', () => {
      render(<CertificateEmailSender {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Send Certificate via Email')).not.toBeInTheDocument();
    });

    test('should not render when certificate is null', () => {
      render(<CertificateEmailSender {...defaultProps} certificate={null} />);

      expect(screen.queryByText('Send Certificate via Email')).not.toBeInTheDocument();
    });

    test('should render certificate recipients', () => {
      render(<CertificateEmailSender {...defaultProps} />);

      expect(screen.getByText('Original Recipients')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });

    test('should show access denied message for unauthorized users', () => {
      const unauthorizedCertificate = {
        ...mockCertificate,
        issuedFrom: 'Different Organization'
      };

      render(
        <CertificateEmailSender 
          {...defaultProps} 
          certificate={unauthorizedCertificate}
        />
      );

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.getByText(/You don't have permission/)).toBeInTheDocument();
    });
  });

  describe('recipient management', () => {
    test('should toggle recipient selection', async () => {
      const user = userEvent.setup();
      render(<CertificateEmailSender {...defaultProps} />);

      const firstRecipientCheckbox = screen.getAllByRole('checkbox')[0];
      expect(firstRecipientCheckbox).toBeChecked();

      await user.click(firstRecipientCheckbox);
      expect(firstRecipientCheckbox).not.toBeChecked();
    });

    test('should add custom email field', async () => {
      const user = userEvent.setup();
      render(<CertificateEmailSender {...defaultProps} />);

      const addEmailButton = screen.getByText('Add Email');
      await user.click(addEmailButton);

      const emailInputs = screen.getAllByPlaceholderText('email@example.com');
      expect(emailInputs).toHaveLength(2); // One default + one added
    });

    test('should remove custom email field', async () => {
      const user = userEvent.setup();
      render(<CertificateEmailSender {...defaultProps} />);

      // Add an email first
      const addEmailButton = screen.getByText('Add Email');
      await user.click(addEmailButton);

      // Now remove it
      const removeButtons = screen.getAllByTestId('trash-icon');
      await user.click(removeButtons[0].parentElement);

      const emailInputs = screen.getAllByPlaceholderText('email@example.com');
      expect(emailInputs).toHaveLength(1);
    });

    test('should not allow removing the last email field', async () => {
      const user = userEvent.setup();
      render(<CertificateEmailSender {...defaultProps} />);

      // Should not show trash icon when there's only one email field
      expect(screen.queryByTestId('trash-icon')).not.toBeInTheDocument();
    });

    test('should update custom email value', async () => {
      const user = userEvent.setup();
      render(<CertificateEmailSender {...defaultProps} />);

      const emailInput = screen.getByPlaceholderText('email@example.com');
      await user.type(emailInput, 'custom@example.com');

      expect(emailInput).toHaveValue('custom@example.com');
    });

    test('should copy recipients to custom emails', async () => {
      const user = userEvent.setup();
      render(<CertificateEmailSender {...defaultProps} />);

      const copyButton = screen.getByText('Copy to Custom');
      await user.click(copyButton);

      const emailInputs = screen.getAllByPlaceholderText('email@example.com');
      expect(emailInputs).toHaveLength(3); // 1 default + 2 copied
    });
  });

  describe('email options', () => {
    test('should toggle include download link option', async () => {
      const user = userEvent.setup();
      render(<CertificateEmailSender {...defaultProps} />);

      const downloadLinkCheckbox = screen.getByText('Include download link').previousElementSibling;
      expect(downloadLinkCheckbox).toBeChecked();

      await user.click(downloadLinkCheckbox);
      expect(downloadLinkCheckbox).not.toBeChecked();
    });

    test('should change priority selection', async () => {
      const user = userEvent.setup();
      render(<CertificateEmailSender {...defaultProps} />);

      const prioritySelect = screen.getByDisplayValue('Normal');
      await user.selectOptions(prioritySelect, 'High');

      expect(prioritySelect).toHaveValue('high');
    });

    test('should update custom message', async () => {
      const user = userEvent.setup();
      render(<CertificateEmailSender {...defaultProps} />);

      const messageTextarea = screen.getByPlaceholderText(/Add a personal message/);
      await user.type(messageTextarea, 'Custom message content');

      expect(messageTextarea).toHaveValue('Custom message content');
    });

    test('should show character count for custom message', () => {
      render(<CertificateEmailSender {...defaultProps} />);

      expect(screen.getByText('0/1000 characters')).toBeInTheDocument();
    });
  });

  describe('form validation', () => {
    test('should show error when no recipients selected', async () => {
      const user = userEvent.setup();
      render(<CertificateEmailSender {...defaultProps} />);

      // Uncheck all recipients
      const checkboxes = screen.getAllByRole('checkbox');
      for (const checkbox of checkboxes) {
        if (checkbox.checked) {
          await user.click(checkbox);
        }
      }

      const sendButton = screen.getByText('Send Email');
      await user.click(sendButton);

      expect(toast.error).toHaveBeenCalledWith('Please select at least one recipient');
    });

    test('should validate custom email addresses', async () => {
      const user = userEvent.setup();
      
      // Mock invalid email validation
      notificationService.validateEmails.mockReturnValue({
        valid: [],
        invalid: ['invalid-email']
      });

      render(<CertificateEmailSender {...defaultProps} />);

      // Uncheck original recipients
      const checkboxes = screen.getAllByRole('checkbox');
      for (const checkbox of checkboxes) {
        await user.click(checkbox);
      }

      // Add invalid custom email
      const emailInput = screen.getByPlaceholderText('email@example.com');
      await user.type(emailInput, 'invalid-email');

      const sendButton = screen.getByText('Send Email');
      await user.click(sendButton);

      expect(toast.error).toHaveBeenCalledWith('Invalid email addresses: invalid-email');
    });
  });

  describe('sending emails', () => {
    test('should send certificate successfully', async () => {
      const user = userEvent.setup();
      const onSent = vi.fn();

      render(<CertificateEmailSender {...defaultProps} onSent={onSent} />);

      const sendButton = screen.getByText('Send Email');
      await user.click(sendButton);

      await waitFor(() => {
        expect(notificationService.sendCertificate).toHaveBeenCalledWith(
          'cert-123',
          expect.arrayContaining(['john@example.com', 'jane@example.com']),
          expect.objectContaining({
            includeDownloadLink: true,
            customMessage: null,
            priority: 'normal'
          })
        );
      });

      expect(toast.success).toHaveBeenCalledWith('Certificate sent successfully to 2 recipients');
      expect(onSent).toHaveBeenCalledWith(2);
    });

    test('should handle send failure', async () => {
      const user = userEvent.setup();
      
      notificationService.sendCertificate.mockResolvedValue({
        success: false,
        error: 'Send failed'
      });

      render(<CertificateEmailSender {...defaultProps} />);

      const sendButton = screen.getByText('Send Email');
      await user.click(sendButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Send failed');
      });
    });

    test('should show loading state during send', async () => {
      const user = userEvent.setup();
      
      // Make sendCertificate hang to test loading state
      notificationService.sendCertificate.mockReturnValue(new Promise(() => {}));

      render(<CertificateEmailSender {...defaultProps} />);

      const sendButton = screen.getByText('Send Email');
      await user.click(sendButton);

      expect(screen.getByText('Sending...')).toBeInTheDocument();
      expect(screen.getByTestId('spinner-icon')).toBeInTheDocument();
    });

    test('should include custom message and options in send request', async () => {
      const user = userEvent.setup();
      render(<CertificateEmailSender {...defaultProps} />);

      // Set custom message
      const messageTextarea = screen.getByPlaceholderText(/Add a personal message/);
      await user.type(messageTextarea, 'Custom message');

      // Change priority
      const prioritySelect = screen.getByDisplayValue('Normal');
      await user.selectOptions(prioritySelect, 'High');

      // Toggle download link
      const downloadLinkCheckbox = screen.getByText('Include download link').previousElementSibling;
      await user.click(downloadLinkCheckbox);

      const sendButton = screen.getByText('Send Email');
      await user.click(sendButton);

      await waitFor(() => {
        expect(notificationService.sendCertificate).toHaveBeenCalledWith(
          'cert-123',
          expect.any(Array),
          {
            includeDownloadLink: false,
            customMessage: 'Custom message',
            priority: 'high'
          }
        );
      });
    });

    test('should remove duplicate emails before sending', async () => {
      const user = userEvent.setup();
      render(<CertificateEmailSender {...defaultProps} />);

      // Add duplicate email
      const emailInput = screen.getByPlaceholderText('email@example.com');
      await user.type(emailInput, 'john@example.com'); // Same as first recipient

      const sendButton = screen.getByText('Send Email');
      await user.click(sendButton);

      await waitFor(() => {
        const sentEmails = notificationService.sendCertificate.mock.calls[0][1];
        expect(sentEmails).toEqual(['john@example.com', 'jane@example.com']); // No duplicates
      });
    });
  });

  describe('modal controls', () => {
    test('should close modal when close button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(<CertificateEmailSender {...defaultProps} onClose={onClose} />);

      const closeButton = screen.getByTestId('times-icon').parentElement;
      await user.click(closeButton);

      expect(onClose).toHaveBeenCalled();
    });

    test('should close modal when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(<CertificateEmailSender {...defaultProps} onClose={onClose} />);

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(onClose).toHaveBeenCalled();
    });

    test('should disable buttons during sending', async () => {
      const user = userEvent.setup();
      
      // Make sendCertificate hang
      notificationService.sendCertificate.mockReturnValue(new Promise(() => {}));

      render(<CertificateEmailSender {...defaultProps} />);

      const sendButton = screen.getByText('Send Email');
      await user.click(sendButton);

      expect(screen.getByText('Cancel')).toBeDisabled();
      expect(screen.getByTestId('times-icon').parentElement).toBeDisabled();
    });
  });

  describe('recipient counter', () => {
    test('should show correct recipient count', () => {
      render(<CertificateEmailSender {...defaultProps} />);

      expect(screen.getByText('Sending to 2 recipients')).toBeInTheDocument();
    });

    test('should update recipient count when selections change', async () => {
      const user = userEvent.setup();
      render(<CertificateEmailSender {...defaultProps} />);

      // Uncheck one recipient
      const firstCheckbox = screen.getAllByRole('checkbox')[0];
      await user.click(firstCheckbox);

      expect(screen.getByText('Sending to 1 recipient')).toBeInTheDocument();
    });

    test('should use singular form for single recipient', async () => {
      const user = userEvent.setup();
      render(<CertificateEmailSender {...defaultProps} />);

      // Uncheck one recipient
      const firstCheckbox = screen.getAllByRole('checkbox')[0];
      await user.click(firstCheckbox);

      expect(screen.getByText('Sending to 1 recipient')).toBeInTheDocument();
    });
  });

  describe('user permissions', () => {
    test('should allow SuperAdmin to send any certificate', () => {
      mockUser.access = 'superAdmin';
      
      const differentOrgCertificate = {
        ...mockCertificate,
        issuedFrom: 'Different Organization'
      };

      render(
        <CertificateEmailSender 
          {...defaultProps} 
          certificate={differentOrgCertificate}
        />
      );

      expect(screen.queryByText('Access Denied')).not.toBeInTheDocument();
      expect(screen.getByText('Send Email')).not.toBeDisabled();
    });

    test('should prevent Admin from sending certificates from other organizations', () => {
      mockUser.access = 'admin';
      mockUser.organizationName = 'My Organization';
      
      const differentOrgCertificate = {
        ...mockCertificate,
        issuedFrom: 'Different Organization'
      };

      render(
        <CertificateEmailSender 
          {...defaultProps} 
          certificate={differentOrgCertificate}
        />
      );

      expect(screen.getByText('Access Denied')).toBeInTheDocument();
      expect(screen.getByText('Send Email')).toBeDisabled();
    });
  });
});