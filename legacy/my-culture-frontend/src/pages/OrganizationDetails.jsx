import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';
import { 
  FaGlobe, 
  FaPhone, 
  FaEnvelope, 
  FaLocationDot, 
  FaArrowLeft,
  FaCertificate,
  FaUsers,
  FaCalendar
} from "react-icons/fa6";
import axios from "axios";

const OrganizationDetails = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND}/api/organizations/${id}`);
        setOrganization(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Organization not found");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrganization();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg text-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{t('organizationDetails.notFound')}</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            to="/organizations" 
            className="btn btn-primary"
          >
            {t('organizationDetails.backToOrganizations')}
          </Link>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{t('organizationDetails.notFound')}</h1>
          <Link 
            to="/organizations" 
            className="btn btn-primary"
          >
            {t('organizationDetails.backToOrganizations')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Back Button */}
        <nav aria-label="Breadcrumb">
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link 
            to="/organizations" 
            className="inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors duration-300"
          >
            <FaArrowLeft />
            <span>{t('organizationDetails.backToOrganizations')}</span>
          </Link>
        </motion.div>
        </nav>

        {/* Hero Section */}
        <article>
        <motion.div 
          className="bg-white rounded-3xl shadow-xl overflow-hidden mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Header Image */}
          <figure className="relative h-64 md:h-80 overflow-hidden">
            {organization.Image?.url ? (
              <img 
                src={organization.Image.url} 
                alt={organization.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="text-6xl mb-4">🏢</div>
                  <div className="text-lg font-medium">{organization.name}</div>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            
            {/* Organization Badge */}
            <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-sm font-semibold text-primary">
                {organization.published ? t('organizationDetails.active') : t('organizationDetails.draft')}
              </span>
            </div>

            {/* Title Overlay */}
            <div className="absolute bottom-6 left-6 right-6">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                {organization.name}
              </h1>
              <div className="flex items-center gap-4 text-white/90">
                <div className="flex items-center gap-2">
                  <FaLocationDot />
                  <span>{t('common.germany')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaUsers />
                  <span>{t('organizationDetails.culturalOrganization')}</span>
                </div>
              </div>
            </div>
          </figure>

          {/* Content Section */}
          <div className="p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12">
              {/* About Section */}
              <section aria-labelledby="about-title">
              <div>
                <h2 id="about-title" className="text-2xl font-bold text-gray-800 mb-6">{t('organizationDetails.aboutTitle')}</h2>
                <p className="text-gray-600 leading-relaxed text-lg mb-8">
                  {organization.description}
                </p>

                {/* Mission Statement */}
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-6 mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">{t('organizationDetails.mission')}</h3>
                  <p className="text-gray-700">
                    {t('organizationDetails.missionText')}
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <FaCertificate className="text-2xl text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-800">50+</div>
                    <div className="text-sm text-gray-600">{t('organizationDetails.certificatesIssued')}</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-xl">
                    <FaCalendar className="text-2xl text-secondary mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-800">12+</div>
                    <div className="text-sm text-gray-600">{t('organizationDetails.programsActive')}</div>
                  </div>
                </div>
              </div>
              </section>

              {/* Contact & Info Section */}
              <section aria-labelledby="contact-title">
              <div>
                <h2 id="contact-title" className="text-2xl font-bold text-gray-800 mb-6">{t('organizationDetails.contactTitle')}</h2>
                
                {/* Contact Information */}
                <div className="space-y-4 mb-8">
                  {organization.website && (
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <FaGlobe className="text-primary text-xl" />
                      <div>
                        <div className="font-semibold text-gray-800">{t('organizationDetails.website')}</div>
                        <a 
                          href={organization.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:text-secondary transition-colors"
                        >
                          {organization.website}
                        </a>
                      </div>
                    </div>
                  )}

                  {organization.email && (
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <FaEnvelope className="text-secondary text-xl" />
                      <div>
                        <div className="font-semibold text-gray-800">{t('organizationDetails.email')}</div>
                        <a 
                          href={`mailto:${organization.email}`}
                          className="text-secondary hover:text-primary transition-colors"
                        >
                          {organization.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {organization.phone && (
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <FaPhone className="text-primary text-xl" />
                      <div>
                        <div className="font-semibold text-gray-800">{t('organizationDetails.phone')}</div>
                        <a 
                          href={`tel:${organization.phone}`}
                          className="text-primary hover:text-secondary transition-colors"
                        >
                          {organization.phone}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Call to Action */}
                <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-6 text-white">
                  <h3 className="text-xl font-bold mb-3">{t('organizationDetails.joinCommunity')}</h3>
                  <p className="mb-4 opacity-90">
                    {t('organizationDetails.joinDescription')}
                  </p>
                  <div className="flex gap-3">
                    <a 
                      href={organization.email ? `mailto:${organization.email}` : '#'}
                      className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex-1 text-center"
                    >
                      {t('organizationDetails.contactUs')}
                    </a>
                    {organization.website && (
                      <a 
                        href={organization.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex-1 text-center"
                      >
                        {t('organizationDetails.visitWebsite')}
                      </a>
                    )}
                  </div>
                </div>
              </div>
              </section>
            </div>
          </div>
        </motion.div>
        </article>

        {/* Additional Sections */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Programs Section */}
          <motion.div 
            className="bg-white rounded-2xl shadow-lg p-8"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('organizationDetails.programs')}</h2>
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-xl">
                <h3 className="font-semibold text-gray-800">Cultural Education</h3>
                <p className="text-gray-600 text-sm mt-1">Learn about heritage and traditions</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-xl">
                <h3 className="font-semibold text-gray-800">Community Events</h3>
                <p className="text-gray-600 text-sm mt-1">Regular workshops and gatherings</p>
              </div>
              <div className="p-4 border border-gray-200 rounded-xl">
                <h3 className="font-semibold text-gray-800">Achievement Certificates</h3>
                <p className="text-gray-600 text-sm mt-1">Recognition for participation and excellence</p>
              </div>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div 
            className="bg-white rounded-2xl shadow-lg p-8"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('organizationDetails.recentActivity')}</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <p className="text-gray-800 font-medium">New program launched</p>
                  <p className="text-gray-600 text-sm">2 weeks ago</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-secondary rounded-full mt-2"></div>
                <div>
                  <p className="text-gray-800 font-medium">Certificate milestone reached</p>
                  <p className="text-gray-600 text-sm">3 weeks ago</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <p className="text-gray-800 font-medium">Community event completed</p>
                  <p className="text-gray-600 text-sm">1 month ago</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
};

export default OrganizationDetails;