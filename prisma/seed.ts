import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function clearDatabase() {
  console.log('Clearing existing data...');
}

function seedDatabase() {
  console.log('Seeding reference data...');
}

async function main(): Promise<void> {
  await prisma.$connect();
  clearDatabase();
  seedDatabase();
  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async e => {
    console.error('Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
