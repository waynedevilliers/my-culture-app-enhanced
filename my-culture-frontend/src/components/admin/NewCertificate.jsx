import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";

const NewCertificate = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    issuedFrom: "",
    issueDate: "",
    templateId: "elegant-gold", // Default template
  });

  const [recipients, setRecipients] = useState([{ name: "", email: "" }]);
  const [previewKey, setPreviewKey] = useState(0);
  const [debouncedPreviewData, setDebouncedPreviewData] = useState({
    templateId: "elegant-gold",
    title: "",
    issuedFrom: "",
    issueDate: "",
    recipientName: ""
  });
  const debounceTimer = useRef(null);

  // Fetch available templates and organizations
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await axios.get(import.meta.env.VITE_BACKEND + "/api/certificate-templates");
        setTemplates(response.data.data || []);
      } catch (error) {
        console.error("Error fetching templates:", error);
        toast.error(t("admin.certificates.create.templatesError"));
      }
    };

    const fetchOrganizations = async () => {
      try {
        const response = await axios.get(import.meta.env.VITE_BACKEND + "/api/organizations");
        // Filter to only published organizations
        const publishedOrgs = response.data.results?.filter(org => org.published) || [];
        setOrganizations(publishedOrgs);
      } catch (error) {
        console.error("Error fetching organizations:", error);
        toast.error(t("admin.certificates.create.organizationsError"));
      }
    };

    fetchTemplates();
    fetchOrganizations();
  }, []);

  // Debounced preview update function
  const updatePreview = useCallback(() => {
    const newPreviewData = {
      templateId: form.templateId,
      title: form.title,
      issuedFrom: form.issuedFrom,
      issueDate: form.issueDate,
      recipientName: recipients[0]?.name || ""
    };

    // Only update if data has actually changed
    if (JSON.stringify(newPreviewData) !== JSON.stringify(debouncedPreviewData)) {
      setDebouncedPreviewData(newPreviewData);
      setPreviewKey(prev => prev + 1);
    }
  }, [form.templateId, form.title, form.issuedFrom, form.issueDate, recipients, debouncedPreviewData]);

  // Debounce preview updates
  useEffect(() => {
    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer for debounced update
    debounceTimer.current = setTimeout(updatePreview, 500); // 500ms delay

    // Cleanup timer on unmount
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [updatePreview]);

  // Handle form input changes
  const handleChange = (e) => {
    setForm((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  // Handle recipient changes
  const handleRecipientChange = (index, field, value) => {
    const updatedRecipients = [...recipients];
    updatedRecipients[index][field] = value;
    setRecipients(updatedRecipients);
  };

  // Add new recipient
  const addRecipient = () => {
    setRecipients([...recipients, { name: "", email: "" }]);
  };

  // Remove recipient
  const removeRecipient = (index) => {
    if (recipients.length > 1) {
      setRecipients(recipients.filter((_, i) => i !== index));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (recipients.some((r) => !r.name || !r.email)) {
      toast.error(t("admin.certificates.create.recipientsError"));
      return;
    }

    try {
      setLoading(true);

      // Prepare payload for certificate creation
      const certificatePayload = {
        title: form.title,
        description: form.description,
        issuedFrom: form.issuedFrom,
        issuedDate: form.issueDate,
        templateId: form.templateId,
        recipients,
      };

      // Send request to create certificate
      await axios.post(import.meta.env.VITE_BACKEND + "/api/certificates", certificatePayload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      toast.success(t("admin.certificates.create.success"));
      navigate("/dashboard/certificates");
    } catch (error) {
      toast.error(error.response?.data?.message || t("admin.certificates.create.error"));
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col w-full max-w-screen-xl m-auto gap-4 mb-10" onSubmit={handleSubmit}>
      <label className="input input-bordered flex items-center gap-2 rounded-none">
        {t("admin.certificates.title")}
        <input type="text" name="title" className="grow" placeholder={t("admin.certificates.create.title")} value={form.title} onChange={handleChange} required />
      </label>
      <label className="input input-bordered flex items-center gap-2 rounded-none">
        {t("admin.certificates.description")}
        <input type="text" name="description" className="grow" placeholder={t("admin.certificates.create.description")} value={form.description} onChange={handleChange} required />
      </label>
      <div className="flex flex-col gap-2">
        <label className="text-lg font-semibold">{t("admin.certificates.create.issuedFrom")}</label>
        <select 
          name="issuedFrom" 
          value={form.issuedFrom} 
          onChange={handleChange}
          className="select select-bordered w-full rounded-none"
          required
        >
          <option value="">{t("admin.certificates.create.selectOrganization")}</option>
          {organizations.map((org) => (
            <option key={org.id} value={org.name}>
              {org.name}
            </option>
          ))}
        </select>
      </div>
      <label className="input input-bordered flex items-center gap-2 rounded-none">
        {t("admin.certificates.create.issueDate")}
        <input type="date" name="issueDate" className="grow" value={form.issueDate} onChange={handleChange} required />
      </label>

      {/* Template Selection */}
      <div className="flex flex-col gap-2">
        <label className="text-lg font-semibold">{t("admin.certificates.create.certificateTemplate")}</label>
        <select 
          name="templateId" 
          value={form.templateId} 
          onChange={handleChange}
          className="select select-bordered w-full rounded-none"
          required
        >
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name} - {template.description}
            </option>
          ))}
        </select>
        
        {/* Certificate Preview */}
        {form.templateId && (
          <div className="mt-4 p-4 border border-gray-300 rounded">
            <h4 className="font-semibold mb-2">{t("admin.certificates.create.certificatePreview")}</h4>
            <iframe 
              key={previewKey}
              src={`${import.meta.env.VITE_BACKEND}/api/certificate-templates/${debouncedPreviewData.templateId}/preview?participant=${encodeURIComponent(debouncedPreviewData.recipientName || 'Sample Name')}&event=${encodeURIComponent(debouncedPreviewData.title || 'Certificate Title')}&issueDate=${encodeURIComponent(debouncedPreviewData.issueDate || new Date().toDateString())}&organizationName=${encodeURIComponent(debouncedPreviewData.issuedFrom || 'Organization Name')}`}
              className="w-full h-[700px] border border-gray-200"
              title="Certificate Preview"
            />
          </div>
        )}
      </div>

      {/* Recipients Section */}
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">{t("admin.certificates.create.recipients")}</h3>
        {recipients.map((recipient, index) => (
          <div key={index} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder={t("admin.certificates.create.recipientName")}
              value={recipient.name}
              onChange={(e) => handleRecipientChange(index, "name", e.target.value)}
              className="input input-bordered w-full sm:w-1/2"
              required
            />
            <input
              type="email"
              placeholder={t("admin.certificates.create.recipientEmail")}
              value={recipient.email}
              onChange={(e) => handleRecipientChange(index, "email", e.target.value)}
              className="input input-bordered w-full sm:w-1/2"
              required
            />
            {recipients.length > 1 && (
              <button type="button" onClick={() => removeRecipient(index)} className="btn btn-error btn-sm">
                {t("admin.certificates.create.remove")}
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addRecipient} className="btn btn-primary btn-sm self-start">
          {t("admin.certificates.create.addRecipient")}
        </button>
      </div>

      <button type="submit" className="btn btn-base-100 rounded-none" disabled={loading}>
        {loading ? t("admin.certificates.create.saving") : t("admin.certificates.create.save")}
      </button>
    </form>
  );
};

export default NewCertificate;
