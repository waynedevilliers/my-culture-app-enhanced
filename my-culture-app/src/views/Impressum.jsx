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

  const headingClass = 'text-2xl sm:text-3xl font-bold text-primary mt-4';

  return (
    <main
      id="impressum"
      className="flex flex-col justify-center items-center text-gray-800"
    >
      <article className="max-w-screen-xl w-full mt-12 flex flex-col gap-2 text-pretty px-4 mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary">
          Impressum
        </h1>

        <h2 className={headingClass}>Anschrift</h2>
        <address className="not-italic">
          Culture Academy e. V.
          <br /> Harz 51
          <br /> 06108 Halle (Saale)
          <br /> Germany
        </address>
        <p>
          E-Mail:{' '}
          <a
            href="mailto:info@culture-academy.org"
            className="text-primary underline hover:no-underline"
          >
            info@culture-academy.org
          </a>
          <br /> Tel: +49 172 3560531
        </p>
        <p>Vereinsregister 22292 (Amtsgericht Stendal)</p>

        <h2 className={headingClass}>Datenschutzbeauftragter</h2>
        <address className="not-italic">
          Christian Köhler-Warmbrunn
          <br /> c/o Culture Academy e. V.
          <br /> Harz 51
          <br /> 06108 Halle (Saale)
        </address>

        <h2 className={headingClass}>Verbraucherstreitbeilegung</h2>
        <p>
          Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren
          vor einer Verbraucherschlichtungsstelle teilzunehmen.
        </p>

        <h2 className={headingClass}>Inhaltslizenzen</h2>
        <p>
          Jegliche Inhalte, die bei culture-academy.org veröffentlicht werden,
          bleiben Eigentum des Culture Academy e. V.. Soweit nicht anders
          vermerkt, können und sollen sie weiterverwertet werden. Alle Inhalte,
          die nicht anders gekennzeichnet sind, und ab dem 01.08.2025
          veröffentlicht wurden, stehen unter der „Creative Commons
          Attribution-NonCommercial 4.0 International“-Lizenz.
        </p>

        <h2 className={headingClass}>Datenschutz</h2>
        <p>
          Angaben zum Datenschutz sind unserer{' '}
          <Link
            to="/datenschutz"
            className="text-primary underline hover:no-underline"
          >
            Datenschutzerklärung
          </Link>{' '}
          zu entnehmen.
        </p>
      </article>
    </main>
  );
};

export default Impressum;
