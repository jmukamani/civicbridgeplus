import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { logoutUser } from '../slices/authSlice';

export const useAuth = () => {
  const { user, token, loading, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    // Check token expiration if needed
  }, [token]);

  const logoutFn = () => {
    dispatch(logoutUser());
  };

  return {
    user,
    token,
    isAuthenticated: !!token,
    loading,
    error,
    logout: logoutFn,
  };
};