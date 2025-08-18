import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useUser } from "../../contexts/UserContext";
import { FaEye, FaEnvelope, FaDownload, FaTrash, FaFile, FaShield, FaTriangleExclamation } from "react-icons/fa6";

const CertificatesList = () => {
  const { t } = useTranslation();
  const { user } = useUser();
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

  const handleSendCertificate = async (certificateId, certificate) => {
    // Enhanced security check
    if (user?.access === 'admin' && certificate.issuedFrom !== user?.organizationName) {
      toast.error('You can only send certificates from your organization');
      return;
    }
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
  

  const handleGenerateCertificatePage = (certificateId, certificate) => {
    // Enhanced security check
    if (user?.access === 'admin' && certificate.issuedFrom !== user?.organizationName) {
      toast.error('You can only generate certificates from your organization');
      return;
    }
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

  const handleViewCertificate = async (certificateId, certificate) => {
    try {
      // Enhanced security check
      if (user?.access === 'admin' && certificate.issuedFrom !== user?.organizationName) {
        toast.error('You can only view certificates from your organization');
        return;
      }

      const response = await axios.get(`${import.meta.env.VITE_BACKEND}/api/certificates/${certificateId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      const certificateData = response.data;
  
      if (!certificateData.recipients || certificateData.recipients.length === 0) {
        toast.error(t("admin.certificates.noRecipientsError"));
        return;
      }
  
      // Open secure certificate viewer
      const firstRecipient = certificateData.recipients[0];
      if (firstRecipient) {
        // Create a secure viewing URL 
        const viewerUrl = `/certificates/view/${certificateId}?recipient=${firstRecipient.id}`;
        window.open(viewerUrl, '_blank', 'noopener,noreferrer');
      } else {
        toast.error(t("admin.certificates.noRecipientsError"));
      }
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error('Access denied: You don\'t have permission to view this certificate');
      } else if (error.response?.status === 404) {
        toast.error('Certificate not found');
      } else {
        toast.error(t("admin.certificates.viewError"));
      }
      console.error(error);
    }
  };
  

  const handleDelete = (certificate) => {
    // Enhanced security check
    if (user?.access === 'admin' && certificate.issuedFrom !== user?.organizationName) {
      toast.error('You can only delete certificates from your organization');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${certificate.title}"?`)) {
      return;
    }

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
      {/* Access Level Indicator */}
      <div className="w-full max-w-screen-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FaShield className={`text-lg ${user?.access === 'superAdmin' ? 'text-purple-600' : 'text-blue-600'}`} />
            <span className="text-sm font-medium">
              {user?.access === 'superAdmin' 
                ? 'System-wide certificate access' 
                : `Organization: ${user?.organizationName || 'Unknown'}`}
            </span>
          </div>
          {certificates.length === 0 && (
            <div className="text-sm text-gray-500 flex items-center gap-1">
              <FaTriangleExclamation className="text-yellow-500" />
              No certificates found
            </div>
          )}
        </div>
      </div>
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
            <th className="hidden lg:table-cell">Access</th>
            <th>Actions</th>
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
              {/* Access Level Column */}
              <td className="hidden lg:table-cell">
                {(() => {
                  const hasAccess = user?.access === 'superAdmin' || certificate.issuedFrom === user?.organizationName;
                  return (
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      hasAccess 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {hasAccess ? '✓ Full Access' : '✗ Limited Access'}
                    </span>
                  );
                })()}
              </td>
              <td className="text-right">
                {/* Generate Certificate Button */}
                <button
                  className="btn btn-ghost btn-xs mr-2 tooltip"
                  onClick={() => handleGenerateCertificatePage(certificate.id, certificate)}
                  data-tip="Generate certificate page"
                >
                  <FaFile className="w-3 h-3" />
                  <span className="hidden sm:inline ml-1">{t("admin.certificates.generate")}</span>
                </button>
                {/* View Certificate Button */}
                <button
                  className="btn btn-ghost btn-xs mr-2 tooltip"
                  onClick={() => handleViewCertificate(certificate.id, certificate)}
                  data-tip="View certificate"
                >
                  <FaEye className="w-3 h-3" />
                  <span className="hidden sm:inline ml-1">{t("admin.certificates.view")}</span>
                </button>
                {/* Send Email Button */}
                <button
                  className="btn btn-ghost btn-xs mr-2 tooltip"
                  onClick={() => handleSendCertificate(certificate.id, certificate)}
                  data-tip="Send via email"
                >
                  <FaEnvelope className="w-3 h-3" />
                  <span className="hidden sm:inline ml-1">{t("admin.certificates.send")}</span>
                </button>
                {/* Delete Button */}
                <button
                  className="btn btn-ghost btn-xs hover:bg-transparent hover:text-red-600 transform duration-300 transition-colors tooltip"
                  onClick={() => handleDelete(certificate)}
                  data-tip="Delete certificate"
                >
                  <FaTrash className="w-3 h-3" />
                  <span className="hidden sm:inline ml-1">{t("admin.tables.delete")}</span>
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
      
      {/* Email Sender Modal */}
      <CertificateEmailSender
        certificate={selectedCertificate}
        isOpen={emailSenderOpen}
        onClose={() => {
          setEmailSenderOpen(false);
          setSelectedCertificate(null);
        }}
        onSent={(recipientCount) => {
          toast.success(`Certificate sent successfully to ${recipientCount} recipients!`);
          // Optionally refresh the list or update UI
        }}
      />
    </div>
  );
};

export default CertificatesList;
