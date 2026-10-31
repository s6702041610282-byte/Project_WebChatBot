import { API_URL } from './config';

/** ข้อผิดพลาดที่มีรหัส (แปลเป็นข้อความไทยด้วย authErrorMessage) */
export class AuthError extends Error {
  constructor(code) {
    super(code);
    this.code = code;
  }
}

/**
 * เรียกระบบหลังบ้าน — ส่งแบบ text/plain (simple request) จึงไม่ติด CORS และอ่านผลตอบกลับได้
 * @param {string} action register | login | google | me | profile | save | logout | resetRequest | resetConfirm
 */
export async function callApi(action, payload = {}, { keepalive = false } = {}) {
  let res;
  try {
    res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, ...payload }),
      redirect: 'follow',
      keepalive
    });
  } catch {
    // ออฟไลน์จริง = network · มีเน็ตแต่ Apps Script ตอบเป็นหน้า error (ยังไม่ Deploy โค้ดใหม่/สิทธิ์ไม่ใช่ Anyone) = server-unreachable
    throw new AuthError(navigator.onLine === false ? 'network' : 'server-unreachable');
  }
  let data;
  try {
    data = await res.json();
  } catch {
    throw new AuthError(res.ok ? 'server-outdated' : 'server');
  }
  if (!data || data.ok !== true) throw new AuthError(data?.code || 'server');
  return data;
}
