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


import StoreChat from './StoreChat.jsx';
import { DisabilityProvider } from '../context/DisabilityContext.jsx';
import { ToastProvider } from '../context/ToastContext.jsx';
import ConsentModal from '../components/ConsentModal.jsx';

function App() {
  return (
    <ToastProvider>
      <DisabilityProvider>
        <ConsentModal />
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Dynamic Store Shop Chat Link */}
            <Route path="/:ownerDomain" element={<StoreChat />} />

            {/* User Dashboard / Chat */}
            <Route element={<RequireAuth allowedRoles={['USER']}><UserLayout /></RequireAuth>}>
              <Route path="/chat" element={<UserDashboard />} />
              <Route path="/history" element={<History />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/shopping-list" element={<ShoppingList />} />
              <Route path="/profile" element={<Profile />} />
            </Route>


            {/* Protected Owner Routes */}
            <Route element={<RequireAuth allowedRoles={['OWNER']}><OwnerLayout /></RequireAuth>}>
              <Route path="/owner" element={<Dashboard />} />
              <Route path="/owner/products/:category?" element={<Products />} />
              <Route path="/owner/chats" element={<ChatHistory />} />
              <Route path="/owner/chat" element={<ChatView />} />
              <Route path="/owner/live-support" element={<OwnerLiveSupport />} />
              <Route path="/owner/profile" element={<Profile />} />
            </Route>


            {/* Protected Admin Routes */}
            <Route element={<RequireAuth allowedRoles={['ADMIN']}><AdminLayout /></RequireAuth>}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/stores" element={<StoreApproval />} />
              <Route path="/admin/missing" element={<MissingRequests />} />
              <Route path="/admin/config" element={<SystemConfig />} />
            </Route>

            {/* Catch all - 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </DisabilityProvider>
    </ToastProvider>
  );
}

export default App;
