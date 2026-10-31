/**
 * ซิงก์ความคืบหน้า + ผลแบบทดสอบ ขึ้นระบบ (Google Sheet) อัตโนมัติ
 * - ทุกครั้งที่ข้อมูลเปลี่ยน รอ 1.5 วินาทีแล้วส่งขึ้นระบบ (รวมหลายการเปลี่ยนเป็นครั้งเดียว)
 * - ระบบรวมข้อมูลจากทุกเครื่องให้ (เอาคะแนน/ดาวที่ดีที่สุด และผลสอบล่าสุด)
 * - ออฟไลน์อยู่: เก็บไว้ในเครื่องก่อน แล้วส่งใหม่เมื่อเชื่อมต่อได้
 */
import { useEffect, useState } from 'react';
import { callApi } from './api';
import { loadProgress, replaceProgress, subscribeProgress } from '../utils/progress';
import { readResults, replaceResults, subscribeResults } from '../utils/quizStorage';

const LEGACY_ACCOUNTS = 'chatbot-learning:accounts';
const questKey = (uid) => `chatbot-learning:quest:${uid}`;
const quizKey = (uid) => `chatbot-learning:quiz-results:${uid}`;

/* ---------- รวมข้อมูล 2 ชุด (ตรงกับ mergeProgress_ ใน Code.gs) ---------- */
export function mergeProgress(a = {}, b = {}) {
  const out = { xp: Math.max(Number(a.xp) || 0, Number(b.xp) || 0), lessons: {}, missions: {} };
  [a.lessons || {}, b.lessons || {}].forEach((l) =>
    Object.keys(l).forEach((k) => {
      if (l[k]) out.lessons[k] = true;
    })
  );
  const am = a.missions || {};
  const bm = b.missions || {};
  new Set([...Object.keys(am), ...Object.keys(bm)]).forEach((id) => {
    const x = am[id] || {};
    const y = bm[id] || {};
    const m = {
      stars: Math.max(x.stars || 0, y.stars || 0),
      best: Math.max(x.best || 0, y.best || 0),
      attempts: Math.max(x.attempts || 0, y.attempts || 0)
    };
    const d = (y.designAt || 0) >= (x.designAt || 0) ? (y.design ? y : x) : x.design ? x : y;
    if (d.design) {
      m.design = d.design;
      m.designAt = d.designAt || 0;
    }
    out.missions[id] = m;
  });
  return out;
}

export function mergeResults(a = {}, b = {}) {
  const out = {};
  new Set([...Object.keys(a), ...Object.keys(b)]).forEach((k) => {
    const x = a[k];
    const y = b[k];
    out[k] = !x ? y : !y ? x : String(y.finishedAt || '') >= String(x.finishedAt || '') ? y : x;
  });
  return out;
}

let applying = false;

/** นำข้อมูลจากระบบมารวมกับในเครื่อง */
export function hydrate(uid, progress, results) {
  if (!uid) return;
  applying = true;
  try {
    const p = mergeProgress(loadProgress(uid), progress || {});
    if (JSON.stringify(p) !== JSON.stringify(loadProgress(uid))) replaceProgress(uid, p);
    const r = mergeResults(readResults(uid), results || {});
    if (JSON.stringify(r) !== JSON.stringify(readResults(uid))) replaceResults(uid, r);
  } finally {
    applying = false;
  }
}

/** ผู้ที่เคยใช้ระบบเดิม (บัญชีในเครื่อง) — ย้ายความคืบหน้าเดิมมาไว้ในบัญชีจริง */
export function adoptLegacy(email, uid) {
  try {
    const old = JSON.parse(localStorage.getItem(LEGACY_ACCOUNTS) || '{}')[String(email).toLowerCase()];
    if (!old?.uid || old.uid === uid || old.adopted) return;
    const p = JSON.parse(localStorage.getItem(questKey(old.uid)) || 'null');
    const r = JSON.parse(localStorage.getItem(quizKey(old.uid)) || 'null');
    if (p) replaceProgress(uid, mergeProgress(loadProgress(uid), p));
    if (r) replaceResults(uid, mergeResults(readResults(uid), r));
    const all = JSON.parse(localStorage.getItem(LEGACY_ACCOUNTS) || '{}');
    all[String(email).toLowerCase()] = { ...old, adopted: uid };
    localStorage.setItem(LEGACY_ACCOUNTS, JSON.stringify(all));
  } catch {
    /* ไม่เป็นไร */
  }
}

/* ---------- ส่งขึ้นระบบอัตโนมัติ ---------- */
let token = '';
let uid = '';
let timer = null;
let dirty = false;
let unsubs = [];
let status = 'saved'; // saved | saving | offline | local
const statusListeners = new Set();

function setStatus(s) {
  status = s;
  statusListeners.forEach((fn) => fn(s));
}

function schedule() {
  if (applying || !token) return;
  dirty = true;
  setStatus('saving');
  clearTimeout(timer);
  timer = setTimeout(push, 1500);
}

async function push(opts) {
  clearTimeout(timer);
  if (!token || !dirty) return;
  const t = token;
  const u = uid;
  dirty = false;
  try {
    const data = await callApi('save', { token: t, progress: loadProgress(u), results: readResults(u) }, opts);
    if (t !== token) return;
    hydrate(u, data.progress, data.results);
    if (!dirty) setStatus('saved');
  } catch (err) {
    if (t !== token) return;
    dirty = true;
    setStatus('offline');
    if (err.code !== 'invalid-token') timer = setTimeout(push, 20000);
  }
}

function onHide() {
  if (document.visibilityState === 'hidden' && dirty) push({ keepalive: true });
}

function onOnline() {
  if (dirty) push();
}

export function startSync(t, u) {
  stopSync();
  if (t === 'local') return setStatus('local'); // บัญชีในเครื่อง — ไม่ส่งขึ้นระบบ
  if (!t || !u) return;
  token = t;
  uid = u;
  unsubs = [subscribeProgress(schedule), subscribeResults(schedule)];
  document.addEventListener('visibilitychange', onHide);
  window.addEventListener('online', onOnline);
  setStatus('saved');
}

/** ส่งขึ้นระบบทันที (หลังเข้าสู่ระบบ — เผื่อในเครื่องมีข้อมูลที่ระบบยังไม่มี) */
export function syncNow() {
  if (!token) return;
  dirty = true;
  push();
}

export function stopSync() {
  clearTimeout(timer);
  unsubs.forEach((f) => f());
  unsubs = [];
  token = '';
  uid = '';
  dirty = false;
  document.removeEventListener('visibilitychange', onHide);
  window.removeEventListener('online', onOnline);
}

/** สถานะการบันทึก สำหรับแสดงบนเมนูโปรไฟล์ */
export function useSyncStatus() {
  const [s, setS] = useState(status);
  useEffect(() => {
    statusListeners.add(setS);
    return () => statusListeners.delete(setS);
  }, []);
  return s;
}
