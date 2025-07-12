import LocationsList from "../../components/admin/LocationsList";

const Locations = () => {
  return (
    <section id="dashboard-events" className="flex flex-col items-center h-full mt-20 gap-4 px-4">
      <h1 className="max-w-screen-xl w-full border-b-2 border-accent text-3xl font-bold text-center pb-4">Veranstaltungsorte</h1>
      <LocationsList />
    </section>
  );
};

export default Locations;
