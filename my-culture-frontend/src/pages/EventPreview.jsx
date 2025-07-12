import { useParams } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import { BlockNoteView, darkDefaultTheme } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import axios from 'axios';
import { BlockNoteSchema, locales, defaultBlockSpecs } from '@blocknote/core';
import { locales as multiColumnLocales, multiColumnDropCursor, withMultiColumn } from '@blocknote/xl-multi-column';
import EventMap from '../components/events/EventMap.jsx';
import { FaTicket } from 'react-icons/fa6';
import { RowsPhotoAlbum } from 'react-photo-album';
import impressions from '../utils/impressions.ts';
import "react-photo-album/rows.css";

const EventPreview = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [position, setPosition] = useState([]);
  const editor = useCreateBlockNote({
    schema: withMultiColumn(BlockNoteSchema.create({
      blockSpecs: { ...defaultBlockSpecs },
    })),
    dropCursor: multiColumnDropCursor,
    dictionary: {
      ...locales.en,
      multi_column: multiColumnLocales.en,
    },
    initialContent: event?.content,
  }, [event]);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND}/api/events/` + id,
        );
        setEvent(response.data);
        setPosition([response.data.Location.latitude, response.data.Location.longitude]);
      } catch (err) {
        console.error("Error fetching event:", err);
      }
    };
    void fetchEvent();

  }, []);

  return (
    <section id="event-preview" className="w-screen relative bg-neutral flex flex-col justify-center items-center">
      {event && (
        <>
          <div className="relative max-w-screen-xl px-4 flex flex-col bg-neutral">
            <div className="relative flex flex-col mt-32 text-center sm:text-right">
              <img src={event.Image.url} alt="" className="object-top object-cover z-10" />
              <div className="absolute w-1/2 h-1/2 border-primary border-l-8 border-t-8 z-20"></div>
              <div className="absolute bottom-0 right-0 w-1/2 h-1/2 border-primary border-r-8 border-b-8 z-20"></div>
              <h1 className="absolute text-4xl sm:text-6xl md:text-7xl bottom-8 right-5 font-bold text-white z-20">{event.title}</h1>
              <h2 className="absolute text-xs sm:text-xl text-black font-bold bg-primary p-2 z-20">{new Date(event.date).toLocaleDateString('de-DE', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })} um {new Date(event.date).getHours() + ":" + (new Date(event.date).getMinutes() < 10 ? '0' : '') + new Date(event.date).getMinutes()} Uhr</h2>
              <p className="absolute text-xs text-black font-bold bg-primary p-1 bottom-0 right-0 z-20">von {event.User.firstName + " " + event.User.lastName}</p>
            </div>
            <div className="relative max-w-screen-xl mx-auto my-10 z-10">
              <BlockNoteView editor={editor} editable={false} theme={{
                ...darkDefaultTheme,
                colors: {
                  editor: {
                    text: 'white',
                    background: 'transparent',
                  },
                },
              }} className="border focus-visible:outline-none focus:outline-none focus-within:outline-none" />
            </div>
            <div className="flex md:flex-row flex-col w-full mb-20 sm:mb-10 justify-between z-10">
              <EventMap position={position} event={event} />
              <div className="md:text-right text-left px-4 mt-4">
                <h2 className="text-4xl lg:text-5xl text-white font-bold mb-4">Veranstaltungsort</h2>
                <h3 className="text-3xl lg:text-4xl text-primary font-bold">{event.Location.name}</h3>
                <p className="text-lg lg:text-xl text-white">
                  {event.Location.street + " " + event.Location.houseNumber}<br /> {event.Location.postalCode + " " + event.Location.city}
                </p>
                <div className="w-1/2 border-primary border-b-4"></div>
                <div className="absolute bottom-5 sm:bottom-10 right-5 bounce text-white drop-shadow-xl hover:text-primary text-4xl font-bold cursor-pointer z-10">
                  <a href={event.bookingLink} className="flex flex-row items-center gap-4">Tickets <FaTicket className="self-end" /></a>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      <div className="absolute w-screen h-full z-0 overflow-hidden opacity-5">
        <RowsPhotoAlbum
          targetRowHeight={250}
          rowConstraints={{ singleRowMaxHeight: 250 }}
          photos={impressions}
          componentsProps={() => ({ image: { loading: "eager", decoding: "sync" }})}
        />
      </div>
    </section>
  );
};

export default EventPreview;
