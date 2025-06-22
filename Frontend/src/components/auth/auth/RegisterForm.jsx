import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { register } from '../../../slices/authSlice';
import { toast } from 'react-hot-toast';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'citizen',
    county: '',
    phone: '',
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    try {
      const user = await dispatch(register(formData)).unwrap();
      toast.success('Registration successful!');
      
      // Redirect based on role
      if (user.role === 'citizen') {
        navigate('/citizen/dashboard');
      } else if (user.role === 'representative') {
        navigate('/representative/dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin/dashboard');
      }
    } catch (error) {
      toast.error(error || 'Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-kenya-black mb-6">Create an Account</h2>
      {error && (
        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="mt-1 form-input w-full rounded-md border-gray-300 shadow-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="mt-1 form-input w-full rounded-md border-gray-300 shadow-sm"
              required
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 form-input w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="mt-1 form-input w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            I am a
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="mt-1 form-input w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="citizen">Citizen</option>
            <option value="representative">Representative</option>
          </select>
        </div>
        
        {formData.role === 'representative' && (
          <div className="mb-4">
            <label htmlFor="county" className="block text-sm font-medium text-gray-700">
              County
            </label>
            <select
              id="county"
              name="county"
              value={formData.county}
              onChange={handleChange}
              className="mt-1 form-input w-full rounded-md border-gray-300 shadow-sm"
              required={formData.role === 'representative'}
            >
              <option value="">Select County</option>
              {/* Add all Kenyan counties here */}
              <option value="nairobi">Nairobi</option>
              <option value="mombasa">Mombasa</option>
              {/* ... other counties */}
            </select>
          </div>
        )}
        
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="mt-1 form-input w-full rounded-md border-gray-300 shadow-sm"
            required
            minLength="6"
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="mt-1 form-input w-full rounded-md border-gray-300 shadow-sm"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary flex justify-center py-2 px-4"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="text-kenya-red hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;