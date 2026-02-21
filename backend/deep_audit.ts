// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// async function deepAudit() {
//     console.log('=== SYSTEM ADMIN & QA DEEP AUDIT START ===\n');
//     const bugs: string[] = [];
//     const dirt: string[] = [];

//     // --- 1. CHAT LOG INTEGRITY ---
//     const orphans = await prisma.chatHistory.findMany({
//         where: { session_id: null }
//     });
//     if (orphans.length > 0) {
//         bugs.push(`[BUG] Orphaned Chats: Found ${orphans.length} chat messages without a session_id.`);
//     }

//     const emptySessions = await prisma.chatSession.findMany({
//         include: { _count: { select: { chats: true } } }
//     });
//     const emptyCount = emptySessions.filter(s => s._count.chats === 0).length;
//     if (emptyCount > 0) {
//         dirt.push(`[DIRT] Empty Sessions: ${emptyCount} chat sessions have 0 messages.`);
//     }

//     // --- 2. POS & TRANSACTION INTEGRITY ---
//     const transactions = await prisma.transaction.findMany({
//         include: { items: true }
//     });

//     transactions.forEach(tx => {
//         const itemTotal = tx.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
//         const expected = itemTotal - tx.discount;
//         if (Math.abs(tx.total - expected) > 0.01) {
//             bugs.push(`[BUG] Transaction Mismatch: Tx ${tx.id} total is ${tx.total} but calculated sum is ${expected}.`);
//         }
//     });

//     const negativePoints = await prisma.user.findMany({
//         where: { OR: [{ points: { lt: 0 } }, { loyaltyPoints: { lt: 0 } }] }
//     });
//     if (negativePoints.length > 0) {
//         bugs.push(`[BUG] Negative Points: Found ${negativePoints.length} users with negative points.`);
//     }

//     // --- 3. INVENTORY & STOCK INTEGRITY ---
//     const negativeStockItems = await prisma.product.findMany({
//         where: { stock: { lt: 0 } },
//         include: { owner: true }
//     });
//     if (negativeStockItems.length > 0) {
//         negativeStockItems.forEach(p => {
//             bugs.push(`[BUG] Negative Stock: Product "${p.name}" (ID: ${p.id}) in store "${p.owner.name}" has stock: ${p.stock}`);
//         });
//     }

//     const pendingNoContributor = await prisma.product.findMany({
//         where: { status: 'PENDING', contributorId: null }
//     });
//     if (pendingNoContributor.length > 0) {
//         bugs.push(`[BUG] Status Conflict: Found ${pendingNoContributor.length} PENDING products without a contributorId.`);
//     }

//     // --- 4. ACCOUNT & CONTEXT INTEGRITY ---
//     const contextCollisions = await prisma.user.findMany({
//         where: {
//             AND: [
//                 { ownerId: { not: null } },
//                 { memberOfId: { not: null } }
//             ]
//         }
//     });
//     if (contextCollisions.length > 0) {
//         bugs.push(`[BUG] Identity Crisis: ${contextCollisions.length} users have both ownerId AND memberOfId set.`);
//     }

//     const abandonedOwners = await prisma.owner.findMany({
//         where: { user: null }
//     });
//     if (abandonedOwners.length > 0) {
//         dirt.push(`[DIRT] Abandoned Stores: ${abandonedOwners.length} owners exist without a linked primary User account.`);
//     }

//     // --- 5. CATEGORY & CLUTTER ---
//     const emptyCategories = await prisma.category.findMany({
//         include: { _count: { select: { products: true } } }
//     });
//     const cleanableCats = emptyCategories.filter(c => c._count.products === 0);
//     if (cleanableCats.length > 0) {
//         dirt.push(`[DIRT] Ghost Categories: ${cleanableCats.length} POS categories have 0 products.`);
//     }

//     // --- 6. TASKING SYSTEM ---
//     const tasks = await prisma.facilityTask.findMany({ include: { owner: true } });
//     const badTasks = tasks.filter(t => !t.owner);
//     if (badTasks.length > 0) {
//         bugs.push(`[BUG] Orphaned Tasks: ${badTasks.length} tasks point to non-existent stores.`);
//     }

//     // --- REPORTING ---
//     console.log('--- AUDIT RESULTS ---\n');

//     if (bugs.length === 0 && dirt.length === 0) {
//         console.log('✨ System looks PRISTINE, SysAdmin! No bugs or dirt found.');
//     } else {
//         if (bugs.length > 0) {
//             console.log('🚨 BUGS FOUND (Action Required):');
//             bugs.forEach(b => console.log(`  ${b}`));
//         } else {
//             console.log('✅ No bugs found.');
//         }

//         if (dirt.length > 0) {
//             console.log('\n🧹 DIRT FOUND (Cleanup Recommended):');
//             dirt.forEach(d => console.log(`  ${d}`));
//         } else {
//             console.log('\n✨ No dirt found.');
//         }
//     }

//     console.log('\n=== DEEP AUDIT COMPLETE ===');
//     await prisma.$disconnect();
// }

// deepAudit().catch(e => {
//     console.error(e);
//     process.exit(1);
// });
