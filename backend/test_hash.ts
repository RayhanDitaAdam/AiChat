import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findUnique({ where: { email: 'superadmin@example.com' } });
    if (!user) {
        console.log("Super Admin not found in DB.");
        return;
    }
    
    console.log("User role:", user.role);
    console.log("DB superAdminKeyHash exists:", !!user.superAdminKeyHash);

    if (user.superAdminKeyHash) {
        try {
            const rawKey = fs.readFileSync('key.txt', 'utf8');
            const cleanKey = rawKey.replace(/\s+/g, '');
            console.log("Key length read from file:", cleanKey.length);
            
            const isMatch = await argon2.verify(user.superAdminKeyHash, cleanKey);
            console.log("Does argon2 verify the key matches the DB hash?", isMatch);
        } catch (e) {
            console.error("Error reading key.txt or verifying:", e);
        }
    }
}
main().finally(() => prisma.$disconnect());
