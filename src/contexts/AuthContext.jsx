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
import { replaceProgress } from '../utils/progress';
import { replaceResults } from '../utils/quizStorage';
import { PREVIEW_UID, PREVIEW_USER, isPreview, setPreview, subscribePreview } from '../utils/preview';

const AuthContext = createContext(null);

function bind(u) {
  setStorageUser(u ? u.uid : null);
  setLogUser(u);
  if (u) startSync(currentToken(), u.uid);
  else stopSync();
}

/** โหมดพรีเซนต์: ใช้บัญชีจำลอง ไม่บันทึก/ไม่ซิงก์ขึ้นระบบ */
function bindPreview() {
  setStorageUser(PREVIEW_UID);
  setLogUser(null);
  stopSync();
}

/** ล้างข้อมูลที่ลองทำระหว่างพรีเซนต์ */
export function resetPreviewData() {
  replaceProgress(PREVIEW_UID, {});
  replaceResults(PREVIEW_UID, {});
  try {
    window.localStorage.removeItem(`chatbot-learning:started:${PREVIEW_UID}`);
  } catch {
    /* ไม่เป็นไร */
  }
}

/** สถานะการเข้าสู่ระบบของทั้งเว็บ (บัญชีจริงบน Google Sheet ดู services/authService.js) */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const u = currentUser();
    bind(u);
    return u;
  });
  const [preview, setPreviewState] = useState(() => {
    const on = isPreview();
    if (on) bindPreview();
    return on;
  });

  // เปิด/ปิดโหมดพรีเซนต์จากหน้า Admin
  useEffect(
    () =>
      subscribePreview((on) => {
        if (on) bindPreview();
        else {
          resetPreviewData();
          bind(currentUser());
        }
        setPreviewState(on);
      }),
    []
  );

  // เปิดเว็บ: ตรวจ token กับระบบและดึงความคืบหน้าล่าสุด (เผื่อเรียนจากเครื่องอื่นมา)
  useEffect(() => {
    if (!currentToken()) return;
    refreshSession().then((u) => {
      if (u === null) {
        bind(null);
        setUser(null);
      } else if (u) {
        if (!isPreview()) setLogUser(u);
        setUser(u);
        if (!isPreview()) syncNow();
      }
    });
  }, []);

  const apply = useCallback((u, method) => {
    if (isPreview()) {
      setUser(u);
      return u;
    }
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

  const value = useMemo(() => {
    if (preview) {
      return {
        user: PREVIEW_USER,
        loading: false,
        isLoggedIn: true,
        isPreview: true,
        needProfile: false,
        login,
        register,
        updateProfile: async () => PREVIEW_USER, // ไม่แก้บัญชีจริงระหว่างพรีเซนต์
        logout: () => setPreview(false)
      };
    }
    return {
      user,
      loading: false,
      isLoggedIn: Boolean(user),
      isPreview: false,
      needProfile: Boolean(user && !(user.firstName && user.lastName)),
      login,
      register,
      updateProfile,
      logout
    };
  }, [preview, user, login, register, updateProfile, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth ต้องอยู่ภายใน <AuthProvider>');
  return ctx;
}
