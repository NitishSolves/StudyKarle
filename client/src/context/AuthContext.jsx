import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as authApi from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(function () {
    setLoading(true);
    return authApi
      .fetchCurrentUser()
      .then(function (data) {
        setUser(data);
      })
      .catch(function () {
        setUser(null);
      })
      .finally(function () {
        setLoading(false);
      });
  }, []);

  useEffect(function () {
    loadUser();
  }, [loadUser]);

  const login = useCallback(function (payload) {
    return authApi.login(payload).then(function (data) {
      setUser(data);
      return data;
    });
  }, []);

  const signup = useCallback(function (payload) {
    return authApi.signup(payload).then(function (data) {
      setUser(data);
      return data;
    });
  }, []);

  const logout = useCallback(function () {
    return authApi.logout().then(function () {
      setUser(null);
    });
  }, []);

  const value = {
    user: user,
    loading: loading,
    isAuthenticated: !!user,
    isAdmin: !!user && user.role === 'admin',
    login: login,
    signup: signup,
    logout: logout,
    refreshUser: loadUser,
    setUser: setUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return ctx;
}
