import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './Landing.jsx';
import Login from './Login.jsx';
import Register from './Register.jsx';
import RequireAuth from '../components/RequireAuth.jsx';
import ManagementLayout from '../layouts/ManagementLayout.jsx';
import ManagementDashboard from './ManagementDashboard.jsx';
import OwnerLiveSupport from './owner/OwnerLiveSupport.jsx';
import Products from './owner/Products.jsx';
import ChatHistory from './owner/ChatHistory.jsx';
import ManageTasks from './owner/ManageTasks.jsx';
import StaffManagement from './owner/StaffManagement.jsx';
import OwnerContributors from './owner/OwnerContributors.jsx';
import POSPage from './owner/POS/POS.jsx';
import MembersPage from './owner/POS/Members.jsx';
import ReportsPage from './owner/POS/Reports.jsx';
import TransactionsPage from './owner/POS/Transactions.jsx';
import RewardsPage from './owner/POS/Rewards.jsx';
import POSSettings from './owner/POS/POSSettings.jsx';
import ManageJobs from './owner/ManageJobs.jsx';
import ManageRaksLorongs from './owner/ManageRaksLorongs.jsx';
import SOPManagement from './owner/SOPManagement.jsx';
import ManageExpiry from './owner/ManageExpiry.jsx';
import WorkshopCheckIn from './owner/workshop/CheckIn.jsx';
import WorkOrderQueue from './owner/workshop/WorkOrderQueue.jsx';
import WorkshopServiceHistory from './owner/workshop/ServiceHistory.jsx';
import WorkshopBilling from './owner/workshop/Billing.jsx';
import WorkshopMechanics from './owner/workshop/Mechanics.jsx';
import WorkshopAttendance from './owner/workshop/Attendance.jsx';
import WorkshopCommission from './owner/workshop/Commission.jsx';
import WorkshopSuppliers from './owner/workshop/Suppliers.jsx';
import WorkshopOperations from './owner/workshop/WorkshopOperations.jsx';
import WorkshopHR from './owner/workshop/WorkshopHR.jsx';
import TeamManagementSuite from './owner/TeamManagementSuite.jsx';
import JobMarket from './user/JobMarket.jsx';
import UserLayout from '../layouts/UserLayout.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';
import UserDashboard from './user/UserDashboard.jsx';
import History from './user/History.jsx';
import Wallet from './user/Wallet.jsx';
import ShoppingList from './user/ShoppingList.jsx';
import TaskReporting from './user/TaskReporting.jsx';
import HealthPage from './user/Health.jsx';
import ChatView from '../components/ChatView.jsx';
import AdminDashboard from './admin/Dashboard.jsx';
import AdminOverview from './admin/AdminOverview.jsx';
import StoreApproval from './admin/StoreApproval.jsx';
import MissingRequests from './admin/MissingRequests.jsx';
import SystemConfig from './admin/SystemConfig.jsx';
import BrandingCMS from './admin/BrandingCMS.jsx';
import ContributorReports from './contributor/ContributorReports.jsx';
import ContributorLiveSupport from './contributor/ContributorLiveSupport.jsx';
import AccountOwners from './admin/AccountOwners.jsx';
import Profile from './Profile.jsx';
import ChangePassword from './ChangePassword.jsx';
import StoreSettings from './owner/StoreSettings.jsx';
import SuperAdminDashboard from './admin/SuperAdminDashboard.jsx';
import AITraining from './admin/AITraining.jsx';
import KnowledgeBase from './admin/KnowledgeBase.jsx';
import IntentManager from './admin/IntentManager.jsx';
import ConversationLogs from './admin/ConversationLogs.jsx';
import SuperAdminLogin from './SuperAdminLogin.jsx';

import AccessBlocked from './AccessBlocked.jsx';
import MenuRestricted from './MenuRestricted.jsx';
import LiveChatConfig from './admin/LiveChatConfig.jsx';
import VerifyEmail from './VerifyEmail.jsx';
import ForgotPassword from './ForgotPassword.jsx';
import ResetPassword from './ResetPassword.jsx';
import GitHubCallback from './GitHubCallback.jsx';
import SelectStore from './SelectStore.jsx';
import LiveSupport from './user/LiveSupport.jsx';
import ContributorRequest from './user/ContributorRequest.jsx';
import ContributorAuditLogs from './contributor/ContributorAuditLogs.jsx';
import OwnerContributorProducts from './owner/OwnerContributorProducts.jsx';
import NotFound from './NotFound.jsx';
import ContributorChat from './contributor/ContributorChat.jsx';
import PrivacyPolicy from './PrivacyPolicy.jsx';


import StoreChat from './StoreChat.jsx';
import DisabilityPage from './DisabilityPage.jsx';
import { DisabilityProvider } from '../context/DisabilityContext.jsx';
import { ToastProvider } from '../context/ToastContext.jsx';
import ConsentModal from '../components/ConsentModal.jsx';
import { PATHS } from '../routes/paths.js';
import { useUser } from '../context/useUser';



// Common Layout Wrappers
const RoleBasedLayout = ({ children }) => {
  const { user } = useUser();

  if (!user) return <UserLayout>{children}</UserLayout>;

  switch (user.role) {
    case 'CONTRIBUTOR':
    case 'STAFF':
      return <ManagementLayout>{children}</ManagementLayout>;
    case 'OWNER':
      // Owners might prefer OwnerLayout even on user pages, or UserLayout. 
      // User requested Contributor to be like User+, so let's keep Owner as is for now or use OwnerLayout.
      return <UserLayout>{children}</UserLayout>;
    case 'ADMIN':
    case 'SUPER_ADMIN':
      return <AdminLayout>{children}</AdminLayout>;
    default:
      return <UserLayout>{children}</UserLayout>;
  }
};

const withUser = (Component) => (
  <RequireAuth allowedRoles={['USER', 'STAFF', 'CONTRIBUTOR', 'OWNER', 'ADMIN']}>
    <RoleBasedLayout>
      <Component />
    </RoleBasedLayout>
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
  <RequireAuth allowedRoles={['OWNER', 'STAFF']}>
    <ManagementLayout>
      <Component />
    </ManagementLayout>
  </RequireAuth>
);

const withManagement = (Component) => (
  <RequireAuth allowedRoles={['OWNER', 'CONTRIBUTOR', 'STAFF']}>
    <ManagementLayout>
      <Component />
    </ManagementLayout>
  </RequireAuth>
);

const withAdmin = (Component) => (
  <RequireAuth allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
    <AdminLayout>
      <Component />
    </AdminLayout>
  </RequireAuth>
);

const withSuperAdmin = (Component) => (
  <RequireAuth allowedRoles={['SUPER_ADMIN']}>
    <AdminLayout>
      <Component />
    </AdminLayout>
  </RequireAuth>
);


const withContributor = (Component) => (
  <RequireAuth allowedRoles={['CONTRIBUTOR']}>
    <ManagementLayout>
      <Component />
    </ManagementLayout>
  </RequireAuth>
);

const CatchAllRedirect = () => {
  const { user, isLoading } = useUser();
  if (isLoading) return null;
  if (!user) return <Navigate to={PATHS.LOGIN} replace />;

  switch (user.role) {
    case 'ADMIN': return <Navigate to={PATHS.ADMIN_DASHBOARD} replace />;
    case 'SUPER_ADMIN': return <Navigate to={PATHS.SUPER_ADMIN_DASHBOARD} replace />;
    case 'OWNER': {
      if (user?.owner?.businessCategory === 'AUTO_REPAIR') {
        return <Navigate to={PATHS.OWNER_WORKSHOP_CHECKIN} replace />;
      }
      return <Navigate to={PATHS.OWNER_DASHBOARD} replace />;
    }
    case 'CONTRIBUTOR': return <Navigate to={PATHS.CONTRIBUTOR_DASHBOARD} replace />;
    case 'STAFF': {
      if (user?.memberOf?.businessCategory === 'AUTO_REPAIR') {
        return <Navigate to={PATHS.STAFF_WORKSHOP_CHECKIN} replace />;
      }
      const isDashboardDisabled = user.disabledMenus?.includes('dashboard');
      if (!isDashboardDisabled) return <Navigate to={PATHS.STAFF_DASHBOARD} replace />;
      return <Navigate to={PATHS.STAFF_POS} replace />;
    }
    default: return <Navigate to={PATHS.USER_DASHBOARD} replace />;
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
            <Route path={PATHS.HOME} element={<Landing />} />
            <Route path={PATHS.LOGIN} element={<Login />} />
            <Route path={PATHS.SUPER_ADMIN_LOGIN} element={<SuperAdminLogin />} />
            <Route path={PATHS.REGISTER} element={<Register />} />
            <Route path={PATHS.VERIFY_EMAIL} element={<VerifyEmail />} />
            <Route path={PATHS.FORGOT_PASSWORD} element={<ForgotPassword />} />
            <Route path={PATHS.RESET_PASSWORD} element={<ResetPassword />} />
            <Route path="/auth/github/callback" element={<GitHubCallback />} />
            <Route path={PATHS.PRIVACY_POLICY} element={<PrivacyPolicy />} />

            {/* User & Staff Routes */}
            <Route path={PATHS.USER_DASHBOARD} element={withUser(UserDashboard)} />
            <Route path={PATHS.USER_LIVE_SUPPORT} element={withUser(LiveSupport)} />
            <Route path={PATHS.USER_HISTORY} element={withUser(History)} />
            <Route path={PATHS.USER_WALLET} element={withUser(Wallet)} />
            <Route path={PATHS.USER_SHOPPING_LIST} element={withUser(ShoppingList)} />
            <Route path={PATHS.USER_FACILITY_TASKS} element={withStaff(TaskReporting)} />
            <Route path={PATHS.USER_HEALTH} element={withUser(HealthPage)} />
            <Route path={PATHS.USER_PROFILE} element={withUser(Profile)} />
            <Route path={PATHS.USER_CHANGE_PASSWORD} element={withUser(ChangePassword)} />
            <Route path={PATHS.USER_VACANCIES} element={withUser(JobMarket)} />
            <Route path={PATHS.BECOME_CONTRIBUTOR} element={withUser(ContributorRequest)} />
            <Route path={PATHS.SELECT_STORE} element={withUser(SelectStore)} />

            {/* Owner & Contributor Routes */}
            <Route path={PATHS.OWNER_DASHBOARD} element={withManagement(ManagementDashboard)} />
            <Route path={PATHS.OWNER_PRODUCTS} element={withManagement(Products)} />
            <Route path={`${PATHS.OWNER_PRODUCTS}/:category`} element={withManagement(Products)} />
            <Route path={PATHS.OWNER_CONTRIBUTORS} element={withOwner(OwnerContributors)} />
            <Route path={PATHS.OWNER_CONTRIBUTOR_PRODUCTS} element={withOwner(OwnerContributorProducts)} />
            <Route path={PATHS.OWNER_CHATS} element={withManagement(ChatHistory)} />
            <Route path={PATHS.OWNER_CHAT_ASSISTANT} element={withManagement(ChatView)} />
            <Route path={PATHS.OWNER_LIVE_SUPPORT} element={withManagement(OwnerLiveSupport)} />
            <Route path={PATHS.OWNER_SETTINGS} element={withOwner(StoreSettings)} />
            <Route path={PATHS.OWNER_FACILITY_TASKS} element={withOwner(ManageTasks)} />
            <Route path={PATHS.OWNER_TEAM} element={<Navigate to={`${PATHS.OWNER_TEAM_SUITE}?tab=staff`} replace />} />
            <Route path={PATHS.OWNER_TEAM_SUITE} element={withOwner(TeamManagementSuite)} />
            <Route path={PATHS.OWNER_CONTRIBUTORS} element={<Navigate to={`${PATHS.OWNER_TEAM_SUITE}?tab=contributors`} replace />} />
            <Route path={PATHS.OWNER_POS} element={withOwner(POSPage)} />
            <Route path={PATHS.OWNER_TRANSACTIONS} element={withOwner(TransactionsPage)} />
            <Route path={PATHS.OWNER_MEMBERS} element={withOwner(MembersPage)} />
            <Route path={PATHS.OWNER_REPORTS} element={withManagement(ReportsPage)} />
            <Route path={PATHS.OWNER_REWARDS} element={withManagement(RewardsPage)} />
            <Route path={PATHS.OWNER_POS_SETTINGS} element={withOwner(POSSettings)} />
            <Route path={PATHS.OWNER_VACANCIES} element={withOwner(ManageJobs)} />
            <Route path={PATHS.OWNER_RAK_LORONG} element={withManagement(ManageRaksLorongs)} />
            <Route path={PATHS.OWNER_SOP} element={withOwner(SOPManagement)} />
            <Route path={PATHS.OWNER_EXPIRY} element={withManagement(ManageExpiry)} />

            {/* Workshop (Bengkel) Routes */}
            <Route path={PATHS.OWNER_WORKSHOP_CHECKIN} element={withOwner(WorkshopCheckIn)} />
            <Route path={PATHS.OWNER_WORKSHOP_QUEUE} element={withOwner(WorkOrderQueue)} />
            <Route path={PATHS.OWNER_WORKSHOP_HISTORY} element={withOwner(WorkshopServiceHistory)} />
            <Route path={PATHS.OWNER_WORKSHOP_BILLING} element={withOwner(WorkshopBilling)} />
            <Route path={PATHS.OWNER_WORKSHOP_MECHANICS} element={withOwner(WorkshopMechanics)} />
            <Route path={PATHS.OWNER_WORKSHOP_ATTENDANCE} element={withOwner(WorkshopAttendance)} />
            <Route path={PATHS.OWNER_WORKSHOP_COMMISSION} element={withOwner(WorkshopCommission)} />
            <Route path={PATHS.OWNER_WORKSHOP_SUPPLIERS} element={withOwner(WorkshopSuppliers)} />
            <Route path={PATHS.OWNER_WORKSHOP_SETTINGS} element={<Navigate to={PATHS.OWNER_SETTINGS} replace />} />

            <Route path={PATHS.OWNER_PROFILE} element={withManagement(Profile)} />
            <Route path={PATHS.OWNER_CHANGE_PASSWORD} element={withManagement(ChangePassword)} />

            {/* Staff Routes */}
            <Route path={PATHS.STAFF_DASHBOARD} element={withManagement(ManagementDashboard)} />
            <Route path={PATHS.STAFF_PRODUCTS} element={withManagement(Products)} />
            <Route path={`${PATHS.STAFF_PRODUCTS}/:category`} element={withManagement(Products)} />
            <Route path={PATHS.STAFF_CONTRIBUTORS} element={withOwner(OwnerContributors)} />
            <Route path={PATHS.STAFF_CONTRIBUTOR_PRODUCTS} element={withOwner(OwnerContributorProducts)} />
            <Route path={PATHS.STAFF_CHATS} element={withManagement(ChatHistory)} />
            <Route path={PATHS.STAFF_CHAT_ASSISTANT} element={withManagement(ChatView)} />
            <Route path={PATHS.STAFF_LIVE_SUPPORT} element={withManagement(OwnerLiveSupport)} />
            <Route path={PATHS.STAFF_SETTINGS} element={withOwner(StoreSettings)} />
            <Route path={PATHS.STAFF_FACILITY_TASKS} element={withOwner(ManageTasks)} />
            <Route path={PATHS.STAFF_TEAM} element={withOwner(StaffManagement)} />
            <Route path={PATHS.STAFF_POS} element={withOwner(POSPage)} />
            <Route path={PATHS.STAFF_TRANSACTIONS} element={withOwner(TransactionsPage)} />
            <Route path={PATHS.STAFF_MEMBERS} element={withOwner(MembersPage)} />
            <Route path={PATHS.STAFF_REPORTS} element={withManagement(ReportsPage)} />
            <Route path={PATHS.STAFF_REWARDS} element={withManagement(RewardsPage)} />
            <Route path={PATHS.STAFF_POS_SETTINGS} element={withOwner(POSSettings)} />
            <Route path={PATHS.STAFF_VACANCIES} element={withOwner(ManageJobs)} />
            <Route path={PATHS.STAFF_RAK_LORONG} element={withManagement(ManageRaksLorongs)} />
            <Route path={PATHS.STAFF_SOP} element={withOwner(SOPManagement)} />
            <Route path={PATHS.STAFF_EXPIRY} element={withManagement(ManageExpiry)} />

            {/* Workshop (Bengkel) Staff Routes */}
            <Route path={PATHS.STAFF_WORKSHOP_CHECKIN} element={withOwner(WorkshopCheckIn)} />
            <Route path={PATHS.STAFF_WORKSHOP_QUEUE} element={withOwner(WorkOrderQueue)} />
            <Route path={PATHS.STAFF_WORKSHOP_HISTORY} element={withOwner(WorkshopServiceHistory)} />
            <Route path={PATHS.STAFF_WORKSHOP_BILLING} element={withOwner(WorkshopBilling)} />
            <Route path={PATHS.STAFF_WORKSHOP_MECHANICS} element={withOwner(WorkshopMechanics)} />
            <Route path={PATHS.STAFF_WORKSHOP_ATTENDANCE} element={withOwner(WorkshopAttendance)} />
            <Route path={PATHS.STAFF_WORKSHOP_COMMISSION} element={withOwner(WorkshopCommission)} />
            <Route path={PATHS.STAFF_WORKSHOP_SUPPLIERS} element={withOwner(WorkshopSuppliers)} />

            <Route path={PATHS.STAFF_PROFILE} element={withManagement(Profile)} />
            <Route path={PATHS.STAFF_CHANGE_PASSWORD} element={withManagement(ChangePassword)} />

            {/* Contributor Specific Routes */}
            <Route path={PATHS.CONTRIBUTOR_DASHBOARD} element={withManagement(ManagementDashboard)} />
            <Route path={PATHS.CONTRIBUTOR_CHAT} element={withContributor(ContributorChat)} />
            <Route path={PATHS.CONTRIBUTOR_PRODUCTS} element={withManagement(Products)} />
            <Route path={PATHS.CONTRIBUTOR_CHATS} element={withManagement(ChatHistory)} />
            <Route path={PATHS.CONTRIBUTOR_AUDIT_LOGS} element={withContributor(ContributorAuditLogs)} />
            <Route path={PATHS.CONTRIBUTOR_REPORTS} element={withContributor(ContributorReports)} />
            <Route path={PATHS.CONTRIBUTOR_LIVE_SUPPORT} element={withManagement(ContributorLiveSupport)} />
            <Route path={PATHS.CONTRIBUTOR_PROFILE} element={withManagement(Profile)} />
            <Route path={PATHS.CONTRIBUTOR_CHANGE_PASSWORD} element={withManagement(ChangePassword)} />

            {/* Admin Routes */}
            <Route path={PATHS.ADMIN_DASHBOARD} element={withAdmin(AdminOverview)} />
            <Route path={PATHS.ADMIN_ANALYTICS} element={withAdmin(AdminDashboard)} />
            <Route path={PATHS.ADMIN_STORES} element={withAdmin(StoreApproval)} />
            <Route path={PATHS.ADMIN_MISSING} element={withAdmin(MissingRequests)} />
            <Route path={PATHS.ADMIN_LIVE_CHAT} element={withAdmin(LiveChatConfig)} />
            <Route path={PATHS.ADMIN_SYSTEM} element={withAdmin(SystemConfig)} />
            <Route path={PATHS.SUPER_ADMIN_BRANDING} element={withSuperAdmin(BrandingCMS)} />
            <Route path={PATHS.ADMIN_ACCOUNT_OWNERS} element={withAdmin(AccountOwners)} />
            <Route path={PATHS.SUPER_ADMIN_DASHBOARD} element={withSuperAdmin(SuperAdminDashboard)} />

            {/* AI Owner Control Center Routes */}
            <Route path={PATHS.OWNER_AI_TRAINING} element={withOwner(AITraining)} />
            <Route path={PATHS.OWNER_AI_KNOWLEDGE} element={withOwner(KnowledgeBase)} />
            <Route path={PATHS.OWNER_AI_INTENTS} element={withOwner(IntentManager)} />
            <Route path={PATHS.OWNER_AI_LOGS} element={withOwner(ConversationLogs)} />


            {/* System Routes */}
            <Route path={PATHS.BLOCKED} element={<AccessBlocked />} />
            <Route path={PATHS.RESTRICTED} element={<MenuRestricted />} />
            <Route path="/404" element={<NotFound />} />

            {/* Legacy Gateway Redirect */}
            <Route path="/v-gate/*" element={<Navigate to={PATHS.HOME} replace />} />

            {/* Disability Mode - Public, No Login Required */}
            <Route path="/disability" element={<DisabilityPage />} />

            {/* Dynamic Store Shop Chat Link */}
            <Route path="/:ownerDomain" element={<StoreChat />} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </DisabilityProvider>
    </ToastProvider>
  );
}

export default App;
