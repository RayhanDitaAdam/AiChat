/**
 * obfuscator.js
 * Extreme Dynamic URL Obfuscation Engine
 */

// Helper: URL Safe Base64
const toUrlSafe = (base64) => base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
const fromUrlSafe = (safe) => {
    let base64 = safe.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    return base64;
};

// Generate or retrieve a random stable session stamp (exactly 16 chars)
const getSessionStamp = () => {
    const key = '_heart_shield_stamp';
    if (typeof window === 'undefined') return 'server-side-stub-xx';

    try {
        let stamp = sessionStorage.getItem(key);
        if (!stamp) {
            stamp = (Math.random().toString(36).substring(2, 10) + Date.now().toString(36)).substring(0, 16).padEnd(16, 'x');
            sessionStorage.setItem(key, stamp);
        }
        return stamp;
    } catch {
        return 'local-session-fallback';
    }
};

const SESSION_STAMP = getSessionStamp();

// Internal Mapping ID -> Readable hint
const PATH_MAPS = {
    LOGIN: 'L1', REGISTER: 'R2', USER_DASHBOARD: 'U3', USER_HISTORY: 'U4',
    USER_WALLET: 'U5', USER_SHOPPING_LIST: 'U6', USER_PROFILE: 'U7',
    OWNER_DASHBOARD: 'O1', OWNER_PRODUCTS: 'O2', OWNER_CHATS: 'O3',
    OWNER_CHAT_ASSISTANT: 'O4', OWNER_LIVE_SUPPORT: 'O5', OWNER_SETTINGS: 'O6',
    OWNER_PROFILE: 'O7', ADMIN_DASHBOARD: 'A1', ADMIN_STORES: 'A2',
    ADMIN_MISSING: 'A3', ADMIN_LIVE_CHAT: 'A4', ADMIN_SYSTEM: 'A5',
    ADMIN_MENUS: 'A6', BLOCKED: 'S1', RESTRICTED: 'S2'
};

const REVERSE_MAP = Object.fromEntries(Object.entries(PATH_MAPS).map(([k, v]) => [v, k]));

/**
 * Encodes an internal ID into an extremely long, complex hash
 */
export const obfuscate = (internalId) => {
    try {
        if (internalId === '/' || internalId === 'HOME') return '/';

        const key = PATH_MAPS[internalId] || 'XX';
        const timestamp = Date.now().toString(36);
        const randomSeed = Math.random().toString(36).substring(2, 10).padEnd(8, '0');

        // Payload structure: HS (2) + : (1) + seed (8) + : (1) + key (2) + : (1) + session (16) + : (1) + pad (1) = 33 bytes
        // Why 33? (33 / 3) * 4 = 44 characters exactly in Base64 (zero padding).
        const payload = `HS:${randomSeed}:${key}:${SESSION_STAMP}:X`;
        const core = toUrlSafe(btoa(payload));

        // Noise (exactly 80)
        const noiseRaw = toUrlSafe(btoa(Math.random().toString(36).repeat(8)));
        const noise = noiseRaw.substring(0, 80).padEnd(80, 'z');

        // Suffix (exactly 16)
        const suffixRaw = toUrlSafe(btoa(timestamp + 'stability-pad'));
        const suffix = suffixRaw.substring(0, 16).padEnd(16, 's');

        const finalHash = `${noise}${core}${suffix}`;
        return `/v-gate/${finalHash}/session-${toUrlSafe(btoa(SESSION_STAMP))}/t-${timestamp}`;
    } catch (err) {
        console.error('HeartShield: Obfuscation failed:', err);
        return '/';
    }
};

/**
 * Decodes the extreme hash back to the internal ID
 */
export const decode = (pathname) => {
    try {
        if (!pathname || pathname === '/' || pathname === '') return null;

        // Standardize: Look for the segment immediately following 'v-gate'
        const parts = pathname.split('/').filter(Boolean);
        const gateIdx = parts.indexOf('v-gate');

        if (gateIdx === -1 || !parts[gateIdx + 1]) {
            console.debug('HeartShield Debug: "v-gate" segment not found or no blob follows.', {
                pathname,
                parts,
                gateIdx
            });
            return null;
        }

        const blob = parts[gateIdx + 1];

        // Exact Length Check: 80 (noise) + 44 (core) + 16 (suffix) = 140
        if (blob.length < 140) {
            console.debug('HeartShield Debug: URL blob is too short.', {
                received: blob.length,
                expected: '>=140',
                snippet: blob.substring(0, 20) + '...'
            });
            return null;
        }

        // The core starts at exactly 80 and spans 44 chars
        const encodedCore = blob.substring(80, 124);
        const rawDecoded = fromUrlSafe(encodedCore);
        const decoded = atob(rawDecoded);
        const data = decoded.split(':');

        // Expected data parts: [HS, seed, key, session, X]
        if (data[0] !== 'HS' || data.length < 5) {
            console.warn('HeartShield Warning: Integrity header mismatch or invalid length.', {
                headerValue: data[0],
                actualParts: data.length,
                fullDecodedString: decoded
            });
            return null;
        }

        const internalIdKey = data[2];
        const sessionInUrl = data[3];

        if (sessionInUrl !== SESSION_STAMP) {
            console.warn('HeartShield Mismatch: Link belongs to a different session or tab.', {
                sessionFromUrl: sessionInUrl,
                sessionInBrowser: SESSION_STAMP
            });
            return null;
        }

        const internalRouteId = REVERSE_MAP[internalIdKey] || null;
        if (!internalRouteId) {
            console.warn('HeartShield Warning: No internal route mapping found for key:', internalIdKey);
        }

        return internalRouteId;
    } catch (e) {
        console.error('HeartShield Critical: Decoding error encountered.', e.message);
        return null;
    }
};

/**
 * Note: Since we use SESSION_STAMP, if the user refreshes, 
 * the old hashes in the browser history will become invalid.
 * This is intentional for "extreme" obfuscation.
 */
