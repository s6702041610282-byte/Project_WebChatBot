/**
 * เครื่องยนต์บอทแบบ Rule-based (จับคู่คำสำคัญ) — ใช้ทั้งตอนทดลองแชตและตอนเปิดใช้งานจริง
 *
 * design = {
 *   name, avatar, greeting, fallback,
 *   faqs: [{ id, key, keywords: [], answer }],
 *   menu: [{ id, label, faqId }]
 * }
 */

/** ตัดช่องว่าง/เครื่องหมาย แล้วทำเป็นตัวพิมพ์เล็ก เพื่อเทียบข้อความแบบยืดหยุ่น */
export const norm = (s = '') =>
  String(s)
    .toLowerCase()
    .replace(/[\s"'“”‘’!?.,:;()\-–—_/\\]+/g, '');

/** คำสำคัญยาว ≥4 ตัวอักษร ยอมให้สะกดผิดได้ 1 ตัว */
function fuzzyHas(text, kw) {
  if (kw.length < 4) return false;
  for (let i = 0; i + kw.length <= text.length; i++) {
    let diff = 0;
    for (let j = 0; j < kw.length && diff < 2; j++) if (text[i + j] !== kw[j]) diff++;
    if (diff < 2) return true;
  }
  return false;
}

/** หา FAQ ที่ตรงกับข้อความมากที่สุด คืน { faq, hits } หรือ null */
export function matchFaq(design, message) {
  const text = norm(message);
  if (!text) return null;
  let best = null;
  for (const faq of design.faqs) {
    let score = 0;
    const hits = [];
    for (const raw of faq.keywords) {
      const kw = norm(raw);
      if (!kw) continue;
      if (text.includes(kw)) {
        score += 10 + kw.length;
        hits.push(raw);
      } else if (fuzzyHas(text, kw)) {
        score += 5;
        hits.push(raw + '~');
      }
    }
    if (score > 0 && (!best || score > best.score)) best = { faq, hits, score };
  }
  return best;
}

/** ให้บอทตอบข้อความ — คืน { text, faq, kind: 'faq'|'fallback'|'silent' } */
export function reply(design, message) {
  const m = matchFaq(design, message);
  if (m && m.faq.answer.trim()) return { text: m.faq.answer.trim(), faq: m.faq, hits: m.hits, kind: 'faq' };
  if (design.fallback.trim()) return { text: design.fallback.trim(), faq: null, kind: 'fallback' };
  return { text: '', faq: null, kind: 'silent' };
}

/** กดปุ่ม Rich Menu */
export function pressMenu(design, button) {
  const faq = design.faqs.find((f) => f.id === button.faqId);
  if (faq && faq.answer.trim()) return { text: faq.answer.trim(), faq, kind: 'faq' };
  if (design.fallback.trim()) return { text: design.fallback.trim(), faq: null, kind: 'fallback' };
  return { text: '', faq: null, kind: 'silent' };
}

const hasAll = (answer, must) => must.every((t) => norm(answer).includes(norm(t)));

/** ตรวจเงื่อนไขของภารกิจ (แสดงเป็นเช็กลิสต์ระหว่างออกแบบ) */
export function checkRules(mission, design) {
  const { rules, facts } = mission;
  const filled = design.faqs.filter((f) => f.key && f.answer.trim());
  const keys = new Set(filled.map((f) => f.key));
  const menuOk = design.menu.filter((b) => b.label.trim() && design.faqs.some((f) => f.id === b.faqId));
  const list = [
    { id: 'name', label: 'ตั้งชื่อบอท', ok: design.name.trim().length >= 2 },
    { id: 'greeting', label: 'ข้อความต้อนรับ (Greeting)', ok: design.greeting.trim().length >= 10 },
    { id: 'faq', label: `FAQ ครบ ${facts.length} หัวข้อ`, ok: keys.size >= Math.min(rules.minFaq, facts.length), value: `${keys.size}/${facts.length}` },
    {
      id: 'kw',
      label: `ทุกหัวข้อมีคำสำคัญ ≥ ${rules.minKeywords} คำ`,
      ok: filled.length > 0 && filled.every((f) => f.keywords.filter((k) => k.trim()).length >= rules.minKeywords)
    },
    { id: 'menu', label: `Rich Menu ≥ ${rules.minMenu} ปุ่ม`, ok: menuOk.length >= rules.minMenu, value: `${menuOk.length}/${rules.minMenu}` },
    { id: 'fallback', label: 'ข้อความ Fallback', ok: design.fallback.trim().length >= 10 }
  ];
  if (rules.maxAnswer) {
    list.push({
      id: 'short',
      label: `คำตอบสั้น ไม่เกิน ${rules.maxAnswer} ตัวอักษร`,
      ok: filled.length > 0 && filled.every((f) => f.answer.trim().length <= rules.maxAnswer)
    });
  }
  return list;
}

/**
 * จำลองการเปิดใช้งานจริงกับลูกค้าทุกคน
 * คืน { rows, correct, total, percent, rulesOk, pass, stars, issues }
 */
export function runSimulation(mission, design) {
  const factOf = (key) => mission.facts.find((f) => f.key === key);
  const issues = [];
  const addIssue = (id, text, tip) => {
    if (!issues.some((i) => i.id === id)) issues.push({ id, text, tip });
  };

  const rows = mission.customers.map((c) => {
    let ask;
    let res;
    let note = '';
    if (c.menu) {
      const btn = design.menu.find((b) => {
        const f = design.faqs.find((x) => x.id === b.faqId);
        return f && f.key === c.menu && b.label.trim();
      });
      if (btn) {
        ask = btn.label;
        res = pressMenu(design, btn);
      } else {
        ask = `(หาปุ่ม “${factOf(c.menu).label}” ไม่เจอ)`;
        res = { text: '', faq: null, kind: 'nobutton' };
        addIssue(`menu-${c.menu}`, `ไม่มีปุ่ม Rich Menu เรื่อง “${factOf(c.menu).label}”`, 'เพิ่มปุ่มในแท็บ Rich Menu แล้วผูกกับ FAQ หัวข้อนี้');
      }
    } else {
      ask = c.msg;
      res = reply(design, c.msg);
    }

    let ok = false;
    let mood = 'angry';
    if (c.intent === 'out') {
      ok = res.kind === 'fallback';
      if (ok) {
        mood = 'ok';
        note = 'บอทแจ้งอย่างสุภาพว่าตอบเรื่องนี้ไม่ได้';
      } else if (res.kind === 'silent') {
        note = 'บอทเงียบ ลูกค้าไม่รู้ต้องทำอะไรต่อ';
        addIssue('fallback', 'ยังไม่มีข้อความ Fallback', 'เขียนข้อความขออภัยอย่างสุภาพ และแนะนำให้กดเมนูหรือโทรติดต่อ');
      } else {
        mood = 'confused';
        note = `บอทเข้าใจผิดว่าถามเรื่อง “${factOf(res.faq.key)?.label || 'อื่น'}”`;
        addIssue(
          `wide-${res.faq.id}`,
          `คำสำคัญของหัวข้อ “${factOf(res.faq.key)?.label}” กว้างเกินไป (${(res.hits || []).join(', ')})`,
          'ลบคำสั้น ๆ ที่ใช้กันทั่วไป เช่น “ร้าน” “ไหม” แล้วใช้คำที่เจาะจงกับหัวข้อนั้นแทน'
        );
      }
    } else {
      const fact = factOf(c.intent);
      if (res.faq && res.faq.key === c.intent) {
        const missing = fact.must.filter((t) => !hasAll(res.faq.answer, [t]));
        if (missing.length === 0) {
          ok = true;
          mood = 'love';
          note = 'ได้ข้อมูลครบถ้วน';
        } else {
          mood = 'confused';
          note = `คำตอบขาดข้อมูล: ${missing.join(', ')}`;
          addIssue(`miss-${c.intent}`, `คำตอบเรื่อง “${fact.label}” ข้อมูลไม่ครบ (ขาด ${missing.join(', ')})`, `ตรวจกับข้อมูลจริง: ${fact.info}`);
        }
      } else if (res.kind === 'nobutton') {
        note = 'ลูกค้าหาปุ่มไม่เจอ';
      } else if (res.faq) {
        note = `บอทตอบผิดเรื่อง (ตอบเรื่อง “${factOf(res.faq.key)?.label}”)`;
        addIssue(`conf-${c.intent}`, `“${c.msg || ask}” ถูกจับคู่ไปที่ “${factOf(res.faq.key)?.label}”`, `เพิ่มคำสำคัญที่เจาะจงให้หัวข้อ “${fact.label}” เช่น ${fact.hintKw.slice(0, 2).map((k) => `“${k}”`).join(' ')}`);
      } else {
        note = res.kind === 'silent' ? 'บอทไม่ตอบอะไรเลย' : 'บอทไม่เข้าใจคำถาม';
        const has = design.faqs.some((f) => f.key === c.intent);
        addIssue(
          `nokw-${c.intent}`,
          has ? `บอทไม่รู้จักคำถาม “${c.msg}”` : `ยังไม่มี FAQ เรื่อง “${fact.label}”`,
          has
            ? `เพิ่มคำสำคัญที่ลูกค้าใช้จริงในหัวข้อ “${fact.label}” เช่น ${fact.hintKw.slice(0, 3).map((k) => `“${k}”`).join(' ')}`
            : `สร้าง FAQ หัวข้อ “${fact.label}” จากข้อมูล: ${fact.info}`
        );
      }
    }
    return { customer: c, ask, answer: res.text, kind: res.kind, ok, mood, note };
  });

  const correct = rows.filter((r) => r.ok).length;
  const total = rows.length;
  const percent = Math.round((correct / total) * 100);
  const rules = checkRules(mission, design);
  const failedRules = rules.filter((r) => !r.ok);
  failedRules.forEach((r) => addIssue(`rule-${r.id}`, `ยังไม่ผ่านเงื่อนไข: ${r.label}`, 'ดูเช็กลิสต์ด้านบนของหน้าออกแบบ'));
  const rulesOk = failedRules.length === 0;
  const pass = rulesOk && percent >= mission.rules.passPercent;
  const stars = !pass ? 0 : percent === 100 ? 3 : percent >= 90 ? 2 : 1;
  return { rows, correct, total, percent, rulesOk, rules, pass, stars, issues };
}

let seq = 0;
export const uid = (p = 'id') => `${p}${Date.now().toString(36)}${(seq++).toString(36)}`;

export function emptyDesign(mission) {
  return {
    name: '',
    avatar: 'blue',
    acc: 'none',
    greeting: '',
    fallback: '',
    faqs: [],
    menu: Array.from({ length: mission.rules.minMenu }, () => ({ id: uid('m'), label: '', faqId: '' }))
  };
}
