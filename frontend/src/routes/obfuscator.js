/**
 * obfuscator.js
 * Simplified URL Mapping (Hash removed per user request)
 */

const PATH_MAPS = {
    LOGIN: '/login',
    REGISTER: '/register',
    VERIFY_EMAIL: '/verify-email',
    USER_DASHBOARD: '/dashboard',
    USER_HISTORY: '/history',
    USER_WALLET: '/wallet',
    USER_SHOPPING_LIST: '/shopping-list',
    USER_FACILITY_TASKS: '/task-reporting',
    USER_HEALTH: '/health',
    USER_PROFILE: '/profile',
    OWNER_DASHBOARD: '/owner/dashboard',
    OWNER_PRODUCTS: '/owner/inventory',
    OWNER_CHATS: '/owner/audit-logs',
    OWNER_CHAT_ASSISTANT: '/owner/chat-assistant',
    OWNER_LIVE_SUPPORT: '/owner/live-support',
    OWNER_SETTINGS: '/owner/settings',
    OWNER_FACILITY_TASKS: '/owner/facility-tasks',
    OWNER_TEAM: '/owner/team',
    OWNER_POS: '/owner/pos',
    OWNER_MEMBERS: '/owner/members',
    OWNER_REPORTS: '/owner/reports',
    OWNER_REWARDS: '/owner/rewards',
    OWNER_HEALTH: '/owner/health',
    OWNER_PROFILE: '/owner/profile',
    ADMIN_DASHBOARD: '/admin/dashboard',
    ADMIN_STORES: '/admin/stores',
    ADMIN_MISSING: '/admin/missing-requests',
    ADMIN_LIVE_CHAT: '/admin/live-chat',
    ADMIN_SYSTEM: '/admin/system',
    ADMIN_MENUS: '/admin/menus',
    BLOCKED: '/blocked',
    RESTRICTED: '/restricted',
    SELECT_STORE: '/select-store'
};

const REVERSE_MAP = Object.fromEntries(Object.entries(PATH_MAPS).map(([k, v]) => [v, k]));

/**
 * Returns a readable path for an internal ID
 */
export const obfuscate = (internalId) => {
    if (internalId === '/' || internalId === 'HOME') return '/';
    return PATH_MAPS[internalId] || '/';
};

/**
 * Maps a readable path back to its internal ID
 */
export const decode = (pathname) => {
    if (!pathname || pathname === '/' || pathname === '') return null;

    // Exact match check
    if (REVERSE_MAP[pathname]) return REVERSE_MAP[pathname];

    // Handle nested paths or variations if necessary
    for (const [path, id] of Object.entries(REVERSE_MAP)) {
        if (pathname.startsWith(path)) return id;
    }

    return null;
};
