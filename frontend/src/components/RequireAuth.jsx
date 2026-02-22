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
        BECOME_CONTRIBUTOR: 'Become Contributor',
        OWNER_DASHBOARD: 'Dashboard',
        OWNER_PRODUCTS: 'Inventory',
        OWNER_CHATS: 'AI Audit Logs',
        OWNER_CHAT_ASSISTANT: 'Chat Assistant',
        OWNER_LIVE_SUPPORT: 'Live Support',
        OWNER_SETTINGS: 'Store Settings',
        OWNER_FACILITY_TASKS: 'Facility Tasks',
        OWNER_TEAM: 'Staff Management',
        OWNER_POS: 'POS System',
        OWNER_TRANSACTIONS: 'Transactions',
        OWNER_MEMBERS: 'Members',
        OWNER_REPORTS: 'Sales Reports',
        OWNER_REWARDS: 'Loyalty Rewards',
        OWNER_POS_SETTINGS: 'Point Rules',
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

    // Check if current menu is individually disabled
    // Core Owner menus should never be locked, only POS and extended features
    const coreOwnerMenus = [
        'OWNER_DASHBOARD', 'OWNER_PRODUCTS', 'OWNER_CHATS', 'OWNER_CHAT_ASSISTANT',
        'OWNER_LIVE_SUPPORT', 'OWNER_SETTINGS', 'OWNER_FACILITY_TASKS', 'OWNER_TEAM', 'OWNER_PROFILE'
    ];

    if (currentMenu && user.disabledMenus?.includes(internalId) && !coreOwnerMenus.includes(internalId)) {
        return <Navigate to={`${PATHS.RESTRICTED}?menu=${encodeURIComponent(currentMenu)}`} replace />;
    }

    // Special Case: If any POS-related menu is accessed, and BOTH the parent "OWNER_POS_SYSTEM" 
    // AND the specific menu are disabled, block it. This allows individual POS menus to be enabled.
    const posMenuMapping = {
        'POS System': 'OWNER_POS',
        'Transactions': 'OWNER_TRANSACTIONS',
        'Members': 'OWNER_MEMBERS',
        'Sales Reports': 'OWNER_REPORTS',
        'Loyalty Rewards': 'OWNER_REWARDS',
        'Health Intel': 'OWNER_HEALTH'
    };

    const posMenus = ['POS System', 'Transactions', 'Members', 'Sales Reports', 'Loyalty Rewards', 'Health Intel'];
    if (posMenus.includes(currentMenu)) {
        const specificMenuId = posMenuMapping[currentMenu];
        // Block only if BOTH parent system is disabled AND this specific menu is disabled
        if (user.disabledMenus?.includes('OWNER_POS_SYSTEM') && user.disabledMenus?.includes(specificMenuId)) {
            return <Navigate to={`${PATHS.RESTRICTED}?menu=${encodeURIComponent('POS System')}`} replace />;
        }
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // User is logged in but doesn't have permission for this specific route
        return <Navigate to="/404" replace />;
    }

    return children;
};

export default RequireAuth;
