import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { FaCheck, FaTimes, FaEye, FaClock } from "react-icons/fa6";

const OrganizationApplicationsList = () => {
  const { t } = useTranslation();
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND}/api/organizations/applications`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setApplications(response.data.data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error(t("admin.applications.errorFetching"));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (applicationId) => {
    try {
      setLoading(true);
      await axios.post(
        `${import.meta.env.VITE_BACKEND}/api/organizations/applications/${applicationId}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success(t("admin.applications.approveSuccess"));
      fetchApplications();
    } catch (error) {
      console.error("Error approving application:", error);
      toast.error(t("admin.applications.approveError"));
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (applicationId, rejectionNotes) => {
    try {
      setLoading(true);
      await axios.post(
        `${import.meta.env.VITE_BACKEND}/api/organizations/applications/${applicationId}/reject`,
        { rejectionNotes },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      toast.success(t("admin.applications.rejectSuccess"));
      setShowModal(false);
      fetchApplications();
    } catch (error) {
      console.error("Error rejecting application:", error);
      toast.error(t("admin.applications.rejectError"));
    } finally {
      setLoading(false);
    }
  };

  const viewApplication = (application) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <FaCheck className="text-success" />;
      case "rejected":
        return <FaTimes className="text-error" />;
      default:
        return <FaClock className="text-warning" />;
    }
  };

  const getStatusText = (status) => {
    return t(`admin.applications.status.${status}`);
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  return (
    <div className="overflow-x-auto flex flex-col max-w-screen-xl w-full justify-center items-center gap-4">
      {loading && (
        <div className="flex justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      )}

      <div className="stats shadow w-full">
        <div className="stat">
          <div className="stat-title">{t("admin.applications.stats.total")}</div>
          <div className="stat-value">{applications.length}</div>
        </div>
        <div className="stat">
          <div className="stat-title">{t("admin.applications.stats.pending")}</div>
          <div className="stat-value text-warning">
            {applications.filter((app) => app.approvalStatus === "pending").length}
          </div>
        </div>
        <div className="stat">
          <div className="stat-title">{t("admin.applications.stats.approved")}</div>
          <div className="stat-value text-success">
            {applications.filter((app) => app.approvalStatus === "approved").length}
          </div>
        </div>
      </div>

      <table className="table table-xs table-zebra mb-4">
        <thead className="bg-secondary text-white">
          <tr>
            <th>{t("admin.applications.table.id")}</th>
            <th>{t("admin.applications.table.organizationName")}</th>
            <th className="hidden sm:table-cell">{t("admin.applications.table.adminEmail")}</th>
            <th className="hidden sm:table-cell">{t("admin.applications.table.submittedDate")}</th>
            <th>{t("admin.applications.table.status")}</th>
            <th>{t("admin.applications.table.actions")}</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((application) => (
            <tr key={application.id}>
              <td>{application.id}</td>
              <td className="font-semibold">{application.name}</td>
              <td className="hidden sm:table-cell">{application.adminEmail}</td>
              <td className="hidden sm:table-cell">
                {new Date(application.createdAt).toLocaleDateString("de-DE")}
              </td>
              <td>
                <div className="flex items-center gap-2">
                  {getStatusIcon(application.approvalStatus)}
                  <span className="text-xs">
                    {getStatusText(application.approvalStatus)}
                  </span>
                </div>
              </td>
              <td>
                <div className="flex gap-2">
                  <button
                    className="btn btn-ghost btn-xs hover:bg-transparent hover:text-primary"
                    onClick={() => viewApplication(application)}
                    title={t("admin.applications.actions.view")}
                  >
                    <FaEye />
                  </button>
                  {application.approvalStatus === "pending" && (
                    <>
                      <button
                        className="btn btn-ghost btn-xs hover:bg-transparent hover:text-success"
                        onClick={() => handleApprove(application.id)}
                        title={t("admin.applications.actions.approve")}
                        disabled={loading}
                      >
                        <FaCheck />
                      </button>
                      <button
                        className="btn btn-ghost btn-xs hover:bg-transparent hover:text-error"
                        onClick={() => {
                          setSelectedApplication(application);
                          setShowModal(true);
                        }}
                        title={t("admin.applications.actions.reject")}
                        disabled={loading}
                      >
                        <FaTimes />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {applications.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">{t("admin.applications.noApplications")}</p>
        </div>
      )}

      {/* Application Details Modal */}
      {showModal && selectedApplication && (
        <dialog className="modal modal-open">
          <div className="modal-box w-11/12 max-w-2xl">
            <h3 className="font-bold text-lg mb-4">
              {selectedApplication.approvalStatus === "pending"
                ? t("admin.applications.modal.reviewTitle")
                : t("admin.applications.modal.detailsTitle")}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="label">
                  <span className="label-text font-semibold">
                    {t("admin.applications.fields.organizationName")}
                  </span>
                </label>
                <p className="text-sm">{selectedApplication.name}</p>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-semibold">
                    {t("admin.applications.fields.website")}
                  </span>
                </label>
                <p className="text-sm">
                  <a
                    href={selectedApplication.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link link-primary"
                  >
                    {selectedApplication.website}
                  </a>
                </p>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-semibold">
                    {t("admin.applications.fields.contactEmail")}
                  </span>
                </label>
                <p className="text-sm">{selectedApplication.email}</p>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-semibold">
                    {t("admin.applications.fields.contactPhone")}
                  </span>
                </label>
                <p className="text-sm">{selectedApplication.phone}</p>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-semibold">
                    {t("admin.applications.fields.adminName")}
                  </span>
                </label>
                <p className="text-sm">{selectedApplication.adminName}</p>
              </div>

              <div>
                <label className="label">
                  <span className="label-text font-semibold">
                    {t("admin.applications.fields.adminEmail")}
                  </span>
                </label>
                <p className="text-sm">{selectedApplication.adminEmail}</p>
              </div>
            </div>

            <div className="mb-6">
              <label className="label">
                <span className="label-text font-semibold">
                  {t("admin.applications.fields.description")}
                </span>
              </label>
              <p className="text-sm whitespace-pre-wrap">
                {selectedApplication.description}
              </p>
            </div>

            {selectedApplication.approvalStatus === "pending" ? (
              <div className="modal-action">
                <button
                  className="btn btn-error"
                  onClick={() => {
                    const notes = prompt(t("admin.applications.rejectPrompt"));
                    if (notes !== null) {
                      handleReject(selectedApplication.id, notes);
                    }
                  }}
                  disabled={loading}
                >
                  {t("admin.applications.actions.reject")}
                </button>
                <button
                  className="btn btn-success"
                  onClick={() => handleApprove(selectedApplication.id)}
                  disabled={loading}
                >
                  {t("admin.applications.actions.approve")}
                </button>
                <button
                  className="btn"
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                >
                  {t("admin.applications.actions.close")}
                </button>
              </div>
            ) : (
              <div className="modal-action">
                <button
                  className="btn"
                  onClick={() => setShowModal(false)}
                >
                  {t("admin.applications.actions.close")}
                </button>
              </div>
            )}
          </div>
        </dialog>
      )}
    </div>
  );
};

export default OrganizationApplicationsList;