import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/useUser';
import { PATHS } from '../routes/paths.js';
import { decode } from '../routes/obfuscator.js';

const RequireAuth = ({ children, allowedRoles }) => {
    const { user, isLoading } = useUser();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to={PATHS.LOGIN} state={{ from: location }} replace />;
    }

    if (user.isBlocked) {
        return <Navigate to={PATHS.BLOCKED} replace />;
    }

    // Role-to-Menu Mapping for URL protection
    const menuMapping = {
        USER_DASHBOARD: 'Chat Assistant',
        USER_HISTORY: 'Shopping Queue',
        USER_WALLET: 'Wallet',
        USER_SHOPPING_LIST: 'Shopping List',
        USER_PROFILE: 'Profile',
        OWNER_DASHBOARD: 'Dashboard',
        OWNER_PRODUCTS: 'Inventory',
        OWNER_CHATS: 'AI Audit Logs',
        OWNER_CHAT_ASSISTANT: 'Chat Assistant',
        OWNER_LIVE_SUPPORT: 'Live Support',
        OWNER_SETTINGS: 'Store Settings',
        OWNER_PROFILE: 'Profile',
        ADMIN_DASHBOARD: 'Analytics',
        ADMIN_STORES: 'Stores & Approval',
        ADMIN_MISSING: 'Missing Requests',
        ADMIN_SYSTEM: 'System Config',
        ADMIN_MENUS: 'Menu Management',
    };

    const internalId = decode(location.pathname);
    const currentMenu = menuMapping[internalId];
    if (currentMenu && user.disabledMenus?.includes(currentMenu)) {
        return <Navigate to={`${PATHS.RESTRICTED}?menu=${encodeURIComponent(currentMenu)}`} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // User is logged in but doesn't have permission
        if (user.role === 'ADMIN') return <Navigate to={PATHS.ADMIN_DASHBOARD} replace />;
        if (user.role === 'OWNER') return <Navigate to={PATHS.OWNER_DASHBOARD} replace />;
        return <Navigate to={PATHS.USER_DASHBOARD} replace />;
    }

    return children;
};

export default RequireAuth;
