import prisma from './src/common/services/prisma.service.js';

async function fix() {
  const config = await prisma.systemConfig.findUnique({ where: { id: 'global' } });
  console.log('Current DB Config:', config?.aiModel);
  if (config?.aiModel?.includes('gemini-1.5')) {
    await prisma.systemConfig.update({
      where: { id: 'global' },
      data: { aiModel: 'gemini-3-flash-preview' }
    });
    console.log('Updated DB aiModel to gemini-3-flash-preview');
  }
}
fix().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
