import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './Landing.jsx';
import Chat from './Chat.jsx';
import Login from './Login.jsx';
import Register from './Register.jsx';
import Dashboard from './owner/Dashboard.jsx';
import Products from './owner/Products.jsx';
import ChatHistory from './owner/ChatHistory.jsx';
import RequireAuth from '../components/RequireAuth.jsx';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected User Routes */}
        <Route
          path="/chat"
          element={
            <RequireAuth>
              <Chat />
            </RequireAuth>
          }
        />

        {/* Protected Owner Routes */}
        <Route
          path="/owner"
          element={
            <RequireAuth allowedRoles={['OWNER']}>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/owner/products"
          element={
            <RequireAuth allowedRoles={['OWNER']}>
              <Products />
            </RequireAuth>
          }
        />
        <Route
          path="/owner/chats"
          element={
            <RequireAuth allowedRoles={['OWNER']}>
              <ChatHistory />
            </RequireAuth>
          }
        />

        {/* Catch all - 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
