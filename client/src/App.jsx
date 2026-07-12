import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Fleet from './pages/Fleet';
import Drivers from './pages/Drivers';
import TripDispatcher from './pages/Trips';
import Maintenance from './pages/Maintenance';
import Expenses from './pages/Expenses';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

export default function App() {
  // Hackathon flow verification session state checks
  const [isAuthenticated, setIsAuthenticated] = useState(true); 
  const [activePage, setActivePage] = useState('dashboard');
  const [userRole, setUserRole] = useState('Dispatcher');

  // Explicit Auth Guard matching Mockup validation metrics
  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  // Pure clean dynamic conditional engine mappings router
  const renderView = () => {
    switch (activePage) {
      case 'dashboard': 
        return <Dashboard />;
      case 'fleet': 
        return <Fleet />;
      case 'drivers': 
        return <Drivers />;
      case 'trips': 
        return <TripDispatcher />;
      case 'maintenance': 
        return <Maintenance />;
      case 'expenses': 
        return <Expenses />;
      case 'analytics': 
        return <Analytics />;
      case 'settings': 
        return <Settings />;
      default: 
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-slate-50 overflow-hidden font-sans antialiased text-slate-900 select-none">
      
      {/* Sidebar navigation dynamic dashboard element handler matrix */}
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        userRole={userRole} 
      />

      {/* Primary display core injection framework window shell node */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar userSession="Raven K." />
        
        {/* Active Route View Viewport container block configuration */}
        <main className="flex-1 overflow-y-auto p-6 max-w-[1600px] w-full mx-auto">
          {renderView()}
        </main>
      </div>
      
    </div>
  );
}