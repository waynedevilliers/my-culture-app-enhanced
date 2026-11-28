'use client';

import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

// Shown after an organisation admin was created: either the link was
// emailed, or (no email set up) the super admin copies it and passes it on.
const AdminLinkDialog = ({ result, onClose }) => {
  const { t } = useTranslation();
  if (!result) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result.setPasswordUrl);
      toast.success(t('admin.adminAccess.copied'));
    } catch {
      toast.error(t('admin.adminAccess.copyFailed'));
    }
  };

  return (
    <dialog className="modal modal-open">
      <div className="modal-box w-11/12 max-w-2xl">
        <h3 className="font-bold text-lg mb-4">
          {t('admin.adminAccess.title')}
        </h3>
        {result.emailed ? (
          <p className="text-sm">
            {t('admin.adminAccess.emailed', { email: result.email })}
          </p>
        ) : (
          <>
            <p className="text-sm mb-4">
              {t('admin.adminAccess.notEmailed', { email: result.email })}
            </p>
            <div className="flex gap-2">
              <input
                readOnly
                value={result.setPasswordUrl}
                aria-label={t('admin.adminAccess.linkLabel')}
                className="input input-bordered w-full text-sm"
                onFocus={(e) => e.target.select()}
              />
              <button type="button" className="btn btn-primary" onClick={copy}>
                {t('admin.adminAccess.copy')}
              </button>
            </div>
          </>
        )}
        <div className="modal-action">
          <button type="button" className="btn" onClick={onClose}>
            {t('admin.adminAccess.close')}
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default AdminLinkDialog;
