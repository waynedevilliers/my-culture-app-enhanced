'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from '@/lib/router';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../contexts/UserContext';
import CertificateDesign from '../certificate/CertificateDesign';

const API = process.env.NEXT_PUBLIC_BACKEND ?? '';
const LANGUAGES = ['de', 'en'];
const COLORS = ['green', 'blue', 'burgundy', 'grey'];
const MAX_SIGNATURES = 3;

const today = () => new Date().toISOString().slice(0, 10);

const NewCertificate = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useUser();
  const isSuperAdmin = user?.role === 'superAdmin';
  const [loading, setLoading] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [organizationsLoaded, setOrganizationsLoaded] = useState(false);
  const [form, setForm] = useState({
    organizationId: '',
    language: 'de',
    color: 'green',
    introText: '',
    achievement: '',
    addition: '',
    issuedDate: today(),
  });
  const [signatures, setSignatures] = useState([{ name: '', role: '' }]);
  const [recipients, setRecipients] = useState([{ name: '', email: '' }]);

  // Super admins choose any approved organisation; organisation admins get
  // only their own from the same endpoint.
  useEffect(() => {
    axios
      .get(`${API}/api/organizations`, {
        params: { limit: 100 },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      })
      .then(({ data }) => {
        const results = data.results ?? [];
        setOrganizations(results);
        if (results.length === 1) {
          setForm((prev) => ({
            ...prev,
            organizationId: String(results[0].id),
          }));
        }
      })
      .catch(() =>
        toast.error(t('admin.certificates.create.organizationsError'))
      )
      .finally(() => setOrganizationsLoaded(true));
  }, [t]);

  const organization = organizations.find(
    (org) => String(org.id) === form.organizationId
  );

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const updateRow = (setRows) => (index, field, value) => {
    setRows((rows) =>
      rows.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };
  const handleSignatureChange = updateRow(setSignatures);
  const handleRecipientChange = updateRow(setRecipients);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!signatures.some((s) => s.name.trim())) {
      toast.error(t('admin.certificates.create.signaturesError'));
      return;
    }
    if (recipients.some((r) => !r.name.trim() || !r.email.trim())) {
      toast.error(t('admin.certificates.create.recipientsError'));
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        `${API}/api/certificates`,
        {
          ...form,
          organizationId: form.organizationId || undefined,
          signatures,
          recipients,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      toast.success(t('admin.certificates.create.success'));
      navigate('/dashboard/certificates');
    } catch (error) {
      toast.error(
        error.response?.data?.message || t('admin.certificates.create.error')
      );
    } finally {
      setLoading(false);
    }
  };

  const noOrganization =
    organizationsLoaded && !isSuperAdmin && organizations.length === 0;

  return (
    <form
      className="flex flex-col w-full max-w-screen-xl m-auto gap-4 mb-10"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-2">
        <label
          htmlFor="certificate-organization"
          className="text-lg font-semibold"
        >
          {t('admin.certificates.create.issuedFrom')}
        </label>
        {isSuperAdmin ? (
          <select
            id="certificate-organization"
            name="organizationId"
            value={form.organizationId}
            onChange={handleChange}
            className="select select-bordered w-full rounded-none"
            required
          >
            <option value="">
              {t('admin.certificates.create.selectOrganization')}
            </option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        ) : (
          <input
            id="certificate-organization"
            readOnly
            value={
              organization?.name ??
              (noOrganization
                ? t('admin.certificates.create.noOrganization')
                : '')
            }
            className="input input-bordered w-full rounded-none"
          />
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col gap-2 w-full">
          <label
            htmlFor="certificate-language"
            className="text-lg font-semibold"
          >
            {t('admin.certificates.create.language')}
          </label>
          <select
            id="certificate-language"
            name="language"
            value={form.language}
            onChange={handleChange}
            className="select select-bordered w-full rounded-none"
          >
            {LANGUAGES.map((language) => (
              <option key={language} value={language}>
                {t(`admin.certificates.create.languages.${language}`)}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2 w-full">
          <label htmlFor="certificate-color" className="text-lg font-semibold">
            {t('admin.certificates.create.color')}
          </label>
          <select
            id="certificate-color"
            name="color"
            value={form.color}
            onChange={handleChange}
            className="select select-bordered w-full rounded-none"
          >
            {COLORS.map((color) => (
              <option key={color} value={color}>
                {t(`admin.certificates.create.colors.${color}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="certificate-intro" className="text-lg font-semibold">
          {t('admin.certificates.create.introText')}
        </label>
        <textarea
          id="certificate-intro"
          name="introText"
          className="textarea textarea-bordered w-full rounded-none"
          rows={2}
          maxLength={400}
          placeholder={t('admin.certificates.create.introPlaceholder')}
          value={form.introText}
          onChange={handleChange}
          required
        />
      </div>
      <label className="input input-bordered flex items-center gap-2 rounded-none">
        {t('admin.certificates.create.achievement')}
        <input
          type="text"
          name="achievement"
          className="grow"
          maxLength={80}
          placeholder={t('admin.certificates.create.achievementPlaceholder')}
          value={form.achievement}
          onChange={handleChange}
          required
        />
      </label>
      <label className="input input-bordered flex items-center gap-2 rounded-none">
        {t('admin.certificates.create.addition')}
        <input
          type="text"
          name="addition"
          className="grow"
          maxLength={150}
          placeholder={t('admin.certificates.create.additionPlaceholder')}
          value={form.addition}
          onChange={handleChange}
        />
      </label>
      <label className="input input-bordered flex items-center gap-2 rounded-none">
        {t('admin.certificates.create.issueDate')}
        <input
          type="date"
          name="issuedDate"
          className="grow"
          value={form.issuedDate}
          onChange={handleChange}
          required
        />
      </label>

      {/* Signatures */}
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">
          {t('admin.certificates.create.signatures')}
        </h3>
        {signatures.map((signature, index) => (
          <div key={index} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder={t('admin.certificates.create.signatureName')}
              aria-label={`${t('admin.certificates.create.signatureName')} ${index + 1}`}
              value={signature.name}
              maxLength={100}
              onChange={(e) =>
                handleSignatureChange(index, 'name', e.target.value)
              }
              className="input input-bordered w-full sm:w-1/2"
            />
            <input
              type="text"
              placeholder={t('admin.certificates.create.signatureRole')}
              aria-label={`${t('admin.certificates.create.signatureRole')} ${index + 1}`}
              value={signature.role}
              maxLength={100}
              onChange={(e) =>
                handleSignatureChange(index, 'role', e.target.value)
              }
              className="input input-bordered w-full sm:w-1/2"
            />
            {signatures.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setSignatures(signatures.filter((_, i) => i !== index))
                }
                className="btn btn-error btn-sm"
              >
                {t('admin.certificates.create.remove')}
              </button>
            )}
          </div>
        ))}
        {signatures.length < MAX_SIGNATURES && (
          <button
            type="button"
            onClick={() =>
              setSignatures([...signatures, { name: '', role: '' }])
            }
            className="btn btn-primary btn-sm self-start"
          >
            {t('admin.certificates.create.addSignature')}
          </button>
        )}
      </div>

      {/* Certificate Preview */}
      <div className="mt-4 p-4 border border-gray-300 rounded">
        <h4 className="font-semibold mb-2">
          {t('admin.certificates.create.certificatePreview')}
        </h4>
        <CertificateDesign
          organizationName={
            organization?.name ??
            t('admin.certificates.create.previewOrganization')
          }
          logoUrl={organization?.Image?.url}
          introText={form.introText}
          achievement={
            form.achievement ||
            t('admin.certificates.create.achievementPlaceholder')
          }
          recipientName={
            recipients[0]?.name || t('admin.certificates.create.previewName')
          }
          addition={form.addition}
          signatures={signatures}
          issuedDate={form.issuedDate}
          language={form.language}
          color={form.color}
        />
      </div>

      {/* Recipients Section */}
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">
          {t('admin.certificates.create.recipients')}
        </h3>
        {recipients.map((recipient, index) => (
          <div key={index} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder={t('admin.certificates.create.recipientName')}
              aria-label={`${t('admin.certificates.create.recipientName')} ${index + 1}`}
              value={recipient.name}
              maxLength={150}
              onChange={(e) =>
                handleRecipientChange(index, 'name', e.target.value)
              }
              className="input input-bordered w-full sm:w-1/2"
              required
            />
            <input
              type="email"
              placeholder={t('admin.certificates.create.recipientEmail')}
              aria-label={`${t('admin.certificates.create.recipientEmail')} ${index + 1}`}
              value={recipient.email}
              maxLength={255}
              onChange={(e) =>
                handleRecipientChange(index, 'email', e.target.value)
              }
              className="input input-bordered w-full sm:w-1/2"
              required
            />
            {recipients.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setRecipients(recipients.filter((_, i) => i !== index))
                }
                className="btn btn-error btn-sm"
              >
                {t('admin.certificates.create.remove')}
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            setRecipients([...recipients, { name: '', email: '' }])
          }
          className="btn btn-primary btn-sm self-start"
        >
          {t('admin.certificates.create.addRecipient')}
        </button>
      </div>

      <button
        type="submit"
        className="btn btn-base-100 rounded-none"
        disabled={loading || noOrganization}
      >
        {loading
          ? t('admin.certificates.create.saving')
          : t('admin.certificates.create.save')}
      </button>
    </form>
  );
};

export default NewCertificate;
