import dotenv from 'dotenv';
import { User, Organization, Image } from './db.js';

// Load environment variables
dotenv.config();

const organizationData = [
  {
    name: "Berlin Cultural Heritage Center",
    description: "Preserving and promoting German cultural traditions through educational programs, workshops, and community events. We connect generations through shared heritage and cultural learning.",
    website: "https://www.berlin-heritage.de",
    phone: "+49 30 1234567",
    email: "info@berlin-heritage.de",
    published: true,
    imagePath: "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg"
  },
  {
    name: "Munich International Music Academy",
    description: "Fostering musical excellence and cultural exchange through world-class instruction, performances, and multicultural music programs for students of all ages.",
    website: "https://www.munich-music.org",
    phone: "+49 89 2345678",
    email: "contact@munich-music.org",
    published: true,
    imagePath: "https://res.cloudinary.com/demo/image/upload/v2/sample.jpg"
  },
  {
    name: "Hamburg Contemporary Arts Collective",
    description: "Supporting emerging and established artists through exhibition spaces, collaborative projects, and community outreach programs that bridge traditional and modern art forms.",
    website: "https://www.hamburg-arts.com",
    phone: "+49 40 3456789",
    email: "hello@hamburg-arts.com",
    published: true,
    imagePath: "https://res.cloudinary.com/demo/image/upload/v3/sample.jpg"
  },
  {
    name: "Cologne Community Theater",
    description: "Creating inclusive theatrical experiences that reflect our diverse community through original productions, educational workshops, and youth development programs.",
    website: "https://www.cologne-theater.org",
    phone: "+49 221 4567890",
    email: "tickets@cologne-theater.org",
    published: true,
    imagePath: "https://res.cloudinary.com/demo/image/upload/v4/sample.jpg"
  },
  {
    name: "Frankfurt Dance & Movement Studio",
    description: "Celebrating cultural diversity through dance education, professional training, and community performances that showcase traditional and contemporary movement arts.",
    website: "https://www.frankfurt-dance.de",
    phone: "+49 69 5678901",
    email: "studio@frankfurt-dance.de",
    published: true,
    imagePath: "https://res.cloudinary.com/demo/image/upload/v5/sample.jpg"
  },
  {
    name: "Stuttgart Multicultural Center",
    description: "Building bridges between communities through language exchange, cultural festivals, integration programs, and intercultural dialogue initiatives.",
    website: "https://www.stuttgart-multicultural.org",
    phone: "+49 711 6789012",
    email: "welcome@stuttgart-multicultural.org",
    published: true,
    imagePath: "https://res.cloudinary.com/demo/image/upload/v6/sample.jpg"
  },
  {
    name: "Dresden Youth Cultural Initiative",
    description: "Empowering young people through creative expression, leadership development, and cultural projects that address social issues and build community connections.",
    website: "https://www.dresden-youth.de",
    phone: "+49 351 7890123",
    email: "youth@dresden-youth.de",
    published: false,
    imagePath: "https://res.cloudinary.com/demo/image/upload/v6/sample.jpg"
  },
  {
    name: "Nuremberg Traditional Crafts Guild",
    description: "Preserving traditional German craftsmanship through apprenticeships, workshops, and exhibitions that celebrate historical techniques and contemporary applications.",
    website: "https://www.nuremberg-crafts.org",
    phone: "+49 911 8901234",
    email: "guild@nuremberg-crafts.org",
    published: true,
    imagePath: "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg"
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