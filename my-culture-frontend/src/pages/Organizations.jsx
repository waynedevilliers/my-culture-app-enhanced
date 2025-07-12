import OrganizationList from "../components/organization/OrganizationsList";

const Organizations = () => {
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
