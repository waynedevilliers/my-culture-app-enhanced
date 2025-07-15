import { FaFacebook, FaInstagram, FaEnvelope, FaPhone } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="w-full text-gray-800">
      <div className="border-t-4 border-primary px-4">
        <div className="max-w-screen-xl mx-auto md:px-12 lg:px-16 py-8">
          <div className="flex flex-col md:flex-row justify-between gap-8 text-center md:text-left">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-primary">{t('footer.stayConnected')}</h1>
              <p className="text-lg font-medium mt-2">
                {t('footer.connectDescription')}
              </p>
              <div className="w-1/2 border-b-4 border-primary pt-4 hidden md:block"></div>
            </div>

            <div className="flex-1 space-y-4 md:text-right">
              <div className="flex justify-center md:justify-end items-center gap-2 text-2xl font-bold text-primary">
                <FaEnvelope />
                <p>{t('footer.email')}</p>
              </div>
              <a
                href="mailto:info@culture-academy.org"
                className="text-lg hover:text-primary block font-semibold"
              >
                info@culture-academy.org
              </a>

              <div className="flex justify-center md:justify-end items-center gap-2 mt-4 text-2xl font-bold text-primary">
                <FaPhone />
                <p>{t('footer.phone')}</p>
              </div>
              <p className="hover:text-primary font-semibold">
                +49 172 3560531
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mt-8 text-center md:text-left">
            <div>
              <p className="text-lg font-bold text-primary">{t('footer.socialMedia')}</p>
              <div className="flex justify-center md:justify-start gap-4 mt-2 text-2xl">
                <a href="https://facebook.com" className="hover:text-primary">
                  <FaFacebook />
                </a>
                <a href="https://instagram.com" className="hover:text-primary">
                  <FaInstagram />
                </a>
              </div>
            </div>

            <div className="w-32 h-32">
              <img
                src="/logoNew/MB_Sparkasse.png"
                alt="Live in Lu Logo"
                className="object-contain"
              />
            </div>
          </div>
        </div>

        <div className="w-full border-t-2 border-primary">
          <div className="max-w-screen-xl mx-auto px-4 md:px-12 lg:px-16 py-4 flex flex-col md:flex-row justify-between items-center text-sm text-center md:text-left">
            <div className="font-medium">
              &copy; {new Date().getFullYear()}{" "}
              <span className="text-primary underline">Culture Academy</span>. {t('footer.copyright')}
            </div>

            <nav className="flex justify-center md:justify-start gap-4 mt-4 md:mt-0">
              <Link to="/impressum" className="hover:text-primary font-bold">
                {t('footer.imprint')}
              </Link>
              <Link to="/privacy" className="hover:text-primary font-bold">
                {t('footer.privacy')}
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;