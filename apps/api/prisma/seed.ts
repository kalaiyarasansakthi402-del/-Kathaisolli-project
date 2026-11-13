import fs from 'node:fs';
import path from 'node:path';
import { UserRole } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaClient } from '@prisma/client';
import { sanitizeDatabaseUrl } from '../src/prisma/prisma.service';

const candidateEnvPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '../../../.env'),
  path.resolve(__dirname, '../../.env'),
];

for (const envFile of candidateEnvPaths) {
  if (fs.existsSync(envFile) && typeof process.loadEnvFile === 'function') {
    try {
      process.loadEnvFile(envFile);
      break;
    } catch {}
  }
}

const targetDbUrl =
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.DIRECT_URL ||
  process.env.DATABASE_URL;
const sanitizedUrl = sanitizeDatabaseUrl(targetDbUrl);
const prisma = sanitizedUrl
  ? new PrismaClient({ datasources: { db: { url: sanitizedUrl } } })
  : new PrismaClient();

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
  // 1. Essential reference data (Safe for both development and production)
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

  // 2. Optional Production/Deployment initial admin bootstrap
  const initialAdminEmail = process.env.INITIAL_ADMIN_EMAIL?.toLowerCase().trim();
  const initialAdminPassword = process.env.INITIAL_ADMIN_PASSWORD;
  if (initialAdminEmail && initialAdminPassword && initialAdminPassword.length >= 16) {
    const adminHash = await argon2.hash(initialAdminPassword, {
      type: argon2.argon2id,
    });
    await prisma.user.upsert({
      where: { email: initialAdminEmail },
      update: {
        role: UserRole.ADMIN,
        passwordHash: adminHash,
      },
      create: {
        email: initialAdminEmail,
        displayName: process.env.INITIAL_ADMIN_NAME || 'Platform Administrator',
        role: UserRole.ADMIN,
        passwordHash: adminHash,
      },
    });
    console.info(`Initial admin provisioned for ${initialAdminEmail}.`);
  }

  // 3. Skip demo user accounts in production
  if (process.env.NODE_ENV === 'production') {
    console.info(
      `[Production] Successfully seeded ${categories.length} categories and the Tamil language. Demo user seeding is disabled in production.`,
    );
    return;
  }

  // 4. Development demo users
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
