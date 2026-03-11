import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const sections = await prisma.landingSection.findMany();
    const stats = {
        PUBLISHED: sections.filter(s => s.status === 'PUBLISHED').length,
        DRAFT: sections.filter(s => s.status === 'DRAFT').length,
        REVISION: sections.filter(s => s.status === 'REVISION').length,
        ACTIVE_PUBLISHED: sections.filter(s => s.status === 'PUBLISHED' && s.isActive).length
    };
    console.log('--- Section Stats ---');
    console.log(stats);

    console.log('--- Published Sections ---');
    console.table(sections.filter(s => s.status === 'PUBLISHED').map(s => ({
        id: s.id,
        type: s.type,
        isActive: s.isActive,
        order: s.order
    })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
