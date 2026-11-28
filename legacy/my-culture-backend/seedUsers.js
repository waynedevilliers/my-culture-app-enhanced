import dotenv from 'dotenv';
import { User, Organization } from './db.js';

// Load environment variables
dotenv.config();

const userData = [
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
  // Organization admin users with specific organizationId assignments
  {
    firstName: "Maria",
    lastName: "Kulturerbe",
    email: "admin@berlin-heritage.de",
    password: "password",
    phoneNumber: "1555123456",
    role: "admin",
    newsletter: true,
    organizationId: 1, // Will be assigned to first organization
  },
  {
    firstName: "Hans",
    lastName: "Musikdirektor",
    email: "admin@munich-music.org",
    password: "password", 
    phoneNumber: "1555234567",
    role: "admin",
    newsletter: true,
    organizationId: 2, // Will be assigned to second organization
  },
  {
    firstName: "Anna",
    lastName: "Kunstleiterin",
    email: "admin@hamburg-arts.com",
    password: "password",
    phoneNumber: "1555345678", 
    role: "admin",
    newsletter: true,
    organizationId: 3, // Will be assigned to third organization
  },
];

async function seedUsers() {
  try {
    console.log('🌱 Starting user seeding...');

    // Clear existing users (optional - be careful with this!)
    console.log('🗑️ Clearing existing users...');
    await User.destroy({ where: {} });

    console.log('👥 Creating users...');
    
    // Create users
    const createdUsers = [];
    for (const user of userData) {
      console.log(`👤 Creating user: ${user.firstName} ${user.lastName} (${user.email})...`);
      
      // If organizationId is specified, check if organization exists
      let finalUserData = { ...user };
      if (user.organizationId) {
        const organization = await Organization.findByPk(user.organizationId);
        if (!organization) {
          console.warn(`⚠️ Organization with ID ${user.organizationId} not found for user ${user.email}. Creating user without organization.`);
          delete finalUserData.organizationId;
        } else {
          console.log(`🏢 Assigning user ${user.email} to organization: ${organization.name}`);
        }
      }

      const createdUser = await User.create(finalUserData, { individualHooks: true });
      createdUsers.push(createdUser);
      console.log(`✅ Created user: ${user.firstName} ${user.lastName}`);
    }

    console.log('🎉 User seeding completed successfully!');
    console.log(`📊 Created ${createdUsers.length} users`);
    console.log(`👑 Admin users: ${createdUsers.filter(user => user.role === 'admin').length}`);
    console.log(`👤 Regular users: ${createdUsers.filter(user => user.role === 'user').length}`);
    console.log(`📧 Newsletter subscribers: ${createdUsers.filter(user => user.newsletter).length}`);
    console.log(`🏢 Organization-assigned users: ${createdUsers.filter(user => user.organizationId).length}`);

  } catch (error) {
    console.error('❌ Error seeding users:', error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

// Run the seeder
seedUsers();