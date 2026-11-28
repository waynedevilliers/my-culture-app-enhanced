import {
  sequelize,
  User,
  Event,
  Image,
  Location,
  Testimonial,
  Category,
  EventCategory,
  Blog,
  Gallery,
  Organization,
  Certificate,
  CertificateRecipient,
} from "./db.js";

const databaseSeed = async () => {
  await sequelize.sync({ force: true });

  const sampleUsers = [
    {
      firstName: "René",
      lastName: "Weiberlenn",
      email: "rene.weiberlenn@live.de",
      password: "password",
      phoneNumber: "1234567890",
      role: "admin",
      newsletter: true,
    },
    {
      firstName: "Wayne",
      lastName: "Black",
      email: "wayne@black.com",
      password: "password",
      phoneNumber: "2345678901",
      role: "admin",
      newsletter: false,
    },
    {
      firstName: "Bob",
      lastName: "Johnson",
      email: "bob.johnson@live.de",
      phoneNumber: "3456789012",
      password: "password",
      role: "user",
      newsletter: true,
    },
    {
      firstName: "Charlie",
      lastName: "Williams",
      email: "charlie.williams@live.de",
      password: "password",
      phoneNumber: "4567890123",
      role: "user",
      newsletter: true,
    },
    {
      firstName: "Diana",
      lastName: "Brown",
      email: "diana.brown@live.de",
      password: "password",
      phoneNumber: "5678901234",
      role: "user",
      newsletter: false,
    },
    {
      firstName: "Eve",
      lastName: "Davies",
      email: "eve.davies@live.de",
      password: "password",
      phoneNumber: "6789012345",
      role: "user",
      newsletter: true,
    },
    {
      firstName: "Frank",
      lastName: "Miller",
      email: "frank.miller@live.de",
      password: "password",
      phoneNumber: "7890123456",
      role: "user",
      newsletter: false,
    },
    {
      firstName: "Grace",
      lastName: "Wilson",
      email: "grace.wilson@live.de",
      password: "password",
      phoneNumber: "8901234567",
      role: "user",
      newsletter: true,
    },
    {
      firstName: "Hannah",
      lastName: "Moore",
      email: "hannah.moore@live.de",
      password: "password",
      phoneNumber: "9012345678",
      role: "user",
      newsletter: false,
    },
    {
      firstName: "Ian",
      lastName: "Taylor",
      email: "ian.taylor@live.de",
      password: "password",
      phoneNumber: "0123456789",
      role: "user",
      newsletter: true,
    },
    {
      firstName: "Jack",
      lastName: "Anderson",
      email: "jack.anderson@live.de",
      password: "password",
      phoneNumber: "1123456789",
      role: "user",
      newsletter: true,
    },
  ];

  const sampleTestimonials = [
    {
      name: "Jane Doe",
      affiliation: "CEO, TechSolutions Inc.",
      description:
        "This service completely exceeded my expectations! The professionalism and attention to detail were outstanding.",
      rating: 5,
    },
    {
      name: "John Smith",
      affiliation: "Founder, GreenGrow Farms",
      description:
        "Working with this team was an absolute pleasure. Their expertise and dedication made all the difference for our project.",
      rating: 5,
    },
    {
      name: "Emily Carter",
      affiliation: "Marketing Director, BrightFuture LLC",
      description:
        "I am blown away by the quality of work delivered. The results were transformative for our business!",
      rating: 5,
    },
    {
      name: "Michael Johnson",
      affiliation: "Professor, University of Innovation",
      description:
        "A truly stellar experience. The insights provided were incredibly valuable and well thought out.",
      rating: 5,
    },
    {
      name: "Sophia Lee",
      affiliation: "COO, Visionary Ventures",
      description:
        "Exceptional service and great communication throughout the entire process. I couldn't have asked for more!",
      rating: 5,
    },
  ];

  const sampleCategories = [
    {
      label: "Soul",
      value: "soul",
    },
    {
      label: "Rock",
      value: "rock",
    },
    {
      label: "Funk",
      value: "funk",
    },
    {
      label: "Blues",
      value: "blues",
    },
    {
      label: "Jazz",
      value: "jazz",
    },
    {
      label: "Folk",
      value: "folk",
    },
    {
      label: "Country",
      value: "country",
    },
    {
      label: "Alternative",
      value: "alternative",
    },
    {
      label: "Metal",
      value: "metal",
    },
    {
      label: "Punk",
      value: "punk",
    },
  ];

  const sampleLocations = [
    {
      name: "Klubhaus Ludwigsfelde",
      street: "Theodor-Fontane-Straße",
      houseNumber: "42",
      postalCode: 14974,
      city: "Ludwigsfelde",
      latitude: 52.301516067788015,
      longitude: 13.259896002779223,
    },
    {
      name: "Kulturscheune Thyrow",
      street: "Thyrower Bahnhofstraße",
      houseNumber: "89",
      postalCode: 14959,
      city: "Trebbin OT Thyrow",
      latitude: 52.250024495229646,
      longitude: 13.245091084406909,
    },
    {
      name: "LISUM Struveshof",
      street: "Struveweg",
      houseNumber: "1-18",
      postalCode: 14974,
      city: "Ludwigsfelde",
      latitude: 52.31992695209389,
      longitude: 13.230193635694153,
    },
  ];

  const sampleImages = [
    {
      name: "Stone Senate",
      url: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1734121098/Stone%20Senate.png",
      userId: 1,
    },
    {
      name: "Vanja Sky",
      url: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1734121084/Vanja%20Sky.jpg",
      userId: 1,
    },
    {
      name: "Will Jacobs",
      url: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1734121066/Will%20Jacobs.jpg",
      userId: 1,
    },
    {
      name: "Brown Sugar",
      url: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1734120996/Brown%20Sugar.jpg",
      userId: 1,
    },
    {
      name: "Open Air Festival",
      url: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1734343131/Open%20Air%20Festival.png",
      userId: 1,
    },
    {
      name: "The Abalur's",
      url: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1735818603/The%20Abalur%27s.jpg",
      userId: 1,
    },
    {
      name: "Peter Karp Band",
      url: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1735818875/Peter%20Karp%20Band.jpg",
      userId: 1,
    },
    {
      name: "LUKE & Band",
      url: "https://res.cloudinary.com/dv5rxkcpd/image/upload/v1735818994/LUKE%20and%20Band.jpg",
      userId: 1,
    },
  ];

  const sampleEvents = [
    {
      title: "Irischer Abend mit The Abalur's",
      date: new Date("2025-02-22T21:00:00"),
      content: [
        {
          "id": "28256333-2b22-4153-8109-53281ad9aaac",
          "type": "paragraph",
          "props": {
            "textColor": "default",
            "textAlignment": "left",
            "backgroundColor": "default",
          },
          "content": [
            {
              "text": "1999 gründete HORCH-Frontmann Adolphi diese Band ursprünglich als kleines „Nebenunternehmen“ – als eine der ersten Aufgaben ergab sich allerdings ein Support zu Jethro Tull. Dies führte zu weit mehr als 1.000 Konzerten und diversen Festivals in Deutschland, der Schweiz, Österreich – inzwischen ist die Celtic-Folkrock-Combo mit stets eigenem Songmaterial vom nunmehr 6. Album und dem Extrakt aus über 20 Jahren Bandgeschichte unterwegs.",
              "type": "text",
              "styles": {},
            },
          ],
          "children": [],
        },
        {
          "id": "638243c4-3e38-4c50-a3e0-15ba8dbf4db0",
          "type": "paragraph",
          "props": {
            "textColor": "default",
            "textAlignment": "left",
            "backgroundColor": "default",
          },
          "content": [
            {
              "text": "The ABERLOUR'S zählen heute zu den wenigen Celtic Rock Bands aus Deutschland, die sich live mit Originalen wie Beoga, der Battlefield Band oder Fairport Convention messen konnten - und im Folkbereich genauso brillieren wie auf Metalfestivals wie Wacken oder Mittelalterevents wie das Mediaval Selb. Seltene Akustik-Instrumente wie Cister und Mandocello treffen auf donnernde Grooves, melodiöse Vocallinien ergänzen sich mit furiosen Fiddle-und Akkordeonparts. Wildromantisch-skurrile Geschichten aus Irland, Schottland, England und dem Mansfelder Land; getragen von Speedfolk, Worldbeat, Medieval Rock - Celtic Folk’n’Beat.",
              "type": "text",
              "styles": {},
            },
          ],
          "children": [],
        },
        {
          "id": "970c42a3-637c-453b-a0b1-47935185eeb1",
          "type": "paragraph",
          "props": {
            "textColor": "default",
            "textAlignment": "center",
            "backgroundColor": "default",
          },
          "content": [
            {
              "text": "Allein vier Mal bestritt die Band zusammen mit berühmten Kollegen aus Übersee die legendäre Irish Heart Beat Tour der renomierten Agentur Magnetic Music quer durch Deutschland – jeweils als eigenständiger Brückenschlag zwischen hochklassigem Celtic Folk und konzertantem Rock.",
              "type": "text",
              "styles": {
                "italic": true,
              },
            },
          ],
          "children": [],
        },
        {
          "id": "46dfa054-90f3-4a36-950c-a5e8c281fdae",
          "type": "paragraph",
          "props": {
            "textColor": "default",
            "textAlignment": "left",
            "backgroundColor": "default",
          },
          "content": [
            {
              "text": "FOLK ROOTS London schrieb einst (in Inseltypischer Übertreibung):",
              "type": "text",
              "styles": {
                "bold": true,
              },
            },
            {
              "text": " …They must be glimpsed – sell the cat, mortage your mother-in-law, what ever, flu is not excuse. They cure all known ills and one or two not yet discovered by science. Paradise, german style.",
              "type": "text",
              "styles": {},
            },
          ],
          "children": [],
        },
        {
          "id": "c2d78789-b360-43b9-ab89-7d78acd7494e",
          "type": "paragraph",
          "props": {
            "textColor": "default",
            "textAlignment": "left",
            "backgroundColor": "default",
          },
          "content": [
            {
              "text": "Adolphi solo voc. / Gitarren / mandocello / Cister / Thunderbodhran • Val Gregor violine / Voc. • Steffen Thomas aKKordeon / orgel / Voc. • Meff Schimetzek drums • Kayer Büttner bass",
              "type": "text",
              "styles": {
                "italic": true,
                "textColor": "red",
              },
            },
          ],
          "children": [],
        },
        {
          "id": "c48e9374-50ea-49bb-875e-9105ff955f24",
          "type": "paragraph",
          "props": {
            "textColor": "default",
            "textAlignment": "left",
            "backgroundColor": "default",
          },
          "content": [],
          "children": [],
        },
      ],
      imageId: 6,
      locationId: 2,
      userId: 1,
      discountedPrice: 18.0,
      abendkassePrice: 24.0,
      prebookedPrice: 22.0,
      bookingLink: "https://example.com/book-now",
      published: true,
    },
    {
      title: "Luke & Band",
      date: new Date("2025-04-12T21:00:00"),
      content: [
        {
          "id": "35031e03-feb9-4a64-8289-6f5a4b954011",
          "type": "heading",
          "props": {
            "level": 2,
            "textColor": "default",
            "textAlignment": "left",
            "backgroundColor": "default",
          },
          "content": [
            {
              "text": "\"LUKE\" ist Die ",
              "type": "text",
              "styles": {},
            },
            {
              "text": "New Blues",
              "type": "text",
              "styles": {
                "italic": true,
              },
            },
            {
              "text": " Band des deutschen Singer/Songwriters und Gitarristen Lukas Schüßler.",
              "type": "text",
              "styles": {},
            },
          ],
          "children": [],
        },
        {
          "id": "f74d6598-1f7d-48a3-bb55-b2ba3488268e",
          "type": "paragraph",
          "props": {
            "textColor": "default",
            "textAlignment": "left",
            "backgroundColor": "default",
          },
          "content": [
            {
              "text": "Seit seinem dreizehnten Lebensjahr steht der Sänger, Gitarrist und Songwriter Lukas Schüßler aka LUKE nun mehr als 15 Jahre auf der Bühne. Dabei spielte er bereits in den angesagtesten Blues-Clubs und Festivals in Deutschland, Frankreich, Luxemburg und Holland, tourte bereits im Vorprogramm von ",
              "type": "text",
              "styles": {},
            },
            {
              "text": "Patti Smith, Keb’ Mo’ ",
              "type": "text",
              "styles": {
                "italic": true,
              },
            },
            {
              "text": "oder ",
              "type": "text",
              "styles": {},
            },
            {
              "text": "Taj Mahal, ",
              "type": "text",
              "styles": {
                "italic": true,
              },
            },
            {
              "text": "wurde zum Preisträger des ",
              "type": "text",
              "styles": {},
            },
            {
              "text": "Deutschen Rock und Pop Preises 2019",
              "type": "text",
              "styles": {
                "bold": true,
                "italic": true,
              },
            },
            {
              "text": " gekürt, erhielt den ",
              "type": "text",
              "styles": {},
            },
            {
              "text": "Kulturpreis für Musik 2023 des Regionalverbands Saarbrücken",
              "type": "text",
              "styles": {
                "bold": true,
                "italic": true,
              },
            },
            {
              "text": " und wurde für die ",
              "type": "text",
              "styles": {},
            },
            {
              "text": "German Blues Challenge 2023",
              "type": "text",
              "styles": {
                "bold": true,
                "italic": true,
              },
            },
            {
              "text": " nominiert.",
              "type": "text",
              "styles": {},
            },
          ],
          "children": [],
        },
        {
          "id": "78b24f58-f6d7-49e8-8348-3018cb30881e",
          "type": "paragraph",
          "props": {
            "textColor": "default",
            "textAlignment": "left",
            "backgroundColor": "default",
          },
          "content": [
            {
              "text": "Inspiriert durch Blues Legenden wie ",
              "type": "text",
              "styles": {},
            },
            {
              "text": "Eric Clapton",
              "type": "text",
              "styles": {
                "italic": true,
              },
            },
            {
              "text": " und ",
              "type": "text",
              "styles": {},
            },
            {
              "text": "John Mayer",
              "type": "text",
              "styles": {
                "italic": true,
              },
            },
            {
              "text": " aber auch Songwriter wie ",
              "type": "text",
              "styles": {},
            },
            {
              "text": "Sting",
              "type": "text",
              "styles": {
                "italic": true,
              },
            },
            {
              "text": " oder ",
              "type": "text",
              "styles": {},
            },
            {
              "text": "Bruce Springsteen",
              "type": "text",
              "styles": {
                "italic": true,
              },
            },
            {
              "text": ", vereint LUKE in seinen Songs Tradition und Moderne. Dabei trifft eingängiges, poppiges Songwriting auf den organischen Sound, die Energie und die Authentizität des Blues. Mit „...extrem ausdrucksstarker Intensität...” ",
              "type": "text",
              "styles": {},
            },
            {
              "text": "(Joachim Joe Brookes, RockTimes, 14.09.21) ",
              "type": "text",
              "styles": {
                "italic": true,
              },
            },
            {
              "text": "singt und spielt der Saarbrücker mit rauer und markanter Stimme seine Songs, in denen sich die musikalische Vielseitigkeit des Songwriters widerspiegelt.",
              "type": "text",
              "styles": {},
            },
          ],
          "children": [],
        },
        {
          "id": "3882142e-9040-472c-b54d-bbc5b7c0ebe2",
          "type": "paragraph",
          "props": {
            "textColor": "default",
            "textAlignment": "left",
            "backgroundColor": "default",
          },
          "content": [
            {
              "text": "Mit bereits 22 veröffentlichten Songs auf 3 CDs, inklusive 4 Musikvideos seit der Bandgründung 2019, zeigt LUKE, dass neben seiner markanten Stimme und der dynamisch singenden Blues-Gitarre vor allem die Songs im Vordergrund stehen. ",
              "type": "text",
              "styles": {},
            },
          ],
          "children": [],
        },
        {
          "id": "d42a1f49-6f95-46a7-8473-eb5714b071fb",
          "type": "paragraph",
          "props": {
            "textColor": "default",
            "textAlignment": "left",
            "backgroundColor": "default",
          },
          "content": [
            {
              "text": "Über seine erste EP “Out Of The Blue” schrieb ",
              "type": "text",
              "styles": {},
            },
            {
              "text": "MusikNah",
              "type": "text",
              "styles": {
                "italic": true,
              },
            },
            {
              "text": ": \n“Man merkt dass hier schon einige Jahre Erfahrung im Songwriting vorhanden sind”\n”Eine sehr gelungene Mischung aus Blues, Rock, Soul und einem Hauch Indie”",
              "type": "text",
              "styles": {},
            },
          ],
          "children": [],
        },
        {
          "id": "656b2091-5d2a-4706-80b7-deef8ca4ec2d",
          "type": "paragraph",
          "props": {
            "textColor": "default",
            "textAlignment": "left",
            "backgroundColor": "default",
          },
          "content": [
            {
              "text": "Mit seiner zweiten EP “Break The Silence” schaffte es LUKE bereits mit den beiden Singles “So Far Away From You” und “Break The Silence” ins Radio und und wurde mehrfach für Interviews in Zeitungen und im SR-Fernsehen angefragt. 2023 präsentiert LUKE nun sein Debut-Album “Strange Boy In Town” mit 10 Songs, welche von internationalen Größen wie ",
              "type": "text",
              "styles": {},
            },
            {
              "text": "Dominik Rivinius ",
              "type": "text",
              "styles": {
                "italic": true,
              },
            },
            {
              "text": "(",
              "type": "text",
              "styles": {},
            },
            {
              "text": "Eminem",
              "type": "text",
              "styles": {
                "italic": true,
              },
            },
            {
              "text": ", ",
              "type": "text",
              "styles": {},
            },
            {
              "text": "Alicia Keys",
              "type": "text",
              "styles": {
                "italic": true,
              },
            },
            {
              "text": ", ",
              "type": "text",
              "styles": {},
            },
            {
              "text": "Taylor Swift",
              "type": "text",
              "styles": {
                "italic": true,
              },
            },
            {
              "text": ") gemischt und vom mehrfachen Grammy-Award Gewinner ",
              "type": "text",
              "styles": {},
            },
            {
              "text": "Brian Lucey",
              "type": "text",
              "styles": {
                "italic": true,
              },
            },
            {
              "text": " (",
              "type": "text",
              "styles": {},
            },
            {
              "text": "Elvis Costello, Buddy Guy, Black Keys",
              "type": "text",
              "styles": {
                "italic": true,
              },
            },
            {
              "text": ") gemastert wurden. Das Album wurde sofort ",
              "type": "text",
              "styles": {},
            },
            {
              "text": "Album der Woche",
              "type": "text",
              "styles": {
                "bold": true,
                "italic": true,
              },
            },
            {
              "text": " bei SR3 ",
              "type": "text",
              "styles": {
                "bold": true,
              },
            },
            {
              "text": "und erhielt zahlreiche Airplays bei SR3, SR2, Radio Bob und Classic Rock Radio.",
              "type": "text",
              "styles": {},
            },
          ],
          "children": [],
        },
        {
          "id": "222c8cb0-43c5-4549-955b-3c59dd888134",
          "type": "paragraph",
          "props": {
            "textColor": "default",
            "textAlignment": "left",
            "backgroundColor": "default",
          },
          "content": [
            {
              "text": "\"Ausgefeilte Gitarren-Technik, ausdrucksstarker Gesang, perfektes Songwriting, eine herrlich groovende Band, ausladende Improvisationen und eine unglaubliche Dynamik - nicht nur live ein Erlebnis auf internationalem Niveau\" ",
              "type": "text",
              "styles": {},
            },
            {
              "text": "(Claude Adam-Brettar, Sonntags ans Schloss, 24.06.2022)",
              "type": "text",
              "styles": {
                "italic": true,
              },
            },
            {
              "text": ".",
              "type": "text",
              "styles": {},
            },
          ],
          "children": [],
        },
        {
          "id": "31ac33d3-8806-487c-abee-d9352e08ba1c",
          "type": "paragraph",
          "props": {
            "textColor": "default",
            "textAlignment": "left",
            "backgroundColor": "default",
          },
          "content": [],
          "children": [],
        },
      ],
      imageId: 7,
      locationId: 1,
      userId: 1,
      discountedPrice: 18.0,
      abendkassePrice: 24.0,
      prebookedPrice: 22.0,
      bookingLink: "https://example.com/book-now",
      published: false,
    },
    {
      title: "Peter Karp Band",
      date: new Date("2025-03-21T21:00:00"),
      content: [
        {
          "id": "63b51082-7d96-4b17-abf7-1625977eb7d0",
          "type": "paragraph",
          "props": {
            "textColor": "default",
            "textAlignment": "left",
            "backgroundColor": "default",
          },
          "content": [
            {
              "text": "Der in New Jersey geborene und heute in Nashville lebende Singer-Songwriter Peter Karp ist einer der ganz Großen. Er sammelte in den Clubs der Lower East Side seine ersten musikalischen Erfahrungen. Später begleitete er musikalische Größen wie Mink de Ville, Don Henley, Ritchie Havens oder Jackson Browne. ",
              "type": "text",
              "styles": {},
            },
          ],
          "children": [],
        },
        {
          "id": "f9b5bf91-6ba4-4ba9-bfa6-f6bb2092fe9d",
          "type": "paragraph",
          "props": {
            "textColor": "default",
            "textAlignment": "left",
            "backgroundColor": "default",
          },
          "content": [
            {
              "text": "Als Gitarrist, Pianist, Harpspieler und begnadeter Sänger hat er sich musikalisch ganz den Wurzeln amerikanischer Musik verschrieben. Seine poetischen und philosophischen Texte brachten ihm, auch durch die Zusammenarbeit mit der kanadischen Musikerin Sue Foley, einige Top10-Hits in den USA ein. ",
              "type": "text",
              "styles": {},
            },
          ],
          "children": [],
        },
        {
          "id": "609ac158-c625-404a-82b5-b45654c78aab",
          "type": "paragraph",
          "props": {
            "textColor": "default",
            "textAlignment": "left",
            "backgroundColor": "default",
          },
          "content": [
            {
              "text": "2013 wurde der frühere Rolling Stones Gitarrist ",
              "type": "text",
              "styles": {},
            },
            {
              "text": "Mick Taylor",
              "type": "text",
              "styles": {
                "bold": true,
              },
            },
            {
              "text": " auf Peter aufmerksam und tourte in den Folgejahren mehrmals mit ihm durch die USA, wobei das wunderbare Live-Album „The Arson`s Match“ entstanden ist.",
              "type": "text",
              "styles": {},
            },
          ],
          "children": [],
        },
        {
          "id": "3b11b305-e3d2-4b74-bdd0-450438f10e54",
          "type": "paragraph",
          "props": {
            "textColor": "default",
            "textAlignment": "center",
            "backgroundColor": "default",
          },
          "content": [
            {
              "text": "“Guys like Peter Karp, James Taylor and Bob Dylan embody Americana Blues, and us English guys are inspired by it.”  (Mick Taylor, The Rolling Stones)",
              "type": "text",
              "styles": {
                "italic": true,
              },
            },
          ],
          "children": [],
        },
        {
          "id": "d1cd40c9-3255-49e7-b1e4-ba00261b1968",
          "type": "paragraph",
          "props": {
            "textColor": "default",
            "textAlignment": "left",
            "backgroundColor": "default",
          },
          "content": [
            {
              "text": "Seine von Americana und Blues infizierte Musik nennt er selbst ",
              "type": "text",
              "styles": {},
            },
            {
              "text": "„Soul-Influenced Americana Blues Rock“",
              "type": "text",
              "styles": {
                "bold": true,
              },
            },
            {
              "text": ".",
              "type": "text",
              "styles": {},
            },
          ],
          "children": [],
        },
        {
          "id": "7e612b7f-ca6f-48d0-b43f-728578b4af5d",
          "type": "paragraph",
          "props": {
            "textColor": "default",
            "textAlignment": "left",
            "backgroundColor": "default",
          },
          "content": [
            {
              "text": "Das letzte Album ",
              "type": "text",
              "styles": {},
            },
            {
              "text": "“Magnificent Heart”",
              "type": "text",
              "styles": {
                "bold": true,
              },
            },
            {
              "text": " besticht durch Karp`s herrlich rauhe, soulige Stimme und meisterhafter Beherrschung von Gitarre und Piano. ",
              "type": "text",
              "styles": {},
            },
          ],
          "children": [],
        },
        {
          "id": "14baaed4-6ef9-4904-8ad8-e68ee62d4669",
          "type": "paragraph",
          "props": {
            "textColor": "default",
            "textAlignment": "left",
            "backgroundColor": "default",
          },
          "content": [
            {
              "text": "Prägnantes Doppel-Slidegitarrenspiel mit dem ex-Delta Moon Gitarristen ",
              "type": "text",
              "styles": {},
            },
            {
              "text": "Mark Johnson ",
              "type": "text",
              "styles": {
                "bold": true,
              },
            },
            {
              "text": "und die mitreißende Performance des „Storytellers“ aus Nashville werden auch auf der 2025er Tour das Publikum in den Bann ziehen, wenn Karp sein neues Album „The Old Man That Never Grew Up“ präsentiert.",
              "type": "text",
              "styles": {},
            },
          ],
          "children": [],
        },
        {
          "id": "ed3535c1-388e-49c6-8a1b-30d538272110",
          "type": "paragraph",
          "props": {
            "textColor": "default",
            "textAlignment": "center",
            "backgroundColor": "default",
          },
          "content": [
            {
              "text": "“Peter Karp is a star. From his muscular slide guitar soloing to his observational and oh-so-true songwriting, and, most of all, that soulful expressive voice of his, dripping with innuendo. Dude’s entertaining as hell.” (Goldmine Magazine)",
              "type": "text",
              "styles": {
                "italic": true,
              },
            },
          ],
          "children": [],
        },
        {
          "id": "45c36ac1-136a-4e7f-98b3-f9a63c123110",
          "type": "paragraph",
          "props": {
            "textColor": "default",
            "textAlignment": "left",
            "backgroundColor": "default",
          },
          "content": [],
          "children": [],
        },
      ],
      imageId: 8,
      locationId: 2,
      userId: 1,
      discountedPrice: 18.0,
      abendkassePrice: 24.0,
      prebookedPrice: 22.0,
      bookingLink: "https://example.com/book-now",
      published: false,
    },
  ];

  const sampleEventCategories = [
    {
      CategoryId: 1,
      EventId: 1,
    },
    {
      CategoryId: 2,
      EventId: 1,
    },
    {
      CategoryId: 3,
      EventId: 2,
    },
    {
      CategoryId: 4,
      EventId: 2,
    },
    {
      CategoryId: 5,
      EventId: 1,
    },
  ];

  const sampleBlogs = [
    {
      title: "Jazz Nights Under the Stars",
      description:
        "Experience the magic of live jazz in an open-air setting. Our non-profit organization brings together talented jazz musicians to create unforgettable evenings of smooth tunes, all for the love of music.",
      userId: 1,
      imageId: 1,
    },
    {
      title: "Blues on the Bayou: A Community Concert",
      description:
        "Feel the rhythm of the bayou with a blues concert that celebrates local talent. Organized by music enthusiasts, this non-profit event is all about connecting people through the power of music.",
      userId: 2,
      imageId: 2,
    },
    {
      title: "Funk Fusion Fridays",
      description:
        "Join us for a groovy night of funk and soul music. This non-profit concert series is designed to bring communities together, fostering a shared love for timeless beats and energetic performances.",
      userId: 3,
      imageId: 3,
    },
    {
      title: "Rock Revival: A Celebration of Classic Rock",
      description:
        "Turn up the volume and join us for a classic rock concert like no other. Organized purely for the joy of music, this non-profit event is all about keeping rock alive for future generations.",
      userId: 4,
      imageId: 4,
    },
    {
      title: "Soul Sessions: A Non-Profit Music Experience",
      description:
        "Let the smooth sounds of soul music take you on a journey. Our non-profit concerts provide a platform for emerging and seasoned artists to share their passion with the community.",
      userId: 4,
      imageId: 4,
    },
  ];

  const sampleGalleries = [
    {
      title: "Summer Concert Highlights",
      content: "A collection of unforgettable moments from our summer concerts.",
      published: true,
    },
    {
      title: "Jazz Festival Memories",
      content: "Relive the soulful melodies and vibrant performances of the jazz festival.",
      published: true,
    },
    {
      title: "Rock Legends Live",
      content: "A tribute to the legendary rock bands that rocked the stage.",
      published: true,
    },
    {
      title: "Classical Evenings",
      content: "Experience the elegance of classical music performances under the stars.",
      published: false,
    },
    {
      title: "Indie Vibes",
      content: "A showcase of emerging indie artists and their unique sounds.",
      published: false,
    },
  ];

  const sampleOrganizations = [
    {
      name: "Culture Academy",
      description: "A platform for fostering cultural exchange and learning through workshops, seminars, and community events.",
      website: "https://www.cultureacademy.org",
      phone: "+49 172 3560531",
      email: "info@cultureacademy.org",
      imageId: 1,
      published: true,
    },
    {
      name: "Green Future Initiative",
      description: "Empowering communities to adopt sustainable practices and promote environmental conservation.",
      website: "https://www.greenfuture.org",
      phone: "+49 160 9876543",
      email: "contact@greenfuture.org",
      imageId: 2,
      published: true,
    },
    {
      name: "Tech Innovators",
      description: "Bringing technology solutions to underserved communities through innovative programs and partnerships.",
      website: "https://www.techinnovators.com",
      phone: "+49 170 1234567",
      email: "hello@techinnovators.com",
      imageId: 3,
      published: false,
    },
    {
      name: "Music for All",
      description: "Promoting music education and appreciation for people of all ages and backgrounds.",
      website: "https://www.musicforall.org",
      phone: "+49 180 2233445",
      email: "info@musicforall.org",
      imageId: 5,
      published: true,
    },
    {
      name: "Urban Artists Collective",
      description: "A creative hub for artists to showcase their work and collaborate on urban art projects.",
      website: "https://www.urbanartists.org",
      phone: "+49 151 3344556",
      email: "support@urbanartists.org",
      imageId: 6,      
      published: false,
    },
    {
      name: "Global Youth Network",
      description: "Connecting young leaders worldwide to create meaningful change through collaboration and innovation.",
      website: "https://www.globalyouth.org",
      phone: "+49 162 9988776",
      email: "team@globalyouth.org",
      imageId: 7,      
      published: true,
    },
  ];

  const sampleCertificates = [
    {
      title: "Yellow Belt in Judo",
      issuedBy: "Community Judo Academy",
      issuedDate: "2024-01-15",
      issuedFrom: "Sensei John Doe",
      expirationDate: null,
      certificateUrl: "",
      description: "Awarded for completing the beginner level of Judo training and demonstrating basic techniques.",
      published: true,
      recipients: [{ name: "Christian Koehler", email: "info@culture-academy.org" }],
    },
    {
      title: "Park Clean-Up Volunteer",
      issuedBy: "City of Green Park Initiative",
      issuedDate: "2023-12-10",
      issuedFrom: "Mayor Jane Smith",
      expirationDate: null,
      certificateUrl: "",
      description: "Certificate of appreciation for volunteering in the community park clean-up event.",
      published: false,
      recipients: [
        { name: "Mary Smith", email: "wrdevilliers@gmail.com" },
        { name: "John Doe", email: "john.doe@example.com" },
      ],
    },
    {
      title: "100 Yoga Classes Attended",
      issuedBy: "Yoga Flow Center",
      issuedDate: "2024-02-05",
      issuedFrom: "Instructor Sarah Lee",
      expirationDate: null,
      certificateUrl: "",
      description: "Recognizing dedication to wellness and health by attending 100 yoga classes.",
      published: true,
      recipients: [{ name: "Wayne de Villiers", email: "wrdevilliers@gmail.com" }],
    },
    {
      title: "Community Gardening Volunteer",
      issuedBy: "Neighborhood Green Thumb Initiative",
      issuedDate: "2024-01-25",
      issuedFrom: "Coordinator Lisa Brown",
      expirationDate: null,
      certificateUrl: "",
      description: "Awarded for contributing time and effort to the community garden project, promoting sustainability.",
      published: true,
      recipients: [
        { name: "Bob Lee", email: "wrdevilliers@gmail.com" },
        { name: "Alice Johnson", email: "alice.j@example.com" },
      ],
    },
    {
      title: "Blood Donation Champion",
      issuedBy: "Red Cross Community Drive",
      issuedDate: "2023-11-15",
      issuedFrom: "Coordinator Mark Johnson",
      expirationDate: null,
      certificateUrl: "",
      description: "Recognized for consistent blood donations that help save lives in the community.",
      published: false,
      recipients: [
        { name: "Carla Adams", email: "wrdevilliers@gmail.com" },
        { name: "David Brown", email: "david.brown@example.com" },
      ],
    },
  ];
  
  await User.bulkCreate(sampleUsers, { individualHooks: true });
  await Image.bulkCreate(sampleImages, { individualHooks: true });
  await Testimonial.bulkCreate(sampleTestimonials, { individualHooks: true });
  await Category.bulkCreate(sampleCategories, { individualHooks: true });
  await Location.bulkCreate(sampleLocations, { individualHooks: true });
  await Event.bulkCreate(sampleEvents, { individualHooks: true });
  await EventCategory.bulkCreate(sampleEventCategories, {
    individualHooks: true,
  });
  await Blog.bulkCreate(sampleBlogs, { individualHooks: true });
  await Gallery.bulkCreate(sampleGalleries, { individualHooks: true });
  await Organization.bulkCreate(sampleOrganizations, { individualHooks: true });

  // Insert certificates & recipients separately
    for (const certData of sampleCertificates) {
      const { recipients, ...certificateInfo } = certData;
      const certificate = await Certificate.create(certificateInfo);

      if (recipients && recipients.length > 0) {
        const recipientEntries = recipients.map((recipient) => ({
          name: recipient.name,
          email: recipient.email,
          certificateId: certificate.id,
        }));
        await CertificateRecipient.bulkCreate(recipientEntries);
      }
    }

  const galleries = await Gallery.findAll();
  const images = await Image.findAll();

  await galleries[0].addImages([
    images[0],
    images[1],
    images[2],
    images[3],
    images[4],
    images[5],
    images[6],
    images[7],
  ]);

  await galleries[1].addImages([
    images[7],
    images[6],
    images[5],
    images[4],
    images[3],
    images[2],
    images[1],
    images[0],
  ]);

  await galleries[2].addImages([
    images[2],
    images[4],
    images[6],
    images[0],
    images[1],
    images[5],
    images[7],
    images[3],
  ]);
};

try {
  await databaseSeed();
  console.log("Database seeded.");
} catch (error) {
  console.log({ error });
} finally {
  void sequelize.close();
  console.log("Database connection closed.");
}
