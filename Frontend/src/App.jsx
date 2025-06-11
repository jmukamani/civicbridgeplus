import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/common/Sidebar';
import Header from './components/common/Header';
import AuthForm from './components/auth/AuthForm';
import HomePage from './components/home/HomePage';
import Dashboard from './components/dashboard/Dashboard';
import Representatives from './components/representatives/Representatives';
import PolicyAnalysis from './components/policy/PolicyAnalysis';
import Settings from './components/Settings/Settings';

const CivicBridgePulseApp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const auth = localStorage.getItem('isAuthenticated');
    return auth === 'true';
  });
  
  const [currentUser, setCurrentUser] = useState(() => {
    const user = localStorage.getItem('currentUser');
    try {
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  });
  
  const [language, setLanguage] = useState('en');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleAuthSuccess = (user) => {
    console.log('Auth success - user:', user);
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const ProtectedLayout = () => {
    console.log('ProtectedLayout - isAuthenticated:', isAuthenticated);
    
    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to login');
      return <Navigate to="/login" />;
    }

    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          currentUser={currentUser}
          language={language}
        />
        
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            language={language} 
            setLanguage={setLanguage} 
            setSidebarOpen={setSidebarOpen} 
          />

          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    );
  };

  return (
    <Routes>
      <Route path="/" element={<HomePage setLanguage={setLanguage} language={language} />} />
      <Route path="/register" element={<AuthForm isLogin={false} onAuthSuccess={handleAuthSuccess} language={language} />} />
      <Route path="/login" element={<AuthForm isLogin={true} onAuthSuccess={handleAuthSuccess} language={language} />} />

      <Route element={<ProtectedLayout />}>
        <Route index element={<Dashboard currentUser={currentUser} language={language} />} />
        <Route path="/dashboard" element={<Dashboard currentUser={currentUser} language={language} />} />
        <Route path="/policy-analysis" element={<PolicyAnalysis language={language} />} />
        <Route path="/representatives" element={<Representatives language={language} />} />
        <Route path="/settings" element={
          <Settings 
            currentUser={currentUser}
            language={language}
            setLanguage={setLanguage}
            setIsAuthenticated={setIsAuthenticated}
            setCurrentUser={setCurrentUser}
          />
        } />
      </Route>
    </Routes>
  );
};

export default CivicBridgePulseApp;