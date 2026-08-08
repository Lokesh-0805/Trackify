import { createContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken) {
      setToken(storedToken);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (!token) {
      delete api.defaults.headers.common.Authorization;
      return;
    }

    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const payload = response.data;

      if (!payload.token) {
        throw new Error('No token returned by server');
      }

      localStorage.setItem('token', payload.token);
      localStorage.setItem('user', JSON.stringify(payload.user));

      setToken(payload.token);
      setUser(payload.user || null);
      return payload;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({
    user,
    token,
    login,
    logout,
    isAuthenticated: Boolean(token),
    loading,
  }), [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext, AuthProvider };
