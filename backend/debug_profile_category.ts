import { prisma } from './src/common/services/prisma.service.js';
import { AuthService } from './src/modules/auth/auth.service.js';

async function check() {
    const authService = new AuthService();

    // Find an owner
    const ownerUser = await prisma.user.findFirst({
        where: { role: 'OWNER' },
        include: { owner: true }
    });

    if (!ownerUser) {
        console.log('No owner user found for testing.');
        return;
    }

    console.log(`Testing with user: ${ownerUser.email}`);
    console.log(`Current Category in DB: ${ownerUser.owner?.businessCategory}`);

    const profile = await authService.getUserProfile(ownerUser.id);
    console.log('--- Profile Response ---');
    console.log(JSON.stringify(profile.user.owner, null, 2));

    if (profile.user.owner && profile.user.owner.businessCategory) {
        console.log('SUCCESS: businessCategory is present in profile.');
    } else {
        console.log('FAILED: businessCategory is missing from profile.');
    }
}

check().catch(console.error);
