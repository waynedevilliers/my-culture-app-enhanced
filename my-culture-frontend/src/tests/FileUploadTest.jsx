import { useState } from 'react';
import { toast } from 'react-toastify';
import Preview from '../components/image/Preview.jsx';
import axios from 'axios';

const FileUploadTest = () => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    image: null,
  })

  const handleChange = (e) =>
    setForm((prevState) =>
      e.target.type === 'file'
        ? { ...prevState, [e.target.name]: e.target.files[0] }
        : { ...prevState, [e.target.name]: e.target.value }
    );


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const payload = {
        data: formData,
        config: {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          }
        }
      }

      await axios.post(import.meta.env.VITE_BACKEND + '/api/file/upload', payload.data, payload.config)
      .then((result) => {
        setImage(result.data.url)
        setForm({
          name: '',
          image: null,
        });
      })
      .catch((error) => {
        toast.error("Something went wrong", error);
      })

    } catch (error) {
      toast.error('Something went Wrong...', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="file-upload" className="flex flex-col w-screen justify-center items-center">
      <h1 className="text-center text-2xl">File Upload</h1>
      <form className="mt-5 w-1/3 mx-auto flex flex-col items-center gap-5" onSubmit={handleSubmit}>
        <label className="input input-bordered flex items-center gap-2 w-full">
          Name:
          <input
          value={form.name}
          onChange={handleChange}
          type="text"
          name="name"
          className="grow"
          />
        </label>
        <input
          onChange={handleChange}
          name="image"
          type="file"
          className="file-input input-bordered w-full"
        />

        <button type="submit" className="btn btn-block" disabled={loading}>Upload</button>
      </form>
      {image && <Preview image={image} />}
    </section>
  );
};

export default FileUploadTest;
