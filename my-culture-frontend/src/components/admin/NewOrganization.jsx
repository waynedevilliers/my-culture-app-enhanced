import { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const NewOrganization = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    website: '',
    phone: '',
    email: '',
    image: null,
  });

  // Handle form input changes
  const handleChange = (e) => {
    setForm((prevState) =>
      e.target.type === 'file'
        ? { ...prevState, [e.target.name]: e.target.files[0] }
        : { ...prevState, [e.target.name]: e.target.value },
    );
  };

  // Function to sanitize form data
  const sanitizeForm = (formData) => ({
    ...formData,
    website: formData.website || null,
    phone: formData.phone || null,
    email: formData.email || null,
  });

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const sanitizedForm = sanitizeForm(form);

      let imageId = null;

      // Check if image exists before uploading
      if (form.image) {
        const imageData = new FormData();
        imageData.append('image', form.image);
        imageData.append('name', form.image.name);

        const uploadResponse = await axios.post(
          import.meta.env.VITE_BACKEND + '/api/file/upload',
          imageData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        imageId = uploadResponse.data.id; // Retrieve image ID from response
      }

      // Prepare payload for organization creation
      const organizationPayload = {
        name: sanitizedForm.name,
        description: sanitizedForm.description,
        website: sanitizedForm.website,
        phone: sanitizedForm.phone,
        email: sanitizedForm.email,
        imageId: imageId, // Only send imageId if available
      };

      // Send request to create organization
      await axios.post(
        import.meta.env.VITE_BACKEND + '/api/organizations',
        organizationPayload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success(t('admin.messages.organizationCreateSuccess'));
      navigate("/dashboard/organizations");

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
        {t('admin.forms.name')}
        <input type="text" name="name" className="grow" placeholder={t('admin.forms.namePlaceholder')} value={form.name} onChange={handleChange} required />
      </label>
      <label className="input input-bordered flex items-center gap-2 rounded-none">
        {t('admin.forms.description')}
        <input type="text" name="description" className="grow" placeholder={t('admin.forms.descriptionPlaceholder')} value={form.description} onChange={handleChange} required />
      </label>
      <label className="input input-bordered flex items-center gap-2 rounded-none">
        {t('admin.forms.website')}
        <input type="url" name="website" className="grow" placeholder={t('admin.forms.websitePlaceholder')} value={form.website} onChange={handleChange} />
      </label>
      <label className="input input-bordered flex items-center gap-2 rounded-none">
        {t('admin.forms.phone')}
        <input type="tel" name="phone" className="grow" placeholder={t('admin.forms.phonePlaceholder')} value={form.phone} onChange={handleChange} />
      </label>
      <label className="input input-bordered flex items-center gap-2 rounded-none">
        {t('admin.forms.email')}
        <input type="email" name="email" className="grow" placeholder={t('admin.forms.emailPlaceholder')} value={form.email} onChange={handleChange} />
      </label>
      <label className="input input-bordered flex items-center rounded-none px-0">
        <input type="file" name="image" className="file-input file-input-md w-full max-w-xs rounded-none" onChange={handleChange} />
      </label>
      <button type="submit" className="btn btn-base-100 rounded-none" disabled={loading}>
        {loading ? t('admin.forms.saving') : t('admin.forms.save')}
      </button>
    </form>
  );
};

export default NewOrganization;

