import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const DEFAULT_OWNER_ID = 'e0449386-8bfb-4b3f-be75-6d67bd81a825'; // HeartAI Central Store

async function main() {
    // 1. Create POS Admin (Shared)
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@heartpos.com' },
        update: {},
        create: {
            email: 'admin@heartpos.com',
            username: 'admin',
            password: hashedPassword,
            name: 'Master Admin',
            role: 'ADMIN',
            isEmailVerified: true
        }
    });

    // 2. Create Categories
    const food = await prisma.category.upsert({
        where: { name: 'Food' },
        update: {},
        create: { name: 'Food' }
    });

    const drink = await prisma.category.upsert({
        where: { name: 'Drink' },
        update: {},
        create: { name: 'Drink' }
    });

    // 3. Create Products (Shared with owner_id)
    const products = [
        { name: 'Nasi Goreng', price: 25000, stock: 50, barcode: '1001', categoryId: food.id, owner_id: DEFAULT_OWNER_ID, aisle: 'A1', rak: 'R1' },
        { name: 'Mie Ayam', price: 15000, stock: 30, barcode: '1002', categoryId: food.id, owner_id: DEFAULT_OWNER_ID, aisle: 'A1', rak: 'R1' },
        { name: 'Es Teh Manis', price: 5000, stock: 100, barcode: '2001', categoryId: drink.id, owner_id: DEFAULT_OWNER_ID, aisle: 'A2', rak: 'R2' },
        { name: 'Kopi Hitam', price: 8000, stock: 40, barcode: '2002', categoryId: drink.id, owner_id: DEFAULT_OWNER_ID, aisle: 'A2', rak: 'R2' },
    ];

    for (const p of products) {
        await prisma.product.upsert({
            where: { barcode: p.barcode },
            update: { stock: p.stock, price: p.price, owner_id: p.owner_id, aisle: p.aisle, rak: p.rak },
            create: p
        });
    }

    // 4. Create Settings
    await prisma.setting.upsert({
        where: { id: 'global' },
        update: {},
        create: {
            id: 'global',
            storeName: 'Heart POS Central',
            address: 'Jl. Raya No. 123',
            pointMinSpend: 10000,
            pointRatio: 5000,
            pointRedeemVal: 1000,  // 1 point = Rp 1.000
        }
    });

    // 5. Create Rewards
    const rewards = [
        { name: 'Shopping Bag Exclusive', pointsRequired: 50, stock: 100 },
        { name: 'Voucher Rp 10.000', pointsRequired: 100, stock: 50 },
        { name: 'T-Shirt HeartAI', pointsRequired: 500, stock: 20 },
    ];

    for (const r of rewards) {
        await prisma.reward.upsert({
            where: { name: r.name },
            update: { stock: r.stock, pointsRequired: r.pointsRequired },
            create: r
        });
    }

    console.log('✅ Shared Seeding completed');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
