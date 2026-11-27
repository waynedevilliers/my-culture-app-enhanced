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

  await prisma.organization.upsert({
    where: { email: 'org@myculture.app' },
    update: {},
    create: {
      name: 'MyCulture Foundation',
      email: 'org@myculture.app',
      description: 'A platform for cultural events and community engagement',
      website: 'https://myculture.app',
      verified: true,
      published: true,
      approvalStatus: 'approved',
      approvedAt: new Date(),
      userId: adminUser.id,
    },
  });

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
      '1 organization, 1 blog post, 1 subscriber.'
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
