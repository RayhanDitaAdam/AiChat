import { PrismaClient } from '@prisma/client';
import { PasswordUtil } from '../src/common/utils/password.util.ts';
import { Role } from '../src/common/types/auth.types.ts';

const prisma = new PrismaClient();

async function seedAdmins() {
    const defaultPassword = 'Asui1234';
    const hashedDefaultPassword = await PasswordUtil.hash(defaultPassword);

    const admins = [
        {
            email: 'akuntiktok1397@gmail.com',
            password: hashedDefaultPassword,
            name: 'Admin TikTok',
            role: Role.ADMIN,
        },
        {
            email: 'rayhan.dita45@smk.belajar.id',
            password: hashedDefaultPassword,
            name: 'Admin SMK',
            role: Role.ADMIN,
        }
    ];

    for (const admin of admins) {
        await prisma.user.upsert({
            where: { email: admin.email },
            update: {
                role: Role.ADMIN,
            },
            create: admin,
        });
        console.log(`Admin ${admin.email} created/updated.`);
    }

    console.log(`Default password for new admins: ${defaultPassword}`);
}

seedAdmins()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
