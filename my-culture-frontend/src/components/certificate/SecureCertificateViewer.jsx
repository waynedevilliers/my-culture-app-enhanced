import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../contexts/UserContext';
import CertificateDownload from './CertificateDownload';
import { 
  FaLock, 
  FaEye, 
  FaShield, 
  FaCalendar, 
  FaBuilding, 
  FaUser, 
  FaEnvelope,
  FaTriangleExclamation,
  FaArrowLeft
} from 'react-icons/fa6';

const SecureCertificateViewer = () => {
  const { t } = useTranslation();
  const { certificateId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useUser();
  
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState(null);

  const recipientId = searchParams.get('recipient');
  const token = searchParams.get('token');

  useEffect(() => {
    const fetchCertificate = async () => {
      if (!certificateId) {
        setError('Certificate ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Use token from URL parameter or localStorage
        const authToken = token || localStorage.getItem('token');
        
        if (!authToken) {
          setError('Authentication required');
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND}/api/certificates/${certificateId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        const certificateData = response.data;
        setCertificate(certificateData);

        // Check access permissions
        const userHasAccess = 
          user?.access === 'superAdmin' || 
          certificateData.issuedFrom === user?.organizationName;
        
        setHasAccess(userHasAccess);

        // Set selected recipient
        if (recipientId) {
          const recipient = certificateData.recipients?.find(r => r.id === recipientId);
          if (recipient) {
            setSelectedRecipient(recipient);
          } else if (certificateData.recipients?.length > 0) {
            setSelectedRecipient(certificateData.recipients[0]);
          }
        } else if (certificateData.recipients?.length > 0) {
          setSelectedRecipient(certificateData.recipients[0]);
        }

      } catch (error) {
        console.error('Error fetching certificate:', error);
        if (error.response?.status === 403) {
          setError('Access denied: You don\'t have permission to view this certificate');
        } else if (error.response?.status === 404) {
          setError('Certificate not found');
        } else if (error.response?.status === 401) {
          setError('Authentication failed. Please log in again.');
        } else {
          setError('Error loading certificate. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [certificateId, recipientId, token, user]);

  const handleRecipientChange = (recipient) => {
    setSelectedRecipient(recipient);
    // Update URL without reloading
    const newParams = new URLSearchParams(searchParams);
    newParams.set('recipient', recipient.id);
    navigate(`/certificates/view/${certificateId}?${newParams.toString()}`, { replace: true });
  };

  const goBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary"></div>
          <p className="mt-4 text-gray-600">Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTriangleExclamation className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Certificate Access Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-2">
            <button
              onClick={goBack}
              className="btn btn-primary w-full"
            >
              <FaArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn btn-outline w-full"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!certificate || !selectedRecipient) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Certificate not found</h1>
          <button
            onClick={goBack}
            className="btn btn-primary"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={goBack}
                className="btn btn-ghost btn-sm"
              >
                <FaArrowLeft className="w-4 h-4" />
                Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{certificate.title}</h1>
                <p className="text-gray-600">{certificate.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FaLock className={`text-lg ${hasAccess ? 'text-green-600' : 'text-red-600'}`} />
              <span className={`px-3 py-1 rounded text-sm font-medium ${
                hasAccess 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {hasAccess ? 'Full Access' : 'Limited Access'}
              </span>
            </div>
          </div>

          {/* Certificate Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <FaCalendar className="w-4 h-4" />
              <span>Issued: {new Date(certificate.issuedDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <FaBuilding className="w-4 h-4" />
              <span>From: {certificate.issuedFrom}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <FaUser className="w-4 h-4" />
              <span>{certificate.recipients?.length || 0} Recipients</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recipient Selection */}
          {certificate.recipients && certificate.recipients.length > 1 && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Recipients</h3>
                <div className="space-y-2">
                  {certificate.recipients.map((recipient, index) => (
                    <button
                      key={recipient.id || index}
                      onClick={() => handleRecipientChange(recipient)}
                      className={`w-full text-left p-3 rounded border transition-colors ${
                        selectedRecipient?.id === recipient.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium text-gray-800">{recipient.name}</div>
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <FaEnvelope className="w-3 h-3" />
                        {recipient.email}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Certificate Preview */}
          <div className={certificate.recipients?.length > 1 ? 'lg:col-span-2' : 'lg:col-span-3'}>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Certificate Preview
                  {selectedRecipient && (
                    <span className="text-primary ml-2">- {selectedRecipient.name}</span>
                  )}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FaEye className="w-4 h-4" />
                  Secure View
                </div>
              </div>

              {/* Certificate iframe */}
              {selectedRecipient?.recipientUrl ? (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <iframe
                    src={selectedRecipient.recipientUrl}
                    className="w-full h-[800px]"
                    title={`Certificate for ${selectedRecipient.name}`}
                    sandbox="allow-scripts allow-same-origin"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg p-8 text-center">
                  <FaTriangleExclamation className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-800 mb-2">Certificate Preview Unavailable</h4>
                  <p className="text-gray-600">
                    The certificate preview is not available. Please generate the certificate first.
                  </p>
                </div>
              )}

              {/* Download Section */}
              {hasAccess && selectedRecipient && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <CertificateDownload
                    certificateId={certificateId}
                    title={`${certificate.title} - ${selectedRecipient.name}`}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FaShield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-800 mb-1">Secure Certificate Viewing</h4>
              <p className="text-sm text-blue-700">
                This certificate is being viewed through our secure system. 
                {hasAccess 
                  ? ' You have full access to download and manage this certificate.'
                  : ' Your access is limited to viewing only.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecureCertificateViewer;