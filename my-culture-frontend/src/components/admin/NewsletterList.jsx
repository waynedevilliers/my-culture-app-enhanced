import axios from 'axios';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';

const NewsletterList = () => {
  const [newsletters, setNewsletters] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const pageNumbers = [...Array(pages + 1).keys()].slice(1);

  const fetchNewsletters = () => {
    axios.get(import.meta.env.VITE_BACKEND + '/api/newsletters?page=' + page, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }).then(({ data }) => {
      setNewsletters(data.results);
      setPages(data.totalPages);
      setHasNextPage(data.hasNextPage);
      setHasPreviousPage(data.hasPreviousPage);
    })
    .catch(() => {
      setNewsletters([]);
      setPage(1)
      setPages(1);
      setHasNextPage(false);
      setHasPreviousPage(false);
      toast.error('Error fetching newsletters');
    });
  };

  const handleDelete = async (newsletter) => {
    const payload = {
      url: import.meta.env.VITE_BACKEND + '/api/newsletters/' + newsletter.id,
      config: {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    };

    await axios.delete(payload.url, payload.config)
    .then(() => {
      toast.success('Newsletter deleted');
      void fetchNewsletters();
    })
    .catch((error) => {
      toast.error('Error deleting newsletter', error);
    });
  };

  const handleSend = async (newsletter) => {
    const payload = {
      url: import.meta.env.VITE_BACKEND + '/api/newsletters/send',
      data: {
        subject: newsletter.subject,
        content: newsletter.content,
      },
      config: {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
    };

    await axios.post(
      payload.url,
      payload.data,
      payload.config
    ).then(() => {
      toast.success('Newsletter successfully sent');
      void fetchNewsletters();
    }).catch((error) => {
      toast.error('Error sending newsletter', error);
    });
  }

  useEffect(() => {
    void fetchNewsletters();
  }, []);

  useEffect(() => {
    void fetchNewsletters();
  }, [page]);

  return (
    <div className="overflow-x-auto flex flex-col max-w-screen-xl w-full justify-center items-center gap-4">
      <label className="input input-bordered flex items-center gap-2 w-full"> Search <input type="search" className="grow" placeholder="..." />
      </label>

      <table className="table table-xs table-zebra mb-4">
        <thead className="bg-secondary text-white">
        <tr>
          <th>Titel</th>
          <th></th>
          <th></th>
          <th></th>
        </tr>
        </thead>
        <tbody>
        {newsletters && newsletters.map((newsletter) => (
          <tr key={newsletter.id}>
            <th>{newsletter.subject}</th>
            <th>
              <button className="btn btn-ghost btn-xs hover:bg-transparent hover:text-primary transform duration-300 transition-colors" onClick={() => handleDelete(newsletter)} type="button">löschen</button>
            </th>
            <th>
              <button className="btn btn-ghost btn-xs hover:bg-transparent hover:text-primary transform duration-300 transition-colors" type="button">bearbeiten</button>
            </th>
            <th>
              <button className="btn btn-ghost btn-xs hover:bg-transparent hover:text-primary transform duration-300 transition-colors" onClick={() => handleSend(newsletter)} type="button">senden</button>
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

export default NewsletterList;
