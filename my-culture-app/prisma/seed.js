// Prisma seed script
// Run with: npm run prisma:seed

import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  try {
    // Clean existing data (optional - comment out if you want to preserve data)
    // await prisma.user.deleteMany({});
    // await prisma.organization.deleteMany({});
    // await prisma.category.deleteMany({});
    // await prisma.subscriber.deleteMany({});

    // Create roles/categories
    console.log('📚 Creating categories...');
    const categories = await Promise.all([
      prisma.category.upsert({
        where: { slug: 'culture' },
        update: {},
        create: {
          name: 'Culture',
          slug: 'culture',
        },
      }),
      prisma.category.upsert({
        where: { slug: 'events' },
        update: {},
        create: {
          name: 'Events',
          slug: 'events',
        },
      }),
      prisma.category.upsert({
        where: { slug: 'education' },
        update: {},
        create: {
          name: 'Education',
          slug: 'education',
        },
      }),
      prisma.category.upsert({
        where: { slug: 'community' },
        update: {},
        create: {
          name: 'Community',
          slug: 'community',
        },
      }),
    ]);
    console.log(`✅ Created ${categories.length} categories\n`);

    // Create super admin user
    console.log('👤 Creating super admin user...');
    const hashedPassword = await hashPassword('admin@123456');
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@myculture.app' },
      update: {},
      create: {
        email: 'admin@myculture.app',
        firstName: 'Admin',
        lastName: 'User',
        password: hashedPassword,
        role: 'SUPER_ADMIN',
        verified: true,
        newsletter: true,
      },
    });
    console.log(`✅ Created admin user: ${adminUser.email}\n`);

    // Create sample organization
    console.log('🏢 Creating sample organization...');
    const organization = await prisma.organization.upsert({
      where: { email: 'org@myculture.app' },
      update: {},
      create: {
        name: 'MyCulture Foundation',
        email: 'org@myculture.app',
        description: 'A platform for cultural events and community engagement',
        website: 'https://myculture.app',
        verified: true,
        approvalStatus: 'approved',
        userId: adminUser.id,
      },
    });
    console.log(`✅ Created organization: ${organization.name}\n`);

    // Create sample location
    console.log('📍 Creating sample location...');
    const location = await prisma.location.create({
      data: {
        name: 'Main Hall',
        address: '123 Culture Street',
        city: 'Berlin',
        postalCode: '10115',
        country: 'Germany',
        latitude: 52.52,
        longitude: 13.405,
        organizationId: organization.id,
      },
    });
    console.log(`✅ Created location: ${location.name}\n`);

    // Create sample event
    console.log('🎭 Creating sample event...');
    const event = await prisma.event.create({
      data: {
        title: 'Cultural Festival 2025',
        description: 'A celebration of diverse cultures',
        content: 'Join us for a wonderful cultural experience',
        date: new Date('2025-06-15'),
        startDate: new Date('2025-06-15T10:00:00'),
        endDate: new Date('2025-06-15T22:00:00'),
        locationString: 'Main Hall, Berlin',
        capacity: 500,
        status: 'PUBLISHED',
        published: true,
        userId: adminUser.id,
        organizationId: organization.id,
        locationId: location.id,
        price: 25.00,
        discountedPrice: 15.00,
      },
    });
    console.log(`✅ Created event: ${event.title}\n`);

    // Create sample blog
    console.log('📝 Creating sample blog post...');
    const blog = await prisma.blog.create({
      data: {
        title: 'Welcome to MyCulture',
        slug: 'welcome-to-myculture',
        content: 'This is a sample blog post about our platform and mission.',
        excerpt: 'Welcome to MyCulture, your platform for cultural engagement.',
        published: true,
        userId: adminUser.id,
        categoryId: categories[0].id,
      },
    });
    console.log(`✅ Created blog post: ${blog.title}\n`);

    // Create sample subscriber
    console.log('📧 Creating sample subscriber...');
    const subscriber = await prisma.subscriber.create({
      data: {
        email: 'subscriber@example.com',
        name: 'Sample Subscriber',
        subscribed: true,
      },
    });
    console.log(`✅ Created subscriber: ${subscriber.email}\n`);

    console.log('✨ Database seed completed successfully!');
    console.log('\n📊 Seed Summary:');
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Users: 1 (Admin)`);
    console.log(`   - Organizations: 1`);
    console.log(`   - Locations: 1`);
    console.log(`   - Events: 1`);
    console.log(`   - Blogs: 1`);
    console.log(`   - Subscribers: 1`);
    console.log('\n🔐 Admin Credentials:');
    console.log('   Email: admin@myculture.app');
    console.log('   Password: admin@123456');
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
