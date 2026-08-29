import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import NyaayaMitraPortal from './pages/NyaayaMitraPortal';
import CaseManagerPortal from './pages/CaseManagerPortal';
import LegalExpertPortal from './pages/LegalExpertPortal';
import LegalKnowledgeHub from './pages/LegalKnowledgeHub';
import AdminPortal from './pages/AdminPortal';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import { authService } from './services/api';

export default function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Layout State
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Helper to normalize role strings
  const normalizeRole = (role = '') => {
    const r = role.toLowerCase();
    if (r === 'paralegal' || r === 'nyaaya_mitra') return 'nyaaya_mitra';
    if (r === 'case_manager') return 'case_manager';
    if (r === 'legal_expert') return 'legal_expert';
    if (r === 'admin') return 'admin';
    return 'nyaaya_mitra';
  };

  // On initial render: Validate token with backend /api/auth/me to stay in sync
  useEffect(() => {
    const syncAuthSession = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setIsAuthLoading(false);
        return;
      }

      try {
        const response = await authService.getMe();
        if (response.data?.user) {
          setUser(response.data.user);
          setIsAuthenticated(true);
          localStorage.setItem('authUser', JSON.stringify(response.data.user));
        } else {
          handleLogout();
        }
      } catch (err) {
        console.warn('Session sync notice:', err.message);
        handleLogout();
      } finally {
        setIsAuthLoading(false);
      }
    };

    syncAuthSession();
  }, []);

  const handleLoginSuccess = (token, loggedInUser) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('authUser', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    setIsAuthenticated(true);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setUser(null);
    setIsAuthenticated(false);
    setCurrentView('dashboard');
  };

  const handleUserUpdate = (updatedUser) => {
    localStorage.setItem('authUser', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  // Render view router based on authenticated role
  const renderCurrentView = () => {
    const roleKey = normalizeRole(user?.role);

    // Global Knowledge Hub
    if (currentView === 'knowledge') {
      return <LegalKnowledgeHub />;
    }

    // Global Profile
    if (currentView === 'profile') {
      return <Profile user={user} onUserUpdate={handleUserUpdate} />;
    }

    // Role-specific routing
    switch (roleKey) {
      case 'nyaaya_mitra':
        if (currentView === 'add_case') {
          return <NyaayaMitraPortal user={user} initialOpenAddModal={true} />;
        }
        if (currentView === 'previous_cases') {
          return <NyaayaMitraPortal user={user} initialTab="previous_cases" />;
        }
        return <NyaayaMitraPortal user={user} />;

      case 'case_manager':
        if (currentView === 'previous_cases') {
          return <CaseManagerPortal user={user} initialTab="previous_cases" />;
        }
        if (currentView === 'delayed_monitor') {
          return <CaseManagerPortal user={user} initialTab="delayed" />;
        }
        if (currentView === 'expert_requests') {
          return <CaseManagerPortal user={user} initialTab="expert_requests" />;
        }
        if (currentView === 'volunteers') {
          return <CaseManagerPortal user={user} initialTab="volunteers" />;
        }
        return <CaseManagerPortal user={user} initialTab="dashboard" />;

      case 'legal_expert':
        if (currentView === 'previous_cases') {
          return <LegalExpertPortal user={user} initialTab="previous_cases" />;
        }
        return <LegalExpertPortal user={user} />;

      case 'admin':
        return <AdminPortal user={user} />;

      default:
        return <NyaayaMitraPortal user={user} />;
    }
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-10 w-10 text-primary-500 mb-3" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm font-bold text-slate-300">Synchronizing OutLawed Session...</span>
        </div>
      </div>
    );
  }

  // Not authenticated: render clean Login page
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Authenticated layout shell
  return (
    <div className="min-h-full bg-slate-100">
      {/* Sidebar navigation drawer */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        currentPage={currentView}
        onNavigate={(viewId) => setCurrentView(viewId)}
        user={user}
      />

      {/* Main content wrapper */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top sticky navbar */}
        <Navbar
          projectName="OutLawed"
          user={user}
          onMenuClick={() => setIsSidebarOpen(true)}
          onLogout={handleLogout}
        />

        {/* Dynamic page container */}
        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 bg-slate-100">
          <div className="max-w-7xl mx-auto">
            {renderCurrentView()}
          </div>
        </main>
      </div>
    </div>
  );
}
