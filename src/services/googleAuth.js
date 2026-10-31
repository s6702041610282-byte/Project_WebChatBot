/**
 * เข้าสู่ระบบด้วย Google จริง ผ่าน Google Identity Services (ปุ่ม "Sign in with Google")
 * - ได้ ID token (credential) แล้วส่งให้ระบบหลังบ้านตรวจสอบกับ Google อีกชั้น
 * - ต้องใส่ VITE_GOOGLE_CLIENT_ID ในไฟล์ .env (ดู README หัวข้อ "เข้าสู่ระบบด้วย Google")
 */
import { GOOGLE_CLIENT_ID } from './config';

export const googleConfigured = Boolean(GOOGLE_CLIENT_ID);

let scriptPromise = null;
let initialized = false;
let handler = null;

function loadScript() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.onload = () => (window.google?.accounts?.id ? resolve() : reject(new Error('gsi')));
      s.onerror = () => {
        scriptPromise = null;
        s.remove();
        reject(new Error('gsi'));
      };
      document.head.appendChild(s);
    });
  }
  return scriptPromise;
}

/** โหลด Google Identity Services และตั้งค่าครั้งเดียว — onCredential จะถูกเรียกเมื่อเลือกบัญชีสำเร็จ */
export async function prepareGoogle(onCredential) {
  handler = onCredential;
  await loadScript();
  if (!initialized) {
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (res) => res?.credential && handler?.(res.credential),
      ux_mode: 'popup',
      auto_select: false,
      cancel_on_tap_outside: true,
      context: 'signin'
    });
    initialized = true;
  }
  return window.google.accounts.id;
}

/** หลังออกจากระบบ ไม่ให้ Google เลือกบัญชีเดิมให้อัตโนมัติ */
export function googleSignOut() {
  try {
    window.google?.accounts?.id?.disableAutoSelect();
  } catch {
    /* ไม่เป็นไร */
  }
}
