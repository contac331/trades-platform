import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  isAuthenticated: false,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
      };
    case 'AUTH_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
      };
    case 'AUTH_FAILURE':
      localStorage.removeItem('token');
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
      };
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Check if user is logged in on app start
    if (state.token) {
      loadUser();
    }
  }, []);

  const loadUser = async () => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await api.get('/auth/me');
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          user: response.data.user,
          token: state.token,
        },
      });
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE' });
    }
  };

  const login = async (email, password) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await api.post('/auth/login', { email, password });
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: response.data,
      });
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE' });
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await api.post('/auth/register', userData);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: response.data,
      });
      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      dispatch({ type: 'AUTH_FAILURE' });
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = async () => {
    console.log('Logout function called');
    try {
      console.log('Making logout API call');
      await api.post('/auth/logout');
      console.log('Logout API call successful');
    } catch (error) {
      console.log('Logout API call failed:', error);
      // Continue with logout even if API call fails
    }
    console.log('Dispatching LOGOUT action');
    dispatch({ type: 'LOGOUT' });
    console.log('Showing logout success message');
    toast.success('Logged out successfully');
    console.log('Logout function completed');
  };

  const updateProfile = async (userData) => {
    try {
      console.log('AuthContext updateProfile called with:', userData);
      const response = await api.put('/auth/profile', userData);
      console.log('Profile update API response:', response.data);
      dispatch({
        type: 'UPDATE_USER',
        payload: response.data.user,
      });
      return { success: true };
    } catch (error) {
      console.error('AuthContext updateProfile error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      const message = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || error.message || 'Profile update failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
