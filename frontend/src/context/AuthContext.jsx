import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('fl_token');
    if (token) fetchMe();
    else setLoading(false);
  }, []);

  const fetchMe = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch { localStorage.removeItem('fl_token'); }
    finally { setLoading(false); }
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('fl_token', data.token);
    localStorage.setItem('fl_refresh', data.refreshToken);
    setUser(data.user);
    toast.success(`Welcome back, ${data.user.firstName}!`);
    return data.user;
  };

  const register = async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    localStorage.setItem('fl_token', data.token);
    localStorage.setItem('fl_refresh', data.refreshToken);
    setUser(data.user);
    toast.success('Account created successfully!');
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('fl_token');
    localStorage.removeItem('fl_refresh');
    setUser(null);
    toast('Logged out');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);