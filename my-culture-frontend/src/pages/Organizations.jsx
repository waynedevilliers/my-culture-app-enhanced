import OrganizationList from "../components/organization/OrganizationsList";
import { useTranslation } from 'react-i18next';

const Organizations = () => {
  const { t } = useTranslation();
  
  return (
    <main
      id="organization"
      className="relative scroll-mt-24 pt-24 pb-16 min-h-screen"
    >
      
      <section aria-labelledby="organizations-list">
        <OrganizationList />
      </section>
    </main>
  );
};

export default Organizations;
