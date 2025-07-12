import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const NewGallery = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
  });

  const handleChange = (e) => {
    setForm((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        title: form.title,
        content: form.content,
        Images: [],
      };

      await axios.post(import.meta.env.VITE_BACKEND + "/api/galleries", payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      toast.success("Gallery created successfully!");
      navigate("/dashboard/gallery");
    } catch (error) {
      toast.error("Error creating gallery: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="flex flex-col w-full max-w-screen-xl m-auto gap-4 mb-10"
      onSubmit={handleSubmit}
    >
      <label className="input input-bordered flex items-center gap-2 rounded-none focus:ring-2 focus:ring-primary focus:outline-none">
        Title
        <input
          type="text"
          name="title"
          className="grow"
          placeholder="New Gallery Title"
          value={form.title}
          onChange={handleChange}
          required
        />
      </label>
      <label className="flex flex-col gap-2">
        <span className="font-medium text-gray-700">Content</span>
        <textarea
          name="content"
          className="textarea textarea-bordered flex items-center gap-2  rounded-none focus:ring-2 focus:ring-primary focus:outline-none"
          placeholder="Enter a gallery description..."
          value={form.content}
          onChange={handleChange}
          rows={5}
          required
        />
      </label>
      <button
        type="submit"
        className="btn btn-base-100 bg-base-100 rounded-none hover:bg-accent"
        disabled={loading}
      >
        Save
      </button>
    </form>
  );
};

export default NewGallery;


