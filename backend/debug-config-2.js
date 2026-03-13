
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('--- DEBUG SYSTEM CONFIG ---');
    const config = await prisma.systemConfig.findUnique({ where: { id: 'global' } });
    console.log('Config:', JSON.stringify({
        ...config,
        geminiApiKey: config?.geminiApiKey ? 'SET (length: ' + config.geminiApiKey.length + ')' : 'MISSING',
        deepseekApiKey: config?.deepseekApiKey ? 'SET' : 'MISSING'
    }, null, 2));

    console.log('--- ENV VARS ---');
    console.log('process.env.GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'SET' : 'MISSING');
    console.log('process.env.DEEPSEEK_API_KEY:', process.env.DEEPSEEK_API_KEY ? 'SET' : 'MISSING');
}

main().catch(console.error).finally(() => prisma.$disconnect());
