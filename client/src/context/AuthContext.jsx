import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as authApi from "../api/authApi";
import { invalidateCache } from "../api/axiosClient";

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

  useEffect(
    function () {
      loadUser();
    },
    [loadUser]
  );

  // Central 401/session-expiry handling. The axios interceptor dispatches this
  // event whenever any protected endpoint returns 401, so an expired session
  // clears the cached user (and the user-scoped axios cache) immediately.
  // ProtectedRoute then redirects to /login instead of showing an error page
  // or raw backend JSON.
  useEffect(function () {
    function handleUnauthorized() {
      setUser(null);
      invalidateCache();
    }
    window.addEventListener("studykarle:unauthorized", handleUnauthorized);
    return function () {
      window.removeEventListener("studykarle:unauthorized", handleUnauthorized);
    };
  }, []);

  const login = useCallback(function (payload) {
    return authApi.login(payload).then(function (data) {
      setUser(data);
      return data;
    });
  }, []);

  // Legacy direct signup (kept for backward compatibility)
  const signup = useCallback(function (payload) {
    return authApi.signup(payload).then(function (data) {
      setUser(data);
      return data;
    });
  }, []);

  // NEW: OTP-based signup methods
  const requestOtp = useCallback(function (payload) {
    return authApi.requestOtp(payload);
  }, []);

  const verifyOtp = useCallback(function (payload) {
    return authApi.verifyOtp(payload).then(function (data) {
      setUser(data);
      return data;
    });
  }, []);

  const resendOtp = useCallback(function (payload) {
    return authApi.resendOtp(payload);
  }, []);

  const logout = useCallback(function () {
    return authApi.logout().then(function () {
      setUser(null);
    });
  }, []);

  const value = useMemo(
    function () {
      return {
        user: user,
        loading: loading,
        isAuthenticated: !!user,
        isAdmin: !!user && user.role === "admin",
        login: login,
        signup: signup,
        requestOtp: requestOtp,
        verifyOtp: verifyOtp,
        resendOtp: resendOtp,
        logout: logout,
        refreshUser: loadUser,
        setUser: setUser,
      };
    },
    [
      user,
      loading,
      login,
      signup,
      requestOtp,
      verifyOtp,
      resendOtp,
      logout,
      loadUser,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return ctx;
}
