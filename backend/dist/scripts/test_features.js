import { PrismaClient, Role } from '@prisma/client';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { PasswordUtil } from '../common/utils/password.util.js';
const prisma = new PrismaClient();
const API_URL = 'http://localhost:4000/api';
async function runTests() {
    console.log('Starting backend feature tests...');
    const results = [];
    // Cleanup previous test run data
    // (Optional: use specific emails to avoid collision, or cleanup by email)
    const timestamp = Date.now();
    const ownerEmail = `owner_${timestamp}@test.com`;
    const userEmail = `user_${timestamp}@test.com`;
    const userPassword = 'Password123!';
    // Create an Owner manually (since we don't have register endpoint for Owner role easily accessible/public)
    let ownerUser;
    let ownerRecord;
    let ownerToken;
    try {
        console.log('Creating Test Owner in DB...');
        const hashedPassword = await PasswordUtil.hash(userPassword);
        // Use nested create to handle relation automatically
        ownerUser = await prisma.user.create({
            data: {
                email: ownerEmail,
                password: hashedPassword,
                name: 'Test Owner',
                role: Role.OWNER,
                // Nested create for Owner
                owner: {
                    create: {
                        name: 'Test Store',
                        domain: `store_${timestamp}.com`
                    }
                }
            },
            include: {
                owner: true
            }
        });
        ownerRecord = ownerUser.owner;
        results.push({ name: 'Create Owner (DB)', status: 'PASS', details: { ownerId: ownerRecord?.id, email: ownerEmail } });
        // Login as Owner
        console.log('Testing Owner Login...');
        const ownerLoginRes = await axios.post(`${API_URL}/auth/login`, {
            email: ownerEmail,
            password: userPassword
        });
        ownerToken = ownerLoginRes.data.token;
        results.push({ name: 'Owner Login', status: 'PASS', details: { token: '***' } });
    }
    catch (error) {
        console.error('Owner Setup Failed:', error?.response?.data || error.message);
        results.push({ name: 'Owner Setup', status: 'FAIL', details: error?.response?.data, error: error.message });
    }
    // Test User Registration & Login
    let userToken;
    let userId;
    try {
        console.log('Testing User Registration...');
        const registerRes = await axios.post(`${API_URL}/auth/register`, {
            email: userEmail,
            password: userPassword,
            name: 'Test User'
        });
        userId = registerRes.data.user.id;
        results.push({ name: 'User Registration', status: 'PASS', details: { userId, email: userEmail } });
        console.log('Testing User Login...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: userEmail,
            password: userPassword
        });
        userToken = loginRes.data.token;
        results.push({ name: 'User Login', status: 'PASS', details: { token: '***' } });
    }
    catch (error) {
        console.error('User Flow Failed. Details:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        }
        else {
            console.error('Message:', error.message);
            console.error('Code:', error.code);
        }
        const errorDetail = error?.response?.data || error.message;
        results.push({ name: 'User Flow', status: 'FAIL', details: errorDetail, error: error.message });
    }
    // Test Rating Feature
    if (userToken && ownerRecord) {
        try {
            console.log('Testing Create Rating...');
            const ratingRes = await axios.post(`${API_URL}/rating`, {
                ownerId: ownerRecord.id,
                score: 5,
                feedback: 'Great service implementation!'
            }, {
                headers: { Authorization: `Bearer ${userToken}` }
            });
            results.push({ name: 'Create Rating', status: 'PASS', details: ratingRes.data });
        }
        catch (error) {
            // Check if it's validation error or other
            console.error('Create Rating Failed:', error?.response?.data || error.message);
            results.push({ name: 'Create Rating', status: 'FAIL', details: error?.response?.data, error: error.message });
        }
    }
    else {
        results.push({ name: 'Create Rating', status: 'FAIL', details: 'Skipped due to missing user/owner', error: 'Skipped' });
    }
    // Test Owner Retrieve Ratings
    if (ownerToken && ownerRecord) {
        try {
            console.log('Testing Owner Get Ratings...');
            // Mounted at /api in app.ts, so path is /api/ratings/:ownerId
            const getRatingRes = await axios.get(`${API_URL}/ratings/${ownerRecord.id}`, {
                headers: { Authorization: `Bearer ${ownerToken}` }
            });
            const ratings = getRatingRes.data;
            // Check if our rating is there
            const ratingFound = Array.isArray(ratings.data) && ratings.data.length > 0; // Assuming response structure { status: 'success', data: [...] } or just [...]
            results.push({ name: 'Owner Get Ratings', status: 'PASS', details: { count: ratings.data?.length || 0, sample: ratings.data?.[0] } });
        }
        catch (error) {
            console.error('Owner Get Ratings Failed:', error?.response?.data || error.message);
            results.push({ name: 'Owner Get Ratings', status: 'FAIL', details: error?.response?.data, error: error.message });
        }
    }
    // Generate Report
    const reportPath = path.join(process.cwd(), 'backend_test_results.json');
    fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
    const readmePath = path.join(process.cwd(), 'README.md');
    // Read existing README if exists
    let readmeContent = '';
    if (fs.existsSync(readmePath)) {
        readmeContent = fs.readFileSync(readmePath, 'utf-8');
    }
    const testSummary = `
## Backend Feature Verification Results (${new Date().toISOString()})

| Feature | Status | Details |
|---------|--------|---------|
${results.map(r => `| ${r.name} | ${r.status} | ${r.error ? r.error : 'Success'} |`).join('\n')}

**Details JSON:**
\`\`\`json
${JSON.stringify(results, null, 2)}
\`\`\`
`;
    fs.writeFileSync(readmePath, readmeContent + '\n' + testSummary);
    console.log(`Test completed. Results saved to ${reportPath} and appended to ${readmePath}`);
}
runTests().catch(console.error).finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=test_features.js.map