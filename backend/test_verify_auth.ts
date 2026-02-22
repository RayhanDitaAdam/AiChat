import { PrismaClient } from '@prisma/client';
import { AuthService } from './src/modules/auth/auth.service';
import * as fs from 'fs';

const prisma = new PrismaClient();
const authService = new AuthService();

async function main() {
    const userId = "33c1b608-4438-4158-872b-3c784fc0c72e";
    const rawKey = fs.readFileSync('key.txt', 'utf8');
    const cleanKey = rawKey.replace(/\s+/g, '');
    
    console.log("Testing verifyKeyFile with id:", userId);
    console.log("Cleaned key length:", cleanKey.length);

    try {
        const result = await authService.verifyKeyFile(userId, cleanKey);
        console.log("Verification result:", JSON.stringify(result, null, 2));
    } catch (e: any) {
        console.error("Verification failed:", e.message);
    }
}

main().finally(() => prisma.$disconnect());
