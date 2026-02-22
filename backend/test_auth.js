const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findUnique({
        where: { email: 'superadmin@example.com' }
    });

    if (!user || !user.superAdminKeyHash) {
        console.log("No super admin found");
        return;
    }

    const rawKey = fs.readFileSync('key.txt', 'utf8');
    
    console.log("Hash in DB:", user.superAdminKeyHash);
    console.log("Raw key length:", rawKey.length);

    try {
        const isValid = await argon2.verify(user.superAdminKeyHash, rawKey);
        console.log("Valid without trim:", isValid);
        const isValidTrim = await argon2.verify(user.superAdminKeyHash, rawKey.trim());
        console.log("Valid with trim:", isValidTrim);
    } catch (e) {
        console.error(e);
    }
}
main().finally(() => prisma.$disconnect());
