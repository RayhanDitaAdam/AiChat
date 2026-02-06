import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './Landing.jsx';
import Login from './Login.jsx';
import Register from './Register.jsx';
import Dashboard from './owner/Dashboard.jsx';
import Products from './owner/Products.jsx';
import ChatHistory from './owner/ChatHistory.jsx';
import RequireAuth from '../components/RequireAuth.jsx';
import OwnerLayout from '../layouts/OwnerLayout.jsx';
import OwnerLiveSupport from './owner/OwnerLiveSupport.jsx';
import ManageTasks from './owner/ManageTasks.jsx';
import StaffManagement from './owner/StaffManagement.jsx';
import UserLayout from '../layouts/UserLayout.jsx';
import UserDashboard from './user/UserDashboard.jsx';
import History from './user/History.jsx';
import Wallet from './user/Wallet.jsx';
import ShoppingList from './user/ShoppingList.jsx';
import TaskReporting from './user/TaskReporting.jsx';
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
import VerifyEmail from './VerifyEmail.jsx';
import GitHubCallback from './GitHubCallback.jsx';
import SelectStore from './SelectStore.jsx';


import StoreChat from './StoreChat.jsx';
import { DisabilityProvider } from '../context/DisabilityContext.jsx';
import { ToastProvider } from '../context/ToastContext.jsx';
import ConsentModal from '../components/ConsentModal.jsx';
import { PATHS } from '../routes/paths.js';



// Common Layout Wrappers
const withUser = (Component) => (
  <RequireAuth allowedRoles={['USER', 'STAFF']}>
    <UserLayout>
      <Component />
    </UserLayout>
  </RequireAuth>
);

const withStaff = (Component) => (
  <RequireAuth allowedRoles={['STAFF']}>
    <UserLayout>
      <Component />
    </UserLayout>
  </RequireAuth>
);

const withOwner = (Component) => (
  <RequireAuth allowedRoles={['OWNER']}>
    <OwnerLayout>
      <Component />
    </OwnerLayout>
  </RequireAuth>
);

const withAdmin = (Component) => (
  <RequireAuth allowedRoles={['ADMIN']}>
    <AdminLayout>
      <Component />
    </AdminLayout>
  </RequireAuth>
);

function App() {
  return (
    <ToastProvider>
      <DisabilityProvider>
        <ConsentModal />
        <Router>
          <Routes>
            {/* Public Entry Points */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/auth/github/callback" element={<GitHubCallback />} />

            {/* User & Staff Routes */}
            <Route path="/dashboard" element={withUser(UserDashboard)} />
            <Route path="/history" element={withUser(History)} />
            <Route path="/wallet" element={withUser(Wallet)} />
            <Route path="/shopping-list" element={withUser(ShoppingList)} />
            <Route path="/task-reporting" element={withStaff(TaskReporting)} />
            <Route path="/profile" element={withUser(Profile)} />
            <Route path={PATHS.SELECT_STORE} element={withUser(SelectStore)} />

            {/* Owner Routes */}
            <Route path="/owner/dashboard" element={withOwner(Dashboard)} />
            <Route path="/owner/inventory" element={withOwner(Products)} />
            <Route path="/owner/audit-logs" element={withOwner(ChatHistory)} />
            <Route path="/owner/chat-assistant" element={withOwner(ChatView)} />
            <Route path="/owner/live-support" element={withOwner(OwnerLiveSupport)} />
            <Route path="/owner/settings" element={withOwner(StoreSettings)} />
            <Route path="/owner/facility-tasks" element={withOwner(ManageTasks)} />
            <Route path="/owner/team" element={withOwner(StaffManagement)} />
            <Route path="/owner/profile" element={withOwner(Profile)} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={withAdmin(AdminDashboard)} />
            <Route path="/admin/stores" element={withAdmin(StoreApproval)} />
            <Route path="/admin/missing-requests" element={withAdmin(MissingRequests)} />
            <Route path="/admin/live-chat" element={withAdmin(LiveChatConfig)} />
            <Route path="/admin/system" element={withAdmin(SystemConfig)} />
            <Route path="/admin/menus" element={withAdmin(MenuManagement)} />

            {/* System Routes */}
            <Route path="/blocked" element={<AccessBlocked />} />
            <Route path="/restricted" element={<MenuRestricted />} />

            {/* Legacy Gateway Redirect */}
            <Route path="/v-gate/*" element={<Navigate to="/" replace />} />

            {/* Dynamic Store Shop Chat Link */}
            <Route path="/:ownerDomain" element={<StoreChat />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </DisabilityProvider>
    </ToastProvider>
  );
}

export default App;
