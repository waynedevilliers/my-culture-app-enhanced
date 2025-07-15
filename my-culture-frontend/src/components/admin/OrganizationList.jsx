import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import UpdateOrganizationModal from "./UpdateOrganizationModal";
import { useTranslation } from "react-i18next";

const OrganizationList = () => {
  const { t } = useTranslation();
  const [organizations, setOrganizations] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const pageNumbers = [...Array(pages + 1).keys()].slice(1);
  const [selectedOrg, setSelectedOrg] = useState(null);

  const fetchOrganizations = () => {
    axios
      .get(import.meta.env.VITE_BACKEND + "/api/organizations?page=" + page, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then(({ data }) => {
        setOrganizations(data.results);
        setPages(data.totalPages);
        setHasNextPage(data.hasNextPage);
        setHasPreviousPage(data.hasPreviousPage);
      })
      .catch(() => {
        setOrganizations([]);
        setPages(1);
        setHasNextPage(false);
        setHasPreviousPage(false);
        toast.error(t('admin.messages.errorFetchingOrganizations'));
      });
  };

  const handlePublish = (organization) => {
    const data = {
      name: organization.name,
      published: !organization.published,
    };

    axios
      .put(
        `${import.meta.env.VITE_BACKEND}/api/organizations/${organization.id}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then(() => {
        void fetchOrganizations();
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  const handleDelete = (organizationId) => {
    axios
      .delete(
        `${import.meta.env.VITE_BACKEND}/api/organizations/${organizationId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then(() => {
        toast.success(t('admin.messages.organizationDeletedSuccess'));
        fetchOrganizations();
      })
      .catch(() => {
        toast.error(t('admin.messages.organizationDeleteFailed'));
      });
  };

  useEffect(() => {
    void fetchOrganizations();
  }, [page]);

  return (
    <div className="overflow-x-auto flex flex-col max-w-screen-xl w-full justify-center items-center gap-4">
      <label className="input input-bordered flex items-center gap-2 w-full">
        {t('admin.tables.search')} <input type="search" className="grow" placeholder={t('admin.tables.searchPlaceholder')} />
      </label>
      <table className="table table-xs table-zebra mb-4">
        <thead className="bg-secondary text-white">
          <tr>
            <th></th>
            <th>{t('admin.tables.name')}</th>
            <th className="hidden sm:table-cell">{t('admin.tables.published')}</th>
            <th className="hidden sm:table-cell"></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {organizations &&
            organizations.map((organization) => (
              <tr key={organization.id}>
                <th>{organization.id}</th>
                <th>{organization.name}</th>
                <th className="hidden sm:table-cell">
                  <button
                    className="btn btn-ghost btn-xs hover:bg-transparent hover:text-primary transform duration-300 transition-colors"
                    onClick={() => {
                      handlePublish(organization);
                    }}
                    type="button"
                  >
                    {organization.published ? t('admin.tables.no') : t('admin.tables.yes')}
                  </button>
                </th>
                <th className="hidden sm:table-cell">
                  <button
                    className="btn btn-ghost btn-xs hover:bg-transparent hover:text-primary transform duration-300 transition-colors"
                    onClick={() => handleDelete(organization.id)}
                    type="button"
                  >
                    {t('admin.tables.delete')}
                  </button>
                </th>
                <th>
                  <button
                    type="button"
                    onClick={() => setSelectedOrg(organization)}
                    className="btn btn-ghost btn-xs hover:bg-transparent hover:text-primary transform duration-300 transition-colors"
                  >
                    {t('admin.tables.update')}
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

      {selectedOrg && (
        <UpdateOrganizationModal
          organization={selectedOrg}
          onClose={() => setSelectedOrg(null)}
          onUpdated={() => fetchOrganizations()}
        />
      )}
    </div>
  );
};

export default OrganizationList;
