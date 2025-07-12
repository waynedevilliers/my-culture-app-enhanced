import { useEffect, useState } from "react";
import OrganizationCard from "./OrganizationCards";
import axios from "axios";

const OrganizationList = () => {
  const [organizations, setOrganizations] = useState([]);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND}/api/organizations/published`
        );
        const data = response.data || [];
        setOrganizations(data);
      } catch (err) {
        console.error("Error fetching organizations:", err);
      }
    };
    fetchOrganizations();
  }, []);

  console.log(organizations);

  return (
    <section
      id="organization-section"
      className="max-w-screen-xl w-screen flex flex-col py-8 p-5"
    >
      <h2 className="text-3xl font-bold text-gray-800 mb-10 text-center">
        Organizations
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-">
        {organizations && organizations.length > 0 ? (
          organizations.map((organization) => (
            <OrganizationCard
              key={organization.id}
              organization={organization}
            />
          ))
        ) : (
          <p className="text-center text-gray-600 col-span-full">
            No organizations found.
          </p>
        )}
      </div>
    </section>
  );
};

export default OrganizationList;
