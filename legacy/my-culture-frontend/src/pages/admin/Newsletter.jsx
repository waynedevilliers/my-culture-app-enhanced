import NewsletterList from '../../components/admin/NewsletterList.jsx';

const Newsletter = () => {
  return (
    <section id="dashboard-newsletter" className="flex flex-col items-center h-full mt-20 gap-4 px-4">
      <h1 className="max-w-screen-xl w-full border-b-2 border-accent text-4xl font-bold text-center pb-4">Newsletter</h1>
      <NewsletterList />
    </section>
  );
};

export default Newsletter;
