import { createContext, useContext, useEffect, useState } from "react";
import { clearToken, getToken, setToken } from "../services/api.js";
import {
  login as loginRequest,
  me,
  register as registerRequest,
  verifyEmail as verifyEmailRequest,
} from "../services/auth.service.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(getToken()));

  useEffect(() => {
    const token = getToken();
    if (!token) return undefined;
    let active = true;

    me()
      .then((data) => {
        if (active) setUser(data.user);
      })
      .catch((error) => {
        const rejected = error.status === 401 || error.status === 403;
        if (rejected && getToken() === token) clearToken();
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  function applySession({ token, user: nextUser }) {
    setToken(token);
    setUser(nextUser);
  }

  async function login(body) {
    const data = await loginRequest(body);
    applySession(data);
    return data.user;
  }

  function register(body) {
    return registerRequest(body);
  }

  async function verifyEmail(body) {
    const data = await verifyEmailRequest(body);
    applySession(data);
    return data.user;
  }

  function updateUser(nextUser) {
    setUser((current) => (current ? { ...current, ...nextUser } : nextUser));
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  const value = {
    user,
    loading,
    login,
    register,
    verifyEmail,
    applySession,
    updateUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
