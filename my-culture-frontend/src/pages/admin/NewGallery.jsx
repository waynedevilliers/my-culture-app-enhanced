import NewGallery from "../../components/admin/NewGallery"; 

const Gallery = () => {
  return (
    <section
      id="dashboard-events"
      className="flex flex-col items-center h-full mt-20 gap-4 px-4"
    >
      <h1 className="max-w-screen-xl w-full border-b-2 border-accent text-4xl font-bold text-center pb-4">
        New Gallery
      </h1>
     <NewGallery />
    </section>
  );
};

export default Gallery;
