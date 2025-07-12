import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import OrganizationCard from "./OrganizationCards";
import axios from "axios";

const OrganizationList = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

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
      } finally {
        setLoading(false);
      }
    };
    fetchOrganizations();
  }, []);

  return (
    <section
      id="organization-section"
      className="py-16 px-4"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Featured
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent ml-3">
              Organizations
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover amazing cultural organizations from around the world and
            explore their unique programs and achievements
          </p>

          {/* Decorative line */}
          <div className="flex items-center justify-center mt-8">
            <div className="w-20 h-1 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
            <div className="w-3 h-3 bg-primary rounded-full mx-4"></div>
            <div className="w-20 h-1 bg-gradient-to-r from-secondary to-primary rounded-full"></div>
          </div>
        </motion.div>

        {/* Organizations grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse"
              >
                <div className="h-56 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 auto-rows-fr">
            {organizations && organizations.length > 0 ? (
              organizations.map((organization, index) => (
                <OrganizationCard
                  key={organization.id}
                  organization={organization}
                  index={index}
                />
              ))
            ) : (
              <motion.div
                className="col-span-full text-center py-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-gray-400 text-6xl mb-4">🏢</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No Organizations Found
                </h3>
                <p className="text-gray-500">
                  Check back soon for new organizations to join our community!
                </p>
              </motion.div>
            )}
          </div>
        )}

        {/* Call to action for organizations */}
        {organizations && organizations.length > 0 && (
          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Join Our Community
              </h3>
              <p className="text-gray-600 mb-6">
                Are you part of a cultural organization? Join our platform and
                start recognizing achievements with beautiful certificates.
              </p>
              <a
                href="/admin"
                className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-full hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                Get Started Today
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default OrganizationList;
