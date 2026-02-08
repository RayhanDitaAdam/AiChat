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
import POSPage from './owner/POS/POS.jsx';
import MembersPage from './owner/POS/Members.jsx';
import ReportsPage from './owner/POS/Reports.jsx';
import RewardsPage from './owner/POS/Rewards.jsx';
import UserLayout from '../layouts/UserLayout.jsx';
import UserDashboard from './user/UserDashboard.jsx';
import History from './user/History.jsx';
import Wallet from './user/Wallet.jsx';
import ShoppingList from './user/ShoppingList.jsx';
import TaskReporting from './user/TaskReporting.jsx';
import HealthPage from './user/Health.jsx';
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
            <Route path={PATHS.HOME} element={<Landing />} />
            <Route path={PATHS.LOGIN} element={<Login />} />
            <Route path={PATHS.REGISTER} element={<Register />} />
            <Route path={PATHS.VERIFY_EMAIL} element={<VerifyEmail />} />
            <Route path="/auth/github/callback" element={<GitHubCallback />} />

            {/* User & Staff Routes */}
            <Route path={PATHS.USER_DASHBOARD} element={withUser(UserDashboard)} />
            <Route path={PATHS.USER_HISTORY} element={withUser(History)} />
            <Route path={PATHS.USER_WALLET} element={withUser(Wallet)} />
            <Route path={PATHS.USER_SHOPPING_LIST} element={withUser(ShoppingList)} />
            <Route path={PATHS.USER_FACILITY_TASKS} element={withStaff(TaskReporting)} />
            <Route path={PATHS.USER_HEALTH} element={withUser(HealthPage)} />
            <Route path={PATHS.USER_PROFILE} element={withUser(Profile)} />
            <Route path={PATHS.SELECT_STORE} element={withUser(SelectStore)} />

            {/* Owner Routes */}
            <Route path={PATHS.OWNER_DASHBOARD} element={withOwner(Dashboard)} />
            <Route path={PATHS.OWNER_PRODUCTS} element={withOwner(Products)} />
            <Route path={PATHS.OWNER_CHATS} element={withOwner(ChatHistory)} />
            <Route path={PATHS.OWNER_CHAT_ASSISTANT} element={withOwner(ChatView)} />
            <Route path={PATHS.OWNER_LIVE_SUPPORT} element={withOwner(OwnerLiveSupport)} />
            <Route path={PATHS.OWNER_SETTINGS} element={withOwner(StoreSettings)} />
            <Route path={PATHS.OWNER_FACILITY_TASKS} element={withOwner(ManageTasks)} />
            <Route path={PATHS.OWNER_TEAM} element={withOwner(StaffManagement)} />
            <Route path={PATHS.OWNER_POS} element={withOwner(POSPage)} />
            <Route path={PATHS.OWNER_MEMBERS} element={withOwner(MembersPage)} />
            <Route path={PATHS.OWNER_REPORTS} element={withOwner(ReportsPage)} />
            <Route path={PATHS.OWNER_REWARDS} element={withOwner(RewardsPage)} />
            <Route path={PATHS.OWNER_HEALTH} element={withOwner(HealthPage)} />
            <Route path={PATHS.OWNER_PROFILE} element={withOwner(Profile)} />

            {/* Admin Routes */}
            <Route path={PATHS.ADMIN_DASHBOARD} element={withAdmin(AdminDashboard)} />
            <Route path={PATHS.ADMIN_STORES} element={withAdmin(StoreApproval)} />
            <Route path={PATHS.ADMIN_MISSING} element={withAdmin(MissingRequests)} />
            <Route path={PATHS.ADMIN_LIVE_CHAT} element={withAdmin(LiveChatConfig)} />
            <Route path={PATHS.ADMIN_SYSTEM} element={withAdmin(SystemConfig)} />
            <Route path={PATHS.ADMIN_MENUS} element={withAdmin(MenuManagement)} />

            {/* System Routes */}
            <Route path={PATHS.BLOCKED} element={<AccessBlocked />} />
            <Route path={PATHS.RESTRICTED} element={<MenuRestricted />} />

            {/* Legacy Gateway Redirect */}
            <Route path="/v-gate/*" element={<Navigate to={PATHS.HOME} replace />} />

            {/* Dynamic Store Shop Chat Link */}
            <Route path="/:ownerDomain" element={<StoreChat />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to={PATHS.HOME} replace />} />
          </Routes>
        </Router>
      </DisabilityProvider>
    </ToastProvider>
  );
}

export default App;
