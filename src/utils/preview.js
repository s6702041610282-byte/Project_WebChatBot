import { useEffect, useState } from 'react';

/**
 * โหมดพรีเซนต์ของ Admin
 * - เปิดอัตโนมัติเมื่อครูเข้ามุม Admin (ปิดได้ที่หน้า Admin หรือแถบด้านบน)
 * - เข้าได้ทุกหน้าโดยไม่ต้องเข้าสู่ระบบ และปลดล็อกบทเรียน/กิจกรรม/แบบทดสอบทั้งหมด
 * - ใช้บัญชีจำลอง "admin-preview" → ไม่ส่งข้อมูลขึ้น Google Sheet และไม่ปนกับข้อมูลนักเรียน
 * - เก็บใน sessionStorage: ปิดแท็บแล้วหายเอง
 */
const KEY = 'chatbot-learning:preview';
export const PREVIEW_UID = 'admin-preview';
export const PREVIEW_USER = {
  uid: PREVIEW_UID,
  email: '',
  firstName: 'ครูผู้สอน',
  lastName: '(พรีเซนต์)',
  displayName: 'ครูผู้สอน (พรีเซนต์)',
  studentId: '',
  classroom: '',
  provider: 'preview',
  photoURL: '',
  role: 'admin',
  preview: true
};

const listeners = new Set();

export function isPreview() {
  try {
    return window.sessionStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function setPreview(on) {
  try {
    if (on) window.sessionStorage.setItem(KEY, '1');
    else window.sessionStorage.removeItem(KEY);
  } catch {
    /* โหมดส่วนตัว */
  }
  listeners.forEach((fn) => fn(Boolean(on)));
}

export function subscribePreview(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function usePreview() {
  const [on, setOn] = useState(isPreview);
  useEffect(() => subscribePreview(setOn), []);
  return on;
}
