import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const p = await prisma.product.findFirst();
  console.log('Sample product:', { id: p.id, owner_id: p.owner_id });
}
main().catch(console.error).finally(() => prisma.$disconnect());
