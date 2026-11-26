// Prisma seed script. Run with: npm run prisma:seed
// Requires SEED_ADMIN_PASSWORD (and optionally SEED_ADMIN_EMAIL).
// Safe to run more than once: every record is looked up before it is created.

import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth';
import { readSeedAdminConfig } from '../src/lib/seed/config';

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: 'Culture', slug: 'culture' },
  { name: 'Events', slug: 'events' },
  { name: 'Education', slug: 'education' },
  { name: 'Community', slug: 'community' },
];

async function main() {
  const admin = readSeedAdminConfig();

  const categories = await Promise.all(
    CATEGORIES.map((category) =>
      prisma.category.upsert({
        where: { slug: category.slug },
        update: {},
        create: category,
      })
    )
  );

  // The password is only set when the admin is first created; re-running
  // the seed never resets it.
  const adminUser = await prisma.user.upsert({
    where: { email: admin.email },
    update: {},
    create: {
      email: admin.email,
      firstName: 'Admin',
      lastName: 'User',
      password: await hashPassword(admin.password),
      role: 'SUPER_ADMIN',
      verified: true,
      newsletter: false,
    },
  });

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

  const locationData = {
    name: 'Main Hall',
    address: '123 Culture Street',
    city: 'Berlin',
    postalCode: '10115',
    country: 'Germany',
    latitude: 52.52,
    longitude: 13.405,
    organizationId: organization.id,
  };
  const location =
    (await prisma.location.findFirst({
      where: { name: locationData.name, organizationId: organization.id },
    })) ?? (await prisma.location.create({ data: locationData }));

  const eventTitle = 'Cultural Festival 2025';
  const existingEvent = await prisma.event.findFirst({
    where: { title: eventTitle, organizationId: organization.id },
  });
  if (!existingEvent) {
    await prisma.event.create({
      data: {
        title: eventTitle,
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
        price: 25.0,
        discountedPrice: 15.0,
      },
    });
  }

  await prisma.blog.upsert({
    where: { slug: 'welcome-to-myculture' },
    update: {},
    create: {
      title: 'Welcome to MyCulture',
      slug: 'welcome-to-myculture',
      content: 'This is a sample blog post about our platform and mission.',
      excerpt: 'Welcome to MyCulture, your platform for cultural engagement.',
      published: true,
      userId: adminUser.id,
      categoryId: categories[0].id,
    },
  });

  await prisma.subscriber.upsert({
    where: { email: 'subscriber@example.com' },
    update: {},
    create: {
      email: 'subscriber@example.com',
      name: 'Sample Subscriber',
      subscribed: true,
    },
  });

  console.log(
    `Seed complete: ${categories.length} categories, super admin ${admin.email}, ` +
      '1 organization, 1 location, 1 event, 1 blog post, 1 subscriber.'
  );
}

main()
  .catch((error) => {
    console.error(
      'Seed failed:',
      error instanceof Error ? error.message : error
    );
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
