'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../contexts/UserContext';
import {
  FaEye,
  FaEnvelope,
  FaTrash,
  FaShield,
  FaTriangleExclamation,
} from 'react-icons/fa6';
import CertificateRecipientsDialog from './CertificateRecipientsDialog.jsx';

const API = process.env.NEXT_PUBLIC_BACKEND ?? '';
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

const CertificatesList = () => {
  const { t } = useTranslation();
  const { user } = useUser();
  const isSuperAdmin = user?.role === 'superAdmin';
  const [certificates, setCertificates] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [search, setSearch] = useState('');
  const [openId, setOpenId] = useState(null);
  const [sendingId, setSendingId] = useState(null);
  const pageNumbers = [...Array(pages + 1).keys()].slice(1);

  const fetchCertificates = useCallback(() => {
    axios
      .get(`${API}/api/certificates`, {
        params: { page, search },
        headers: authHeaders(),
      })
      .then(({ data }) => {
        setCertificates(data.results);
        setPages(Math.max(1, data.totalPages));
        setHasNextPage(data.hasNextPage);
        setHasPreviousPage(data.hasPreviousPage);
      })
      .catch(() => {
        setCertificates([]);
        setPages(1);
        setHasNextPage(false);
        setHasPreviousPage(false);
        toast.error(t('admin.certificates.fetchError'));
      });
  }, [page, search, t]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const handleSend = async (certificate) => {
    setSendingId(certificate.id);
    try {
      const { data } = await axios.post(
        `${API}/api/certificates/${certificate.id}/send`,
        {},
        { headers: authHeaders() }
      );
      const result = data.data;
      if (!result.emailConfigured) {
        toast.info(t('admin.certificates.emailNotConfigured'));
        setOpenId(certificate.id);
      } else if (result.requested === 0) {
        toast.info(t('admin.certificates.sendNone'));
      } else {
        if (result.sent > 0) {
          toast.success(
            t('admin.certificates.sendResult', { count: result.sent })
          );
        }
        if (result.failed > 0) {
          toast.error(
            t('admin.certificates.sendFailed', { count: result.failed })
          );
        }
        fetchCertificates();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || t('admin.certificates.sendError')
      );
    } finally {
      setSendingId(null);
    }
  };

  const handleDelete = (certificate) => {
    if (
      !confirm(
        t('admin.certificates.deleteConfirm', {
          name: certificate.achievement,
        })
      )
    ) {
      return;
    }

    axios
      .delete(`${API}/api/certificates/${certificate.id}`, {
        headers: authHeaders(),
      })
      .then(() => {
        fetchCertificates();
        toast.success(t('admin.messages.certificateDeleteSuccess'));
      })
      .catch((error) => {
        toast.error(
          error.response?.data?.message ||
            t('admin.messages.certificateDeleteFailed')
        );
      });
  };

  const openCertificate = certificates.find((c) => c.id === openId) ?? null;

  return (
    <div className="overflow-x-auto flex flex-col max-w-screen-xl w-full justify-center items-center gap-4">
      {/* Access Level Indicator */}
      <div className="w-full max-w-screen-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FaShield
              className={`text-lg ${isSuperAdmin ? 'text-purple-600' : 'text-blue-600'}`}
            />
            <span className="text-sm font-medium">
              {isSuperAdmin
                ? t('admin.certificates.scopeAll')
                : t('admin.certificates.scopeOwn')}
            </span>
          </div>
          {certificates.length === 0 && (
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <FaTriangleExclamation className="text-yellow-500" />
              {t('admin.certificates.noneFound')}
            </div>
          )}
        </div>
      </div>
      <label className="input input-bordered flex items-center gap-2 w-full">
        {t('admin.tables.search')}{' '}
        <input
          type="search"
          className="grow"
          placeholder={t('admin.certificates.searchPlaceholder')}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </label>
      <table className="table table-xs table-zebra mb-4">
        <thead className="bg-secondary text-white">
          <tr>
            <th>{t('admin.certificates.achievement')}</th>
            <th className="hidden sm:table-cell">
              {t('admin.tables.issuedDate')}
            </th>
            <th className="hidden md:table-cell">
              {t('admin.tables.recipients')}
            </th>
            <th className="hidden md:table-cell">
              {t('admin.tables.issuedFrom')}
            </th>
            <th>{t('admin.certificates.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {certificates.map((certificate) => (
            <tr key={certificate.id}>
              <td>{certificate.achievement}</td>
              <td className="hidden sm:table-cell">
                {new Date(certificate.issuedDate).toLocaleDateString()}
              </td>
              <td className="hidden md:table-cell">
                {certificate.recipients.length > 0 ? (
                  <ul className="list-disc pl-4">
                    {certificate.recipients.map((recipient) => (
                      <li
                        key={recipient.id}
                        className={recipient.revokedAt ? 'line-through' : ''}
                      >
                        {recipient.name}
                        {recipient.email ? ` (${recipient.email})` : ''}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-gray-500">
                    {t('admin.certificates.noRecipients')}
                  </span>
                )}
              </td>
              <td className="hidden md:table-cell">
                {certificate.organization.name}
              </td>
              <td className="text-right">
                <button
                  className="btn btn-ghost btn-xs mr-2"
                  onClick={() => setOpenId(certificate.id)}
                  aria-label={t('admin.certificates.viewLabel', {
                    name: certificate.achievement,
                  })}
                >
                  <FaEye className="w-3 h-3" />
                  <span className="hidden sm:inline ml-1">
                    {t('admin.certificates.view')}
                  </span>
                </button>
                <button
                  className="btn btn-ghost btn-xs mr-2"
                  onClick={() => handleSend(certificate)}
                  disabled={sendingId === certificate.id}
                  aria-label={t('admin.certificates.sendLabel', {
                    name: certificate.achievement,
                  })}
                >
                  <FaEnvelope className="w-3 h-3" />
                  <span className="hidden sm:inline ml-1">
                    {t('admin.certificates.send')}
                  </span>
                </button>
                <button
                  className="btn btn-ghost btn-xs hover:bg-transparent hover:text-red-600 transform duration-300 transition-colors"
                  onClick={() => handleDelete(certificate)}
                  aria-label={t('admin.certificates.deleteLabel', {
                    name: certificate.achievement,
                  })}
                >
                  <FaTrash className="w-3 h-3" />
                  <span className="hidden sm:inline ml-1">
                    {t('admin.tables.delete')}
                  </span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="join">
        <button
          className={
            hasPreviousPage ? 'join-item btn' : 'join-item btn btn-disabled'
          }
          onClick={() => setPage(page - 1)}
        >
          «
        </button>
        {pageNumbers.map((pageNumber) => (
          <button
            key={pageNumber}
            className={
              page === pageNumber
                ? 'join-item btn btn-md btn-active'
                : 'join-item btn btn-md'
            }
            onClick={() => setPage(pageNumber)}
          >
            {pageNumber}
          </button>
        ))}
        <button
          className={
            hasNextPage ? 'join-item btn' : 'join-item btn btn-disabled'
          }
          onClick={() => setPage(page + 1)}
        >
          »
        </button>
      </div>

      <CertificateRecipientsDialog
        certificate={openCertificate}
        onClose={() => setOpenId(null)}
        onChanged={fetchCertificates}
      />
    </div>
  );
};

export default CertificatesList;
