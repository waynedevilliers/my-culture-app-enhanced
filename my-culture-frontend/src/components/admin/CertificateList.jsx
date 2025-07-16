import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useTranslation } from "react-i18next";

const CertificatesList = () => {
  const { t } = useTranslation();
  const [certificates, setCertificates] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [search, setSearch] = useState("");
  const pageNumbers = [...Array(pages + 1).keys()].slice(1);

  const fetchCertificates = () => {
    axios
      .get(`${import.meta.env.VITE_BACKEND}/api/certificates?page=${page}&search=${search}&includeRecipients=true`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then(({ data }) => {
        setCertificates(data.results);
        setPages(data.totalPages);
        setHasNextPage(data.hasNextPage);
        setHasPreviousPage(data.hasPreviousPage);
      })
      .catch(() => {
        setCertificates([]);
        setPages(1);
        setHasNextPage(false);
        setHasPreviousPage(false);
        toast.error(t("admin.certificates.fetchError"));
      });
  };

  console.log('certificates',certificates);

  const handleSendCertificate = async (certificateId) => {
    try {
      // Fetch certificate details first to get recipients
      const response = await axios.get(`${import.meta.env.VITE_BACKEND}/api/certificates/${certificateId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      const certificate = response.data;
  
      if (!certificate.recipients || certificate.recipients.length === 0) {
        toast.error(t("admin.certificates.noRecipientsError"));
        return;
      }
  
      // Send certificate to each recipient
      const sendRequests = certificate.recipients.map((recipient) =>
        axios.post(
          `${import.meta.env.VITE_BACKEND}/api/certificates/send-certificate/${certificateId}`,
          { email: recipient.email }, 
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
      );
  
      // Wait for all requests to complete
      await Promise.all(sendRequests);
  
      toast.success(t("admin.certificates.sendSuccess"));
    } catch (error) {
      toast.error(error.response?.data?.message || t("admin.certificates.sendError"));
      console.error(error);
    }
  };
  

  const handleGenerateCertificatePage = (certificateId) => {
    axios
      .post(
        `${import.meta.env.VITE_BACKEND}/api/certificates/generate-certificate/${certificateId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      )
      .then((response) => {
        toast.success(response.data.message);
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || t("admin.certificates.generateError"));
      });
  };

  const handleViewCertificate = async (certificateId) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND}/api/certificates/${certificateId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      const certificate = response.data;
  
      if (!certificate.recipients || certificate.recipients.length === 0) {
        toast.error(t("admin.certificates.noRecipientsError"));
        return;
      }
  
      const firstRecipient = certificate.recipients[0];
      if (firstRecipient.recipientUrl) {
        window.open(firstRecipient.recipientUrl, "_blank");
      } else {
        toast.error(t("admin.certificates.urlNotFound"));
      }
    } catch (error) {
      toast.error(t("admin.certificates.viewError"));
      console.error(error);
    }
  };
  

  const handleDelete = (certificate) => {
    axios
      .delete(`${import.meta.env.VITE_BACKEND}/api/certificates/${certificate.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
      .then(() => {
        fetchCertificates(); // Refresh the list after deletion
        toast.success(t("admin.messages.certificateDeleteSuccess"));
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || t("admin.messages.certificateDeleteFailed"));
      });
  };

  useEffect(() => {
    fetchCertificates();
  }, [page, search]);

  return (
    <div className="overflow-x-auto flex flex-col max-w-screen-xl w-full justify-center items-center gap-4">
      <label className="input input-bordered flex items-center gap-2 w-full">
        {t("admin.tables.search")}{" "}
        <input
          type="search"
          className="grow"
          placeholder={t("admin.certificates.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>
      <table className="table table-xs table-zebra mb-4">
        <thead className="bg-secondary text-white">
          <tr>
            <th>{t("admin.certificates.title")}</th>
            <th className="hidden sm:table-cell">{t("admin.tables.issuedDate")}</th>
            <th className="hidden md:table-cell">{t("admin.tables.recipients")}</th>
            <th className="hidden md:table-cell">{t("admin.tables.issuedFrom")}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {certificates.map((certificate) => (
            <tr key={certificate.id}>
              <td>{certificate.title}</td>
              <td className="hidden sm:table-cell">
                {new Date(certificate.issuedDate).toLocaleDateString()}
              </td>
              {/* ✅ Display Multiple Recipients */}
              <td className="hidden md:table-cell">
                {certificate.recipients && certificate.recipients.length > 0 ? (
                  <ul className="list-disc pl-4">
                    {certificate.recipients.map((recipient, index) => (
                      <li key={index}>{recipient.name} ({recipient.email})</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-gray-500">{t("admin.certificates.noRecipients")}</span>
                )}
              </td>
              <td className="hidden md:table-cell">{certificate.issuedFrom}</td>
              <td className="text-right">
                {/* Generate Certificate Button */}
                <button
                  className="btn btn-ghost btn-xs mr-2"
                  onClick={() => handleGenerateCertificatePage(certificate.id)}
                >
                  {t("admin.certificates.generate")}
                </button>
                {/* View Certificate Button */}
                <button
                  className="btn btn-ghost btn-xs mr-2"
                  onClick={() => handleViewCertificate(certificate.id)}
                >
                  {t("admin.certificates.view")}
                </button>
                {/* Send Email Button */}
                <button
                  className="btn btn-ghost btn-xs mr-2"
                  onClick={() => handleSendCertificate(certificate.id)}
                >
                  {t("admin.certificates.send")}
                </button>
                {/* Delete Button */}
                <button
                  className="btn btn-ghost btn-xs hover:bg-transparent hover:text-primary transform duration-300 transition-colors"
                  onClick={() => handleDelete(certificate)}
                >
                  {t("admin.tables.delete")}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="join">
        <button
          className={hasPreviousPage ? "join-item btn" : "join-item btn btn-disabled"}
          onClick={() => setPage(page - 1)}
        >
          «
        </button>
        {pages &&
          pageNumbers.map((pageNumber) => (
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

export default CertificatesList;
