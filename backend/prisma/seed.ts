/// <reference types="node" />
import { PrismaClient, Role } from '@prisma/client';
import { PasswordUtil } from '../src/common/utils/password.util.js';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up existing seed data...');

  const emails = ['admin@example.com', 'owner@example.com', 'user@example.com', 'user@example.com', 'real@user.com'];
  await prisma.user.deleteMany({
    where: { email: { in: emails } }
  });

  console.log('Seeding database with new accounts...');

  const commonPassword = await PasswordUtil.hash('Sigma123!');

  // 1. Create a dummy owner record
  const OWNER_ID = 'e0449386-8bfb-4b3f-be75-6d67bd81a825';
  const owner = await prisma.owner.upsert({
    where: { id: OWNER_ID },
    update: {},
    create: {
      id: OWNER_ID,
      ownerCode: '0000001',
      name: 'HeartAI Central Store',
      domain: 'heartai-store',
      isApproved: true,
    },
  });

  // 2. Create Owner User
  await prisma.user.create({
    data: {
      email: 'owner@example.com',
      name: 'Owner User',
      password: commonPassword,
      role: Role.OWNER,
      ownerId: OWNER_ID,
      isEmailVerified: true,
    },
  });

  // 3. Create Regular User
  await prisma.user.create({
    data: {
      email: 'user@example.com',
      name: 'Regular User',
      password: commonPassword,
      role: Role.USER,
      isEmailVerified: true,
    },
  });

  // 4. Create Admin User
  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin System',
      password: commonPassword,
      role: Role.ADMIN,
      isEmailVerified: true,
    },
  });

  // 5. Create some products for the owner
  await prisma.product.deleteMany({ where: { owner_id: OWNER_ID } });

  const products = [
    { name: 'Susu UHT Full Cream', price: 18000, stock: 50, halal: true, aisle: 'Dairy', rak: 'D1', owner_id: OWNER_ID, category: 'Minuman' },
    { name: 'Roti Tawar Gandum', price: 15000, stock: 20, halal: true, aisle: 'Bakery', rak: 'B1', owner_id: OWNER_ID, category: 'Makanan Sehat' },
    { name: 'Minyak Goreng 2L', price: 34000, stock: 100, halal: true, aisle: 'Grocery', rak: 'G5', owner_id: OWNER_ID, category: 'Kebutuhan Dapur' },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: product
    });
  }

  console.log('Seed completed! 🚀');
  console.log('------------------');
  console.log('Admin: admin@example.com / Sigma123!');
  console.log('Owner: owner@example.com / Sigma123!');
  console.log('User:  user@example.com  / Sigma123!');
}

main()
  .catch((e) => {
    console.error('Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
