// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// async function fix() {
//     console.log('--- STARTING DATABASE FIX ---');

//     // 1. Fix admin role mismatch
//     const updatedAdmin = await prisma.user.update({
//         where: { email: 'admin@heartai.com' },
//         data: { role: 'ADMIN' }
//     });
//     console.log(`✅ Updated: ${updatedAdmin.email} role changed to ${updatedAdmin.role}`);

//     // 2. Delete expired pending users
//     // Note: Using deleteMany for safety and efficiency
//     const deletedPending = await (prisma as any).userPending.deleteMany({
//         where: {
//             email: {
//                 in: ['tester@heartai.com', 'tester3@heartai.com']
//             }
//         }
//     });
//     console.log(`✅ Deleted: ${deletedPending.count} expired pending users.`);

//     console.log('--- DATABASE FIX COMPLETED ---');

//     await prisma.$disconnect();
// }

// fix().catch(e => {
//     console.error(e);
//     process.exit(1);
// });
