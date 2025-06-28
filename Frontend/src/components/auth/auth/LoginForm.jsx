import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from "../../../slices/authSlice";
import { toast } from 'react-hot-toast';
import { store } from '../../../store/store';

const LoginForm = () => {
  console.log('LoginForm component rendered'); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
  e.preventDefault();
  console.log('handleSubmit called'); // Debug log
  
  try {
    console.log('About to dispatch login...'); // Debug log
    const result = await dispatch(login({ email, password })).unwrap();
    console.log('Login result:', result); // Debug log
    
    // Check Redux state after login
    const currentState = store.getState();
    console.log('Redux state after login:', currentState.auth);
    
    toast.success('Login successful!');
    
    // Ensure we have user data before redirecting
    if (result?.user?.role) {
      const redirectPath = {
        citizen: '/citizen/dashboard',
        representative: '/representative/dashboard',
        admin: '/admin/dashboard'
      }[result.user.role];
      
      console.log('Navigating to:', redirectPath);
      navigate(redirectPath);
      
      // Force refresh if still on login page after 1 second
      setTimeout(() => {
        if (window.location.pathname === '/login') {
          console.log('Still on login page, forcing redirect...');
          window.location.href = redirectPath;
        }
      }, 1000);
    } else {
      console.log('No user role found in result:', result);
    }
  } catch (error) {
    console.log('Login error caught:', error); // Debug log
    toast.error(error || 'Login failed');
  }
};

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Login to CivicBridge</h2>
      {error && (
        <div className="mb-4 px-3 py-2 bg-red-100 text-red-700 rounded text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex justify-center transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <div className="mt-4 text-center">
        <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors">
          Forgot password?
        </a>
      </div>
    </div>
  );
};

export default LoginForm;