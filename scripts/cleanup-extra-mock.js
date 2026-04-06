const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const deleted = await prisma.seniorProfile.deleteMany({
    where: {
      name: '郭亦凡',
      school: '厦门大学',
      destination: '香港中文大学 金融学硕士',
    },
  });
  console.log(`Deleted extra mock seniors: ${deleted.count}`);
}

main()
  .catch((error) => {
    console.error('Cleanup failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
