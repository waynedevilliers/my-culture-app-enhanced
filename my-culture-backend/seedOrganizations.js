import dotenv from 'dotenv';
import { User, Organization, Image } from './db.js';

// Load environment variables
dotenv.config();

// Base URL for local images (will be set based on environment)
const getImageUrl = (filename) => {
  const baseUrl = process.env.URL || 'http://localhost:3000';
  return `${baseUrl}/uploads/organizations/${filename}`;
};

const organizationData = [
  {
    name: "Berliner Kulturerbe-Zentrum",
    description: "Bewahrung und Förderung deutscher Kulturtraditionen durch Bildungsprogramme, Workshops und Gemeinschaftsveranstaltungen. Wir verbinden Generationen durch gemeinsames Erbe und kulturelles Lernen.",
    website: "https://www.berlin-heritage.de",
    phone: "+49 30 1234567",
    email: "info@berlin-heritage.de",
    published: true,
    imagePath: getImageUrl("berlin-heritage.png")
  },
  {
    name: "Münchener Internationale Musikakademie",
    description: "Förderung musikalischer Exzellenz und kulturellen Austauschs durch erstklassigen Unterricht, Aufführungen und multikulturelle Musikprogramme für Schüler aller Altersgruppen.",
    website: "https://www.munich-music.org",
    phone: "+49 89 2345678",
    email: "contact@munich-music.org",
    published: true,
    imagePath: getImageUrl("munich-music.png")
  },
  {
    name: "Hamburger Zeitgenössisches Kunstkollektiv",
    description: "Unterstützung aufstrebender und etablierter Künstler durch Ausstellungsräume, gemeinsame Projekte und Gemeinschaftsprogramme, die traditionelle und moderne Kunstformen verbinden.",
    website: "https://www.hamburg-arts.com",
    phone: "+49 40 3456789",
    email: "hello@hamburg-arts.com",
    published: true,
    imagePath: getImageUrl("hamburg-arts.png")
  },
  {
    name: "Kölner Gemeinschaftstheater",
    description: "Schaffung inklusiver Theatererfahrungen, die unsere vielfältige Gemeinschaft durch Originalproduktionen, Bildungsworkshops und Jugendentwicklungsprogramme widerspiegeln.",
    website: "https://www.cologne-theater.org",
    phone: "+49 221 4567890",
    email: "tickets@cologne-theater.org",
    published: true,
    imagePath: getImageUrl("cologne-theater.jpg")
  },
  {
    name: "Frankfurter Tanz- und Bewegungsstudio",
    description: "Feier der kulturellen Vielfalt durch Tanzausbildung, professionelle Schulungen und Gemeinschaftsaufführungen, die traditionelle und zeitgenössische Bewegungskünste präsentieren.",
    website: "https://www.frankfurt-dance.de",
    phone: "+49 69 5678901",
    email: "studio@frankfurt-dance.de",
    published: true,
    imagePath: getImageUrl("frankfurt-dance.jpg")
  },
  {
    name: "Stuttgarter Multikulturelles Zentrum",
    description: "Brücken zwischen Gemeinschaften bauen durch Sprachaustausch, Kulturfestivals, Integrationsprogramme und interkulturelle Dialoginitiativen.",
    website: "https://www.stuttgart-multicultural.org",
    phone: "+49 711 6789012",
    email: "welcome@stuttgart-multicultural.org",
    published: true,
    imagePath: getImageUrl("stuttgart-multicultural.png")
  },
  {
    name: "Dresdner Jugend-Kulturinitiative",
    description: "Stärkung junger Menschen durch kreative Ausdrucksformen, Führungskräfteentwicklung und Kulturprojekte, die gesellschaftliche Themen ansprechen und Gemeinschaftsverbindungen aufbauen.",
    website: "https://www.dresden-youth.de",
    phone: "+49 351 7890123",
    email: "youth@dresden-youth.de",
    published: false,
    imagePath: getImageUrl("berlin-heritage.png") // Reusing image
  },
  {
    name: "Nürnberger Traditionelle Handwerkszunft",
    description: "Bewahrung traditioneller deutscher Handwerkskunst durch Lehrlingsausbildung, Workshops und Ausstellungen, die historische Techniken und zeitgenössische Anwendungen feiern.",
    website: "https://www.nuremberg-crafts.org",
    phone: "+49 911 8901234",
    email: "guild@nuremberg-crafts.org",
    published: true,
    imagePath: getImageUrl("munich-music.png") // Reusing image
  }
];

async function seedOrganizations() {
  try {
    console.log('🌱 Starting organization seeding...');

    // Get the first admin user for association
    const adminUser = await User.findOne({ where: { role: 'admin' } });
    if (!adminUser) {
      console.error('❌ No admin user found. Please create an admin user first.');
      return;
    }

    console.log(`👤 Using admin user: ${adminUser.email}`);

    // Clear existing organizations (optional)
    console.log('🗑️ Clearing existing organizations...');
    await Organization.destroy({ where: {} });
    await Image.destroy({ where: {} }); // Clear all images for fresh start

    // Create images and organizations
    for (const orgData of organizationData) {
      console.log(`📷 Creating image for ${orgData.name}...`);
      
      // Create image record
      const image = await Image.create({
        name: `${orgData.name} Image`,
        url: orgData.imagePath,
        userId: adminUser.id
      });

      console.log(`🏢 Creating organization: ${orgData.name}...`);
      
      // Create organization
      await Organization.create({
        name: orgData.name,
        description: orgData.description,
        website: orgData.website,
        phone: orgData.phone,
        email: orgData.email,
        published: orgData.published,
        imageId: image.id
      });

      console.log(`✅ Created ${orgData.name}`);
    }

    console.log('🎉 Organization seeding completed successfully!');
    console.log(`📊 Created ${organizationData.length} organizations`);
    console.log(`📋 Published organizations: ${organizationData.filter(org => org.published).length}`);
    console.log(`📝 Draft organizations: ${organizationData.filter(org => !org.published).length}`);

  } catch (error) {
    console.error('❌ Error seeding organizations:', error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

// Run the seeder
seedOrganizations();