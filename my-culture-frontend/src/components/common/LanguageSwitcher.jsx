import { useTranslation } from 'react-i18next';
import { FaGlobe } from 'react-icons/fa6';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'de' ? 'en' : 'de';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-secondary hover:text-primary transition-colors duration-300"
      title={i18n.language === 'de' ? 'Switch to English' : 'Auf Deutsch wechseln'}
    >
      <FaGlobe className="text-lg" />
      <span className="font-semibold">
        {i18n.language === 'de' ? 'EN' : 'DE'}
      </span>
    </button>
  );
};

export default LanguageSwitcher;