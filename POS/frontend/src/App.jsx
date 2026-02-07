import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PATHS } from './routes/paths';

import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import { useAuth } from './context/useAuth';

import DashboardPage from './pages/DashboardPage';
import POSPage from './pages/POSPage';
import InventoryPage from './pages/InventoryPage';
import MembersPage from './pages/MembersPage';
import HealthPage from './pages/HealthPage';
import ReportsPage from './pages/ReportsPage';
import RewardsPage from './pages/RewardsPage';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="h-screen w-full flex items-center justify-center font-black text-slate-400 font-sans tracking-[0.2em]">LOADING...</div>;
  if (!isAuthenticated) return <Navigate to={PATHS.LOGIN} replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={PATHS.LOGIN} element={<LoginPage />} />

        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path={PATHS.HOME} element={<DashboardPage />} />
          <Route path={PATHS.POS} element={<POSPage />} />
          <Route path={PATHS.INVENTORY} element={<InventoryPage />} />
          <Route path={PATHS.MEMBERS} element={<MembersPage />} />
          <Route path={PATHS.HEALTH} element={<HealthPage />} />
          <Route path={PATHS.REPORTS} element={<ReportsPage />} />
          <Route path={PATHS.REWARDS} element={<RewardsPage />} />
        </Route>

        <Route path="*" element={<Navigate to={PATHS.HOME} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
