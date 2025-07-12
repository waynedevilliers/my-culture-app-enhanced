import { Link } from "react-router-dom";

function OrganizationCard({ organization }) {
  console.log("Organization image", organization.Image);
  return (
    <div className="max-w-sm md:max-w-md lg:max-w-lg rounded-lg overflow-hidden shadow-lg m-4 transition-transform transform hover:scale-105">
      <Link to={`/organization/${organization.id}`} className="block">
        <div className="relative group">
          <img
            src={organization.Image.url}
            alt={organization.name}
            className="w-full h-48 object-cover transition-transform transform group-hover:scale-110 duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        <div className="p-6 text-center">
          <h3 className="text-xl font-semibold text-primary mb-2">
            {organization.name}
          </h3>
          <p className="text-gray-700 text-sm md:text-base line-clamp-3">
            {organization.description}
          </p>
        </div>
      </Link>

      <div className="p-4 flex justify-center">
        <Link
          to={`/organization/${organization.id}`}
          className="bg-primary text-white py-2 px-6 rounded-full shadow-md transition-transform duration-300 hover:scale-105 hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Learn More
        </Link>
      </div>
    </div>
  );
}

export default OrganizationCard;
