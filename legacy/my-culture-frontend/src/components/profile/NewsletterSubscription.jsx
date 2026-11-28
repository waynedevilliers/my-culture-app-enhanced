import { useState } from "react";
import axios from "axios";
import { useUser } from "../../contexts/UserContext";
import { toast } from "react-toastify";

const NewsletterSubscription = () => {
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(false);

  const handleUnsubscribe = async () => {
    setLoading(true);
    try {
      const payload = {
        url: `${import.meta.env.VITE_BACKEND}/api/subscribers/remove`,
        config: {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      };
      await axios.get(
        payload.url,
        payload.config,
      );
      setUser({ ...user, newsletter: false });
      toast.success("Erfolgreich vom Newsletter abgemeldet.");
    } catch (error) {
      toast.error("Fehler beim Abmelden. Bitte versuchen Sie es erneut.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const payload = {
        data: {
          email: user.email,
        },
        config: {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      }

      await axios.post(
        `${import.meta.env.VITE_BACKEND}/api/subscribers/add`,
        payload.data,
        payload.config
      );
      setUser({ ...user, newsletter: true });
      toast.success("Erfolgreich für den Newsletter angemeldet.");
    } catch (error) {
      toast.error("Fehler beim Anmelden. Bitte versuchen Sie es erneut.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full flex flex-col items-center text-gray-200 py-10 px-4 border-t-4 border-neutral">
      <div className="relative max-w-screen-xl flex flex-col gap-8">
        {user && (
          <div className="relative flex flex-col w-full justify-between gap-8 p-10">
            <div className="absolute h-1/4 w-1/2 top-0 left-0 border-l-2 border-t-2 border-primary"></div>
            <div className="absolute h-1/4 w-1/2 bottom-0 right-0 border-r-2 border-b-2 border-primary z-0"></div>
            <h2 className="text-4xl font-bold max-w-[450px] w-full">
              Newsletter-Abonnement
            </h2>
            <p className="text-center">
              {user.newsletter
                ? ("Sie sind für den Newsletter angemeldet.")
                : (<>Sie sind <span className="text-red-600">nicht</span> für den Newsletter angemeldet.</>)}
            </p>
            <div className="flex flex-col gap-4">
              {user.newsletter ? (
                <button
                  onClick={handleUnsubscribe}
                  className="btn btn-primary hover:btn-neutral border-2 hover:border-primary hover:border-2 rounded-none text-neutral hover:text-primary text-lg font-semibold w-full sm:w-auto z-10"
                  disabled={loading}
                >
                  Abmelden
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn btn-primary hover:btn-neutral border-2 hover:border-primary hover:border-2 rounded-none text-neutral hover:text-primary text-lg font-semibold w-full sm:w-auto z-10"
                  disabled={loading}
                  onClick={handleSubscribe}
                >
                  Abonnieren
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default NewsletterSubscription;
