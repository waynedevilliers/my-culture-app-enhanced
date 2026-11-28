import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const pageNumbers = [...Array(pages + 1).keys()].slice(1);

  const fetchEvents = () => {
    axios.get(import.meta.env.VITE_BACKEND + '/api/events?page=' + page, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }).then(({ data }) => {
      setEvents(data.results);
      setPages(data.totalPages);
      setHasNextPage(data.hasNextPage);
      setHasPreviousPage(data.hasPreviousPage);
    })
    .catch(() => {
      setEvents([]);
      setPages(1);
      setPages(1);
      setHasNextPage(false);
      setHasPreviousPage(false);
      toast.error('Error fetching users');
    });
  };

  const handlePublish = (event) => {
    const data = {
      title: event.title,
      date: event.date,
      description: event.description,
      conclusion: event.conclusion,
      discountedPrice: event.discountedPrice,
      abendkassePrice: event.abendkassePrice,
      prebookedPrice: event.prebookedPrice,
      bookingLink: event.bookingLink,
      published: !event.published,
      userId: event.User.id,
      imageId: event.Image.id,
      locationId: event.Location.id,
      Categories: event.Categories.map((category) => ({
        id: category.id,
      })),
    };

    axios.put(import.meta.env.VITE_BACKEND + '/api/events/' + event.id, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }).then(() => {
      void fetchEvents();
    }).catch((error) => {
      toast.error(error.message);
    });
  };

  const handleDelete = (event) => {
    const payload = {
      url: `${import.meta.env.VITE_BACKEND}/api/events/${event.id}`,
      config: {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    };

    axios.delete(payload.url, payload.config)
    .then(() => {
      void fetchEvents();
    })
    .catch((error) => {
      toast.error(error.message);
    })
  };

  useEffect(() => {
    void fetchEvents();
  }, []);

  useEffect(() => {
    void fetchEvents();
  }, [page]);

  return (
    <div className="overflow-x-auto flex flex-col max-w-screen-xl w-full justify-center items-center gap-4">
      <label className="input input-bordered flex items-center gap-2 w-full"> Search <input type="search" className="grow" placeholder="..." />
      </label>
      <table className="table table-xs table-zebra mb-4">
        <thead className="bg-secondary text-white">
        <tr>
          <th>Titel</th>
          <th className="hidden sm:table-cell">Datum</th>
          <th className="hidden md:table-cell">Ort</th>
          <th>Published</th>
          <th></th>
          <th></th>
        </tr>
        </thead>
        <tbody>
        {events && events.map((event) => (
          <tr key={event.id}>
            <th>{event.title}</th>
            <th className="hidden sm:table-cell">{new Date(event.date).toLocaleDateString()}</th>
            <th className="hidden md:table-cell">{event.Location.name}</th>
            <th>
              <button className="btn btn-ghost btn-xs hover:bg-transparent hover:text-primary transform duration-300 transition-colors" onClick={() => handlePublish(event)} type="button">{event.published ? ("Ja") : ("Nein")}</button>
            </th>
            <th>
              <button className="btn btn-ghost btn-xs hover:bg-transparent hover:text-primary transform duration-300 transition-colors">bearbeiten</button>
            </th>
            <th>
              <button className="btn btn-ghost btn-xs hover:bg-transparent hover:text-primary transform duration-300 transition-colors" onClick={() => handleDelete(event)}>löschen</button>
            </th>
          </tr>
        ))}
        </tbody>
      </table>
      <div className="join">
        <button className={hasPreviousPage ? "join-item btn" : "join-item btn btn-disabled"} onClick={() => setPage(page - 1)}>«</button>
        {pages && (pageNumbers.map((pageNumber) => (
          <button key={pageNumber} className={page === pageNumber ? "join-item btn btn-md btn-active" : "join-item btn btn-md"} onClick={() => setPage(pageNumber)}>{pageNumber}</button>
        )))}
        <button className={hasNextPage ? "join-item btn" : "join-item btn btn-disabled"} onClick={() => setPage(page + 1)}>»</button>
      </div>
    </div>
  );
};

export default EventsList;
