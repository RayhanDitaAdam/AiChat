
import prisma from './src/common/services/prisma.service.js';

async function updateRole() {
    const user = await prisma.user.update({
        where: { email: 'Staff@gmail.com' },
        data: { role: 'STAFF' }
    });
    console.log('Successfully updated user role:', user.email, '->', user.role);
}

updateRole()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
