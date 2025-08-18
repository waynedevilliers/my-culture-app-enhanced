import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../contexts/UserContext';
import notificationService from '../../services/notificationService';
import {
  FaEnvelope,
  FaPaperPlane,
  FaSpinner,
  FaCheck,
  FaTriangleExclamation,
  FaPlus,
  FaTrash,
  FaCopy,
  FaEye,
  FaXmark
} from 'react-icons/fa6';

const CertificateEmailSender = ({ certificate, isOpen, onClose, onSent }) => {
  const { t } = useTranslation();
  const { user } = useUser();
  
  const [sending, setSending] = useState(false);
  const [recipients, setRecipients] = useState([]);
  const [customEmails, setCustomEmails] = useState(['']);
  const [includeOriginalRecipients, setIncludeOriginalRecipients] = useState(true);
  const [customMessage, setCustomMessage] = useState('');
  const [includeDownloadLink, setIncludeDownloadLink] = useState(true);
  const [priority, setPriority] = useState('normal');
  const [emailPreview, setEmailPreview] = useState(false);

  // Initialize recipients when certificate changes
  useEffect(() => {
    if (certificate?.recipients) {
      setRecipients(certificate.recipients.map(r => ({ ...r, selected: true })));
    }
  }, [certificate]);

  // Check access permissions
  const hasAccess = user?.access === 'superAdmin' || certificate?.issuedFrom === user?.organizationName;

  const handleRecipientToggle = (index, checked) => {
    setRecipients(prev => 
      prev.map((recipient, i) => 
        i === index ? { ...recipient, selected: checked } : recipient
      )
    );
  };

  const handleCustomEmailChange = (index, value) => {
    setCustomEmails(prev => 
      prev.map((email, i) => i === index ? value : email)
    );
  };

  const addCustomEmail = () => {
    setCustomEmails(prev => [...prev, '']);
  };

  const removeCustomEmail = (index) => {
    if (customEmails.length > 1) {
      setCustomEmails(prev => prev.filter((_, i) => i !== index));
    }
  };

  const validateForm = () => {
    const selectedRecipients = recipients.filter(r => r.selected);
    const validCustomEmails = customEmails.filter(email => email.trim());
    
    if (selectedRecipients.length === 0 && validCustomEmails.length === 0) {
      toast.error('Please select at least one recipient');
      return false;
    }

    // Validate custom emails
    const emailValidation = notificationService.validateEmails(validCustomEmails);
    if (emailValidation.invalid.length > 0) {
      toast.error(`Invalid email addresses: ${emailValidation.invalid.join(', ')}`);
      return false;
    }

    return true;
  };

  const handleSend = async () => {
    if (!validateForm() || !hasAccess) return;

    try {
      setSending(true);

      // Collect all recipient emails
      const selectedRecipientEmails = recipients
        .filter(r => r.selected)
        .map(r => r.email);
      
      const validCustomEmails = customEmails.filter(email => email.trim());
      
      const allEmails = includeOriginalRecipients 
        ? [...selectedRecipientEmails, ...validCustomEmails]
        : validCustomEmails;

      // Remove duplicates
      const uniqueEmails = [...new Set(allEmails)];

      const result = await notificationService.sendCertificate(
        certificate.id,
        uniqueEmails,
        {
          includeDownloadLink,
          customMessage: customMessage.trim() || null,
          priority
        }
      );

      if (result.success) {
        toast.success(`Certificate sent successfully to ${uniqueEmails.length} recipients`);
        onSent?.(uniqueEmails.length);
        onClose();
      } else {
        toast.error(result.error);
      }

    } catch (error) {
      console.error('Error sending certificate:', error);
      toast.error('Failed to send certificate. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const copyRecipientsToCustom = () => {
    const recipientEmails = recipients
      .filter(r => r.selected)
      .map(r => r.email);
    
    setCustomEmails([...customEmails.filter(e => e.trim()), ...recipientEmails]);
  };

  if (!isOpen || !certificate) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Send Certificate via Email</h2>
            <p className="text-gray-600 mt-1">{certificate.title}</p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            disabled={sending}
          >
            <FaXmark className="w-5 h-5" />
          </button>
        </div>

        {/* Access Check */}
        {!hasAccess && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <FaTriangleExclamation className="w-5 h-5" />
              <span className="font-medium">Access Denied</span>
            </div>
            <p className="text-red-700 mt-1">
              You don't have permission to send this certificate. You can only send certificates from your organization.
            </p>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Original Recipients */}
          {recipients.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Original Recipients</h3>
                <button
                  onClick={copyRecipientsToCustom}
                  className="btn btn-ghost btn-sm"
                  type="button"
                >
                  <FaCopy className="w-4 h-4 mr-1" />
                  Copy to Custom
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recipients.map((recipient, index) => (
                  <label
                    key={recipient.id || index}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      recipient.selected ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={recipient.selected}
                      onChange={(e) => handleRecipientToggle(index, e.target.checked)}
                      className="checkbox checkbox-primary"
                      disabled={!hasAccess}
                    />
                    <div>
                      <div className="font-medium text-gray-800">{recipient.name}</div>
                      <div className="text-sm text-gray-600">{recipient.email}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Custom Recipients */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Additional Recipients</h3>
            <div className="space-y-3">
              {customEmails.map((email, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => handleCustomEmailChange(index, e.target.value)}
                    placeholder="email@example.com"
                    className="input input-bordered flex-1"
                    disabled={!hasAccess}
                  />
                  {customEmails.length > 1 && (
                    <button
                      onClick={() => removeCustomEmail(index)}
                      className="btn btn-ghost btn-square"
                      type="button"
                      disabled={!hasAccess}
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addCustomEmail}
                className="btn btn-ghost btn-sm"
                type="button"
                disabled={!hasAccess}
              >
                <FaPlus className="w-4 h-4 mr-1" />
                Add Email
              </button>
            </div>
          </div>

          {/* Email Options */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Email Options</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Include Download Link */}
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={includeDownloadLink}
                  onChange={(e) => setIncludeDownloadLink(e.target.checked)}
                  className="checkbox checkbox-primary"
                  disabled={!hasAccess}
                />
                <span>Include download link</span>
              </label>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="select select-bordered w-full"
                  disabled={!hasAccess}
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            {/* Custom Message */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Message (Optional)
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Add a personal message that will be included in the email..."
                className="textarea textarea-bordered w-full"
                rows={4}
                disabled={!hasAccess}
              />
              <div className="text-xs text-gray-500 mt-1">
                {customMessage.length}/1000 characters
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {(() => {
              const selectedCount = recipients.filter(r => r.selected).length;
              const customCount = customEmails.filter(e => e.trim()).length;
              const total = selectedCount + customCount;
              return `Sending to ${total} recipient${total !== 1 ? 's' : ''}`;
            })()}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setEmailPreview(!emailPreview)}
              className="btn btn-ghost"
              type="button"
              disabled={!hasAccess}
            >
              <FaEye className="w-4 h-4 mr-1" />
              Preview
            </button>
            <button
              onClick={onClose}
              className="btn btn-ghost"
              disabled={sending}
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              className="btn btn-primary"
              disabled={sending || !hasAccess}
            >
              {sending ? (
                <>
                  <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <FaPaperPlane className="w-4 h-4 mr-2" />
                  Send Email
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateEmailSender;