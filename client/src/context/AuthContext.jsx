import { createContext, useContext, useEffect, useState } from "react";
import { clearToken, getToken, setToken } from "../services/api.js";
import {
  login as loginRequest,
  me,
  register as registerRequest,
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

  async function login(body) {
    const data = await loginRequest(body);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  async function register(body) {
    const data = await registerRequest(body);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  const value = { user, loading, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
