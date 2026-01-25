import { JWTService } from '../src/common/services/jwt.service.js';
import { Role } from '@prisma/client';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const API_URL = 'http://localhost:4000';

async function testRoutes() {
    console.log('🚀 Starting Backend Route Tests...\n');
    const documentation: any = {
        apiName: "AiChat Backend API (Real Data)",
        baseUrl: API_URL,
        timestamp: new Date().toISOString(),
        routes: []
    };

    // 1. Authenticate as USER
    console.log('--- Authenticating as USER ---');
    const userPayload = { token: 'test-user-token' };
    const userLogin = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userPayload),
    });
    const userData = await userLogin.json();

    documentation.routes.push({
        name: "Google Auth (User Bypass)",
        path: "/api/auth/google",
        method: "POST",
        request: { body: userPayload },
        response: { status: userLogin.status, body: userData }
    });

    if (!userLogin.ok) {
        console.error('❌ USER login failed:', userData);
        return;
    }
    const userToken = userData.token;
    console.log('✅ USER token obtained.\n');

    // 2. Authenticate as OWNER
    console.log('--- Authenticating as OWNER ---');
    const ownerPayload = { token: 'test-owner-token' };
    const ownerLogin = await fetch(`${API_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ownerPayload),
    });
    const ownerData = await ownerLogin.json();

    documentation.routes.push({
        name: "Google Auth (Owner Bypass)",
        path: "/api/auth/google",
        method: "POST",
        request: { body: ownerPayload },
        response: { status: ownerLogin.status, body: ownerData }
    });

    if (!ownerLogin.ok) {
        console.error('❌ OWNER login failed:', ownerData);
        return;
    }
    const ownerToken = ownerData.token;
    console.log('✅ OWNER token obtained.\n');

    const userId = userData.user.id;
    const ownerId = ownerData.user.ownerId;

    const tests = [
        {
            role: 'USER',
            name: 'Auth: Get User Profile',
            url: `${API_URL}/api/auth/me`,
            method: 'GET',
            token: userToken,
        },
        {
            role: 'OWNER',
            name: 'Owner: Create Product (Sayur Kol)',
            url: `${API_URL}/api/products`,
            method: 'POST',
            token: ownerToken,
            body: {
                name: 'Sayur Kol Super',
                price: 6000,
                stock: 50,
                aisle: 'Sayuran',
                section: 'Segar',
                halal: true
            }
        },
        {
            role: 'USER',
            name: 'Chat: Ask for Healthy Options',
            url: `${API_URL}/api/chat`,
            method: 'POST',
            token: userToken,
            body: {
                message: 'Halo HEART, saya lagi diet nih. Ada sayuran hijau yang seger nggak hari ini?',
                ownerId: ownerId,
                userId: userId,
            },
        },
        {
            role: 'USER',
            name: 'Chat: Ask for Prices',
            url: `${API_URL}/api/chat`,
            method: 'POST',
            token: userToken,
            body: {
                message: 'Wah Brokoli sama Bayam oke juga. Berapa harganya per ikat? Terus lokasinya di sebelah mana ya?',
                ownerId: ownerId,
                userId: userId,
            },
        },
        {
            role: 'USER',
            name: 'Chat: Ask for Cooking Recommendations',
            url: `${API_URL}/api/chat`,
            method: 'POST',
            token: userToken,
            body: {
                message: 'Bolehkah saya minta saran masakan yang simpel buat Brokoli-nya? Biar nggak bosen makannya.',
                ownerId: ownerId,
                userId: userId,
            },
        },
        {
            role: 'USER',
            name: 'Rating: User submits rating after help',
            url: `${API_URL}/api/rating`,
            method: 'POST',
            token: userToken,
            body: {
                ownerId: ownerId,
                score: 5,
                feedback: 'HEART ngebantu banget! Rekomendasi buat dietnya oke, nggak kaku balesnya.'
            },
        },
        {
            role: 'OWNER',
            name: 'Owner: Dashboard - Customer Ratings',
            url: `${API_URL}/api/ratings/${ownerId}`,
            method: 'GET',
            token: ownerToken,
        },
        {
            role: 'OWNER',
            name: 'Owner: Dashboard - Full Chat History',
            url: `${API_URL}/api/chat-history/${ownerId}`,
            method: 'GET',
            token: ownerToken,
        },
    ];

    const results: any = {
        USER_INTERACTIONS: [],
        OWNER_INTERACTIONS: [],
        SYSTEM_INFO: {
            baseUrl: API_URL,
            timestamp: new Date().toISOString()
        }
    };

    for (const test of tests) {
        try {
            const options: any = {
                method: test.method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${test.token}`
                },
            };

            if (test.body) {
                options.body = JSON.stringify(test.body);
            }

            const response = await fetch(test.url, options);
            const resBody = await response.json();

            const docItem = {
                name: test.name,
                endpoint: test.url.replace(API_URL, ''),
                method: test.method,
                request: test.body ? { body: test.body } : undefined,
                response: {
                    status: response.status,
                    body: resBody
                }
            };

            if (test.role === 'USER') {
                results.USER_INTERACTIONS.push(docItem);
            } else {
                results.OWNER_INTERACTIONS.push(docItem);
            }

            if (response.ok) {
                console.log(`✅ [${test.role}] ${test.name}: SUCCESS (${response.status})`);
            } else {
                console.error(`❌ [${test.role}] ${test.name}: FAILED (${response.status})`);
                console.error(JSON.stringify(resBody, null, 2));
            }
        } catch (error: any) {
            console.error(`❌ [${test.role}] ${test.name}: ERROR - ${error.message}`);
        }
    }

    // Write to api-routes.json
    fs.writeFileSync('api-routes.json', JSON.stringify(results, null, 2));
    console.log('\n📄 Real API responses saved to api-routes.json');
    console.log('🏁 Tests Completed.');
}

testRoutes();
