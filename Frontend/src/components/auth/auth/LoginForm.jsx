import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from "../../../slices/authSlice";
import { toast } from 'react-hot-toast';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await dispatch(login({ email, password })).unwrap();
      toast.success('Login successful!');
      
      // Redirect based on role
      if (user.role === 'citizen') {
        navigate('/citizen/dashboard');
      } else if (user.role === 'representative') {
        navigate('/representative/dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard');
      }
    } catch (error) {
      toast.error(error || 'Login failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-kenya-black mb-6">Login to CivicBridge</h2>
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 form-input w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 form-input w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary flex justify-center py-2 px-4"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      <div className="mt-4 text-center">
        <a href="/forgot-password" className="text-sm text-kenya-red hover:underline">
          Forgot password?
        </a>
      </div>
    </div>
  );
};

export default LoginForm;