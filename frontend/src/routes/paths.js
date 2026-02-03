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

    // User
    get USER_DASHBOARD() { return getPath('USER_DASHBOARD'); },
    get USER_HISTORY() { return getPath('USER_HISTORY'); },
    get USER_WALLET() { return getPath('USER_WALLET'); },
    get USER_SHOPPING_LIST() { return getPath('USER_SHOPPING_LIST'); },
    get USER_PROFILE() { return getPath('USER_PROFILE'); },

    // Owner
    get OWNER_DASHBOARD() { return getPath('OWNER_DASHBOARD'); },
    get OWNER_PRODUCTS() { return getPath('OWNER_PRODUCTS'); },
    get OWNER_CHATS() { return getPath('OWNER_CHATS'); },
    get OWNER_CHAT_ASSISTANT() { return getPath('OWNER_CHAT_ASSISTANT'); },
    get OWNER_LIVE_SUPPORT() { return getPath('OWNER_LIVE_SUPPORT'); },
    get OWNER_SETTINGS() { return getPath('OWNER_SETTINGS'); },
    get OWNER_PROFILE() { return getPath('OWNER_PROFILE'); },

    // Admin
    get ADMIN_DASHBOARD() { return getPath('ADMIN_DASHBOARD'); },
    get ADMIN_STORES() { return getPath('ADMIN_STORES'); },
    get ADMIN_MISSING() { return getPath('ADMIN_MISSING'); },
    get ADMIN_LIVE_CHAT() { return getPath('ADMIN_LIVE_CHAT'); },
    get ADMIN_SYSTEM() { return getPath('ADMIN_SYSTEM'); },
    get ADMIN_MENUS() { return getPath('ADMIN_MENUS'); },

    // System
    get BLOCKED() { return getPath('BLOCKED'); },
    get RESTRICTED() { return getPath('RESTRICTED'); }
};
