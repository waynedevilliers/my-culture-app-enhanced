import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const EventsList = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND}/api/events/next`,
        );
        const data = response.data || [];
        setEvents(data);
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };
    void fetchEvents();
  }, []);

  return (
    <section id="event-section" className="w-screen border-t-4 border-neutral flex flex-col">
      {events && events.length > 0 && (
        events.map((event, key) => ((key % 2 === 0) ? (
            <div key={event.id} className="flex flex-col md:grid md:grid-cols-2 ">
              <div className="relative bg-primary text-white w-full px-4 flex flex-col justify-center items-center text-center gap-2 p-20">
                <h2 className="text-4xl sm:text-5xl font-bold">{new Date(event.date).toLocaleDateString('de-DE', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}</h2>
                <h3 className="text-4xl sm:text-5xl font-bold mb-4">{new Date(event.date).getHours() + ":" + (new Date(event.date).getMinutes() < 10 ? '0' : '') + new Date(event.date).getMinutes()}</h3>
                <h2 className="text-neutral text-4xl sm:text-5xl font-bold w-1/2 mb-10">{event.title}</h2>
                <button className="absolute bottom-10 btn bg-neutral border-none text-primary text-xl rounded-none hover:bg-primary hover:drop-shadow-2xl hover:border-solid hover:border-2 hover:border-neutral hover:text-neutral w-40">
                  <Link to={`/events/${event.id}`}>Mehr</Link>
                </button>
              </div>
              <div className="relative bg-neutral text-primary w-full min-h-96 flex flex-col items-center justify-center">
                <div className="absolute inset-0">
                  <img src={event.Image.url} alt={event.title} className="h-full overflow-hidden w-screen object-cover" />
                </div>
                <button className="absolute bottom-10 btn bg-neutral border-none text-primary text-xl rounded-none hover:bg-primary hover:drop-shadow-2xl hover:border-solid hover:border-2 hover:border-neutral hover:text-black w-40">
                  <a href={event.bookingLink}>Tickets</a>
                </button>
              </div>
            </div>
          ) : (
            <div key={event.id} className="flex flex-col-reverse md:grid md:grid-cols-2">
              <div className="relative bg-neutral text-primary w-full flex flex-col min-h-96 items-center justify-center">
                <div className="absolute inset-0">
                  <img src={event.Image.url} alt={event.title} className="h-full overflow-hidden w-screen object-cover" />
                </div>
                <button className="absolute bottom-10 btn bg-neutral border-none text-primary text-xl rounded-none hover:bg-primary hover:drop-shadow-2xl hover:border-solid hover:border-2 hover:border-neutral hover:text-neutral w-40">
                  <a href={event.bookingLink}>Tickets</a>
                </button>
              </div>
              <div className="relative bg-neutral text-primary w-full px-4 flex flex-col justify-center items-center text-center gap-2 p-20">
                <h2 className="text-4xl sm:text-5xl font-bold">{new Date(event.date).toLocaleDateString('de-DE', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}</h2>
                <h3 className="text-4xl sm:text-5xl font-bold mb-4">{new Date(event.date).getHours() + ":" + (new Date(event.date).getMinutes() < 10 ? '0' : '') + new Date(event.date).getMinutes()}</h3>
                <h2 className="text-white text-4xl sm:text-5xl font-bold w-1/2 mb-10">{event.title}</h2>
                <button className="absolute bottom-10 btn bg-primary border-none text-neutral text-xl rounded-none hover:bg-neutral hover:drop-shadow-2xl hover:border-solid hover:border-2 hover:border-primary hover:text-primary w-40">
                  <Link to={`/events/${event.id}`}>Mehr</Link>
                </button>
              </div>
            </div>
          )
        ))
      )}
    </section>
  );
};

export default EventsList;
