import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const studentData: Prisma.StudentCreateInput[] = [
  {
    name: 'john doe',
    email: 'john.d@ku.th',
  },
];

async function main() {
  console.log(`Start seeding ...`);
  for (const data of studentData) {
    const student = await prisma.student.upsert({
      where: { email: data.email },
      update: {},
      create: data,
    });
    console.log(`Created student with id: ${student.stdId}`);
  }
  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async e => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
