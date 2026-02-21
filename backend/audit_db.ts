// import { PrismaClient, Role } from '@prisma/client';

// const prisma = new PrismaClient();

// async function audit() {
//     console.log('--- STARTING DATABASE AUDIT (v3) ---\n');

//     // 1. Audit Users and Roles
//     const users = await prisma.user.findMany({
//         include: {
//             owner: true,
//             memberOf: true,
//             contributorRequests: true
//         }
//     });

//     console.log(`Total Users: ${users.length}`);

//     console.log('\n--- USER DATA DUMP ---');
//     users.forEach(u => {
//         console.log(`- Email: ${u.email}`);
//         console.log(`  Role:  ${u.role}`);
//         console.log(`  ID:    ${u.id}`);
//         console.log(`  OwnerID: ${u.ownerId || 'NULL'}`);
//         console.log(`  MemberOfID: ${u.memberOfId || 'NULL'}`);
//         console.log(`  Requests: ${u.contributorRequests.map(r => r.status).join(',') || 'NONE'}`);
//         console.log('---------------------');
//     });

//     const issues: string[] = [];

//     users.forEach(user => {
//         if (user.role === 'OWNER' && !user.ownerId) {
//             issues.push(`ISSUE: User ${user.email} is OWNER but has no ownerId.`);
//         }
//         if (user.role === 'CONTRIBUTOR') {
//             if (!user.memberOfId) {
//                 issues.push(`ISSUE: User ${user.email} is CONTRIBUTOR but has no memberOfId.`);
//             }
//             const hasApprovedRequest = user.contributorRequests.some(r => r.status === 'APPROVED');
//             if (!hasApprovedRequest) {
//                 issues.push(`ISSUE: User ${user.email} is CONTRIBUTOR but has no APPROVED request.`);
//             }
//         }
//         if (user.role === 'STAFF' && !user.memberOfId) {
//             issues.push(`ISSUE: User ${user.email} is STAFF but has no memberOfId.`);
//         }
//     });

//     // 2. Audit Pending Users
//     const pendingUsers = await (prisma as any).userPending.findMany();
//     console.log(`\n--- PENDING USERS (${pendingUsers.length}) ---`);
//     pendingUsers.forEach((p: any) => {
//         console.log(`- Email: ${p.email}`);
//         console.log(`  Role:  ${p.role}`);
//         console.log(`  Expires: ${p.expiresAt}`);
//         console.log('---------------------');
//     });

//     // 3. Audit Products
//     const products = await prisma.product.findMany({
//         include: {
//             owner: true,
//             contributor: true
//         }
//     });
//     console.log(`\n--- PRODUCT DATA DUMP (${products.length}) ---`);
//     products.forEach(p => {
//         console.log(`- Name: ${p.name}`);
//         console.log(`  Status: ${p.status}`);
//         console.log(`  Owner: ${p.owner.name} (${p.owner_id})`);
//         console.log(`  Contributor: ${p.contributor ? p.contributor.email : 'NONE'}`);
//         console.log('---------------------');

//         if (p.status === 'PENDING' && !p.contributorId) {
//             issues.push(`WARNING: Product ${p.name} is PENDING but has no contributorId.`);
//         }
//     });

//     console.log('\n--- AUDIT SUMMARY ---');
//     if (issues.length === 0) {
//         console.log('No major issues found!');
//     } else {
//         issues.forEach(issue => console.log(issue));
//     }

//     await prisma.$disconnect();
// }

// audit().catch(e => {
//     console.error(e);
//     process.exit(1);
// });
