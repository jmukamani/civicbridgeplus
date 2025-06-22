import { createSlice } from '@reduxjs/toolkit';
import api from '../services/api';

const initialState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setCredentials, logout, setLoading, setError, clearError } = authSlice.actions;

export default authSlice.reducer;

export const login = (credentials) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await api.post('/auth/login', credentials);
    const { user, token } = response.data;
    
    localStorage.setItem('token', token);
    dispatch(setCredentials({ user, token }));
    dispatch(setLoading(false));
    return user;
  } catch (error) {
    dispatch(setError(error.response?.data?.message || 'Login failed'));
    dispatch(setLoading(false));
    throw error;
  }
};

export const register = (userData) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const response = await api.post('/auth/register', userData);
    const { user, token } = response.data;
    
    localStorage.setItem('token', token);
    dispatch(setCredentials({ user, token }));
    dispatch(setLoading(false));
    return user;
  } catch (error) {
    dispatch(setError(error.response?.data?.message || 'Registration failed'));
    dispatch(setLoading(false));
    throw error;
  }
};

export const logoutUser = () => async (dispatch) => {
  try {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
    dispatch(logout());
  } catch (error) {
    console.error('Logout error:', error);
  }
};