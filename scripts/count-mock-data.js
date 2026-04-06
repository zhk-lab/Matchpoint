const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const mockSeniorNames = [
    '王昊然',
    '刘晨曦',
    '陈思远',
    '李沐阳',
    '赵雨彤',
    '周泽宇',
    '徐可欣',
    '黄子墨',
    '罗安琪',
    '韩知远',
    '潘若溪',
    '冯启航',
    '彭雅婷',
    '马骁然',
    '谢宛宁',
    '郑书豪',
    '宋知夏',
    '顾铭泽',
    '唐婉仪',
    '陆景川',
  ];

  const mockEntryCount = await prisma.experienceEntry.count({
    where: {
      sourceNote: {
        startsWith: '模拟案例',
      },
    },
  });
  const mockSeniorCount = await prisma.seniorProfile.count({
    where: {
      name: {
        in: mockSeniorNames,
      },
    },
  });
  console.log(`Mock entries: ${mockEntryCount}`);
  console.log(`Mock seniors (by seeded names): ${mockSeniorCount}`);
}

main()
  .catch((error) => {
    console.error('Count failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
