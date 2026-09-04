import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

const DEMO_CREDENTIALS = {
  loan_officer: { email: 'officer@tvscredit.demo', password: 'demo123' },
  admin: { email: 'admin@tvscredit.demo', password: 'admin123' },
  customer: { email: 'ravi@customer.demo', password: 'demo123' }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('tvs_user');
    return saved ? JSON.parse(saved) : {
      id: 'OFFICER-01',
      email: 'officer@tvscredit.demo',
      role: 'loan_officer',
      name: 'Arunachalam S. (Branch Underwriter)',
      branch: 'Coimbatore Main'
    };
  });
  const [token, setToken] = useState(() => localStorage.getItem('tvs_token'));
  const [loading, setLoading] = useState(false);

  // Initialize signed token on first load if missing
  useEffect(() => {
    const initDefaultToken = async () => {
      if (!token) {
        try {
          const res = await api.login('officer@tvscredit.demo', 'demo123');
          setUser(res.user);
          setToken(res.token);
          localStorage.setItem('tvs_token', res.token);
          localStorage.setItem('tvs_user', JSON.stringify(res.user));
        } catch (e) {
          console.warn('Auto demo login init:', e);
        }
      }
    };
    initDefaultToken();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.login(email, password);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('tvs_token', res.token);
      localStorage.setItem('tvs_user', JSON.stringify(res.user));
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const quickSwitchRole = async (role, customerId = 'CUST-101') => {
    setLoading(true);
    try {
      let email = 'officer@tvscredit.demo';
      let password = 'demo123';

      if (role === 'admin') {
        email = 'admin@tvscredit.demo';
        password = 'admin123';
      } else if (role === 'customer') {
        if (customerId === 'CUST-102') email = 'priya@customer.demo';
        else if (customerId === 'CUST-103') email = 'arjun@customer.demo';
        else if (customerId === 'CUST-105') email = 'suresh@customer.demo';
        else email = 'ravi@customer.demo';
      }

      const res = await api.login(email, password);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('tvs_token', res.token);
      localStorage.setItem('tvs_user', JSON.stringify(res.user));
      return res.user;
    } catch (e) {
      console.error('Quick switch role error:', e);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('tvs_user');
    localStorage.removeItem('tvs_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, quickSwitchRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
