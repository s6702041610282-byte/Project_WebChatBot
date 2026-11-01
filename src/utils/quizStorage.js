/**
 * บันทึกผลแบบทดสอบไว้ในเบราว์เซอร์ แยกตามบัญชีผู้ใช้ (และซิงก์ขึ้นระบบ ดู services/cloudSync.js)
 */
let currentUid = null;
const listeners = new Set();

const keyFor = (uid) => `chatbot-learning:quiz-results:${uid || 'guest'}`;

/** เรียกจาก AuthContext ทุกครั้งที่สถานะการเข้าสู่ระบบเปลี่ยน */
export function setStorageUser(uid) {
  currentUid = uid;
}

export function readResults(uid) {
  try {
    const raw = window.localStorage.getItem(keyFor(uid));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function replaceResults(uid, all) {
  try {
    window.localStorage.setItem(keyFor(uid), JSON.stringify(all || {}));
  } catch {
    // เบราว์เซอร์ไม่อนุญาตให้บันทึก (เช่นโหมดส่วนตัว) เว็บยังใช้งานได้ตามปกติ
  }
  listeners.forEach((fn) => fn(uid));
}

export function subscribeResults(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getResult(quizId) {
  return readResults(currentUid)[quizId] || null;
}

export function getAllResults() {
  return readResults(currentUid);
}

/**
 * @param {string} quizId
 * @param {{score:number,total:number,answers:any[],finishedAt:string}} result
 */
export function saveResult(quizId, result) {
  const all = readResults(currentUid);
  all[quizId] = result;
  replaceResults(currentUid, all);
}

/** ลบผลแบบทดสอบ (ใช้ในโหมดพรีเซนต์ของ Admin เพื่อทำซ้ำได้) */
export function clearResult(quizId) {
  const all = readResults(currentUid);
  delete all[quizId];
  replaceResults(currentUid, all);
}
