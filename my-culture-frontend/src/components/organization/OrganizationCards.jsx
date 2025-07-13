import { Link } from "react-router-dom";
import { FaLocationDot, FaCalendar, FaArrowRight } from "react-icons/fa6";
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';

function OrganizationCard({ organization, index = 0 }) {
  const { t } = useTranslation();
  
  return (
    <motion.div
      className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 flex flex-col h-full"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      {/* Image section with enhanced overlay */}
      <Link to={`/organization/${organization.id}`} className="block">
        <div className="relative overflow-hidden h-56">
          {organization.Image?.url ? (
            <img
              src={organization.Image.url}
              alt={organization.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">🏢</div>
                <div className="text-sm font-medium">{organization.name}</div>
              </div>
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-40 group-hover:opacity-70 transition-opacity duration-300"></div>

          {/* Floating badge */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="text-xs font-medium text-primary">{t('organizations.featured')}</span>
          </div>

          {/* Title overlay on hover */}
          <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <h3 className="text-white font-bold text-lg mb-1 drop-shadow-lg">
              {organization.name}
            </h3>
          </div>
        </div>
      </Link>

      {/* Content section */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Organization name */}
        <Link to={`/organization/${organization.id}`}>
          <h3 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-primary transition-colors duration-300 line-clamp-2 min-h-[3.5rem]">
            {organization.name}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3 flex-grow min-h-[4.5rem]">
          {organization.description}
        </p>

        {/* Meta information */}
        <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <FaLocationDot className="text-primary" />
            <span>{t('common.germany')}</span>
          </div>
          <div className="flex items-center gap-1">
            <FaCalendar className="text-primary" />
            <span>{t('organizationDetails.active')}</span>
          </div>
        </div>

        {/* Action button - Always at bottom */}
        <div className="mt-auto">
          <Link
            to={`/organization/${organization.id}`}
            className="group/btn inline-flex items-center gap-2 w-full justify-center bg-gradient-to-r from-primary to-secondary text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-4 focus:ring-primary/25"
          >
            <span>{t('organizations.exploreOrganization')}</span>
            <FaArrowRight className="text-sm transition-transform duration-300 group-hover/btn:translate-x-1" />
          </Link>
        </div>
      </div>

      {/* Decorative corner */}
      <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-primary/10 to-transparent rounded-br-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </motion.div>
  );
}

export default OrganizationCard;
