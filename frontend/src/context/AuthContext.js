import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is logged in on component mount
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setCurrentUser(userData);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await authAPI.login(email, password);
      
      const userData = response.data;
      const user = {
        id: userData.user_id,
        name: userData.name,
        email: userData.email,
        token: userData.access_token
      };
      
      setCurrentUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      
      return user;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await authAPI.register(name, email, password);
      
      const userData = response.data;
      const user = {
        id: userData.user_id,
        name: userData.name,
        email: userData.email,
        token: userData.access_token
      };
      
      setCurrentUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      
      return user;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to sign up');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  const continueAsGuest = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await authAPI.guestLogin();
      
      const userData = response.data;
      const user = {
        id: userData.user_id,
        name: userData.name,
        email: userData.email,
        token: userData.access_token,
        isGuest: true
      };
      
      setCurrentUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      
      return user;
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create guest session');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    loading,
    error,
    continueAsGuest
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
