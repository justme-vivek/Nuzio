import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  loginWithGoogle,
  logout as apiLogout,
  getMe,
} from "../services/auth.api.js";
import { patchPreferences as apiPatchPreferences } from "../services/user.api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | authed | guest
  const queryClient = useQueryClient();
  const authGeneration = useRef(0);

  const goGuest = useCallback(() => {
    localStorage.removeItem("nuzio_token");
    setUser(null);
    setPreferences(null);
    setStatus("guest");
  }, []);

  useEffect(() => {
    let alive = true;
    const generation = authGeneration.current;
    getMe()
      .then((data) => {
        if (!alive || generation !== authGeneration.current) return;
        setUser(data.user);
        setPreferences(data.preferences);
        setStatus("authed");
      })
      .catch(() => alive && generation === authGeneration.current && goGuest());
    return () => {
      alive = false;
    };
  }, [goGuest]);

  useEffect(() => {
    const handler = () => goGuest();
    window.addEventListener("nuzio:unauthorized", handler);
    return () => window.removeEventListener("nuzio:unauthorized", handler);
  }, [goGuest]);

  const login = useCallback(async (credential) => {
    authGeneration.current += 1;
    const data = await loginWithGoogle(credential);
    setUser(data.user);
    setStatus("authed");
    try {
      const me = await getMe();
      if (me.preferences) setPreferences(me.preferences);
    } catch {
      // preferences load is best-effort
    }
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    authGeneration.current += 1;
    try {
      await apiLogout();
    } catch {
      // ignore
    }
    queryClient.clear();
    goGuest();
  }, [queryClient, goGuest]);

  const patchPreferences = useCallback(async (payload) => {
    const updated = await apiPatchPreferences(payload);
    setPreferences(updated);
    return updated;
  }, []);

  const value = useMemo(
    () => ({
      user,
      preferences,
      status,
      login,
      logout,
      patchPreferences,
      setUser,
      setPreferences,
    }),
    [user, preferences, status, login, logout, patchPreferences],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error("useAuthContext must be used inside <AuthProvider>");
  return ctx;
}
