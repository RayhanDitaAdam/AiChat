// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// async function main() {
//     const owners = await prisma.owner.findMany();
//     console.log('Owners:', owners);
//     if (owners.length > 0) {
//         console.log('Use this ID in frontend:', owners[0].id);
//     } else {
//         console.log('No owners found.');
//     }
// }

// main()
//     .catch((e) => {
//         console.error(e);
//         process.exit(1);
//     })
//     .finally(async () => {
//         await prisma.$disconnect();
//     });
