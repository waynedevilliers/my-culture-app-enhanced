import OrganizationList from "../../components/admin/OrganizationList";
import { useTranslation } from "react-i18next";
const Organization = () => {
  const { t } = useTranslation();
  
  return (
    <section
      id="dashboard-events"
      className="flex flex-col items-center h-full mt-20 gap-4 px-4"
    >
      <h1 className="max-w-screen-xl w-full border-b-2 border-accent text-4xl font-bold text-center pb-4">
        {t('admin.pages.organizations')}
      </h1>
      <OrganizationList />
    </section>
  );
};

export default Organization;
