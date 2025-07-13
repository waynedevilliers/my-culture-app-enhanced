import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const NewCertificate = () => {
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

  // Fetch available templates and organizations
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await axios.get(import.meta.env.VITE_BACKEND + "/api/certificate-templates");
        setTemplates(response.data.data || []);
      } catch (error) {
        console.error("Error fetching templates:", error);
        toast.error("Failed to load certificate templates");
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
        toast.error("Failed to load organizations");
      }
    };

    fetchTemplates();
    fetchOrganizations();
  }, []);

  // Update preview when form data changes
  useEffect(() => {
    setPreviewKey(prev => prev + 1);
  }, [form.templateId, form.title, form.issuedFrom, form.issueDate, recipients[0]?.name]);

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
      toast.error("All recipients must have a name and valid email.");
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

      toast.success("Certificate created successfully!");
      navigate("/dashboard/certificates");
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col w-full max-w-screen-xl m-auto gap-4 mb-10" onSubmit={handleSubmit}>
      <label className="input input-bordered flex items-center gap-2 rounded-none">
        Title
        <input type="text" name="title" className="grow" placeholder="Certificate Title" value={form.title} onChange={handleChange} required />
      </label>
      <label className="input input-bordered flex items-center gap-2 rounded-none">
        Description
        <input type="text" name="description" className="grow" placeholder="Certificate Description" value={form.description} onChange={handleChange} required />
      </label>
      <div className="flex flex-col gap-2">
        <label className="text-lg font-semibold">Issued From</label>
        <select 
          name="issuedFrom" 
          value={form.issuedFrom} 
          onChange={handleChange}
          className="select select-bordered w-full rounded-none"
          required
        >
          <option value="">Select Organization</option>
          {organizations.map((org) => (
            <option key={org.id} value={org.name}>
              {org.name}
            </option>
          ))}
        </select>
      </div>
      <label className="input input-bordered flex items-center gap-2 rounded-none">
        Issue Date
        <input type="date" name="issueDate" className="grow" value={form.issueDate} onChange={handleChange} required />
      </label>

      {/* Template Selection */}
      <div className="flex flex-col gap-2">
        <label className="text-lg font-semibold">Certificate Template</label>
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
            <h4 className="font-semibold mb-2">Certificate Preview:</h4>
            <iframe 
              key={previewKey}
              src={`${import.meta.env.VITE_BACKEND}/api/certificate-templates/${form.templateId}/preview?participant=${encodeURIComponent(recipients[0]?.name || 'Sample Name')}&event=${encodeURIComponent(form.title || 'Certificate Title')}&issueDate=${encodeURIComponent(form.issueDate || new Date().toDateString())}&organizationName=${encodeURIComponent(form.issuedFrom || 'Organization Name')}`}
              className="w-full h-[700px] border border-gray-200"
              title="Certificate Preview"
            />
          </div>
        )}
      </div>

      {/* Recipients Section */}
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Recipients</h3>
        {recipients.map((recipient, index) => (
          <div key={index} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Recipient Name"
              value={recipient.name}
              onChange={(e) => handleRecipientChange(index, "name", e.target.value)}
              className="input input-bordered w-full sm:w-1/2"
              required
            />
            <input
              type="email"
              placeholder="Recipient Email"
              value={recipient.email}
              onChange={(e) => handleRecipientChange(index, "email", e.target.value)}
              className="input input-bordered w-full sm:w-1/2"
              required
            />
            {recipients.length > 1 && (
              <button type="button" onClick={() => removeRecipient(index)} className="btn btn-error btn-sm">
                Remove
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addRecipient} className="btn btn-primary btn-sm self-start">
          + Add Recipient
        </button>
      </div>

      <button type="submit" className="btn btn-base-100 rounded-none" disabled={loading}>
        {loading ? "Saving..." : "Save"}
      </button>
    </form>
  );
};

export default NewCertificate;
