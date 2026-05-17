// AuthContext.jsx
// React Context that keeps track of the logged-in user across the app.
// Components can call useContext(AuthContext) to read the user, or call
// login() / register() / logout() to change it.

import { createContext, useState, useEffect } from "react";
import apiFetch from "../api";

// Create the context object that components will read from
export const AuthContext = createContext(null);

// AuthProvider wraps the whole app and provides the auth values to children
export function AuthProvider({ children }) {
  // The current user (or null if logged out)
  const [user, setUser] = useState(null);

  // The JWT token (or null)
  const [token, setToken] = useState(localStorage.getItem("token"));

  // While we check the token at startup, we want to show a loading state
  const [loading, setLoading] = useState(true);

  // When the app first loads, if there's a token in localStorage, ask the
  // backend "who am I?" to make sure the token is still valid. If yes we
  // know the user and stay logged in. If no we throw the bad token away.
  useEffect(() => {
    async function checkToken() {
      const savedToken = localStorage.getItem("token");
      if (!savedToken) {
        setLoading(false);
        return;
      }
      try {
        const me = await apiFetch("/api/auth/me");
        setUser(me);
        setToken(savedToken);
      } catch (e) {
        // Token is invalid or expired — clear it
        localStorage.removeItem("token");
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    }
    checkToken();
  }, []);

  // Log in with email and password.
  // On success we save the token in localStorage so the user stays logged in
  // even if they refresh the page.
  async function login(email, password) {
    const data = await apiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: email, password: password }),
    });
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  // Register a new account. Backend logs us in automatically and returns a token.
  async function register(name, email, password) {
    const data = await apiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name: name, email: email, password: password }),
    });
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  // Log out 
  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }

  // The "value" passed to children. Components can destructure what they need.
  const value = {
    user: user,
    token: token,
    loading: loading,
    login: login,
    register: register,
    logout: logout,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
