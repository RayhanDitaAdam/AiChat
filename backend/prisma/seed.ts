/// <reference types="node" />
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const OWNER_ID = 'e0449386-8bfb-4b3f-be75-6d67bd81a825';
  const OWNER_USER_ID = '614bd2e3-08bd-4451-a90a-93cad29db2d9';
  const REGULAR_USER_ID = 'd6e8b422-540e-436d-9c37-4d6d63cb5f12';

  // 1. Create a dummy owner
  const owner = await prisma.owner.upsert({
    where: { id: OWNER_ID },
    update: {},
    create: {
      id: OWNER_ID,
      name: 'Supermarket Lokal',
      domain: 'market.lokal',
    },
  });

  // 2. Create products
  await prisma.product.deleteMany({ where: { owner_id: OWNER_ID } });
  const products = [
    { name: 'Sayur Kol Putih', price: 5000, stock: 100, halal: true, aisle: 'A', section: '1', owner_id: owner.id },
    { name: 'Sayur Kol Ungu', price: 8000, stock: 100, halal: true, aisle: 'A', section: '2', owner_id: owner.id },
    { name: 'Kol Mini (Brussels Sprout)', price: 15000, stock: 100, halal: true, aisle: 'B', section: '1', owner_id: owner.id },
    { name: 'Wortel Lokal', price: 4000, stock: 100, halal: true, aisle: 'A', section: '3', owner_id: owner.id },
    { name: 'Daging Ayam', price: 35000, stock: 100, halal: true, aisle: 'Meat', section: 'Counter 1', owner_id: owner.id },
    { name: 'Bayam Organik', price: 7000, stock: 100, halal: true, aisle: 'Sayuran', section: 'Organik', owner_id: owner.id },
    { name: 'Brokoli Segar', price: 12000, stock: 100, halal: true, aisle: 'Sayuran', section: 'Segar', owner_id: owner.id },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  // 3. Create dummy owner user
  await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: { role: 'OWNER', ownerId: OWNER_ID },
    create: {
      id: OWNER_USER_ID,
      email: 'user@example.com',
      name: 'User Demo',
      role: 'OWNER',
      ownerId: OWNER_ID,
    },
  });

  // 4. Create regular user
  await prisma.user.upsert({
    where: { email: 'real@user.com' },
    update: { role: 'USER' },
    create: {
      id: REGULAR_USER_ID,
      email: 'real@user.com',
      name: 'Real User',
      role: 'USER',
    },
  });

  console.log('Seed completed! 🥬');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
