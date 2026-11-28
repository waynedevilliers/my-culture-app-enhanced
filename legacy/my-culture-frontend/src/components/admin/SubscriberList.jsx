import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const SubscriberList = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const pageNumbers = [...Array(pages + 1).keys()].slice(1);

  const fetchSubscribers = async () => {
    const payload = {
      url: import.meta.env.VITE_BACKEND + '/api/subscribers?page=' + page,
    }

    axios.get(payload.url)
    .then(({ data }) => {
      setSubscribers(data.results);
      setPages(data.totalPages);
      setHasNextPage(data.hasNextPage);
      setHasPreviousPage(data.hasPreviousPage);
    })
    .catch((error) => {
      setSubscribers([]);
      setPage(1)
      setPages(1);
      setHasNextPage(false);
      setHasPreviousPage(false);
      toast.error('Error fetching subscribers', error);
    });
  }

  useEffect(() => {
    void fetchSubscribers();
  }, []);

  useEffect(() => {
    void fetchSubscribers();
  }, [page]);

  return (
    <div className="overflow-x-auto flex flex-col max-w-screen-xl w-full justify-center items-center gap-4">
      <label className="input input-bordered flex items-center gap-2 w-full"> Search <input type="search" className="grow" placeholder="..." />
      </label>

      <table className="table table-xs table-zebra mb-4">
        <thead className="bg-secondary text-white">
        <tr>
          <th></th>
          <th>E-Mail</th>
          <th>Status</th>
        </tr>
        </thead>
        {subscribers && subscribers.map((subscriber) => (
          <tr key={subscriber.id}>
            <th>{subscriber.id}</th>
            <th>{subscriber.email}</th>
            <th>{subscriber.status}</th>
          </tr>
        ))}
        <tbody>
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

export default SubscriberList;
