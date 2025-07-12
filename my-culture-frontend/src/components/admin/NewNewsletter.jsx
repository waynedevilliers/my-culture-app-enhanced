import BlockNoteEditor from '../editor/Editor.tsx';
import { toast } from 'react-toastify';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const NewNewsletter = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState('');

  const handleChange = (e) => {
    setSubject(e.target.value);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      url: `${import.meta.env.VITE_BACKEND}/api/newsletters`,
      data: {
        subject: subject,
        content: localStorage.getItem('htmlContent').toString(),
      },
      config: {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    }

    try {
      await axios.post(payload.url, payload.data, payload.config);
      toast.success('Newsletter erfolgreich erstellt.');
      setSubject('');
      localStorage.setItem('editorContent', []);
      localStorage.setItem('htmlContent', '');
      navigate("/dashboard/newsletter")
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="flex flex-col w-full max-w-screen-xl m-auto gap-4 mb-10" onSubmit={handleSubmit}>
      <label className="input input-bordered flex items-center gap-2 rounded-none">
        Titel
        <input type="text" name="title" className="grow" placeholder="Neuer Newsletter" value={subject} onChange={handleChange} />
      </label>
      <BlockNoteEditor />
      <button type="submit" className="btn btn-base-100 rounded-none" disabled={loading}>Speichern</button>
    </form>
  );
};

export default NewNewsletter;
