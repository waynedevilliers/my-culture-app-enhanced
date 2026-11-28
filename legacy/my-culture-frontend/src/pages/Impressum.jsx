import { useEffect } from 'react';

const Impressum = () => {

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, []);

  return (
    <main id="impressum" className="flex flex-col justify-center items-center bg-neutral text-gray-200">
      <article className="max-w-screen-xl mt-32 flex flex-col gap-2 text-pretty px-4 mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary">Datenschutzerklärung</h1>
        <p>Wir freuen uns über Ihr Interesse an unserer Webseite. Der Schutz Ihrer personenbezogenen Daten bei der
          Erhebung, Verarbeitung und Nutzung anlässlich Ihres Besuchs auf unserer Webseite ist uns ein wichtiges
          Anliegen.</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-primary">1. Personenbezogene Daten</h2>
        <p>Personenbezogene Daten sind Informationen, die dazu genutzt werden können, Ihre Identität zu erfahren.
          Darunter fallen Ihr Name, die Adresse, Postanschrift und Telefonnummer. Informationen, die nicht mit Ihrer
          Identität in Verbindung gebracht werden (wie zum Beispiel Anzahl der Nutzer einer Internetseite), gehören
          nicht dazu. Sie können unser Online-Angebot grundsätzlich ohne Offenlegung Ihrer Identität nutzen.</p>
        <p>Wenn Sie unsere Webseite besuchen oder unsere Dienste nutzen übermittelt das Gerät, mit dem Sie die Seite
          aufrufen, automatisch Log-Daten (Verbindungsdaten) an unsere Server. Log-Daten enthalten die IP-Adresse des
          Gerätes, mit dem Sie auf die Website oder einen Dienst zugreifen, die Art des Browsers, mit dem Sie zugreifen,
          die Seite, die Sie zuvor besucht haben, Ihre Systemkonfiguration sowie Datum und Zeitangaben. Die IP-Adressen
          werden nur gespeichert, soweit es zur Erbringung unserer Dienste erforderlich ist. Ansonsten werden die
          IP-Adressen gelöscht oder anonymisiert. Ihre IP-Adresse beim Besuch unserer Webseite speichern wir zur
          Erkennung und Abwehr von Angriffen maximal 7 Tage.</p>
        <p>Wenn Sie Informationen anfordern, E-Books bestellen oder andere Anfragen stellen, fragen wir Sie nach Ihrem
          Namen und anderen persönlichen Informationen. Es unterliegt Ihrer freien Entscheidung, ob Sie diese Daten
          eingeben. Ihre Angaben speichern wir auf besonders geschützten Servern in der Schweiz. Die EU-Kommission hat
          der Schweiz nach entsprechender Prüfung ein dem EU-Recht vergleichbares Datenschutzniveau attestiert. Eine
          Datenübermittlung von der EU in die Schweiz ist datenschutzrechtlich zulässig. Der Zugriff darauf ist nur
          wenigen, befugten Personen möglich. Diese sind für die technische, kaufmännische oder redaktionelle Betreuung
          der Inhalte und Server zuständig.</p>
        <p>Soweit die Nutzungs- beziehungsweise Verkehrsdaten für unsere Dienste erforderlich sind werden sie längstens
          bis zu sechs Monate nach Erhebung der Daten gespeichert. Werden die Daten zur Erfüllung bestehender
          gesetzlicher, satzungsmäßiger oder vertraglicher Aufbewahrungsfristen benötigt (z.B. Rechnungen), werden diese
          Daten auch darüber hinaus gespeichert. Diese Daten sind jedoch gesperrt und nur wenigen, befugten Personen
          über Passwörter zugänglich.</p>
        <h3 className="text-xl sm:text-2xl font-bold text-primary">Widerspruchsrecht gegen die Datenerhebung in
          besonderen Fällen sowie gegen Direktwerbung (Art. 21 DSGVO)</h3>
        <p>Wenn die Datenverarbeitung auf Grundlage von Art. 6 Abs. 1 lit. e oder f DSGVO erfolgt, haben Sie jederzeit
          das Recht, aus Gründen, die sich aus Ihrer besonderen Situation ergeben, gegen die Verarbeitung Ihrer
          personenbezogenen Daten Widerspruch einzulegen; dies gilt auch für ein auf diese Bestimmungen gestütztes
          Profiling. Die jeweilige Rechtsgrundlage, auf denen eine Verarbeitung beruht, entnehmen Sie dieser
          Datenschutzerklärung. Wenn Sie Widerspruch einlegen, werden wir Ihre betroffenen personenbezogenen Daten nicht
          mehr verarbeiten, es sei denn, wir können zwingende schutzwürdige Gründe für die Verarbeitung nachweisen, die
          Ihre Interessen, Rechte und Freiheiten überwiegen oder die Verarbeitung dient der Geltendmachung, Ausübung
          oder Verteidigung von Rechtsansprüchen (Widerspruch nach Art. 21 Abs. 1 DSGVO).</p>
        <p>Werden Ihre personenbezogenen Daten verarbeitet, um Direktwerbung zu betreiben, so haben Sie das Recht,
          jederzeit Widerspruch gegen die Verarbeitung Sie betreffender personenbezogener Daten zum Zwecke derartiger
          Werbung einzulegen; dies gilt auch für das Profiling, soweit es mit solcher Direktwerbung in Verbindung steht.
          Wenn Sie widersprechen, werden Ihre personenbezogenen Daten anschließend nicht mehr zum Zwecke der
          Direktwerbung verwendet (Widerspruch nach Art. 21 Abs. 2 DSGVO).</p>
        <h3 className="text-xl sm:text-2xl font-bold text-primary">Recht auf Einschränkung der Verarbeitung</h3>
        <p>Sie haben das Recht, die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen. Hierzu
          können Sie sich jederzeit unter der im Impressum angegebenen Adresse an uns wenden.</p>
        <p>Das Recht auf Einschränkung der Verarbeitung besteht in folgenden Fällen:</p>
        <ul className="list-disc pl-10">
          <li>Wenn Sie die Richtigkeit Ihrer bei uns gespeicherten personenbezogenen Daten bestreiten, benötigen wir in
            der Regel Zeit, um dies zu überprüfen. Für die Dauer der Prüfung haben Sie das Recht, die Einschränkung der
            Verarbeitung Ihrer personenbezogenen Daten zu verlangen.
          </li>
          <li>Wenn die Verarbeitung Ihrer personenbezogenen Daten unrechtmäßig geschah / geschieht, können Sie statt der
            Löschung die Einschränkung der Datenverarbeitung verlangen.
          </li>
          <li>Wenn wir Ihre personenbezogenen Daten nicht mehr benötigen, Sie sie jedoch zur Ausübung, Verteidigung oder
            Geltendmachung von Rechtsansprüchen benötigen, haben Sie das Recht, statt der Löschung die Einschränkung der
            Verarbeitung Ihrer personenbezogenen Daten zu verlangen.
          </li>
          <li>Wenn Sie einen Widerspruch nach Art. 21 Abs. 1 DSGVO eingelegt haben, muss eine Abwägung zwischen Ihren
            und unseren Interessen vorgenommen werden. Solange noch nicht feststeht, wessen Interessen überwiegen, haben
            Sie das Recht, die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen.
          </li>
        </ul>
        <p>Wenn Sie die Verarbeitung Ihrer personenbezogenen Daten eingeschränkt haben, dürfen diese Daten – von ihrer
          Speicherung abgesehen – nur mit Ihrer Einwilligung oder zur Geltendmachung, Ausübung oder Verteidigung von
          Rechtsansprüchen oder zum Schutz der Rechte einer anderen natürlichen oder juristischen Person oder aus
          Gründen eines wichtigen öffentlichen Interesses der Europäischen Union oder eines Mitgliedstaats verarbeitet
          werden.</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-primary">2. Weitergabe personenbezogener Daten an Dritte</h2>
        <p>Wir verwenden Ihre personenbezogenen Informationen nur zum Zweck der Verwendung durch uns. Wir geben die
          Daten nicht ohne Ihre ausdrückliche Einwilligung an Dritte weiter. Soweit wir gesetzlich oder per
          Gerichtsbeschluss dazu verpflichtet sind, werden wir Ihre Daten an auskunftsberechtigte Stellen
          übermitteln.</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-primary">3. Einsatz von Cookies</h2>
        <p>Bei Internet-Cookies handelt es sich um kleine Datenpakete, die von Ihrem Browser auf dem Festplattenlaufwerk
          Ihres Computers gespeichert werden. Wir verwenden auf unserer Webseite Cookies. Solche Cookies sind notwendig,
          damit Sie sich auf der Website frei bewegen und deren Features nutzen können; hierzu gehört u. a. auch der
          Zugriff auf gesicherte Bereiche der Website. Cookies sind auch für die Funktion des Warenkorbs bei
          Shop-Bestellungen aus technischen Gründen notwendig.</p>
        <p>Die meisten Browser sind so eingestellt, dass sie Cookies automatisch akzeptieren. Sie können das Speichern
          von Cookies jedoch deaktivieren oder Ihren Browser so einstellen, dass er Sie benachrichtigt, sobald Cookies
          gesendet werden.</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-primary">4. Minderjährigenschutz</h2>
        <p>Kinder und Personen unter 18 Jahren sollten ohne Zustimmung der Eltern oder Erziehungsberechtigten keine
          personenbezogenen Daten an uns übermitteln.</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-primary">5. Links zu anderen Websites</h2>
        <p>Unser Online-Angebot enthält Links zu anderen Webseiten. Wir haben keinen Einfluss darauf, dass deren
          Betreiber die Datenschutzbestimmungen einhalten.</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-primary">8. Kontakt</h2>
        <address className="pl-10 not-italic">
          Musik Leben e.V.<br /> Datenschutzbeauftragter<br /> Gaggenauer Straße 7<br /> 14974 Ludwigsfelde<br />
          <a href="mailto:live-in-lu@gmx.de" className="text-primary hover:text-gray-200 hover:underline">live-in-lu@gmx.de</a>
        </address>
        <h3 className="text-xl sm:text-2xl font-bold text-primary">Ihre Betroffenenrechte</h3>
        <p>Unter den angegebenen Kontaktdaten können Sie jederzeit folgende Rechte ausüben:</p>
        <ul className="list-disc pl-10">
          <li>Auskunft über Ihre bei uns gespeicherten Daten und deren Verarbeitung,</li>
          <li>Berichtigung unrichtiger personenbezogener Daten,</li>
          <li>Löschung Ihrer bei uns gespeicherten Daten,</li>
          <li>Einschränkung der Datenverarbeitung, sofern wir Ihre Daten aufgrund gesetzlicher Pflichten noch nicht
            löschen dürfen,
          </li>
          <li>Widerspruch gegen die Verarbeitung Ihrer Daten bei uns und</li>
          <li>Datenübertragbarkeit, sofern Sie in die Datenverarbeitung eingewilligt haben oder einen Vertrag mit uns
            abgeschlossen haben.
          </li>
        </ul>
        <p>Sofern Sie uns eine Einwilligung erteilt haben, können Sie diese jederzeit mit Wirkung für die Zukunft
          widerrufen.</p>
        <p>Sie können sich jederzeit mit einer Beschwerde an die für Sie zuständige Aufsichtsbehörde wenden. Ihre
          zuständige Aufsichtsbehörde richtet sich nach dem Bundesland oder Kantons Ihres Wohnsitzes, Ihrer Arbeit oder
          der mutmaßlichen Verletzung. Eine Liste der Aufsichtsbehörden mit Anschrift für Deutschland (für den
          nichtöffentlichen Bereich) und Schweiz und Österreich (Europäische Datenschutzbeauftragte) finden Sie
          unter:</p>
        <p>
          <a href="https://www.bfdi.bund.de/DE/Infothek/Anschriften_Links/anschriften_links-node.html" className="text-xs sm:text-lg text-primary hover:text-gray-200 hover:underline">www.bfdi.bund.de/.../anschriften_links-node.html</a>
        </p>
      </article>
    </main>
  );
};

export default Impressum;
