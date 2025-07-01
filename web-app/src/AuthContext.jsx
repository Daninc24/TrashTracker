import React, { createContext, useState, useEffect } from 'react';
import api from './api';
import { useToast } from './components/ToastContext';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({
          token,
          email: decoded.email,
          role: decoded.role,
          userId: decoded.userId,
        });
      } catch (e) {
        setUser({ token });
      }
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      setUser(null);
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      setUser({ token: res.data.token });
      showToast('Login successful!', 'success');
      return true;
    } catch (err) {
      showToast(err.response?.data?.error || 'Login failed', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password) => {
    setLoading(true);
    try {
      await api.post('/auth/register', { email, password });
      showToast('Registration successful!', 'success');
      return await login(email, password);
    } catch (err) {
      showToast(err.response?.data?.error || 'Registration failed', 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
} 