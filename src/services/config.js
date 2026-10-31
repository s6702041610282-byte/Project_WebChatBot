/**
 * ตั้งค่าการเชื่อมต่อระบบหลังบ้าน (Google Apps Script Web App)
 * - เปลี่ยนลิงก์ได้ที่ไฟล์ .env → VITE_SHEETS_URL=...
 * - Google Client ID ใส่ที่ .env → VITE_GOOGLE_CLIENT_ID=...
 */
const env = (import.meta.env || {});

export const API_URL =
  env.VITE_SHEETS_URL ||
  'https://script.google.com/macros/s/AKfycbylo57yQIdAAB0fDUIXCvbLjlLDvgt3MksvscEPohCZrbuzATapZvCDTbQbHgSbfBOveA/exec';

export const GOOGLE_CLIENT_ID = env.VITE_GOOGLE_CLIENT_ID || '';

/** รหัสมุม Admin ใช้ตอนระบบหลังบ้านยังไม่พร้อม (ให้ตรงกับ ADMIN_PASSWORD ใน apps-script/Code.gs) */
export const ADMIN_PASSWORD = '123456';
