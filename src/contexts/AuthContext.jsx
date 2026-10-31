import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  currentToken,
  currentUser,
  loginUser,
  logoutUser,
  refreshSession,
  registerUser,
  updateProfile as saveProfile
} from '../services/authService';
import { setStorageUser } from '../utils/quizStorage';
import { logEvent, setLogUser } from '../services/sheetLogger';
import { startSync, stopSync, syncNow } from '../services/cloudSync';

const AuthContext = createContext(null);

function bind(u) {
  setStorageUser(u ? u.uid : null);
  setLogUser(u);
  if (u) startSync(currentToken(), u.uid);
  else stopSync();
}

/** สถานะการเข้าสู่ระบบของทั้งเว็บ (บัญชีจริงบน Google Sheet ดู services/authService.js) */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const u = currentUser();
    bind(u);
    return u;
  });

  // เปิดเว็บ: ตรวจ token กับระบบและดึงความคืบหน้าล่าสุด (เผื่อเรียนจากเครื่องอื่นมา)
  useEffect(() => {
    if (!currentToken()) return;
    refreshSession().then((u) => {
      if (u === null) {
        bind(null);
        setUser(null);
      } else if (u) {
        setLogUser(u);
        setUser(u);
        syncNow();
      }
    });
  }, []);

  const apply = useCallback((u, method) => {
    bind(u);
    if (u) syncNow();
    if (u && method) logEvent('login', { method });
    setUser(u);
    return u;
  }, []);

  const login = useCallback(async (email, password, remember) => apply(await loginUser(email, password, remember), 'อีเมล'), [apply]);
  const register = useCallback(async (data) => apply(await registerUser(data), 'สมัครสมาชิกใหม่'), [apply]);
  const updateProfile = useCallback(async (fields) => {
    const u = await saveProfile(fields);
    setLogUser(u);
    setUser(u);
    logEvent('profile', { firstName: u.firstName, lastName: u.lastName, studentId: u.studentId, classroom: u.classroom });
    return u;
  }, []);
  const logout = useCallback(() => {
    logoutUser();
    apply(null);
  }, [apply]);

  const value = useMemo(
    () => ({
      user,
      loading: false,
      isLoggedIn: Boolean(user),
      needProfile: Boolean(user && !(user.firstName && user.lastName)),
      login,
      register,
      updateProfile,
      logout
    }),
    [user, login, register, updateProfile, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth ต้องอยู่ภายใน <AuthProvider>');
  return ctx;
}
