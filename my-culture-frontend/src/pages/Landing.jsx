import HeroSection from "../sections/HeroSection";
import OrganizationList from "../components/organization/OrganizationsList.jsx"

const Landing = () => {
  return (
    <main className="">
      <HeroSection />
      <section id="organization" className="flex flex-col min-h-screen justify-center items-center min-w-full">
      <OrganizationList />
    </section>
    </main>
  );
};

export default Landing;
