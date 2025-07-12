import BlockNoteEditor from '../editor/Editor.tsx';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import axios from 'axios';

const NewEvent = () => {
  const tomorrow = `${new Date().getFullYear()}-${`${new Date().getMonth() + 1}`.padStart(2, 0)}-${`${new Date().getDate() + 1}`.padStart(2, 0)}T21:00`;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [categories, setCategories] = useState(null);
  const [locations, setLocations] = useState([]);
  const [categoryList, setCategoryList] = useState([]);
  const [form, setForm] = useState({
    title: '',
    date: tomorrow,
    prebookedPrice: 0,
    abendkassePrice: 0,
    discountedPrice: 0,
    bookingLink: '',
    image: null,
  });

  const handleChange = (e) => {
    setForm((prevState) =>
      e.target.type === 'file'
        ? { ...prevState, [e.target.name]: e.target.files[0] }
        : { ...prevState, [e.target.name]: e.target.value },
    );
  };

  const handleLocation = (e) => {
    setLocation(e);
  };

  const handleCategories = (e) => {
    setCategories(e);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const imageData = new FormData();
      imageData.append('image', form.image);
      imageData.append('name', form.image.name);

      const payload = {
        imageData: imageData,
        config: {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      };

      void uploadImage(payload);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (payload) => {
    await axios.post(import.meta.env.VITE_BACKEND + '/api/file/upload', payload.imageData, payload.config)
    .then((result) => {

      const newPayload = {
        ...payload,
        data: {
          title: form.title,
          date: form.date,
          imageId: result.data.id,
          content: JSON.parse(localStorage.getItem('editorContent')),
          prebookedPrice: Number.parseFloat(form.prebookedPrice),
          abendkassePrice: Number.parseFloat(form.abendkassePrice),
          discountedPrice: Number.parseFloat(form.discountedPrice),
          bookingLink: form.bookingLink,
          locationId: location.id,
          Categories: categories,
        },
      }

      void createNewEvent(newPayload);
    })
    .catch((error) => {
      console.error(error);
    });
  };

  const createNewEvent = async (payload) => {
    await axios.post(import.meta.env.VITE_BACKEND + '/api/events', payload.data, payload.config)
    .then((result) => {
      console.log(result.data);
      navigate("/dashboard/events")
    })
    .catch((error) => {
      console.error(error);
    });
  };

  const fetchLocations = async () => {
    axios.get(import.meta.env.VITE_BACKEND + '/api/locations')
    .then(({ data }) => {
      setLocations(() => data.results.map(location => ({
        ...location,
        value: location.name,
        label: location.name,

      })));
    })
    .catch((error) => {
      toast.error(error.message);
    });
  };

  const fetchCategories = async () => {
    axios.get(import.meta.env.VITE_BACKEND + '/api/categorys')
    .then(({ data }) => {
      setCategoryList(data.results);
    })
    .catch((error) => {
      toast.error(error.message);
    });
  };

  useEffect(() => {
    void fetchLocations();
    void fetchCategories();
  }, []);

  return (
      <form className="flex flex-col w-full max-w-screen-xl m-auto gap-4 mb-10" onSubmit={handleSubmit}>
        <label className="input input-bordered flex items-center gap-2 rounded-none">
          Titel
          <input type="text" name="title" className="grow" placeholder="Neue Veranstaltung" value={form.title} onChange={handleChange} />
        </label>
        <label className="input input-bordered flex items-center gap-2 rounded-none">
          Date:
          <input type="datetime-local" name="date" className="grow" value={form.date} onChange={handleChange} />
        </label>
        <Select
          name="location"
          placeholder={"Veranstaltungsort auswählen"}
          components={{ DropdownIndicator:() => null }}
          unstyled
          options={locations}
          classNames={{
            menuList: () => "w-full",
            option: () => "hover:text-primary",
            control: () => "select select-bordered rounded-none focus-within:ring-2 focus-within:ring-offset-[#e3e7db] focus-within:ring-offset-2 focus-within:ring-base-300",
            valueContainer: () => "flex gap-2",
            menu: () => "bg-[#e3e7db] border border-base-300 px-4 py-2 flex gap-2",
          }}
          value={location}
          onChange={handleLocation}
        />
        <Select
          isMulti
          name="categories"
          placeholder={"Veranstaltungskategorie auswählen"}
          options={categoryList}
          components={{ DropdownIndicator:() => null }}
          unstyled
          classNames={{
            menuList: () => "w-full",
            option: () => "hover:text-primary",
            control: () => "select select-bordered rounded-none focus-within:ring-2 focus-within:ring-offset-[#e3e7db] focus-within:ring-offset-2 focus-within:ring-base-300",
            valueContainer: () => "flex gap-2",
            menu: () => "bg-[#e3e7db] border border-base-300 px-4 py-2 flex gap-2",
          }}
          value={categories}
          onChange={handleCategories}
        />
        <label className="input input-bordered flex items-center gap-2 rounded-none">
          Vorverkauf:
          <input type="number" step="0.01" min="0" max="1000" name="prebookedPrice" className="grow" placeholder="Preis eingeben" onChange={handleChange} />
        </label>
        <label className="input input-bordered flex items-center gap-2 rounded-none">
          Ermäßigt:
          <input type="number" step="0.01" min="0" max="1000" name="discountedPrice" className="grow" placeholder="Preis eingeben" onChange={handleChange} />
        </label>
        <label className="input input-bordered flex items-center gap-2 rounded-none">
          Abendkasse:
          <input type="number" step="0.01" min="0" max="1000" name="abendkassePrice" className="grow" placeholder="Preis eingeben" onChange={handleChange} />
        </label>
        <label className="input input-bordered flex items-center gap-2 rounded-none">
          Buchungslink:
          <input type="url" name="bookingLink" className="grow" placeholder="http://..." onChange={handleChange} />
        </label>
        <label className="input input-bordered flex items-center rounded-none px-0">
          <input type="file" name="image" className="file-input file-input-md w-full max-w-xs rounded-none" onChange={handleChange} />
        </label>
        <BlockNoteEditor />
        <button type="submit" className="btn btn-base-100 rounded-none" disabled={loading}>Save</button>
      </form>
  );
};

export default NewEvent;
