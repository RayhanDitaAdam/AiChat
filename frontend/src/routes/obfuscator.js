/**
 * obfuscator.js
 * Simplified URL Mapping (Hash removed per user request)
 */

const PATH_MAPS = {
    LOGIN: '/login',
    REGISTER: '/register',
    VERIFY_EMAIL: '/verify-email',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    USER_DASHBOARD: '/dashboard',
    USER_HISTORY: '/history',
    USER_WALLET: '/wallet',
    USER_SHOPPING_LIST: '/shopping-list',
    USER_FACILITY_TASKS: '/task-reporting',
    USER_HEALTH: '/health',
    USER_PROFILE: '/profile',
    USER_CHANGE_PASSWORD: '/change-password',
    CHAT_ASSISTANT: '/chat',
    USER_LIVE_SUPPORT: '/dashboard/live-staff-chat',
    CHAT_WITH_STAFF: '/dashboard/chat-with-staff',
    STAFF_LIVE_SUPPORT: '/staff/live-support',
    OWNER_DASHBOARD: '/owner/dashboard',
    OWNER_PRODUCTS: '/owner/inventory',
    OWNER_CONTRIBUTORS: '/owner/contributors',
    OWNER_CONTRIBUTOR_PRODUCTS: '/owner/contributors/products/:contributorId',
    OWNER_CHATS: '/owner/chat-audit-logs',
    OWNER_CHAT_ASSISTANT: '/owner/chat-with-ai',
    OWNER_LIVE_SUPPORT: '/owner/live-support',
    OWNER_SETTINGS: '/owner/settings',
    OWNER_FACILITY_TASKS: '/owner/tasks',
    OWNER_TEAM: '/owner/staff-management',
    OWNER_POS: '/owner/point-of-sale',
    OWNER_MEMBERS: '/owner/member-management',
    OWNER_REPORTS: '/owner/sales-reports',
    OWNER_REWARDS: '/owner/loyalty-rewards',
    OWNER_HEALTH: '/owner/health-records',
    OWNER_POS_SETTINGS: '/owner/point-rules',
    OWNER_PROFILE: '/owner/profile',
    OWNER_CHANGE_PASSWORD: '/owner/change-password',
    CONTRIBUTOR_DASHBOARD: '/v-contributor/dashboard',
    CONTRIBUTOR_CHAT: '/v-contributor/chat',
    CONTRIBUTOR_PRODUCTS: '/v-contributor/inventory',
    CONTRIBUTOR_CHATS: '/v-contributor/chat-history',
    CONTRIBUTOR_REPORTS: '/v-contributor/sales-reports',
    CONTRIBUTOR_AUDIT_LOGS: '/v-contributor/ai-audit-logs',
    CONTRIBUTOR_LIVE_SUPPORT: '/v-contributor/live-support',
    CONTRIBUTOR_PROFILE: '/v-contributor/profile',
    CONTRIBUTOR_CHANGE_PASSWORD: '/v-contributor/change-password',
    ADMIN_DASHBOARD: '/admin/dashboard',
    ADMIN_STORES: '/admin/stores',
    ADMIN_MISSING: '/admin/missing-requests',
    ADMIN_LIVE_CHAT: '/admin/live-chat',
    ADMIN_SYSTEM: '/admin/system',
    ADMIN_MENUS: '/admin/menus',
    BLOCKED: '/blocked',
    RESTRICTED: '/restricted',
    SELECT_STORE: '/select-store',
    ADMIN_OWNER_PRODUCTS: '/admin/inventory',
    BECOME_CONTRIBUTOR: '/become-contributor',
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

    const normalizedPath = pathname.toLowerCase();

    // Exact match check (case-insensitive)
    if (REVERSE_MAP[normalizedPath]) return REVERSE_MAP[normalizedPath];

    // Handle nested paths or variations if necessary
    for (const [path, id] of Object.entries(REVERSE_MAP)) {
        if (normalizedPath.startsWith(path)) return id;
    }

    return null;
};
