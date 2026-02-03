import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Landing from './Landing.jsx';
import Login from './Login.jsx';
import Register from './Register.jsx';
import Dashboard from './owner/Dashboard.jsx';
import Products from './owner/Products.jsx';
import ChatHistory from './owner/ChatHistory.jsx';
import RequireAuth from '../components/RequireAuth.jsx';
import OwnerLayout from '../layouts/OwnerLayout.jsx';
import OwnerLiveSupport from './owner/OwnerLiveSupport.jsx';
import UserLayout from '../layouts/UserLayout.jsx';
import UserDashboard from './user/UserDashboard.jsx';
import History from './user/History.jsx';
import Wallet from './user/Wallet.jsx';
import ShoppingList from './user/ShoppingList.jsx';
import ChatView from '../components/ChatView.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';
import AdminDashboard from './admin/Dashboard.jsx';
import StoreApproval from './admin/StoreApproval.jsx';
import MissingRequests from './admin/MissingRequests.jsx';
import SystemConfig from './admin/SystemConfig.jsx';
import Profile from './Profile.jsx';
import StoreSettings from './owner/StoreSettings.jsx';
import MenuManagement from './admin/MenuManagement.jsx';
import AccessBlocked from './AccessBlocked.jsx';
import MenuRestricted from './MenuRestricted.jsx';
import LiveChatConfig from './admin/LiveChatConfig.jsx';


import StoreChat from './StoreChat.jsx';
import { DisabilityProvider } from '../context/DisabilityContext.jsx';
import { ToastProvider } from '../context/ToastContext.jsx';
import ConsentModal from '../components/ConsentModal.jsx';
import { PATHS } from '../routes/paths.js';

import { decode } from '../routes/obfuscator.js';

const SecureGateway = () => {
  const { pathname } = useLocation();
  const internalId = decode(pathname);

  if (!internalId) {
    return <Navigate to="/" replace />;
  }

  // Common Layout Wrappers
  const withUser = (Component) => <RequireAuth allowedRoles={['USER']}><UserLayout><Component /></UserLayout></RequireAuth>;
  const withOwner = (Component) => <RequireAuth allowedRoles={['OWNER']}><OwnerLayout><Component /></OwnerLayout></RequireAuth>;
  const withAdmin = (Component) => <RequireAuth allowedRoles={['ADMIN']}><AdminLayout><Component /></AdminLayout></RequireAuth>;

  switch (internalId) {
    case 'LOGIN': return <Login />;
    case 'REGISTER': return <Register />;

    // User
    case 'USER_DASHBOARD': return withUser(UserDashboard);
    case 'USER_HISTORY': return withUser(History);
    case 'USER_WALLET': return withUser(Wallet);
    case 'USER_SHOPPING_LIST': return withUser(ShoppingList);
    case 'USER_PROFILE': return withUser(Profile);

    // Owner
    case 'OWNER_DASHBOARD': return withOwner(Dashboard);
    case 'OWNER_PRODUCTS': return withOwner(Products);
    case 'OWNER_CHATS': return withOwner(ChatHistory);
    case 'OWNER_CHAT_ASSISTANT': return withOwner(ChatView);
    case 'OWNER_LIVE_SUPPORT': return withOwner(OwnerLiveSupport);
    case 'OWNER_SETTINGS': return withOwner(StoreSettings);
    case 'OWNER_PROFILE': return withOwner(Profile);

    // Admin
    case 'ADMIN_DASHBOARD': return withAdmin(AdminDashboard);
    case 'ADMIN_STORES': return withAdmin(StoreApproval);
    case 'ADMIN_MISSING': return withAdmin(MissingRequests);
    case 'ADMIN_LIVE_CHAT': return withAdmin(LiveChatConfig);
    case 'ADMIN_SYSTEM': return withAdmin(SystemConfig);
    case 'ADMIN_MENUS': return withAdmin(MenuManagement);

    // System
    case 'BLOCKED': return <AccessBlocked />;
    case 'RESTRICTED': return <MenuRestricted />;

    default: return <Navigate to="/" replace />;
  }
};

function App() {
  return (
    <ToastProvider>
      <DisabilityProvider>
        <ConsentModal />
        <Router>
          <Routes>
            {/* Public Entry Points */}
            <Route path="/" element={<Landing />} />

            {/* The Secure Gateway - Handles all obfuscated URLs */}
            <Route path="/v-gate/*" element={<SecureGateway />} />

            {/* Dynamic Store Shop Chat Link - REMAINS READABLE */}
            <Route path="/:ownerDomain" element={<StoreChat />} />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </DisabilityProvider>
    </ToastProvider>
  );
}

export default App;
