/**
 * ChatBot Learning — ระบบหลังบ้าน (Google Apps Script + Google Sheet)
 *  • ระบบบัญชีจริง: สมัคร/เข้าสู่ระบบด้วยอีเมล, ลืมรหัสผ่าน (ส่งรหัสยืนยัน 6 หลักทางอีเมล), ข้อมูลส่วนตัว (ชื่อ นามสกุล เลขที่ ห้อง)
 *  • เก็บความคืบหน้า/คะแนนไว้บนชีต → ออกจากระบบแล้วกลับมา หรือเปลี่ยนเครื่อง ข้อมูลยังอยู่
 *  • บันทึกเหตุการณ์การเรียนลงชีตสรุปสำหรับครู
 *
 * วิธีติดตั้ง (ทำครั้งเดียว)
 * 1) เปิดโปรเจกต์ Apps Script เดิม → วางโค้ดนี้แทนทั้งหมดในไฟล์ Code.gs
 * 2) เลือกฟังก์ชัน setup แล้วกด Run → อนุญาตสิทธิ์ (Sheet, ส่งอีเมล)
 * 3) Deploy → Manage deployments → ✏️ แก้ไข → Version: New version → Deploy
 *    (Execute as: Me · Who has access: Anyone)  ลิงก์ /exec เดิมจะใช้ต่อได้
 */

const SHEET_ID = '1sEuzePrks-OtYy8ZZTp4wmnO6yAGIvssfw6RH_5gG4Y';
const APP_NAME = 'ChatBot Learning';
const ADMIN_PASSWORD = '123456'; // รหัสเข้ามุม Admin ของครู (เปลี่ยนได้ แล้ว Deploy ใหม่)
const TZ = 'Asia/Bangkok';

const SHEETS = {
  summary: {
    name: 'สรุปรายบุคคล',
    color: '#3b5bdb',
    head: ['UID', 'ชื่อ-สกุล', 'เลขที่', 'ห้อง', 'อีเมล', 'ก่อนเรียน', 'หลังเรียน', 'พัฒนาการ', 'บทเรียนที่ผ่าน', 'ภารกิจที่ผ่าน', 'ดาวรวม', 'XP', 'Level', 'ขั้นตอนปัจจุบัน', 'อัปเดตล่าสุด']
  },
  users: {
    name: 'ผู้ใช้',
    color: '#7048e8',
    head: ['UID', 'ชื่อ-สกุล', 'เลขที่', 'ห้อง', 'อีเมล', 'วิธีเข้าสู่ระบบ', 'เข้าใช้ครั้งแรก', 'เข้าใช้ล่าสุด', 'จำนวนครั้งที่เข้าสู่ระบบ']
  },
  logins: {
    name: 'การเข้าสู่ระบบ',
    color: '#1c7ed6',
    head: ['วันเวลา', 'UID', 'ชื่อ-สกุล', 'เลขที่', 'ห้อง', 'วิธีเข้าสู่ระบบ']
  },
  lessons: {
    name: 'การเรียน',
    color: '#0ca678',
    head: ['วันเวลา', 'UID', 'ชื่อ-สกุล', 'เลขที่', 'ห้อง', 'กิจกรรม', 'พาร์ท', 'ชื่อพาร์ท', 'ผ่านแล้วสะสม']
  },
  quizzes: {
    name: 'แบบทดสอบ',
    color: '#f76707',
    head: ['วันเวลา', 'UID', 'ชื่อ-สกุล', 'เลขที่', 'ห้อง', 'แบบทดสอบ', 'คะแนน', 'เต็ม', 'ร้อยละ', 'เวลาที่ใช้', 'ข้อ 1', 'ข้อ 2', 'ข้อ 3', 'ข้อ 4', 'ข้อ 5', 'ข้อ 6', 'ข้อ 7', 'ข้อ 8', 'ข้อ 9', 'ข้อ 10']
  },
  missions: {
    name: 'กิจกรรมภารกิจ',
    color: '#d6336c',
    head: ['วันเวลา', 'UID', 'ชื่อ-สกุล', 'เลขที่', 'ห้อง', 'ภารกิจ', 'ครั้งที่', 'ตอบถูก', 'ร้อยละ', 'ผล', 'ดาว', 'XP ที่ได้', 'ชื่อบอท', 'จำนวน FAQ', 'ปุ่มเมนู', 'สิ่งที่ต้องแก้']
  },
  log: {
    name: 'Log',
    color: '#868e96',
    head: ['วันเวลา', 'เหตุการณ์', 'UID', 'ชื่อ-สกุล', 'ข้อมูล (JSON)']
  },
  /* ----- ชีตของระบบ (ห้ามแก้หัวตาราง) ----- */
  accounts: {
    name: 'ระบบ_บัญชี',
    color: '#212529',
    head: ['UID', 'อีเมล', 'ชื่อ', 'นามสกุล', 'เลขที่', 'ห้อง', 'วิธีสมัคร', 'รูปโปรไฟล์', 'สมัครเมื่อ', 'เข้าใช้ล่าสุด', 'salt', 'passwordHash', 'resetCode', 'resetExpire', 'resetTries']
  },
  sessions: {
    name: 'ระบบ_เซสชัน',
    color: '#212529',
    head: ['token', 'UID', 'สร้างเมื่อ']
  },
  data: {
    name: 'ระบบ_ความคืบหน้า',
    color: '#212529',
    head: ['UID', 'อีเมล', 'progress (JSON)', 'results (JSON)', 'อัปเดตล่าสุด']
  }
};
const SYSTEM_SHEETS = ['accounts', 'sessions', 'data'];

/* ---------- ติดตั้งชีต ---------- */
function setup() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  Object.keys(SHEETS).forEach(function (k) {
    sheetOf_(ss, k);
  });
  const blank = ss.getSheetByName('Sheet1') || ss.getSheetByName('แผ่น1') || ss.getSheetByName('ชีต1');
  if (blank && blank.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(blank);
  return 'ok';
}

function sheetOf_(ss, key) {
  const def = SHEETS[key];
  let sh = ss.getSheetByName(def.name);
  if (!sh) {
    sh = ss.insertSheet(def.name);
    sh.getRange(1, 1, 1, def.head.length)
      .setValues([def.head])
      .setFontWeight('bold')
      .setFontColor('#ffffff')
      .setBackground(def.color)
      .setHorizontalAlignment('center')
      .setVerticalAlignment('middle');
    sh.setFrozenRows(1);
    sh.setRowHeight(1, 32);
    sh.setTabColor(def.color);
    sh.autoResizeColumns(1, def.head.length);
    if (SYSTEM_SHEETS.indexOf(key) >= 0) {
      sh.getRange('A:Z').setNumberFormat('@'); // เก็บเป็นข้อความ (ไม่ให้เลขที่/รหัสกลายเป็นตัวเลข)
      if (key === 'accounts') sh.hideColumns(11, 5);
    } else if (key !== 'log') sh.hideColumns(key === 'summary' || key === 'users' ? 1 : 2);
  }
  return sh;
}

/* ---------- รับข้อมูลจากเว็บ ---------- */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (body.action) return json_(api_(body));
    handle_(body);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, code: (err && err.code) || 'server', error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return json_({ ok: true, app: 'ChatBot Learning logger', time: now_() });
}

function handle_(b) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const u = b.user || {};
  const d = b.data || {};
  const s = b.summary || {};
  const t = now_();
  const who = [u.uid || '', u.name || '', u.studentId || '', u.classroom || ''];

  sheetOf_(ss, 'log').appendRow([t, b.event || '', u.uid || '', u.name || '', JSON.stringify(d)]);
  if (u.uid && b.event !== 'login') refreshUserInfo_(ss, u);

  switch (b.event) {
    case 'login': {
      sheetOf_(ss, 'logins').appendRow([t].concat(who, [d.method || '']));
      upsertUser_(ss, u, d.method, t);
      break;
    }
    case 'lesson_start':
      sheetOf_(ss, 'lessons').appendRow([t].concat(who, ['เริ่มเรียน', d.part || 1, '', s.lessons || 0]));
      break;
    case 'lesson_pass':
      sheetOf_(ss, 'lessons').appendRow([t].concat(who, ['ผ่านพาร์ท', d.part || '', d.title || '', s.lessons || '']));
      break;
    case 'quiz': {
      const per = (d.perQuestion || []).map(function (v) {
        return v ? '✓' : '✗';
      });
      sheetOf_(ss, 'quizzes').appendRow(
        [t].concat(who, [d.quizTitle || d.quizId, d.score, d.total, (d.percent || 0) + '%', mmss_(d.seconds)], per)
      );
      break;
    }
    case 'mission':
      sheetOf_(ss, 'missions').appendRow(
        [t].concat(who, [
          d.missionTitle || d.missionId,
          d.attempt || '',
          (d.correct || 0) + '/' + (d.total || 0),
          (d.percent || 0) + '%',
          d.pass ? 'ผ่าน' : 'ไม่ผ่าน',
          d.stars || 0,
          d.xp || 0,
          d.botName || '',
          d.faqCount || 0,
          d.menuCount || 0,
          d.issues || ''
        ])
      );
      break;
  }

  if (u.uid) upsertSummary_(ss, u, s, t);
}

/* ---------- ตารางสรุป ---------- */
function findRow_(sh, uid) {
  const last = sh.getLastRow();
  if (last < 2) return 0;
  const ids = sh.getRange(2, 1, last - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) if (ids[i][0] === uid) return i + 2;
  return 0;
}

function upsertUser_(ss, u, method, t) {
  const sh = sheetOf_(ss, 'users');
  const row = findRow_(sh, u.uid);
  if (row) {
    const count = Number(sh.getRange(row, 9).getValue()) || 0;
    sh.getRange(row, 2, 1, 8).setValues([[u.name || '', u.studentId || '', u.classroom || '', u.email || '', method || '', sh.getRange(row, 7).getValue(), t, count + 1]]);
  } else {
    sh.appendRow([u.uid, u.name || '', u.studentId || '', u.classroom || '', u.email || '', method || '', t, t, 1]);
  }
}

/** อัปเดตชื่อ/เลขที่/ห้องในชีตผู้ใช้ (เช่นหลังแก้ข้อมูลส่วนตัว) โดยไม่นับเป็นการเข้าสู่ระบบ */
function refreshUserInfo_(ss, u) {
  const sh = sheetOf_(ss, 'users');
  const row = findRow_(sh, u.uid);
  if (row) sh.getRange(row, 2, 1, 4).setValues([[u.name || '', u.studentId || '', u.classroom || '', u.email || '']]);
}

function upsertSummary_(ss, u, s, t) {
  const sh = sheetOf_(ss, 'summary');
  const pre = s.pretest === '' || s.pretest === undefined ? '' : s.pretest;
  const post = s.posttest === '' || s.posttest === undefined ? '' : s.posttest;
  const gain = pre !== '' && post !== '' ? post - pre : '';
  const step =
    pre === ''
      ? '1 แบบทดสอบก่อนเรียน'
      : (s.lessons || 0) < (s.lessonsTotal || 6)
        ? '2 บทเรียน'
        : !(s.missionsPassed > 0)
          ? '3 ลงมือปฏิบัติ'
          : post === ''
            ? '4 แบบทดสอบหลังเรียน'
            : 'เรียนครบทุกขั้น';
  const vals = [
    u.uid,
    u.name || '',
    u.studentId || '',
    u.classroom || '',
    u.email || '',
    pre,
    post,
    gain,
    (s.lessons || 0) + '/' + (s.lessonsTotal || 6),
    (s.missionsPassed || 0) + '/3',
    s.stars || 0,
    s.xp || 0,
    s.level || 1,
    step,
    t
  ];
  const row = findRow_(sh, u.uid);
  if (row) sh.getRange(row, 1, 1, vals.length).setValues([vals]);
  else sh.appendRow(vals);
}

/* ---------- เครื่องมือ ---------- */
function now_() {
  return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm:ss');
}

function mmss_(sec) {
  if (sec === undefined || sec === null || sec === '') return '';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m + ':' + (s < 10 ? '0' : '') + s;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

/* =====================================================================
 *  ระบบบัญชีผู้ใช้ + ซิงก์ความคืบหน้า  (เว็บส่ง { action: ... })
 * ===================================================================== */
const ACC = {};
SHEETS.accounts.head.forEach(function (h, i) {
  ACC[h] = i;
});
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SESSION_DAYS = 120;

function api_(b) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  switch (b.action) {
    case 'register':
      return register_(ss, b);
    case 'login':
      return login_(ss, b);
    case 'me':
      return me_(ss, b);
    case 'profile':
      return profile_(ss, b);
    case 'save':
      return save_(ss, b);
    case 'logout':
      return logout_(ss, b);
    case 'resetRequest':
      return resetRequest_(ss, b);
    case 'resetConfirm':
      return resetConfirm_(ss, b);
    case 'adminLogin':
      return adminLogin_(b);
    case 'admin':
      return adminData_(ss, b);
    default:
      fail_('bad-action');
  }
}

/* ----- การกระทำ ----- */
function register_(ss, b) {
  const email = normEmail_(b.email);
  if (!EMAIL_RE.test(email)) fail_('invalid-email');
  if (String(b.password || '').length < 6) fail_('weak-password');
  const firstName = clean_(b.firstName, 60);
  const lastName = clean_(b.lastName, 60);
  if (!firstName || !lastName) fail_('name-required');
  const sh = sheetOf_(ss, 'accounts');
  if (findAcc_(sh, 'อีเมล', email)) fail_('email-already-in-use');
  const salt = Utilities.getUuid();
  const a = {
    UID: 'u_' + Utilities.getUuid().replace(/-/g, '').slice(0, 12),
    'อีเมล': email,
    'ชื่อ': firstName,
    'นามสกุล': lastName,
    'เลขที่': clean_(b.studentId, 10),
    'ห้อง': clean_(b.classroom, 20),
    'วิธีสมัคร': 'password',
    'รูปโปรไฟล์': '',
    'สมัครเมื่อ': now_(),
    'เข้าใช้ล่าสุด': now_(),
    salt: salt,
    passwordHash: hash_(salt, b.password)
  };
  sh.appendRow(accRow_(a));
  return reply_(ss, a, newSession_(ss, a.UID));
}

function login_(ss, b) {
  const email = normEmail_(b.email);
  const sh = sheetOf_(ss, 'accounts');
  const row = findAcc_(sh, 'อีเมล', email);
  if (!row) fail_('user-not-found');
  const a = readAcc_(sh, row);
  if (!a.passwordHash) fail_('use-google');
  if (hash_(a.salt, b.password) !== a.passwordHash) fail_('wrong-password');
  touch_(sh, row);
  return reply_(ss, a, newSession_(ss, a.UID));
}

function me_(ss, b) {
  const s = auth_(ss, b.token);
  touch_(s.sh, s.row);
  return reply_(ss, s.acc, b.token);
}

function profile_(ss, b) {
  const s = auth_(ss, b.token);
  const firstName = clean_(b.firstName, 60);
  const lastName = clean_(b.lastName, 60);
  if (!firstName || !lastName) fail_('name-required');
  s.acc['ชื่อ'] = firstName;
  s.acc['นามสกุล'] = lastName;
  s.acc['เลขที่'] = clean_(b.studentId, 10);
  s.acc['ห้อง'] = clean_(b.classroom, 20);
  writeAcc_(s.sh, s.row, s.acc);
  return { ok: true, user: publicUser_(s.acc) };
}

function save_(ss, b) {
  const s = auth_(ss, b.token);
  const sh = sheetOf_(ss, 'data');
  const row = findIn_(sh, 1, s.acc.UID);
  let old = { progress: {}, results: {} };
  if (row) {
    const v = sh.getRange(row, 1, 1, 4).getValues()[0];
    old = { progress: parse_(v[2]), results: parse_(v[3]) };
  }
  const progress = mergeProgress_(old.progress, b.progress || {});
  const results = mergeResults_(old.results, b.results || {});
  const vals = [[s.acc.UID, s.acc['อีเมล'], JSON.stringify(progress), JSON.stringify(results), now_()]];
  if (row) sh.getRange(row, 1, 1, 5).setValues(vals);
  else sh.appendRow(vals[0]);
  return { ok: true, progress: progress, results: results };
}

function logout_(ss, b) {
  const sh = sheetOf_(ss, 'sessions');
  const row = findIn_(sh, 1, b.token);
  if (row) sh.deleteRow(row);
  return { ok: true };
}

function resetRequest_(ss, b) {
  const email = normEmail_(b.email);
  const sh = sheetOf_(ss, 'accounts');
  const row = findAcc_(sh, 'อีเมล', email);
  if (!row) fail_('user-not-found');
  const a = readAcc_(sh, row);
  if (!a.passwordHash) fail_('use-google');
  const code = String(Math.floor(100000 + Math.random() * 900000));
  a.resetCode = hash_(a.salt, code);
  a.resetExpire = String(Date.now() + 15 * 60 * 1000);
  a.resetTries = '0';
  writeAcc_(sh, row, a);
  MailApp.sendEmail({
    to: email,
    name: APP_NAME,
    subject: 'รหัสยืนยันสำหรับตั้งรหัสผ่านใหม่ — ' + APP_NAME,
    htmlBody:
      '<div style="font-family:sans-serif;font-size:16px;color:#1f2a44">' +
      '<p>สวัสดี ' + (a['ชื่อ'] || '') + '</p>' +
      '<p>รหัสยืนยันสำหรับตั้งรหัสผ่านใหม่ของคุณคือ</p>' +
      '<p style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#3b5bdb">' + code + '</p>' +
      '<p>รหัสนี้ใช้ได้ภายใน 15 นาที ถ้าไม่ได้ขอตั้งรหัสผ่านใหม่ ไม่ต้องทำอะไร</p></div>'
  });
  return { ok: true };
}

function resetConfirm_(ss, b) {
  const email = normEmail_(b.email);
  if (String(b.password || '').length < 6) fail_('weak-password');
  const sh = sheetOf_(ss, 'accounts');
  const row = findAcc_(sh, 'อีเมล', email);
  if (!row) fail_('user-not-found');
  const a = readAcc_(sh, row);
  if (!a.resetCode || Number(a.resetExpire) < Date.now()) fail_('code-expired');
  if (Number(a.resetTries || 0) >= 5) fail_('code-expired');
  if (hash_(a.salt, String(b.code || '').trim()) !== a.resetCode) {
    a.resetTries = String(Number(a.resetTries || 0) + 1);
    writeAcc_(sh, row, a);
    fail_('wrong-code');
  }
  a.salt = Utilities.getUuid();
  a.passwordHash = hash_(a.salt, b.password);
  a.resetCode = '';
  a.resetExpire = '';
  a.resetTries = '';
  writeAcc_(sh, row, a);
  return { ok: true };
}

/* ----- เซสชัน ----- */
function newSession_(ss, uid) {
  const token = Utilities.getUuid() + Utilities.getUuid().replace(/-/g, '');
  sheetOf_(ss, 'sessions').appendRow([token, uid, String(Date.now())]);
  return token;
}

function auth_(ss, token) {
  if (!token) fail_('invalid-token');
  const ssh = sheetOf_(ss, 'sessions');
  const srow = findIn_(ssh, 1, token);
  if (!srow) fail_('invalid-token');
  const v = ssh.getRange(srow, 1, 1, 3).getValues()[0];
  if (Date.now() - Number(v[2]) > SESSION_DAYS * 864e5) {
    ssh.deleteRow(srow);
    fail_('invalid-token');
  }
  const sh = sheetOf_(ss, 'accounts');
  const row = findAcc_(sh, 'UID', v[1]);
  if (!row) fail_('invalid-token');
  return { sh: sh, row: row, acc: readAcc_(sh, row) };
}

function reply_(ss, a, token) {
  const sh = sheetOf_(ss, 'data');
  const row = findIn_(sh, 1, a.UID);
  const v = row ? sh.getRange(row, 1, 1, 4).getValues()[0] : ['', '', '{}', '{}'];
  return { ok: true, token: token, user: publicUser_(a), progress: parse_(v[2]), results: parse_(v[3]) };
}

function publicUser_(a) {
  const first = a['ชื่อ'] || '';
  const last = a['นามสกุล'] || '';
  return {
    uid: a.UID,
    email: a['อีเมล'],
    firstName: first,
    lastName: last,
    displayName: (first + ' ' + last).trim() || String(a['อีเมล']).split('@')[0],
    studentId: String(a['เลขที่'] || ''),
    classroom: String(a['ห้อง'] || ''),
    provider: a['วิธีสมัคร'] || '',
    photoURL: a['รูปโปรไฟล์'] || '',
    role: 'student'
  };
}

/* ----- อ่าน/เขียนแถวบัญชี ----- */
function findIn_(sh, col, value) {
  if (!value || sh.getLastRow() < 2) return 0;
  const cell = sh
    .getRange(2, col, sh.getLastRow() - 1, 1)
    .createTextFinder(String(value))
    .matchEntireCell(true)
    .matchCase(true)
    .findNext();
  return cell ? cell.getRow() : 0;
}

function findAcc_(sh, field, value) {
  return findIn_(sh, ACC[field] + 1, value);
}

function readAcc_(sh, row) {
  const v = sh.getRange(row, 1, 1, SHEETS.accounts.head.length).getValues()[0];
  const a = {};
  SHEETS.accounts.head.forEach(function (h, i) {
    a[h] = v[i] === null || v[i] === undefined ? '' : String(v[i]);
  });
  return a;
}

function accRow_(a) {
  return SHEETS.accounts.head.map(function (h) {
    return a[h] === undefined ? '' : String(a[h]);
  });
}

function writeAcc_(sh, row, a) {
  sh.getRange(row, 1, 1, SHEETS.accounts.head.length).setValues([accRow_(a)]);
}

function touch_(sh, row) {
  sh.getRange(row, ACC['เข้าใช้ล่าสุด'] + 1).setValue(now_());
}

/* ----- รวมความคืบหน้าจากหลายเครื่อง (เอาค่าที่ดีที่สุด/ล่าสุด) ----- */
function mergeProgress_(a, b) {
  a = a || {};
  b = b || {};
  const out = { xp: Math.max(Number(a.xp) || 0, Number(b.xp) || 0), lessons: {}, missions: {} };
  [a.lessons || {}, b.lessons || {}].forEach(function (l) {
    Object.keys(l).forEach(function (k) {
      if (l[k]) out.lessons[k] = true;
    });
  });
  const am = a.missions || {};
  const bm = b.missions || {};
  Object.keys(am)
    .concat(Object.keys(bm))
    .forEach(function (id) {
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

function mergeResults_(a, b) {
  a = a || {};
  b = b || {};
  const out = {};
  Object.keys(a)
    .concat(Object.keys(b))
    .forEach(function (k) {
      const x = a[k];
      const y = b[k];
      out[k] = !x ? y : !y ? x : String(y.finishedAt || '') >= String(x.finishedAt || '') ? y : x;
    });
  return out;
}

/* ----- เครื่องมือ ----- */
function fail_(code) {
  const e = new Error(code);
  e.code = code;
  throw e;
}

function normEmail_(s) {
  return String(s || '').trim().toLowerCase();
}

function clean_(s, max) {
  return String(s || '')
    .replace(/[\u0000-\u001f<>]/g, '')
    .trim()
    .slice(0, max || 60);
}

function hash_(salt, pw) {
  let h = salt + ':' + pw;
  for (let i = 0; i < 64; i++) {
    h = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, h + salt, Utilities.Charset.UTF_8)
      .map(function (x) {
        return ('0' + (x & 0xff).toString(16)).slice(-2);
      })
      .join('');
  }
  return h;
}

function parse_(s) {
  try {
    return s ? JSON.parse(s) : {};
  } catch (e) {
    return {};
  }
}

/* =====================================================================
 *  มุม Admin ของครู — ดูภาพรวมทั้งห้อง
 * ===================================================================== */
function adminLogin_(b) {
  const cache = CacheService.getScriptCache();
  const tries = Number(cache.get('adm_fail') || 0);
  if (tries >= 10) fail_('admin-locked');
  if (String(b.password || '') !== ADMIN_PASSWORD) {
    cache.put('adm_fail', String(tries + 1), 600);
    fail_('admin-wrong');
  }
  const token = Utilities.getUuid();
  cache.put('adm_' + token, '1', 21600); // ใช้ได้ 6 ชั่วโมง
  return { ok: true, token: token };
}

function adminData_(ss, b) {
  if (!b.token || !CacheService.getScriptCache().get('adm_' + b.token)) fail_('admin-expired');
  const ash = sheetOf_(ss, 'accounts');
  const dsh = sheetOf_(ss, 'data');
  const accs = ash.getLastRow() > 1 ? ash.getRange(2, 1, ash.getLastRow() - 1, 10).getValues() : [];
  const datas = dsh.getLastRow() > 1 ? dsh.getRange(2, 1, dsh.getLastRow() - 1, 5).getValues() : [];
  const byUid = {};
  datas.forEach(function (r) {
    byUid[r[0]] = { progress: parse_(r[2]), results: parse_(r[3]), updatedAt: r[4] };
  });
  const students = accs
    .filter(function (r) {
      return r[0];
    })
    .map(function (r) {
      const d = byUid[r[0]] || { progress: {}, results: {} };
      const p = d.progress || {};
      // ไม่ส่งแบบร่างบอท (ข้อมูลใหญ่) — ส่งเฉพาะคะแนน/ดาว
      const missions = {};
      Object.keys(p.missions || {}).forEach(function (id) {
        const m = p.missions[id];
        missions[id] = { stars: m.stars || 0, best: m.best || 0, attempts: m.attempts || 0 };
      });
      const results = {};
      Object.keys(d.results || {}).forEach(function (k) {
        const x = d.results[k];
        results[k] = { score: x.score, total: x.total, seconds: x.seconds, finishedAt: x.finishedAt };
      });
      return {
        uid: String(r[0]),
        email: String(r[1]),
        firstName: String(r[2]),
        lastName: String(r[3]),
        studentId: String(r[4]),
        classroom: String(r[5]),
        provider: String(r[6]),
        createdAt: String(r[8]),
        lastSeen: String(r[9]),
        progress: { xp: p.xp || 0, lessons: p.lessons || {}, missions: missions },
        results: results
      };
    });
  return { ok: true, students: students, sheetUrl: ss.getUrl(), time: now_() };
}
