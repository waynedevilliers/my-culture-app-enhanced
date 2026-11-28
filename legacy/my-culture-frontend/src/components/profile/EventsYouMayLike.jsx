import { useEffect, useState } from "react";
import axios from "axios";
import { FaTicket } from "react-icons/fa6";
import { toast } from "react-toastify";

const EventsYouMayLike = () => {
  const [randomEvent, setRandomEvent] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND}/api/events/next`
        );
        const data = response.data || [];

        if (data.length > 0) {
          const randomIndex = Math.floor(Math.random() * data.length);
          setRandomEvent(data[randomIndex]);
        }
      } catch (err) {
        toast.error(
          "Es gab ein Problem beim Abrufen der Veranstaltungen. Bitte versuchen Sie es später erneut."
        );
      }
    };

    void fetchEvents();
  }, []);

  return (
    <section className="w-full flex flex-col items-center text-gray-200 py-10 border-t-4 border-neutral px-4">
      {randomEvent ? (
        <>
          <div className="relative w-full max-w-96 p-4">
            <div className="relative">
              <img
                src={randomEvent.Image.url}
                alt=""
                className="object-top object-cover z-10"
              />
              <h3 className="absolute bottom-0 right-0 bg-primary px-2 text-neutral text-md font-bold">
                {randomEvent.title}
              </h3>
              <p className="absolute -top-2 left bg-primary text-xs text-neutral p-1 px-2 font-bold mt-2">
                {new Date(randomEvent.date).toLocaleDateString("de-DE", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}{" "}
                um{" "}
                {new Date(randomEvent.date).toLocaleTimeString("de-DE", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="absolute border-t-4 top-0 left-0 w-1/2 border-primary"></div>
            <div className="absolute border-l-4 top-0 left-0 h-1/2 border-primary"></div>
            <div className="absolute border-r-4 bottom-0 right-0 h-1/2 border-primary"></div>
            <div className="absolute border-b-4 bottom-0 right-0 w-1/2 border-primary"></div>
          </div>
          <div className="flex w-full items-center justify-start pl-4 z-10 mt-4 max-w-96 text-gray-200 hover:text-primary">
            <a
              href={randomEvent.bookingLink}
              className="flex flex-row items-center gap-4 text-2xl"
            >
              Tickets: <FaTicket className="self-end bounce" />
            </a>
          </div>
        </>
      ) : (
        <></>
      )}
    </section>
  );
};

export default EventsYouMayLike;
