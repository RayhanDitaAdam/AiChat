import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const owners = await prisma.owner.findMany({ select: { id: true, name: true, domain: true, isApproved: true } });
  console.log('Owners:', owners);
}
main().catch(console.error).finally(() => prisma.$disconnect());
