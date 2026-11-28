import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const LocationsList = () => {
  const [locations, setLocations] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const pageNumbers = [...Array(pages + 1).keys()].slice(1);

  const fetchLocations = () => {
    axios.get(import.meta.env.VITE_BACKEND + '/api/locations?page=' + page, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }).then(({ data }) => {
      setLocations(data.results);
      setPages(data.totalPages);
      setHasNextPage(data.hasNextPage);
      setHasPreviousPage(data.hasPreviousPage);
    })
    .catch(() => {
      setLocations([]);
      setPages(1);
      setHasNextPage(false);
      setHasPreviousPage(false);
      toast.error('Error fetching locations');
    });
  };

  useEffect(() => {
    void fetchLocations();
  }, []);

  useEffect(() => {
    void fetchLocations();
  }, [page]);

  return (
    <div className="overflow-x-auto flex flex-col max-w-screen-xl w-full justify-center items-center gap-4 px-4 sm:px-0">
      <label className="input input-bordered flex items-center gap-2 w-full"> Search <input type="search" className="grow" placeholder="..." />
      </label>

      <div className="overflow-x-auto w-full">
        <table className="table table-xs table-zebra mb-4 w-full">
          <thead className="bg-secondary text-white">
            <tr>
              <th></th>
              <th>Name</th>
              <th className="hidden sm:table-cell">Street</th>
              <th className="hidden sm:table-cell">House Number</th>
              <th className="hidden sm:table-cell">Postal Code</th>
              <th className="hidden sm:table-cell">City</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {locations && locations.map((location) => (
              <tr key={location.id}>
                <th>{location.id}</th>
                <th>{location.name}</th>
                <th className="hidden sm:table-cell">{location.street}</th>
                <th className="hidden sm:table-cell">{location.houseNumber}</th>
                <th className="hidden sm:table-cell">{location.postalCode}</th>
                <th className="hidden sm:table-cell">{location.city}</th>
                <th>
                  <button className="btn btn-ghost btn-xs hover:bg-transparent hover:text-primary transform duration-300 transition-colors">bearbeiten</button>
                </th>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="join flex flex-wrap justify-center">
        <button
          className={hasPreviousPage ? "join-item btn" : "join-item btn btn-disabled"}
          onClick={() => setPage(page - 1)}
        >
          «
        </button>
        {pages && pageNumbers.map((pageNumber) => (
          <button
            key={pageNumber}
            className={page === pageNumber ? "join-item btn btn-md btn-active" : "join-item btn btn-md"}
            onClick={() => setPage(pageNumber)}
          >
            {pageNumber}
          </button>
        ))}
        <button
          className={hasNextPage ? "join-item btn" : "join-item btn btn-disabled"}
          onClick={() => setPage(page + 1)}
        >
          »
        </button>
      </div>
    </div>
  );
};

export default LocationsList;