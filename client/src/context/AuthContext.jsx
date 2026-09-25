// AuthContext: the logged in user and the login, register and logout actions. Owner: Gerald. Pass through until it is built.
import { createContext, useContext, useEffect, useState } from "react";
import { getToken, setToken, clearToken } from "../services/api.js";
import {
  login as loginRequest,
  register as registerRequest,
  me,
} from "../services/auth.service.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getToken()));

  useEffect(() => {
    if (!getToken()) return;
    me()
      .then((data) => setUser(data.user))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
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

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
