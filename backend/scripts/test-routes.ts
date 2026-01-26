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
        // --- PHASE 1: OWNER SETUP ---
        {
            role: 'OWNER',
            name: 'Auth: Get Owner Profile',
            url: `${API_URL}/api/auth/me`,
            method: 'GET',
            token: ownerToken,
        },
        {
            role: 'OWNER',
            name: 'Product: Owner Creates Special Promo Item',
            url: `${API_URL}/api/products`,
            method: 'POST',
            token: ownerToken,
            body: {
                name: 'Kol Promo Imlek',
                price: 4500,
                stock: 200,
                aisle: 'Sayuran',
                section: 'Promo',
                halal: true
            }
        },
        {
            role: 'OWNER',
            name: 'Product: Owner Updates Price of Promo Item',
            url: `${API_URL}/api/products/RANDOM_ID_PLACEHOLDER`, // Will handle in script logic
            method: 'PATCH',
            token: ownerToken,
            body: {
                price: 4000,
                stock: 150
            }
        },

        // --- PHASE 2: USER INTERACTION (ID) ---
        {
            role: 'USER',
            name: 'Auth: Get User Profile (Initial ID)',
            url: `${API_URL}/api/auth/me`,
            method: 'GET',
            token: userToken,
        },
        {
            role: 'USER',
            name: 'Chat ID: Ask for Promo items',
            url: `${API_URL}/api/chat`,
            method: 'POST',
            token: userToken,
            body: {
                message: 'Halo HEART, ada sayur kol yang lagi promo nggak hari ini?',
                ownerId: ownerId,
                userId: userId,
            },
        },
        {
            role: 'USER',
            name: 'Reminder: Set Reminder for Promo Kol',
            url: `${API_URL}/api/reminder`,
            method: 'POST',
            token: userToken,
            body: {
                product: 'Kol Promo Imlek',
                remindDate: new Date(Date.now() + 172800000).toISOString() // 2 days later
            }
        },

        // --- PHASE 3: MULTI-LANGUAGE SWITCH ---
        {
            role: 'USER',
            name: 'Auth: Update Language to English',
            url: `${API_URL}/api/auth/profile`,
            method: 'PATCH',
            token: userToken,
            body: {
                language: 'en'
            }
        },
        {
            role: 'USER',
            name: 'Chat EN: Ask for location in English',
            url: `${API_URL}/api/chat`,
            method: 'POST',
            token: userToken,
            body: {
                message: 'Hi HEART, where is the Organic Spinach located? And how much does it cost?',
                ownerId: ownerId,
                userId: userId,
            },
        },
        {
            role: 'USER',
            name: 'Rating: User provides feedback in English',
            url: `${API_URL}/api/rating`,
            method: 'POST',
            token: userToken,
            body: {
                ownerId: ownerId,
                score: 5,
                feedback: 'Love the English support! Very helpful shop assistant.'
            }
        },

        // --- PHASE 4: OWNER CLEANUP/DASHBOARD ---
        {
            role: 'OWNER',
            name: 'Product: Owner deletes an old item',
            url: `${API_URL}/api/products/DELETE_ID_PLACEHOLDER`, // Will handle
            method: 'DELETE',
            token: ownerToken,
        },
        {
            role: 'OWNER',
            name: 'Owner: Dashboard - Check All Ratings',
            url: `${API_URL}/api/ratings/${ownerId}`,
            method: 'GET',
            token: ownerToken,
        },
        {
            role: 'OWNER',
            name: 'Owner: Dashboard - Check Chat History',
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

    let lastCreatedProductId = '';
    let itemToDeleteId = '';

    for (const test of tests) {
        try {
            let finalUrl = test.url;
            if (finalUrl.includes('RANDOM_ID_PLACEHOLDER')) {
                finalUrl = finalUrl.replace('RANDOM_ID_PLACEHOLDER', lastCreatedProductId);
            }
            if (finalUrl.includes('DELETE_ID_PLACEHOLDER')) {
                // Find a product to delete (using the one we just created or seeded)
                finalUrl = finalUrl.replace('DELETE_ID_PLACEHOLDER', lastCreatedProductId);
            }

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

            const response = await fetch(finalUrl, options);
            const resBody = await response.json();

            // Track IDs for workflow
            if (test.name.includes('Owner Creates Special Promo Item') && response.ok) {
                lastCreatedProductId = resBody.product.id;
            }

            const docItem = {
                name: test.name,
                endpoint: finalUrl.replace(API_URL, ''),
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
