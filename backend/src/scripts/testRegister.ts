import { AuthService } from '../modules/auth/auth.service.js';

async function testRegister() {
    const authService = new AuthService();
    try {
        const result = await authService.register({
            email: `testowner_${Date.now()}@test.com`,
            password: 'Password123!',
            name: 'Test Owner',
            role: 'OWNER' as any,
            domain: `testdomain_${Date.now()}`
        });
        console.log('Success:', result);
    } catch (error: any) {
        console.error('Error:', error.message);
        if (error.stack) console.error(error.stack);
    }
}

testRegister();
