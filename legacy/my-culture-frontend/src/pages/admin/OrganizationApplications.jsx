import OrganizationApplicationsList from "../../components/admin/OrganizationApplicationsList";
import { useTranslation } from "react-i18next";

const OrganizationApplications = () => {
  const { t } = useTranslation();
  
  return (
    <section
      id="dashboard-organization-applications"
      className="flex flex-col items-center h-full mt-20 gap-4 px-4"
    >
      <h1 className="max-w-screen-xl w-full border-b-2 border-accent text-4xl font-bold text-center pb-4">
        {t('admin.pages.organizationApplications')}
      </h1>
      <OrganizationApplicationsList />
    </section>
  );
};

export default OrganizationApplications;