/**
 * ระบบบัญชีผู้ใช้จริง — เก็บบัญชีไว้บน Google Sheet ผ่าน Apps Script (apps-script/Code.gs)
 * - สมัคร/เข้าสู่ระบบด้วยอีเมล (รหัสผ่านแฮชพร้อม salt ที่ฝั่งเซิร์ฟเวอร์)
 * - เบราว์เซอร์เก็บเฉพาะ token + ข้อมูลผู้ใช้ล่าสุด เพื่อเปิดเว็บได้ทันทีโดยไม่ต้องรอ
 */
import { AuthError, callApi } from './api';
import { adoptLegacy, hydrate } from './cloudSync';

const AUTH_KEY = 'chatbot-learning:auth';
const LEGACY_SESSION = 'chatbot-learning:session';
const LOCAL_ACCOUNTS = 'chatbot-learning:accounts';
const LOCAL_TOKEN = 'local';
/** รหัสข้อผิดพลาดที่แปลว่า "ติดต่อระบบหลังบ้านไม่ได้" → ใช้บัญชีในเครื่องแทน */
const OFFLINE = ['server-unreachable', 'network', 'server-outdated', 'server'];
const isOffline = (err) => OFFLINE.includes(err?.code);

/* ---------- บัญชีในเครื่อง (สำรอง เมื่อระบบหลังบ้านยังไม่พร้อม) ---------- */
const normalize = (email) => String(email || '').trim().toLowerCase();

function readLocal() {
  try {
    return JSON.parse(window.localStorage.getItem(LOCAL_ACCOUNTS) || '{}');
  } catch {
    return {};
  }
}

function writeLocal(all) {
  try {
    window.localStorage.setItem(LOCAL_ACCOUNTS, JSON.stringify(all));
  } catch {
    /* โหมดส่วนตัว */
  }
}

async function hashLocal(email, password) {
  const data = new TextEncoder().encode(`${normalize(email)}:${password}`);
  if (window.crypto?.subtle) {
    const buf = await window.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
  }
  let h = 0;
  for (const b of data) h = (Math.imul(31, h) + b) | 0;
  return `f${h >>> 0}`;
}

function localUser(acc) {
  let first = acc.firstName || '';
  let last = acc.lastName || '';
  if (!first && acc.displayName) {
    const parts = acc.displayName.trim().split(/\s+/);
    first = parts[0] || '';
    last = parts.slice(1).join(' ');
  }
  return {
    uid: acc.uid,
    email: acc.email,
    firstName: first,
    lastName: last,
    displayName: `${first} ${last}`.trim() || acc.email.split('@')[0],
    studentId: acc.studentId || '',
    classroom: acc.classroom || '',
    provider: 'password',
    photoURL: '',
    role: 'student',
    local: true
  };
}

async function localRegister({ firstName, lastName, email, password, studentId, classroom }) {
  const key = normalize(email);
  const all = readLocal();
  if (all[key] && !all[key].adopted) throw new AuthError('email-already-in-use');
  const acc = {
    uid: `u_${Date.now().toString(36)}`,
    email: key,
    firstName,
    lastName,
    displayName: `${firstName} ${lastName}`.trim(),
    studentId,
    classroom,
    provider: 'password',
    createdAt: new Date().toISOString(),
    passwordHash: await hashLocal(key, password)
  };
  writeLocal({ ...all, [key]: acc });
  return acc;
}

async function localCheck(email, password) {
  const acc = readLocal()[normalize(email)];
  if (!acc || !acc.passwordHash) return null;
  return acc.passwordHash === (await hashLocal(email, password)) ? acc : false;
}

function finishLocal(acc, remember) {
  const all = readLocal();
  if (all[acc.email]) {
    all[acc.email].lastLogin = new Date().toISOString();
    writeLocal(all);
  }
  const user = localUser(acc);
  write({ token: LOCAL_TOKEN, user }, remember);
  return user;
}

/** จดจำฉันไว้ = เก็บใน localStorage (เปิดใหม่ยังเข้าอยู่) · ไม่จดจำ = sessionStorage (ปิดเบราว์เซอร์แล้วออก) */
function read() {
  try {
    const l = window.localStorage.getItem(AUTH_KEY);
    if (l) return { ...JSON.parse(l), remember: true };
    const s = window.sessionStorage.getItem(AUTH_KEY);
    return s ? { ...JSON.parse(s), remember: false } : null;
  } catch {
    return null;
  }
}

function write(v, remember = read()?.remember ?? true) {
  try {
    window.localStorage.removeItem(AUTH_KEY);
    window.sessionStorage.removeItem(AUTH_KEY);
    if (v) (remember ? window.localStorage : window.sessionStorage).setItem(AUTH_KEY, JSON.stringify({ token: v.token, user: v.user }));
    window.localStorage.removeItem(LEGACY_SESSION); // ระบบเดิม (บัญชีในเครื่อง) เลิกใช้แล้ว
  } catch {
    /* โหมดส่วนตัว */
  }
}

/** ผู้ใช้ที่เข้าสู่ระบบอยู่ (จากเครื่อง — ตรวจกับเซิร์ฟเวอร์อีกครั้งด้วย refreshSession) */
export const currentUser = () => read()?.user || null;
export const currentToken = () => read()?.token || '';

/** รับผลการเข้าสู่ระบบ: เก็บ token, ดึงความคืบหน้าจากระบบมารวมกับในเครื่อง */
function finish(data, remember = true) {
  if (!data.user || !data.token) throw new AuthError('server-outdated');
  const user = { ...data.user, ...(data.suggest ? { suggest: data.suggest } : {}) };
  adoptLegacy(user.email, user.uid);
  hydrate(user.uid, data.progress, data.results);
  write({ token: data.token, user }, remember);
  return user;
}

export async function registerUser({ firstName, lastName, email, password, studentId = '', classroom = '' }) {
  const data = { firstName, lastName, email, password, studentId, classroom };
  try {
    return finish(await callApi('register', data));
  } catch (err) {
    if (!isOffline(err)) throw err;
    return finishLocal(await localRegister(data), true); // ระบบหลังบ้านยังไม่พร้อม → สมัครไว้ในเครื่องก่อน
  }
}

export async function loginUser(email, password, remember = true) {
  try {
    return finish(await callApi('login', { email, password }), remember);
  } catch (err) {
    if (isOffline(err)) {
      // ระบบหลังบ้านยังไม่พร้อม → เข้าด้วยบัญชีในเครื่อง
      const acc = await localCheck(email, password);
      if (acc) return finishLocal(acc, remember);
      throw new AuthError(acc === false ? 'wrong-password' : 'user-not-found');
    }
    if (err.code === 'user-not-found') {
      // เคยสมัครไว้ในเครื่อง (ตอนระบบยังไม่พร้อม) → ย้ายบัญชีขึ้นระบบให้อัตโนมัติ
      const acc = await localCheck(email, password);
      if (acc === false) throw new AuthError('wrong-password');
      if (acc) {
        const u = localUser(acc);
        return finish(
          await callApi('register', {
            firstName: u.firstName || u.displayName,
            lastName: u.lastName || '-',
            email: acc.email,
            password,
            studentId: u.studentId,
            classroom: u.classroom
          }),
          remember
        );
      }
    }
    throw err;
  }
}

/**
 * ตรวจ token กับเซิร์ฟเวอร์และดึงข้อมูลล่าสุด (เช่นเรียนจากอีกเครื่องมา)
 * @returns user ใหม่ | null (token หมดอายุ) | undefined (เชื่อมต่อไม่ได้ — ใช้ข้อมูลในเครื่องต่อ)
 */
export async function refreshSession() {
  const s = read();
  if (!s?.token) return null;
  if (s.token === LOCAL_TOKEN) return undefined; // บัญชีในเครื่อง
  try {
    const data = await callApi('me', { token: s.token });
    hydrate(data.user.uid, data.progress, data.results);
    const user = { ...data.user };
    write({ token: s.token, user });
    return user;
  } catch (err) {
    if (err.code === 'invalid-token') {
      write(null);
      return null;
    }
    return undefined;
  }
}

/** บันทึกชื่อ นามสกุล เลขที่ ห้อง */
export async function updateProfile(fields) {
  const s = read();
  if (!s?.token) throw new AuthError('invalid-token');
  if (s.token === LOCAL_TOKEN) {
    const all = readLocal();
    const acc = all[normalize(s.user.email)];
    if (!acc) throw new AuthError('invalid-token');
    Object.assign(acc, fields, { displayName: `${fields.firstName} ${fields.lastName}`.trim() });
    writeLocal(all);
    const user = localUser(acc);
    write({ token: LOCAL_TOKEN, user });
    return user;
  }
  const data = await callApi('profile', { token: s.token, ...fields });
  const user = { ...data.user };
  write({ token: s.token, user });
  return user;
}

export const requestPasswordReset = (email) => callApi('resetRequest', { email });
export const confirmPasswordReset = ({ email, code, password }) => callApi('resetConfirm', { email, code, password });

export function logoutUser() {
  const token = currentToken();
  write(null);
  if (token && token !== LOCAL_TOKEN) callApi('logout', { token }, { keepalive: true }).catch(() => {});
}

/** แปลงรหัสข้อผิดพลาดเป็นข้อความภาษาไทย */
export function authErrorMessage(err) {
  const map = {
    'user-not-found': 'ไม่พบบัญชีอีเมลนี้ ลองสมัครสมาชิกก่อนนะ',
    'wrong-password': 'รหัสผ่านไม่ถูกต้อง',
    'email-already-in-use': 'อีเมลนี้สมัครสมาชิกไว้แล้ว ลองเข้าสู่ระบบแทน',
    'invalid-email': 'กรุณากรอกอีเมลให้ถูกต้อง',
    'weak-password': 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
    'name-required': 'กรุณากรอกชื่อและนามสกุล',
    'use-google': 'บัญชีนี้ยังไม่มีรหัสผ่าน กรุณาแจ้งครูผู้ดูแล',
    'google-failed': 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง',
    'google-unverified': 'บัญชี Google นี้ยังไม่ได้ยืนยันอีเมล',
    'google-client-mismatch': 'ตั้งค่า Google Client ID ในเว็บกับใน Apps Script ไม่ตรงกัน (แจ้งครูผู้ดูแล)',
    'invalid-token': 'หมดเวลาการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่',
    'wrong-code': 'รหัสยืนยันไม่ถูกต้อง',
    'code-expired': 'รหัสยืนยันหมดอายุ กรุณากดส่งรหัสใหม่',
    'admin-wrong': 'รหัส Admin ไม่ถูกต้อง',
    'admin-locked': 'ใส่รหัสผิดหลายครั้ง กรุณารอ 10 นาทีแล้วลองใหม่',
    'admin-expired': 'หมดเวลาเข้าใช้ Admin กรุณาใส่รหัสอีกครั้ง',
    'server-unreachable': 'ส่วนนี้ต้องเชื่อมต่อ Google Sheet ก่อน ตอนนี้ยังใช้ไม่ได้ กรุณาแจ้งครูผู้ดูแล',
    network: 'เชื่อมต่อระบบไม่ได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่',
    'server-outdated': 'ระบบหลังบ้านยังเป็นเวอร์ชันเก่า (ครูต้อง Deploy Code.gs เวอร์ชันใหม่)',
    server: 'ระบบขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้ง'
  };
  return map[err?.code] || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง';
}

export { AuthError };
