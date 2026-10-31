/**
 * ส่งข้อมูลการเรียนไปเก็บใน Google Sheet ผ่าน Google Apps Script (Web App)
 *
 * - เปลี่ยนลิงก์ได้ที่ไฟล์ .env → VITE_SHEETS_URL=... (ไม่ใส่จะใช้ลิงก์ด้านล่าง)
 * - โค้ดฝั่ง Apps Script อยู่ที่ apps-script/Code.gs (วางในโปรเจกต์ Apps Script แล้ว Deploy เป็น Web App)
 * - ส่งแบบ text/plain + no-cors เพื่อไม่ให้ติด CORS (ไม่รออ่านผลตอบกลับ)
 * - ถ้าส่งไม่สำเร็จ (ออฟไลน์) จะเก็บไว้ในเบราว์เซอร์แล้วส่งซ้ำรอบถัดไป
 */
import { loadProgress, passedCount, totalStars, levelOf } from '../utils/progress';
import { getAllResults } from '../utils/quizStorage';
import { units } from '../data/course';

import { API_URL as URL } from './config';

const QUEUE_KEY = 'chatbot-learning:sheet-queue';

let user = null;

/** เรียกจาก AuthContext ทุกครั้งที่สถานะผู้ใช้เปลี่ยน */
export function setLogUser(u) {
  user = u;
  if (u) flushQueue();
}

function summary() {
  if (!user) return {};
  const p = loadProgress(user.uid);
  const r = getAllResults();
  return {
    pretest: r.pretest ? r.pretest.score : '',
    posttest: r.posttest ? r.posttest.score : '',
    total: r.pretest?.total || r.posttest?.total || 10,
    lessons: Object.keys(p.lessons).length,
    lessonsTotal: units.length,
    missionsPassed: passedCount(p),
    stars: totalStars(p),
    xp: p.xp,
    level: levelOf(p.xp)
  };
}

function readQueue() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeQueue(q) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q.slice(-200)));
  } catch {
    /* ไม่เป็นไร */
  }
}

function post(payload) {
  if (!URL || typeof fetch !== 'function') return Promise.resolve(false);
  return fetch(URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
    keepalive: true
  })
    .then(() => true)
    .catch(() => false);
}

async function flushQueue() {
  const q = readQueue();
  if (!q.length) return;
  writeQueue([]);
  const failed = [];
  for (const item of q) {
    // eslint-disable-next-line no-await-in-loop
    if (!(await post(item))) failed.push(item);
  }
  if (failed.length) writeQueue([...failed, ...readQueue()]);
}

/**
 * บันทึกเหตุการณ์
 * event: login | lesson_start | lesson_pass | quiz | mission
 */
export function logEvent(event, data = {}) {
  if (!user) return;
  const payload = {
    event,
    time: new Date().toISOString(),
    user: {
      uid: user.uid,
      name: user.displayName || '',
      email: user.email || '',
      studentId: user.studentId || '',
      classroom: user.classroom || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      provider: user.provider || ''
    },
    data,
    summary: summary()
  };
  post(payload).then((ok) => {
    if (!ok) writeQueue([...readQueue(), payload]);
  });
}
