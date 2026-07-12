import React, { useContext, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Login from './pages/Login';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Fleet from './pages/Fleet';
import Drivers from './pages/Drivers';
import TripDispatcher from './pages/Trips';
import Maintenance from './pages/Maintenance';
import Expenses from './pages/Expenses';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import { AppContext } from './context/AppContext';

export default function App() {
  const { user } = useContext(AppContext);
  const isAuthenticated = !!user;
  const userRole = user?.role;

  return (
    <>
      <Toaster position="top-right" toastOptions={{ className: 'text-xs font-bold' }} />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={!isAuthenticated ? <Landing /> : <Navigate to="/dashboard" replace />} />
        <Route path="/login" element={!isAuthenticated ? <Login initialTab="login" /> : <Navigate to="/dashboard" replace />} />
        <Route path="/register" element={!isAuthenticated ? <Login initialTab="register" /> : <Navigate to="/dashboard" replace />} />

        {/* Protected App Routes */}
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <div className="flex h-screen w-screen bg-slate-50 overflow-hidden font-sans antialiased text-slate-900 select-none">
                <Sidebar userRole={userRole} />

                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                  <Topbar />
                  
                  <main className="flex-1 overflow-y-auto p-6 max-w-[1600px] w-full mx-auto">
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/fleet" element={<Fleet />} />
                      <Route path="/drivers" element={<Drivers />} />
                      <Route path="/trips" element={<TripDispatcher />} />
                      <Route path="/maintenance" element={<Maintenance />} />
                      <Route path="/expenses" element={<Expenses />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </main>
                </div>
              </div>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </>
  );
}