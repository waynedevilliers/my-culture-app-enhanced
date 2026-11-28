'use client';

import { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

const API = process.env.NEXT_PUBLIC_BACKEND ?? '';
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

// Recipients of one certificate with their private links: copy, open,
// send again, turn a link off or on again.
const CertificateRecipientsDialog = ({ certificate, onClose, onChanged }) => {
  const { t, i18n } = useTranslation();
  const [busy, setBusy] = useState(null);
  if (!certificate) return null;

  const copy = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t('admin.certificates.recipientsDialog.copied'));
    } catch {
      toast.error(t('admin.certificates.recipientsDialog.copyFailed'));
    }
  };

  const setRevoked = async (recipient, revoked) => {
    if (
      revoked &&
      !confirm(
        t('admin.certificates.recipientsDialog.revokeConfirm', {
          name: recipient.name,
        })
      )
    ) {
      return;
    }
    setBusy(recipient.id);
    try {
      await axios.patch(
        `${API}/api/certificates/${certificate.id}/recipients/${recipient.id}`,
        { revoked },
        { headers: authHeaders() }
      );
      onChanged();
    } catch {
      toast.error(t('admin.certificates.recipientsDialog.updateError'));
    } finally {
      setBusy(null);
    }
  };

  const sendOne = async (recipient) => {
    setBusy(recipient.id);
    try {
      const { data } = await axios.post(
        `${API}/api/certificates/${certificate.id}/send`,
        { recipientIds: [recipient.id] },
        { headers: authHeaders() }
      );
      if (!data.data.emailConfigured) {
        toast.info(t('admin.certificates.emailNotConfigured'));
      } else if (data.data.sent === 1) {
        toast.success(t('admin.certificates.sendResult', { count: 1 }));
        onChanged();
      } else {
        toast.error(t('admin.certificates.sendError'));
      }
    } catch {
      toast.error(t('admin.certificates.sendError'));
    } finally {
      setBusy(null);
    }
  };

  const formatDate = (value) =>
    new Date(value).toLocaleDateString(
      i18n.language === 'en' ? 'en-GB' : 'de-DE'
    );

  return (
    <dialog className="modal modal-open">
      <div className="modal-box w-11/12 max-w-4xl">
        <h3 className="font-bold text-lg mb-1">
          {t('admin.certificates.recipientsDialog.title')}
        </h3>
        <p className="text-sm mb-4">
          {certificate.achievement} – {certificate.organization.name}
        </p>
        <ul className="flex flex-col gap-4">
          {certificate.recipients.map((recipient) => {
            const revoked = !!recipient.revokedAt;
            return (
              <li
                key={recipient.id}
                className="flex flex-col gap-2 border-b border-gray-200 pb-4"
              >
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span
                    className={`font-semibold ${revoked ? 'line-through' : ''}`}
                  >
                    {recipient.name}
                  </span>
                  <span className="text-sm">{recipient.email}</span>
                  <span className="text-xs text-gray-500">
                    {revoked
                      ? t('admin.certificates.recipientsDialog.revoked')
                      : !recipient.email
                        ? t('admin.certificates.recipientsDialog.noEmail')
                        : recipient.sentAt
                          ? t('admin.certificates.recipientsDialog.sentOn', {
                              date: formatDate(recipient.sentAt),
                            })
                          : t('admin.certificates.recipientsDialog.notSent')}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    readOnly
                    value={recipient.url}
                    aria-label={t(
                      'admin.certificates.recipientsDialog.linkLabel',
                      { name: recipient.name }
                    )}
                    className="input input-bordered input-sm w-full text-sm"
                    onFocus={(e) => e.target.select()}
                    disabled={revoked}
                  />
                  <div className="flex gap-2 shrink-0">
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => copy(recipient.url)}
                      disabled={revoked}
                    >
                      {t('admin.certificates.recipientsDialog.copy')}
                    </button>
                    <a
                      href={recipient.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`btn btn-sm ${revoked ? 'btn-disabled' : ''}`}
                      aria-disabled={revoked}
                    >
                      {t('admin.certificates.recipientsDialog.open')}
                    </a>
                    {!revoked && recipient.email && (
                      <button
                        type="button"
                        className="btn btn-sm"
                        onClick={() => sendOne(recipient)}
                        disabled={busy === recipient.id}
                      >
                        {t('admin.certificates.send')}
                      </button>
                    )}
                    <button
                      type="button"
                      className={`btn btn-sm ${revoked ? '' : 'btn-error'}`}
                      onClick={() => setRevoked(recipient, !revoked)}
                      disabled={busy === recipient.id}
                    >
                      {revoked
                        ? t('admin.certificates.recipientsDialog.restore')
                        : t('admin.certificates.recipientsDialog.revoke')}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="modal-action">
          <button type="button" className="btn" onClick={onClose}>
            {t('admin.certificates.recipientsDialog.close')}
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default CertificateRecipientsDialog;
