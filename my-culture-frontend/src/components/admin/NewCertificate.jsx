import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const NewCertificate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    issuedFrom: "",
    issueDate: "",
  });

  const [recipients, setRecipients] = useState([{ name: "", email: "" }]);

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
      <label className="input input-bordered flex items-center gap-2 rounded-none">
        Issued From
        <input type="text" name="issuedFrom" className="grow" placeholder="Person issuing certificate" value={form.issuedFrom} onChange={handleChange} required />
      </label>
      <label className="input input-bordered flex items-center gap-2 rounded-none">
        Issue Date
        <input type="date" name="issueDate" className="grow" value={form.issueDate} onChange={handleChange} required />
      </label>

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
