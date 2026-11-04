import { UserRole } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function getSeedPassword(environmentVariable: string, email: string): string {
  const password = process.env[environmentVariable];
  if (!password || password.length < 16) {
    throw new Error(
      `${environmentVariable} must be a unique password of at least 16 characters for ${email}.`,
    );
  }
  return password;
}

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Demo seed data is disabled in production.');
  }

  const demoUsers = [
    {
      email: 'listener@demo.kathaisolli.local',
      displayName: 'Demo Listener',
      role: UserRole.LISTENER,
      password: getSeedPassword(
        'SEED_DEMO_LISTENER_PASSWORD',
        'listener@demo.kathaisolli.local',
      ),
    },
    {
      email: 'creator@demo.kathaisolli.local',
      displayName: 'Demo Creator',
      role: UserRole.CREATOR,
      password: getSeedPassword(
        'SEED_DEMO_CREATOR_PASSWORD',
        'creator@demo.kathaisolli.local',
      ),
    },
    {
      email: 'admin@demo.kathaisolli.local',
      displayName: 'Demo Administrator',
      role: UserRole.ADMIN,
      password: getSeedPassword(
        'SEED_DEMO_ADMIN_PASSWORD',
        'admin@demo.kathaisolli.local',
      ),
    },
  ];

  if (
    new Set(demoUsers.map((demoUser) => demoUser.password)).size !==
    demoUsers.length
  ) {
    throw new Error('Use a different development password for each demo account.');
  }

  await prisma.language.upsert({
    where: { code: 'ta' },
    update: { name: 'Tamil', nativeName: 'தமிழ்', isActive: true },
    create: { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  });

  const categories = [
    { slug: 'general', name: 'பொதுவானவை (General)' },
    { slug: 'romance', name: 'காதல் கதைகள்' },
    { slug: 'horror', name: 'திகில் கதைகள்' },
    { slug: 'mystery', name: 'மர்மக் கதைகள்' },
    { slug: 'family', name: 'குடும்பக் கதைகள்' },
    { slug: 'history', name: 'வரலாற்றுக் கதைகள்' },
    { slug: 'children', name: 'சிறுவர் கதைகள்' },
    { slug: 'inspiration', name: 'ஊக்கமளிக்கும் கதைகள்' },
    { slug: 'crime-fiction', name: 'குற்றப் புனைகதைகள்' },
    { slug: 'mythology', name: 'புராணக் கதைகள்' },
    { slug: 'science-fiction', name: 'அறிவியல் புனைகதைகள்' },
    { slug: 'comedy', name: 'நகைச்சுவைக் கதைகள்' },
    { slug: 'biography', name: 'வாழ்க்கை வரலாறுகள்' },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, isActive: true },
      create: category,
    });
  }

  for (const demoUser of demoUsers) {
    const passwordHash = await argon2.hash(demoUser.password, {
      type: argon2.argon2id,
    });
    const user = await prisma.user.upsert({
      where: { email: demoUser.email },
      update: {
        displayName: demoUser.displayName,
        role: demoUser.role,
        passwordHash,
      },
      create: {
        email: demoUser.email,
        displayName: demoUser.displayName,
        role: demoUser.role,
        passwordHash,
      },
    });

    if (user.role === UserRole.CREATOR) {
      await prisma.creatorProfile.upsert({
        where: { userId: user.id },
        update: {},
        create: {
          userId: user.id,
          slug: 'demo-creator',
          approvedAt: new Date(),
        },
      });
    }
  }

  console.info(
    `Seeded ${demoUsers.length} development accounts, ${categories.length} Tamil categories, and the Tamil language.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error('Development seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
