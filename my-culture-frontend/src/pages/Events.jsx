import { useTranslation } from 'react-i18next';

const Events = () => {
    const { t } = useTranslation();
    
    return (
      <main id="events" className="flex flex-col h-screen justify-center items-center">
        <h1 className="text-6xl text-accent font-bold text-center">{t('events.title')}</h1>
        <p className="text-lg text-gray-600 mt-4">{t('events.subtitle')}</p>
      </main>
    );
  };
  
  export default Events;
