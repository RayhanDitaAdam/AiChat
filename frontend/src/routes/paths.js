import { obfuscate } from './obfuscator.js';

const CACHE = {};

const getPath = (id) => {
    if (!CACHE[id]) CACHE[id] = obfuscate(id);
    return CACHE[id];
};

export const PATHS = {
    get HOME() { return '/'; },
    get LOGIN() { return getPath('LOGIN'); },
    get REGISTER() { return getPath('REGISTER'); },
    get VERIFY_EMAIL() { return getPath('VERIFY_EMAIL'); },
    get SUPER_ADMIN_LOGIN() { return '/auth/superadmin'; },
    get FORGOT_PASSWORD() { return '/forgot-password'; },
    get RESET_PASSWORD() { return '/reset-password'; },
    get BECOME_CONTRIBUTOR() { return getPath('BECOME_CONTRIBUTOR'); },
    get PRIVACY_POLICY() { return '/privacy-policy'; },

    // User
    get USER_DASHBOARD() { return getPath('USER_DASHBOARD'); },
    get USER_HISTORY() { return getPath('USER_HISTORY'); },
    get USER_WALLET() { return getPath('USER_WALLET'); },
    get USER_SHOPPING_LIST() { return getPath('USER_SHOPPING_LIST'); },
    get USER_FACILITY_TASKS() { return getPath('USER_FACILITY_TASKS'); },
    get USER_PROFILE() { return getPath('USER_PROFILE'); },
    get USER_CHANGE_PASSWORD() { return getPath('USER_CHANGE_PASSWORD'); },
    get USER_HEALTH() { return getPath('USER_HEALTH'); },
    get USER_LIVE_SUPPORT() { return getPath('USER_LIVE_SUPPORT'); },
    get USER_VACANCIES() { return getPath('USER_VACANCIES'); },
    get SELECT_STORE() { return getPath('SELECT_STORE'); },

    // Owner
    get OWNER_DASHBOARD() { return getPath('OWNER_DASHBOARD'); },
    get OWNER_PRODUCTS() { return getPath('OWNER_PRODUCTS'); },
    get OWNER_CONTRIBUTORS() { return getPath('OWNER_CONTRIBUTORS'); },
    get OWNER_CONTRIBUTOR_PRODUCTS() { return getPath('OWNER_CONTRIBUTOR_PRODUCTS'); },
    get OWNER_CHATS() { return getPath('OWNER_CHATS'); },
    get OWNER_CHAT_ASSISTANT() { return getPath('OWNER_CHAT_ASSISTANT'); },
    get OWNER_LIVE_SUPPORT() { return getPath('OWNER_LIVE_SUPPORT'); },
    get OWNER_SETTINGS() { return getPath('OWNER_SETTINGS'); },
    get OWNER_FACILITY_TASKS() { return getPath('OWNER_FACILITY_TASKS'); },
    get OWNER_TEAM() { return getPath('OWNER_TEAM'); },
    get OWNER_TEAM_SUITE() { return getPath('OWNER_TEAM_SUITE'); },
    get OWNER_VACANCIES() { return getPath('OWNER_VACANCIES'); },
    get OWNER_POS() { return getPath('OWNER_POS'); },
    get OWNER_TRANSACTIONS() { return getPath('OWNER_TRANSACTIONS'); },
    get OWNER_MEMBERS() { return getPath('OWNER_MEMBERS'); },
    get OWNER_REPORTS() { return getPath('OWNER_REPORTS'); },
    get OWNER_REWARDS() { return getPath('OWNER_REWARDS'); },
    get OWNER_RAK_LORONG() { return getPath('OWNER_RAK_LORONG'); },
    get OWNER_HEALTH() { return getPath('OWNER_HEALTH'); },
    get OWNER_PROFILE() { return getPath('OWNER_PROFILE'); },
    get OWNER_CHANGE_PASSWORD() { return getPath('OWNER_CHANGE_PASSWORD'); },
    get OWNER_POS_SETTINGS() { return getPath('OWNER_POS_SETTINGS'); },
    get OWNER_SOP() { return getPath('OWNER_SOP'); },
    get OWNER_EXPIRY() { return getPath('OWNER_EXPIRY'); },

    // Workshop (Bengkel)
    get OWNER_WORKSHOP_SUITE_OPS() { return getPath('OWNER_WORKSHOP_SUITE_OPS'); },
    get OWNER_WORKSHOP_SUITE_HR() { return getPath('OWNER_WORKSHOP_SUITE_HR'); },
    get OWNER_WORKSHOP_CHECKIN() { return getPath('OWNER_WORKSHOP_CHECKIN'); },
    get OWNER_WORKSHOP_QUEUE() { return getPath('OWNER_WORKSHOP_QUEUE'); },
    get OWNER_WORKSHOP_HISTORY() { return getPath('OWNER_WORKSHOP_HISTORY'); },
    get OWNER_WORKSHOP_BILLING() { return getPath('OWNER_WORKSHOP_BILLING'); },
    get OWNER_WORKSHOP_MECHANICS() { return getPath('OWNER_WORKSHOP_MECHANICS'); },
    get OWNER_WORKSHOP_ATTENDANCE() { return getPath('OWNER_WORKSHOP_ATTENDANCE'); },
    get OWNER_WORKSHOP_COMMISSION() { return getPath('OWNER_WORKSHOP_COMMISSION'); },
    get OWNER_WORKSHOP_SUPPLIERS() { return getPath('OWNER_WORKSHOP_SUPPLIERS'); },
    get OWNER_WORKSHOP_SETTINGS() { return getPath('OWNER_WORKSHOP_SETTINGS'); },

    // Staff
    get STAFF_DASHBOARD() { return getPath('STAFF_DASHBOARD'); },
    get STAFF_PRODUCTS() { return getPath('STAFF_PRODUCTS'); },
    get STAFF_CONTRIBUTORS() { return getPath('STAFF_CONTRIBUTORS'); },
    get STAFF_CONTRIBUTOR_PRODUCTS() { return getPath('STAFF_CONTRIBUTOR_PRODUCTS'); },
    get STAFF_CHATS() { return getPath('STAFF_CHATS'); },
    get STAFF_CHAT_ASSISTANT() { return getPath('STAFF_CHAT_ASSISTANT'); },
    get STAFF_LIVE_SUPPORT() { return getPath('STAFF_LIVE_SUPPORT'); },
    get STAFF_SETTINGS() { return getPath('STAFF_SETTINGS'); },
    get STAFF_FACILITY_TASKS() { return getPath('STAFF_FACILITY_TASKS'); },
    get STAFF_TEAM() { return getPath('STAFF_TEAM'); },
    get STAFF_TEAM_SUITE() { return getPath('STAFF_TEAM_SUITE'); },
    get STAFF_VACANCIES() { return getPath('STAFF_VACANCIES'); },
    get STAFF_POS() { return getPath('STAFF_POS'); },
    get STAFF_TRANSACTIONS() { return getPath('STAFF_TRANSACTIONS'); },
    get STAFF_RAK_LORONG() { return getPath('STAFF_RAK_LORONG'); },
    get STAFF_MEMBERS() { return getPath('STAFF_MEMBERS'); },
    get STAFF_REPORTS() { return getPath('STAFF_REPORTS'); },
    get STAFF_REWARDS() { return getPath('STAFF_REWARDS'); },
    get STAFF_HEALTH() { return getPath('STAFF_HEALTH'); },
    get STAFF_POS_SETTINGS() { return getPath('STAFF_POS_SETTINGS'); },
    get STAFF_PROFILE() { return getPath('STAFF_PROFILE'); },
    get STAFF_CHANGE_PASSWORD() { return getPath('STAFF_CHANGE_PASSWORD'); },
    get STAFF_SOP() { return getPath('STAFF_SOP'); },
    get STAFF_EXPIRY() { return getPath('STAFF_EXPIRY'); },

    // Workshop (Bengkel)
    get STAFF_WORKSHOP_CHECKIN() { return getPath('STAFF_WORKSHOP_CHECKIN'); },
    get STAFF_WORKSHOP_QUEUE() { return getPath('STAFF_WORKSHOP_QUEUE'); },
    get STAFF_WORKSHOP_HISTORY() { return getPath('STAFF_WORKSHOP_HISTORY'); },
    get STAFF_WORKSHOP_BILLING() { return getPath('STAFF_WORKSHOP_BILLING'); },
    get STAFF_WORKSHOP_MECHANICS() { return getPath('STAFF_WORKSHOP_MECHANICS'); },
    get STAFF_WORKSHOP_ATTENDANCE() { return getPath('STAFF_WORKSHOP_ATTENDANCE'); },
    get STAFF_WORKSHOP_COMMISSION() { return getPath('STAFF_WORKSHOP_COMMISSION'); },
    get STAFF_WORKSHOP_SUPPLIERS() { return getPath('STAFF_WORKSHOP_SUPPLIERS'); },

    // Contributor
    get CONTRIBUTOR_DASHBOARD() { return getPath('CONTRIBUTOR_DASHBOARD'); },
    get CONTRIBUTOR_CHAT() { return getPath('CONTRIBUTOR_CHAT'); },
    get CONTRIBUTOR_PRODUCTS() { return getPath('CONTRIBUTOR_PRODUCTS'); },
    get CONTRIBUTOR_CHATS() { return getPath('CONTRIBUTOR_CHATS'); },
    get CONTRIBUTOR_AUDIT_LOGS() { return getPath('CONTRIBUTOR_AUDIT_LOGS'); },
    get CONTRIBUTOR_REPORTS() { return getPath('CONTRIBUTOR_REPORTS'); },
    get CONTRIBUTOR_LIVE_SUPPORT() { return getPath('CONTRIBUTOR_LIVE_SUPPORT'); },
    get CONTRIBUTOR_PROFILE() { return getPath('CONTRIBUTOR_PROFILE'); },
    get CONTRIBUTOR_CHANGE_PASSWORD() { return getPath('CONTRIBUTOR_CHANGE_PASSWORD'); },

    // Admin
    get ADMIN_DASHBOARD() { return getPath('ADMIN_DASHBOARD'); },
    get ADMIN_ANALYTICS() { return getPath('ADMIN_ANALYTICS'); },
    get ADMIN_STORES() { return getPath('ADMIN_STORES'); },
    get ADMIN_MISSING() { return getPath('ADMIN_MISSING'); },
    get ADMIN_LIVE_CHAT() { return getPath('ADMIN_LIVE_CHAT'); },
    get ADMIN_SYSTEM() { return getPath('ADMIN_SYSTEM'); },
    get SUPER_ADMIN_BRANDING() { return getPath('SUPER_ADMIN_BRANDING'); },
    get ADMIN_MENUS() { return getPath('ADMIN_MENUS'); },
    get ADMIN_ACCOUNT_OWNERS() { return getPath('ADMIN_ACCOUNT_OWNERS'); },
    get SUPER_ADMIN_DASHBOARD() { return getPath('SUPER_ADMIN_DASHBOARD'); },

    // System
    get BLOCKED() { return getPath('BLOCKED'); },
    get RESTRICTED() { return getPath('RESTRICTED'); }
};
