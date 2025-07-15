import { FaAngleDown, FaAward, FaUsers, FaGlobe } from "react-icons/fa6";
import { Link } from "react-scroll";
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';

const HeroSection = () => {
  const { t } = useTranslation();
  
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 py-16">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        className="relative z-10 text-center max-w-5xl mx-auto"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      >
        {/* Main heading */}
        <motion.h1
          className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
            {t('hero.title')}
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          {t('hero.subtitle')}
        </motion.p>

        {/* Stats section */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          <div className="flex flex-col items-center p-4 bg-white/70 backdrop-blur-sm rounded-lg shadow-sm">
            <FaAward className="text-3xl text-primary mb-2" />
            <div className="text-2xl font-bold text-gray-800">1000+</div>
            <div className="text-sm text-gray-600">{t('hero.stats.certificates')}</div>
          </div>
          <div className="flex flex-col items-center p-4 bg-white/70 backdrop-blur-sm rounded-lg shadow-sm">
            <FaUsers className="text-3xl text-secondary mb-2" />
            <div className="text-2xl font-bold text-gray-800">50+</div>
            <div className="text-sm text-gray-600">{t('hero.stats.organizations')}</div>
          </div>
          <div className="flex flex-col items-center p-4 bg-white/70 backdrop-blur-sm rounded-lg shadow-sm">
            <FaGlobe className="text-3xl text-primary mb-2" />
            <div className="text-2xl font-bold text-gray-800">25+</div>
            <div className="text-sm text-gray-600">{t('hero.stats.members')}</div>
          </div>
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <Link
            to="organization-section"
            smooth={true}
            offset={-80}
            duration={800}
            className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            {t('organizations.exploreOrganization')}
          </Link>
          <a
            href="/join-us"
            className="px-8 py-4 border-2 border-primary text-primary font-semibold rounded-full hover:bg-primary hover:text-white transition-all duration-300"
          >
            {t('hero.getStarted')}
          </a>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 text-gray-400 text-3xl cursor-pointer hover:text-primary transition-colors duration-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
      >
        <Link
          to="organization-section"
          spy={true}
          smooth={true}
          offset={-80}
          duration={800}
          className="block animate-bounce"
        >
          <FaAngleDown />
        </Link>
      </motion.div>
    </section>
  );
};

export default HeroSection;
