import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
const ManagementLayout = lazy(() => import('../layouts/ManagementLayout.jsx'));
const UserLayout = lazy(() => import('../layouts/UserLayout.jsx'));
const AdminLayout = lazy(() => import('../layouts/AdminLayout.jsx'));

// Public Pages
import Landing from './Landing.jsx'; // Keep static for LCP
const Login = lazy(() => import('./Login.jsx'));
const Register = lazy(() => import('./Register.jsx'));
const VerifyEmail = lazy(() => import('./VerifyEmail.jsx'));
const ForgotPassword = lazy(() => import('./ForgotPassword.jsx'));
const ResetPassword = lazy(() => import('./ResetPassword.jsx'));
const SuperAdminLogin = lazy(() => import('./SuperAdminLogin.jsx'));
const PrivacyPolicy = lazy(() => import('./PrivacyPolicy.jsx'));
const GitHubCallback = lazy(() => import('./GitHubCallback.jsx'));

// User Pages
const UserDashboard = lazy(() => import('./user/UserDashboard.jsx'));
const LiveSupport = lazy(() => import('./user/LiveSupport.jsx'));
const History = lazy(() => import('./user/History.jsx'));
const Wallet = lazy(() => import('./user/Wallet.jsx'));
const ShoppingList = lazy(() => import('./user/ShoppingList.jsx'));
const HealthPage = lazy(() => import('./user/Health.jsx'));
const JobMarket = lazy(() => import('./user/JobMarket.jsx'));
const ContributorRequest = lazy(() => import('./user/ContributorRequest.jsx'));

// Owner/Staff Pages
const ManagementDashboard = lazy(() => import('./ManagementDashboard.jsx'));
const OwnerLiveSupport = lazy(() => import('./owner/OwnerLiveSupport.jsx'));
const Products = lazy(() => import('./owner/Products.jsx'));
const ChatHistory = lazy(() => import('./owner/ChatHistory.jsx'));
const ManageTasks = lazy(() => import('./owner/ManageTasks.jsx'));
const StaffManagement = lazy(() => import('./owner/StaffManagement.jsx'));
const OwnerContributors = lazy(() => import('./owner/OwnerContributors.jsx'));
const POSPage = lazy(() => import('./owner/POS/POS.jsx'));
const MembersPage = lazy(() => import('./owner/POS/Members.jsx'));
const ReportsPage = lazy(() => import('./owner/POS/Reports.jsx'));
const TransactionsPage = lazy(() => import('./owner/POS/Transactions.jsx'));
const RewardsPage = lazy(() => import('./owner/POS/Rewards.jsx'));
const POSSettings = lazy(() => import('./owner/POS/POSSettings.jsx'));
const ManageJobs = lazy(() => import('./owner/ManageJobs.jsx'));
const ManageRaksLorongs = lazy(() => import('./owner/ManageRaksLorongs.jsx'));
const SOPManagement = lazy(() => import('./owner/SOPManagement.jsx'));
const ManageExpiry = lazy(() => import('./owner/ManageExpiry.jsx'));
const TeamManagementSuite = lazy(() => import('./owner/TeamManagementSuite.jsx'));
const StoreSettings = lazy(() => import('./owner/StoreSettings.jsx'));

// Workshop Pages
const WorkshopCheckIn = lazy(() => import('./owner/workshop/CheckIn.jsx'));
const WorkOrderQueue = lazy(() => import('./owner/workshop/WorkOrderQueue.jsx'));
const WorkshopServiceHistory = lazy(() => import('./owner/workshop/ServiceHistory.jsx'));
const WorkshopBilling = lazy(() => import('./owner/workshop/Billing.jsx'));
const WorkshopMechanics = lazy(() => import('./owner/workshop/Mechanics.jsx'));
const WorkshopAttendance = lazy(() => import('./owner/workshop/Attendance.jsx'));
const WorkshopCommission = lazy(() => import('./owner/workshop/Commission.jsx'));
const WorkshopSuppliers = lazy(() => import('./owner/workshop/Suppliers.jsx'));
const WorkshopOperations = lazy(() => import('./owner/workshop/WorkshopOperations.jsx'));
const WorkshopHR = lazy(() => import('./owner/workshop/WorkshopHR.jsx'));

// Admin Pages
const AdminOverview = lazy(() => import('./admin/AdminOverview.jsx'));
const AdminDashboard = lazy(() => import('./admin/Dashboard.jsx'));
const StoreApproval = lazy(() => import('./admin/StoreApproval.jsx'));
const MissingRequests = lazy(() => import('./admin/MissingRequests.jsx'));
const LiveChatConfig = lazy(() => import('./admin/LiveChatConfig.jsx'));
const SystemConfig = lazy(() => import('./admin/SystemConfig.jsx'));
const BrandingCMS = lazy(() => import('./admin/BrandingCMS.jsx'));
const AccountOwners = lazy(() => import('./admin/AccountOwners.jsx'));
const SuperAdminDashboard = lazy(() => import('./admin/SuperAdminDashboard.jsx'));
const AITraining = lazy(() => import('./admin/AITraining.jsx'));
const KnowledgeBase = lazy(() => import('./admin/KnowledgeBase.jsx'));
const IntentManager = lazy(() => import('./admin/IntentManager.jsx'));
const ConversationLogs = lazy(() => import('./admin/ConversationLogs.jsx'));

// Contributor Pages
const ContributorReports = lazy(() => import('./contributor/ContributorReports.jsx'));
const ContributorLiveSupport = lazy(() => import('./contributor/ContributorLiveSupport.jsx'));
const ContributorAuditLogs = lazy(() => import('./contributor/ContributorAuditLogs.jsx'));
const ContributorChat = lazy(() => import('./contributor/ContributorChat.jsx'));

// Misc
const Profile = lazy(() => import('./Profile.jsx'));
const ChangePassword = lazy(() => import('./ChangePassword.jsx'));
const SelectStore = lazy(() => import('./SelectStore.jsx'));
const AccessBlocked = lazy(() => import('./AccessBlocked.jsx'));
const MenuRestricted = lazy(() => import('./MenuRestricted.jsx'));
const NotFound = lazy(() => import('./NotFound.jsx'));
const StoreChat = lazy(() => import('./StoreChat.jsx'));
const DisabilityPage = lazy(() => import('./DisabilityPage.jsx'));
const OwnerContributorProducts = lazy(() => import('./owner/OwnerContributorProducts.jsx'));
const TaskReporting = lazy(() => import('./user/TaskReporting.jsx'));

// Components
import RequireAuth from '../components/RequireAuth.jsx';
const ChatView = lazy(() => import('../components/ChatView.jsx'));
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

// Loading fallback component
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-[#020617]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="text-zinc-500 font-medium text-sm animate-pulse tracking-widest uppercase">Loading System...</p>
    </div>
  </div>
);

function App() {
  return (
    <ToastProvider>
      <DisabilityProvider>
        <ConsentModal />
        <Router>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Entry Points */}
              <Route path="/" element={<Landing />} />
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
              <Route path={PATHS.OWNER_CHAT_ASSISTANT} element={withManagement(() => <ChatView hideSidebarTools={true} />)} />
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
              <Route path={PATHS.STAFF_CHAT_ASSISTANT} element={withManagement(() => <ChatView hideSidebarTools={true} />)} />
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
          </Suspense>
        </Router>
      </DisabilityProvider>
    </ToastProvider>
  );
}

export default App;
