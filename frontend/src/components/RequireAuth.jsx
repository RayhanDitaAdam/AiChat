import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/useUser';

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
        // Redirect them to the /login page, but save the current location they were
        // trying to go to when they were redirected. This allows us to send them
        // along to that page after they login, which is a nicer user experience.
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user.isBlocked) {
        return <Navigate to="/blocked" replace />;
    }

    // Role-to-Menu Mapping for URL protection
    const menuMapping = {
        '/chat': 'Chat Assistant',
        '/history': 'Shopping Queue',
        '/wallet': 'Wallet',
        '/shopping-list': 'Shopping List',
        '/profile': 'Profile',
        '/owner': 'Dashboard',
        '/owner/products': 'Inventory',
        '/owner/chats': 'AI Audit Logs',
        '/owner/chat': 'Chat Assistant',
        '/owner/live-support': 'Live Support',
        '/owner/store-settings': 'Store Settings',
        '/owner/profile': 'Profile',
        '/admin': 'Analytics',
        '/admin/stores': 'Stores & Approval',
        '/admin/missing': 'Missing Requests',
        '/admin/config': 'System Config',
        '/admin/menus': 'Menu Management',
    };

    const currentMenu = menuMapping[location.pathname];
    if (currentMenu && user.disabledMenus?.includes(currentMenu)) {
        return <Navigate to={`/restricted?menu=${encodeURIComponent(currentMenu)}`} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // User is logged in but doesn't have permission
        if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
        if (user.role === 'OWNER') return <Navigate to="/owner" replace />;
        return <Navigate to="/chat" replace />;
    }

    return children;
};

export default RequireAuth;
