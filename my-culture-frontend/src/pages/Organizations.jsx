import OrganizationList from "../components/organization/OrganizationsList";

const Organizations = () => {
  return (
    <section
      id="organization"
      className="relative scroll-mt-24 pt-24 h-screen flex flex-col justify-center items-center"
    >
      <OrganizationList />
    </section>
  );
};

export default Organizations;
