import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findUnique({
        where: { email: 'superadmin@example.com' }
    });
    console.log("User:", user?.email, "| Role:", user?.role);
    if (user?.password) {
        const matches = await bcrypt.compare('Password123!', user.password);
        console.log("Password matches 'Password123!' :", matches);
    } else {
        console.log("No password found.");
    }
}
main().finally(() => prisma.$disconnect());
