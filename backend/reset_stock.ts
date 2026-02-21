// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// async function resetStock() {
//     console.log('--- RESETTING NEGATIVE STOCK ---');

//     const negativeProducts = await prisma.product.findMany({
//         where: { stock: { lt: 0 } }
//     });

//     if (negativeProducts.length === 0) {
//         console.log('✅ No products with negative stock found.');
//     } else {
//         for (const p of negativeProducts) {
//             const updated = await prisma.product.update({
//                 where: { id: p.id },
//                 data: { stock: 0 }
//             });
//             console.log(`✅ Fixed: Product "${updated.name}" stock reset from ${p.stock} to 0.`);
//         }
//     }

//     console.log('--- RESET COMPLETED ---');
//     await prisma.$disconnect();
// }

// resetStock().catch(e => {
//     console.error(e);
//     process.exit(1);
// });
