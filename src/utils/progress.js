import { useCallback, useEffect, useState } from 'react';
import { missions } from '../data/missions';
import { units } from '../data/course';
import { isPreview } from './preview';

/**
 * ความคืบหน้าในเกม Chatbot Quest (เก็บในเบราว์เซอร์ แยกตามผู้ใช้)
 * { xp, missions: { [id]: { stars, best, attempts, design } }, lessons: { [no]: true } }
 * ทุกคอมโพเนนต์ที่ใช้ useProgress ใช้ข้อมูลชุดเดียวกัน (อัปเดตพร้อมกัน เช่น XP บนแถบเมนู)
 */
const keyFor = (uid) => `chatbot-learning:quest:${uid || 'guest'}`;
const blank = () => ({ xp: 0, missions: {}, lessons: {} });

const cache = {};
const listeners = new Set();

export function loadProgress(uid) {
  const k = keyFor(uid);
  if (cache[k]) return cache[k];
  try {
    const raw = window.localStorage.getItem(k);
    cache[k] = raw ? { ...blank(), ...JSON.parse(raw) } : blank();
  } catch {
    cache[k] = blank();
  }
  return cache[k];
}

function commit(uid, next) {
  const k = keyFor(uid);
  cache[k] = next;
  try {
    window.localStorage.setItem(k, JSON.stringify(next));
  } catch {
    // บันทึกไม่ได้ (เช่นโหมดส่วนตัว) — ยังเล่นต่อได้ตามปกติ
  }
  listeners.forEach((fn) => fn(k));
}

/** แทนที่ข้อมูลทั้งชุด (ใช้ตอนดึงข้อมูลจากระบบ) */
export function replaceProgress(uid, data) {
  commit(uid, { ...blank(), ...(data || {}) });
}

/** ฟังการเปลี่ยนแปลงความคืบหน้า (คืนฟังก์ชันยกเลิก) */
export function subscribeProgress(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export const XP_PER_LEVEL = 300;
export const levelOf = (xp) => Math.floor(xp / XP_PER_LEVEL) + 1;

export const totalStars = (p) => Object.values(p.missions).reduce((s, m) => s + (m.stars || 0), 0);
export const passedCount = (p) => missions.filter((m) => p.missions[m.id]?.stars > 0).length;

/** ความคืบหน้ารายวิชา (%) — อ่านบทเรียน 40% + ผ่านภารกิจ 60% */
export const courseProgress = (p) =>
  Math.round((Object.keys(p.lessons).length / units.length) * 40 + (passedCount(p) / missions.length) * 60);

/** ภารกิจเปิดให้เล่นเมื่อภารกิจก่อนหน้าผ่านแล้ว (โหมดพรีเซนต์ของ Admin เปิดทุกภารกิจ) */
export const isUnlocked = (p, index) => index === 0 || isPreview() || (p.missions[missions[index - 1].id]?.stars || 0) > 0;

export function useProgress(uid) {
  const [p, setP] = useState(() => loadProgress(uid));

  useEffect(() => {
    const k = keyFor(uid);
    setP(loadProgress(uid));
    const on = (changed) => changed === k && setP(cache[k]);
    listeners.add(on);
    return () => listeners.delete(on);
  }, [uid]);

  const update = useCallback((fn) => commit(uid, fn(structuredClone(loadProgress(uid)))), [uid]);

  /** บันทึกแบบร่างบอท */
  const saveDesign = useCallback(
    (id, design) =>
      update((d) => {
        d.missions[id] = { ...(d.missions[id] || {}), design, designAt: Date.now() };
        return d;
      }),
    [update]
  );

  /** บันทึกผลภารกิจ คืน XP ที่ได้รับรอบนี้ */
  const recordRun = useCallback(
    (id, result) => {
      const oldStars = loadProgress(uid).missions[id]?.stars || 0;
      const gain = result.pass ? (oldStars === 0 ? 100 : 0) + Math.max(0, result.stars - oldStars) * 50 : 10;
      update((d) => {
        const m = d.missions[id] || {};
        d.missions[id] = {
          ...m,
          attempts: (m.attempts || 0) + 1,
          stars: Math.max(m.stars || 0, result.stars),
          best: Math.max(m.best || 0, result.percent)
        };
        d.xp += gain;
        return d;
      });
      return gain;
    },
    [uid, update]
  );

  const readLesson = useCallback(
    (no) =>
      update((d) => {
        if (!d.lessons[no]) {
          d.lessons[no] = true;
          d.xp += 20;
        }
        return d;
      }),
    [update]
  );

  return { progress: p, saveDesign, recordRun, readLesson };
}
