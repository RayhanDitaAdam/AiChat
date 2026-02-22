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
    get OWNER_POS() { return getPath('OWNER_POS'); },
    get OWNER_TRANSACTIONS() { return getPath('OWNER_TRANSACTIONS'); },
    get OWNER_MEMBERS() { return getPath('OWNER_MEMBERS'); },
    get OWNER_REPORTS() { return getPath('OWNER_REPORTS'); },
    get OWNER_REWARDS() { return getPath('OWNER_REWARDS'); },
    get OWNER_HEALTH() { return getPath('OWNER_HEALTH'); },
    get OWNER_PROFILE() { return getPath('OWNER_PROFILE'); },
    get OWNER_CHANGE_PASSWORD() { return getPath('OWNER_CHANGE_PASSWORD'); },
    get OWNER_POS_SETTINGS() { return getPath('OWNER_POS_SETTINGS'); },
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
    get ADMIN_MENUS() { return getPath('ADMIN_MENUS'); },
    get ADMIN_ACCOUNT_OWNERS() { return getPath('ADMIN_ACCOUNT_OWNERS'); },
    get SUPER_ADMIN_DASHBOARD() { return getPath('SUPER_ADMIN_DASHBOARD'); },

    // System
    get BLOCKED() { return getPath('BLOCKED'); },
    get RESTRICTED() { return getPath('RESTRICTED'); }
};
