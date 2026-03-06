/// <reference types="node" />
import { PrismaClient, Role } from '@prisma/client';
import { PasswordUtil } from '../src/common/utils/password.util.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up existing data...');

  // Delete in order to handle foreign keys
  await prisma.transactionItem.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.chatHistory.deleteMany({});
  await prisma.chatSession.deleteMany({});
  await prisma.rating.deleteMany({});
  await prisma.reminder.deleteMany({});
  await prisma.rewardActivity.deleteMany({});
  await prisma.pointHistory.deleteMany({});
  await prisma.healthData.deleteMany({});
  await prisma.shoppingListItem.deleteMany({});
  await prisma.shoppingList.deleteMany({});
  await prisma.facilityTask.deleteMany({});
  await prisma.missingRequest.deleteMany({});
  await prisma.jobVacancy.deleteMany({});
  await prisma.subLocation.deleteMany({});
  await prisma.pOSReward.deleteMany({});
  await prisma.pOSSetting.deleteMany({});

  await prisma.ownerConfig.deleteMany({});
  await prisma.productPromo.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.owner.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.userPending.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.discountCode.deleteMany({});



  console.log('Seeding database with new accounts...');

  const commonPassword = await PasswordUtil.hash('Sigma123!');

  const adminEmails = [
    'akuntiktok1397@gmail.com',
    'rayhan.dita45@smk.belajar.id'
  ];

  for (const email of adminEmails) {
    console.log(`Seeding admin: ${email} `);
    await prisma.user.upsert({
      where: { email },
      update: {
        role: Role.ADMIN,
        twoFactorEnabled: true
      } as any,
      create: {
        email,
        name: email.split('@')[0],
        password: commonPassword,
        role: Role.ADMIN,
        isEmailVerified: true,
        twoFactorEnabled: true
      } as any,
    });
  }

  console.log('Seed completed! 🚀');
  console.log('------------------');
  console.log('Admins: akuntiktok1397@gmail.com, rayhan.dita45@smk.belajar.id');
  console.log('Password: Sigma123!');
  console.log('2FA: Email-based verification enabled');
}

main()
  .catch((e) => {
    console.error('Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
