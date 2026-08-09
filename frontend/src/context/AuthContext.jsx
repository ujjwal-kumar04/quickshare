import { createContext, useState, useEffect, useCallback } from 'react';
import api, { getErrorMessage } from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('qs_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  const persist = (token, userObj) => {
    localStorage.setItem('qs_token', token);
    localStorage.setItem('qs_user', JSON.stringify(userObj));
    setUser(userObj);
  };

  const clear = () => {
    localStorage.removeItem('qs_token');
    localStorage.removeItem('qs_user');
    setUser(null);
  };

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem('qs_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.data.user);
      localStorage.setItem('qs_user', JSON.stringify(data.data.user));
    } catch {
      clear();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    persist(data.data.token, data.data.user);
    return data.data.user;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    return data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* ignore */
    }
    clear();
  };

  const updateUser = (partial) => {
    setUser((prev) => {
      const next = { ...prev, ...partial };
      localStorage.setItem('qs_user', JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateUser, isAuthenticated: Boolean(user) }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { getErrorMessage };
