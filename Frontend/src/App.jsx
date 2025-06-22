import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '../src/store/store';
import MainLayout from './components/auth/layout/MainLayout';
import LandingPage from '../src/pages/LandingPage';
import LoginForm from './components/auth/auth/LoginForm';
import RegisterForm from './components/auth/auth/RegisterForm';
import Unauthorized from '../src/pages/Unauthorized';
import NotFound from '../src/pages/NotFound';
import ProtectedRoute from './components/auth/common/ProtectedRoute';

// Citizen Pages
import CitizenDashboard from '../src/pages/citizen/Dashboard';
import PolicyBrowser from '../src/pages/citizen/PolicyBrowser';
import MessageCenter from '../src/pages/citizen/MessageCenter';

// Representative Pages
import RepresentativeDashboard from '../src/pages/representative/Dashboard';
import MessageManagement from '../src/pages/representative/MessageManagement';
import PolicyManagement from '../src/pages/representative/PolicyManagement';
import PolicyUpload from '../src/pages/representative/PolicyUpload';

// Admin Pages
import AdminDashboard from '../src/pages/admin/Dashboard';
import UserManagement from '../src/pages/admin/UserManagement';
import SystemAnalytics from '../src/pages/admin/SystemAnalytics';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Citizen Protected Routes */}
          <Route element={<MainLayout />}>
            <Route element={<ProtectedRoute roles={['citizen']} />}>
              <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
              <Route path="/citizen/policies" element={<PolicyBrowser />} />
              <Route path="/citizen/messages" element={<MessageCenter />} />
            </Route>

            {/* Representative Protected Routes */}
            <Route element={<ProtectedRoute roles={['representative']} />}>
              <Route path="/representative/dashboard" element={<RepresentativeDashboard />} />
              <Route path="/representative/messages" element={<MessageManagement />} />
              <Route path="/representative/policies" element={<PolicyManagement />} />
              <Route path="/representative/policies/upload" element={<PolicyUpload />} />
              <Route path="/representative/policies/edit/:id" element={<PolicyUpload />} />
            </Route>

            {/* Admin Protected Routes */}
            <Route element={<ProtectedRoute roles={['admin']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/analytics" element={<SystemAnalytics />} />
            </Route>
          </Route>

          {/* 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;