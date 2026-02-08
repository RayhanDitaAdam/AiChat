import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/useUser';
import { PATHS } from '../routes/paths.js';
import { decode } from '../routes/obfuscator.js';
import ProgressBar from './ProgressBar.jsx';

const RequireAuth = ({ children, allowedRoles }) => {
    const { user, isLoading } = useUser();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
                <div className="max-w-xs w-full text-center">
                    <p className="text-sm font-medium text-slate-500 mb-2">Authenticating session...</p>
                    <ProgressBar targetWidth="100%" />
                </div>
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
        USER_FACILITY_TASKS: 'Task Reporting',
        USER_PROFILE: 'Profile',
        OWNER_DASHBOARD: 'Dashboard',
        OWNER_PRODUCTS: 'Inventory',
        OWNER_CHATS: 'AI Audit Logs',
        OWNER_CHAT_ASSISTANT: 'Chat Assistant',
        OWNER_LIVE_SUPPORT: 'Live Support',
        OWNER_SETTINGS: 'Store Settings',
        OWNER_FACILITY_TASKS: 'Facility Tasks',
        OWNER_TEAM: 'Staff Management',
        OWNER_POS: 'POS System',
        OWNER_MEMBERS: 'Members',
        OWNER_REPORTS: 'Sales Reports',
        OWNER_REWARDS: 'Loyalty Rewards',
        OWNER_HEALTH: 'Health Intel',
        OWNER_PROFILE: 'Profile',
        ADMIN_DASHBOARD: 'Analytics',
        ADMIN_STORES: 'Stores & Approval',
        ADMIN_MISSING: 'Missing Requests',
        ADMIN_SYSTEM: 'System Config',
        ADMIN_MENUS: 'Menu Management',
    };

    const internalId = decode(location.pathname);
    let currentMenu = menuMapping[internalId];

    // Special Case: If any POS-related menu is accessed, and "POS System" is disabled, block it.
    const posMenus = ['POS System', 'Members', 'Sales Reports', 'Loyalty Rewards', 'Health Intel'];
    if (posMenus.includes(currentMenu) && user.disabledMenus?.includes('POS System')) {
        return <Navigate to={`${PATHS.RESTRICTED}?menu=${encodeURIComponent('POS System')}`} replace />;
    }

    if (currentMenu && user.disabledMenus?.includes(currentMenu)) {
        return <Navigate to={`${PATHS.RESTRICTED}?menu=${encodeURIComponent(currentMenu)}`} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // User is logged in but doesn't have permission
        if (user.role === 'ADMIN') return <Navigate to={PATHS.ADMIN_DASHBOARD} replace />;
        if (user.role === 'OWNER') return <Navigate to={PATHS.OWNER_DASHBOARD} replace />;
        if (user.role === 'STAFF') return <Navigate to={PATHS.USER_FACILITY_TASKS} replace />;
        return <Navigate to={PATHS.USER_DASHBOARD} replace />;
    }

    return children;
};

export default RequireAuth;
