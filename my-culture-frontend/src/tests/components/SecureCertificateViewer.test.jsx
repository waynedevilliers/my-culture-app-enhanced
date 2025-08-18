import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'react-toastify';
import axios from 'axios';
import SecureCertificateViewer from '../../components/certificate/SecureCertificateViewer';

// Mock dependencies
vi.mock('axios');
vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn()
  }
}));

vi.mock('react-router-dom', () => ({
  useParams: () => ({ certificateId: 'cert-123' }),
  useSearchParams: () => [
    new URLSearchParams('recipient=rec-456&token=fake-token'),
    vi.fn()
  ],
  useNavigate: () => vi.fn()
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

// Mock CertificateDownload component
vi.mock('../../components/certificate/CertificateDownload', () => ({
  default: ({ certificateId, title }) => (
    <div data-testid="certificate-download">
      Download: {certificateId} - {title}
    </div>
  )
}));

// Mock icons
vi.mock('react-icons/fa6', () => ({
  FaLock: () => <div data-testid="lock-icon" />,
  FaEye: () => <div data-testid="eye-icon" />,
  FaShield: () => <div data-testid="shield-icon" />,
  FaCalendar: () => <div data-testid="calendar-icon" />,
  FaBuilding: () => <div data-testid="building-icon" />,
  FaUser: () => <div data-testid="user-icon" />,
  FaEnvelope: () => <div data-testid="envelope-icon" />,
  FaTriangleExclamation: () => <div data-testid="warning-icon" />,
  FaArrowLeft: () => <div data-testid="arrow-left-icon" />
}));

const mockCertificate = {
  id: 'cert-123',
  title: 'Test Certificate',
  description: 'Certificate description',
  issuedFrom: 'Test Organization',
  issuedDate: '2025-01-15T10:00:00Z',
  recipients: [
    {
      id: 'rec-456',
      name: 'John Doe',
      email: 'john@example.com',
      recipientUrl: 'https://example.com/certificate/view'
    },
    {
      id: 'rec-789',
      name: 'Jane Smith',
      email: 'jane@example.com',
      recipientUrl: 'https://example.com/certificate/view2'
    }
  ]
};

Object.defineProperty(import.meta, 'env', {
  value: { VITE_BACKEND: 'http://localhost:3001' },
  writable: true
});

beforeEach(() => {
  vi.clearAllMocks();
  mockUser.access = 'admin';
  mockUser.organizationName = 'Test Organization';
  
  // Mock localStorage
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: vi.fn(() => 'fake-jwt-token'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    },
    writable: true
  });
});

describe('SecureCertificateViewer', () => {
  describe('loading state', () => {
    test('should show loading spinner initially', () => {
      // Mock hanging axios request
      axios.get.mockReturnValue(new Promise(() => {}));

      render(<SecureCertificateViewer />);

      expect(screen.getByText('Loading certificate...')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('successful certificate loading', () => {
    beforeEach(() => {
      axios.get.mockResolvedValue({
        data: mockCertificate
      });
    });

    test('should display certificate information', async () => {
      render(<SecureCertificateViewer />);

      await waitFor(() => {
        expect(screen.getByText('Test Certificate')).toBeInTheDocument();
      });

      expect(screen.getByText('Certificate description')).toBeInTheDocument();
      expect(screen.getByText(/Issued: 1\/15\/2025/)).toBeInTheDocument();
      expect(screen.getByText('From: Test Organization')).toBeInTheDocument();
      expect(screen.getByText('2 Recipients')).toBeInTheDocument();
    });

    test('should show access level indicator for admin users', async () => {
      render(<SecureCertificateViewer />);

      await waitFor(() => {
        expect(screen.getByText('Full Access')).toBeInTheDocument();
      });

      expect(screen.getByTestId('lock-icon')).toBeInTheDocument();
    });

    test('should show limited access for users from different organizations', async () => {
      const differentOrgCertificate = {
        ...mockCertificate,
        issuedFrom: 'Different Organization'
      };

      axios.get.mockResolvedValue({
        data: differentOrgCertificate
      });

      render(<SecureCertificateViewer />);

      await waitFor(() => {
        expect(screen.getByText('Limited Access')).toBeInTheDocument();
      });
    });

    test('should display selected recipient information', async () => {
      render(<SecureCertificateViewer />);

      await waitFor(() => {
        expect(screen.getByText('Certificate Preview - John Doe')).toBeInTheDocument();
      });

      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    test('should display certificate in iframe', async () => {
      render(<SecureCertificateViewer />);

      await waitFor(() => {
        const iframe = screen.getByTitle('Certificate for John Doe');
        expect(iframe).toBeInTheDocument();
        expect(iframe).toHaveAttribute('src', 'https://example.com/certificate/view');
      });
    });
  });

  describe('multiple recipients', () => {
    beforeEach(() => {
      axios.get.mockResolvedValue({
        data: mockCertificate
      });
    });

    test('should show recipient selection when multiple recipients exist', async () => {
      render(<SecureCertificateViewer />);

      await waitFor(() => {
        expect(screen.getByText('Recipients')).toBeInTheDocument();
      });

      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    test('should switch recipient when clicked', async () => {
      const user = userEvent.setup();
      render(<SecureCertificateViewer />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      // Click on Jane Smith
      const janeButton = screen.getByText('Jane Smith').closest('button');
      await user.click(janeButton);

      expect(screen.getByText('Certificate Preview - Jane Smith')).toBeInTheDocument();
    });

    test('should highlight selected recipient', async () => {
      render(<SecureCertificateViewer />);

      await waitFor(() => {
        const johnButton = screen.getByText('John Doe').closest('button');
        expect(johnButton).toHaveClass('border-primary');
      });
    });
  });

  describe('single recipient', () => {
    const singleRecipientCertificate = {
      ...mockCertificate,
      recipients: [mockCertificate.recipients[0]]
    };

    beforeEach(() => {
      axios.get.mockResolvedValue({
        data: singleRecipientCertificate
      });
    });

    test('should not show recipient selection for single recipient', async () => {
      render(<SecureCertificateViewer />);

      await waitFor(() => {
        expect(screen.queryByText('Recipients')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Certificate Preview - John Doe')).toBeInTheDocument();
    });
  });

  describe('certificate preview unavailable', () => {
    const certificateWithoutUrl = {
      ...mockCertificate,
      recipients: [
        {
          ...mockCertificate.recipients[0],
          recipientUrl: null
        }
      ]
    };

    beforeEach(() => {
      axios.get.mockResolvedValue({
        data: certificateWithoutUrl
      });
    });

    test('should show unavailable message when no preview URL', async () => {
      render(<SecureCertificateViewer />);

      await waitFor(() => {
        expect(screen.getByText('Certificate Preview Unavailable')).toBeInTheDocument();
      });

      expect(screen.getByText(/The certificate preview is not available/)).toBeInTheDocument();
      expect(screen.queryByRole('iframe')).not.toBeInTheDocument();
    });
  });

  describe('download functionality', () => {
    beforeEach(() => {
      axios.get.mockResolvedValue({
        data: mockCertificate
      });
    });

    test('should show download component for users with access', async () => {
      render(<SecureCertificateViewer />);

      await waitFor(() => {
        expect(screen.getByTestId('certificate-download')).toBeInTheDocument();
      });

      expect(screen.getByText('Download: cert-123 - Test Certificate - John Doe')).toBeInTheDocument();
    });

    test('should not show download component for users without access', async () => {
      const differentOrgCertificate = {
        ...mockCertificate,
        issuedFrom: 'Different Organization'
      };

      axios.get.mockResolvedValue({
        data: differentOrgCertificate
      });

      render(<SecureCertificateViewer />);

      await waitFor(() => {
        expect(screen.queryByTestId('certificate-download')).not.toBeInTheDocument();
      });
    });
  });

  describe('error handling', () => {
    test('should show authentication error for 401 responses', async () => {
      axios.get.mockRejectedValue({
        response: { status: 401 }
      });

      render(<SecureCertificateViewer />);

      await waitFor(() => {
        expect(screen.getByText('Certificate Access Error')).toBeInTheDocument();
      });

      expect(screen.getByText('Authentication failed. Please log in again.')).toBeInTheDocument();
    });

    test('should show permission error for 403 responses', async () => {
      axios.get.mockRejectedValue({
        response: { status: 403 }
      });

      render(<SecureCertificateViewer />);

      await waitFor(() => {
        expect(screen.getByText('Certificate Access Error')).toBeInTheDocument();
      });

      expect(screen.getByText(/Access denied: You don't have permission/)).toBeInTheDocument();
    });

    test('should show not found error for 404 responses', async () => {
      axios.get.mockRejectedValue({
        response: { status: 404 }
      });

      render(<SecureCertificateViewer />);

      await waitFor(() => {
        expect(screen.getByText('Certificate Access Error')).toBeInTheDocument();
      });

      expect(screen.getByText('Certificate not found')).toBeInTheDocument();
    });

    test('should show generic error for other failures', async () => {
      axios.get.mockRejectedValue(new Error('Network error'));

      render(<SecureCertificateViewer />);

      await waitFor(() => {
        expect(screen.getByText('Certificate Access Error')).toBeInTheDocument();
      });

      expect(screen.getByText('Error loading certificate. Please try again.')).toBeInTheDocument();
    });

    test('should provide navigation buttons on error', async () => {
      axios.get.mockRejectedValue({
        response: { status: 404 }
      });

      render(<SecureCertificateViewer />);

      await waitFor(() => {
        expect(screen.getByText('Go Back')).toBeInTheDocument();
      });

      expect(screen.getByText('Go to Dashboard')).toBeInTheDocument();
    });
  });

  describe('authentication', () => {
    test('should use token from URL parameter', async () => {
      render(<SecureCertificateViewer />);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          'http://localhost:3001/api/certificates/cert-123',
          {
            headers: {
              Authorization: 'Bearer fake-token'
            }
          }
        );
      });
    });

    test('should fall back to localStorage token when URL token not available', async () => {
      // Mock useSearchParams to return empty params
      vi.doMock('react-router-dom', () => ({
        useParams: () => ({ certificateId: 'cert-123' }),
        useSearchParams: () => [new URLSearchParams(), vi.fn()],
        useNavigate: () => vi.fn()
      }));

      render(<SecureCertificateViewer />);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          'http://localhost:3001/api/certificates/cert-123',
          {
            headers: {
              Authorization: 'Bearer fake-jwt-token'
            }
          }
        );
      });
    });

    test('should show error when no authentication available', async () => {
      window.localStorage.getItem.mockReturnValue(null);
      
      // Mock empty URL params
      vi.doMock('react-router-dom', () => ({
        useParams: () => ({ certificateId: 'cert-123' }),
        useSearchParams: () => [new URLSearchParams(), vi.fn()],
        useNavigate: () => vi.fn()
      }));

      render(<SecureCertificateViewer />);

      await waitFor(() => {
        expect(screen.getByText('Authentication required')).toBeInTheDocument();
      });
    });
  });

  describe('security notice', () => {
    beforeEach(() => {
      axios.get.mockResolvedValue({
        data: mockCertificate
      });
    });

    test('should show security notice with full access message', async () => {
      render(<SecureCertificateViewer />);

      await waitFor(() => {
        expect(screen.getByText('Secure Certificate Viewing')).toBeInTheDocument();
      });

      expect(screen.getByText(/You have full access to download and manage/)).toBeInTheDocument();
    });

    test('should show security notice with limited access message', async () => {
      const differentOrgCertificate = {
        ...mockCertificate,
        issuedFrom: 'Different Organization'
      };

      axios.get.mockResolvedValue({
        data: differentOrgCertificate
      });

      render(<SecureCertificateViewer />);

      await waitFor(() => {
        expect(screen.getByText(/Your access is limited to viewing only/)).toBeInTheDocument();
      });
    });
  });

  describe('navigation', () => {
    beforeEach(() => {
      axios.get.mockResolvedValue({
        data: mockCertificate
      });
    });

    test('should show back button', async () => {
      render(<SecureCertificateViewer />);

      await waitFor(() => {
        expect(screen.getByText('Back')).toBeInTheDocument();
      });

      expect(screen.getByTestId('arrow-left-icon')).toBeInTheDocument();
    });

    test('should handle back navigation', async () => {
      const mockNavigate = vi.fn();
      
      vi.doMock('react-router-dom', () => ({
        useParams: () => ({ certificateId: 'cert-123' }),
        useSearchParams: () => [new URLSearchParams('recipient=rec-456'), vi.fn()],
        useNavigate: () => mockNavigate
      }));

      const user = userEvent.setup();
      render(<SecureCertificateViewer />);

      await waitFor(() => {
        const backButton = screen.getByText('Back');
        expect(backButton).toBeInTheDocument();
      });

      const backButton = screen.getByText('Back');
      await user.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });

  describe('superAdmin access', () => {
    beforeEach(() => {
      mockUser.access = 'superAdmin';
      axios.get.mockResolvedValue({
        data: mockCertificate
      });
    });

    test('should allow SuperAdmin full access to any certificate', async () => {
      const differentOrgCertificate = {
        ...mockCertificate,
        issuedFrom: 'Different Organization'
      };

      axios.get.mockResolvedValue({
        data: differentOrgCertificate
      });

      render(<SecureCertificateViewer />);

      await waitFor(() => {
        expect(screen.getByText('Full Access')).toBeInTheDocument();
      });

      expect(screen.getByTestId('certificate-download')).toBeInTheDocument();
    });
  });
});