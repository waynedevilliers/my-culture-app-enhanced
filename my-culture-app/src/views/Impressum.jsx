'use client';

import { useEffect } from 'react';
import { Link } from '@/lib/router';

// Operator details only. The privacy policy lives on /datenschutz.
const Impressum = () => {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }, []);

  return (
    <main
      id="impressum"
      className="flex flex-col justify-center items-center bg-neutral text-gray-200"
    >
      <article className="max-w-screen-xl w-full mt-32 flex flex-col gap-2 text-pretty px-4 mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary">
          Impressum
        </h1>
        <h2 className="text-2xl sm:text-3xl font-bold text-primary">
          Angaben gemäß § 5 DDG
        </h2>
        <address className="not-italic">
          Musik Leben e.V.
          <br /> Gaggenauer Straße 7<br /> 14974 Ludwigsfelde
        </address>
        <h2 className="text-2xl sm:text-3xl font-bold text-primary">Kontakt</h2>
        <p>
          E-Mail:{' '}
          <a
            href="mailto:live-in-lu@gmx.de"
            className="text-primary hover:text-gray-200 hover:underline"
          >
            live-in-lu@gmx.de
          </a>
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-primary">
          Datenschutz
        </h2>
        <p>
          Wie wir mit Ihren Daten umgehen, lesen Sie in unserer{' '}
          <Link
            to="/datenschutz"
            className="text-primary hover:text-gray-200 hover:underline"
          >
            Datenschutzerklärung
          </Link>
          .
        </p>
      </article>
    </main>
  );
};

export default Impressum;
