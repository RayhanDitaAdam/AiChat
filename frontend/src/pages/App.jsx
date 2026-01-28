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
import UserLayout from '../layouts/UserLayout.jsx';
import UserDashboard from './user/UserDashboard.jsx';
import ChatView from '../components/ChatView.jsx';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User Dashboard / Chat */}
        <Route element={<RequireAuth><UserLayout /></RequireAuth>}>
          <Route path="/chat" element={<UserDashboard />} />
        </Route>

        {/* Protected Owner Routes */}
        <Route element={<RequireAuth allowedRoles={['OWNER']}><OwnerLayout /></RequireAuth>}>
          <Route path="/owner" element={<Dashboard />} />
          <Route path="/owner/products/:category?" element={<Products />} />
          <Route path="/owner/chats" element={<ChatHistory />} />
          <Route path="/owner/chat" element={<ChatView />} />
        </Route>

        {/* Catch all - 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
