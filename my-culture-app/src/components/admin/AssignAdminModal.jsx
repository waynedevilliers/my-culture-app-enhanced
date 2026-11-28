'use client';

import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

// Super admin assigns (or replaces) the admin of an organisation.
const AssignAdminModal = ({ organization, onClose, onAssigned }) => {
  const { t } = useTranslation();
  const [name, setName] = useState(organization.adminName || '');
  const [email, setEmail] = useState(organization.adminEmail || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND ?? ''}/api/organizations/${organization.id}/admin`,
        { name, email },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      onAssigned(response.data.data);
    } catch (error) {
      toast.error(
        error.response?.data?.message || t('admin.adminAccess.assignError')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog className="modal modal-open">
      <div className="modal-box w-11/12 max-w-2xl">
        <h3 className="font-bold text-lg mb-2">
          {t('admin.adminAccess.assignTitle', { name: organization.name })}
        </h3>
        <p className="text-sm mb-4">{t('admin.adminAccess.assignIntro')}</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="form-control w-full">
            <span className="label-text font-semibold mb-1">
              {t('joinUs.form.adminName')}
            </span>
            <input
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input input-bordered w-full"
            />
          </label>
          <label className="form-control w-full">
            <span className="label-text font-semibold mb-1">
              {t('joinUs.form.adminEmail')}
            </span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input input-bordered w-full"
            />
          </label>
          <div className="modal-action">
            <button type="button" className="btn" onClick={onClose}>
              {t('admin.adminAccess.cancel')}
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {t('admin.adminAccess.assign')}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};

export default AssignAdminModal;
