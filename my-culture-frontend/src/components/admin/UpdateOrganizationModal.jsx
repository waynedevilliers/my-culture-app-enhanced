import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

const UpdateOrganizationModal = ({ organization, onClose, onUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: organization.name || "",
    description: organization.description || "",
    website: organization.website || "",
    phone: organization.phone || "",
    email: organization.email || "",
    published: organization.published || false,
    image: null,
  });

  const handleChange = (e) => {
    setFormData((prevState) =>
      e.target.type === "file"
        ? { ...prevState, [e.target.name]: e.target.files[0] }
        : {
            ...prevState,
            [e.target.name]:
              e.target.type === "checkbox" ? e.target.checked : e.target.value,
          }
    );
  };

  const sanitizeForm = (data) => ({
    ...data,
    website: data.website || null,
    phone: data.phone || null,
    email: data.email || null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const sanitizedForm = sanitizeForm(formData);
      let imageId = organization.imageId || null;

      if (formData.image) {
        const imageData = new FormData();
        imageData.append("image", formData.image);
        imageData.append("name", formData.image.name);

        const uploadResponse = await axios.post(
          import.meta.env.VITE_BACKEND + "/api/file/upload",
          imageData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        imageId = uploadResponse.data.id;
      }

      const updatePayload = {
        name: sanitizedForm.name,
        description: sanitizedForm.description,
        website: sanitizedForm.website,
        phone: sanitizedForm.phone,
        email: sanitizedForm.email,
        published: sanitizedForm.published,
        imageId: imageId,
      };

      await axios.put(
        `${import.meta.env.VITE_BACKEND}/api/organizations/${organization.id}`,
        updatePayload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Organization updated successfully");
      onUpdated();
      onClose();
    } catch (err) {
      toast.error("Failed to update organization");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-none w-full max-w-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Update Organization</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="input input-bordered flex items-center gap-2 rounded-none">
            Name
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="grow"
              placeholder="Name"
              required
            />
          </label>
          <label className="input input-bordered flex items-center gap-2 rounded-none">
            Description
            <input
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="grow"
              placeholder="Description"
              required
            />
          </label>
          <label className="input input-bordered flex items-center gap-2 rounded-none">
            Website
            <input
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="grow"
              placeholder="http://..."
            />
          </label>
          <label className="input input-bordered flex items-center gap-2 rounded-none">
            Phone
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="grow"
              placeholder="+1234567890"
            />
          </label>
          <label className="input input-bordered flex items-center gap-2 rounded-none">
            Email
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="grow"
              placeholder="email@example.com"
            />
          </label>
          <label className="input input-bordered flex items-center gap-2 rounded-none">
            <input
              type="checkbox"
              name="published"
              checked={formData.published}
              onChange={handleChange}
            />
            Published
          </label>
          <label className="input input-bordered flex items-center rounded-none px-0">
            <input
              type="file"
              name="image"
              className="file-input file-input-md w-full max-w-xs rounded-none"
              onChange={handleChange}
            />
          </label>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost rounded-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-base-100 rounded-none"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateOrganizationModal;
