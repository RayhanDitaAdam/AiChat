import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import * as fs from 'fs';

const prisma = new PrismaClient();
const rawKey = fs.readFileSync('key.txt', 'utf8');

async function main() {
    const user = await prisma.user.findUnique({
        where: { email: 'superadmin@example.com' }
    });

    if (!user || !user.superAdminKeyHash) {
        console.log("User or Hash missing");
        return;
    }

    try {
        const isValid1 = await argon2.verify(user.superAdminKeyHash, rawKey);
        console.log("Direct argon2.verify(hash, rawKey):", isValid1);
        
        const trimmed = rawKey.trim();
        const isValid2 = await argon2.verify(user.superAdminKeyHash, trimmed);
        console.log("Direct argon2.verify(hash, trimmedKey):", isValid2);
    } catch (err: any) {
        console.error("Argon error:", err.message);
    }
}
main().finally(() => prisma.$disconnect());
