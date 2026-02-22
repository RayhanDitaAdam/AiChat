import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const admin = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
    console.log("Super Admin Email:", admin?.email);
    console.log("Current OTP Code:", admin?.twoFactorCode || "Belum ada OTP (login dulu biar ke-generate)");
}
main().finally(() => prisma.$disconnect());
