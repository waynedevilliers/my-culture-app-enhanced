import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

const GalleryList = () => {
  const [galleries, setGalleries] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const pageNumbers = [...Array(pages + 1).keys()].slice(1);

  const fetchGalleries = () => {
    axios
      .get(import.meta.env.VITE_BACKEND + "/api/galleries?page=" + page, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then(({ data }) => {
        setGalleries(data.results);
        setPages(data.totalPages);
        setHasNextPage(data.hasNextPage);
        setHasPreviousPage(data.hasPreviousPage);
      })
      .catch(() => {
        setGalleries([]);
        setPages(1);
        setHasNextPage(false);
        setHasPreviousPage(false);
        toast.error("Error fetching galleries");
      });
  };

  const handlePublish = (gallery) => {
    const data = {
      title: gallery.title,
      published: !gallery.published,
      Images: gallery.Images,
    };

    axios
      .put(
        `${import.meta.env.VITE_BACKEND}/api/galleries/${gallery.id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then(() => {
        void fetchGalleries();
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  const handleDelete = (galleryId) => {
    axios
      .delete(`${import.meta.env.VITE_BACKEND}/api/galleries/${galleryId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then(() => {
        toast.success("Gallery deleted successfully");
        fetchGalleries();
      })
      .catch(() => {
        toast.error("Failed to delete gallery");
      });
  };

  useEffect(() => {
    void fetchGalleries();
  }, [page]);

  return (
    <div className="overflow-x-auto flex flex-col max-w-screen-xl w-full justify-center items-center gap-4">
      <label className="input input-bordered flex items-center gap-2 w-full">
        Search <input type="search" className="grow" placeholder="..." />
      </label>
      <table className="table table-xs table-zebra mb-4">
        <thead className="bg-secondary text-white">
          <tr>
            <th></th>
            <th>Titel</th>
            <th className="hidden sm:table-cell">Veröffentlichen</th>
            <th className="hidden sm:table-cell"></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {galleries &&
            galleries.map((gallery) => (
              <tr key={gallery.id}>
                <th>{gallery.id}</th>
                <th>{gallery.title}</th>
                <th className="hidden sm:table-cell">
                  <button
                    className="btn btn-ghost btn-xs hover:bg-transparent hover:text-primary transform duration-300 transition-colors"
                    onClick={() => {
                      handlePublish(gallery);
                    }}
                    type="button"
                  >
                    {gallery.published ? "Nein" : "Ja"}
                  </button>
                </th>
                <th className="hidden sm:table-cell">
                  <button
                    className="btn btn-ghost btn-xs hover:bg-transparent hover:text-primary transform duration-300 transition-colors"
                    onClick={() => handleDelete(gallery.id)}
                    type="button"
                  >
                    löschen
                  </button>
                </th>
                <th>
                  <button className="btn btn-ghost btn-xs hover:bg-transparent hover:text-primary transform duration-300 transition-colors">
                    bearbeiten
                  </button>
                </th>
              </tr>
            ))}
        </tbody>
      </table>

      <div className="join">
        <button
          className={
            hasPreviousPage ? "join-item btn" : "join-item btn btn-disabled"
          }
          onClick={() => setPage(page - 1)}
        >
          «
        </button>

        {pages &&
          pageNumbers.map((pageNumber) => (
            <button
              key={pageNumber}
              className={
                page === pageNumber
                  ? "join-item btn btn-md btn-active"
                  : "join-item btn btn-md"
              }
              onClick={() => setPage(pageNumber)}
            >
              {pageNumber}
            </button>
          ))}

        <button
          className={
            hasNextPage ? "join-item btn" : "join-item btn btn-disabled"
          }
          onClick={() => setPage(page + 1)}
        >
          »
        </button>
      </div>
    </div>
  );
};

export default GalleryList;

