import { optionLetters } from '../data/quizzes';

/**
 * ตรวจคำตอบและแสดงผลคำตอบสำหรับข้อสอบทุกรูปแบบ
 *
 * รูปแบบข้อสอบ (question.type) และรูปแบบคำตอบที่เก็บ
 * - 'choice'   (ค่าเริ่มต้น) : เลขตัวเลือก เช่น 2
 * - 'order'    : ลำดับของ items ที่ผู้เรียนเรียง เช่น [2, 0, 1, 3] (ลำดับที่ถูก = ลำดับใน items)
 * - 'classify' : หมวดที่เลือกให้แต่ละ item เช่น ['rule', 'ai', ...]
 * - 'flow'     : ตัวเลือกที่เลือกในแต่ละช่องของบทสนทนา เช่น [0, 2, 1]
 */
export const QUESTION_TYPES = {
  choice: { label: 'ปรนัย', hint: 'เลือกคำตอบที่ถูกต้องที่สุด 1 ข้อ' },
  order: { label: 'เรียงลำดับ', hint: 'แตะการ์ดตามลำดับที่ถูกต้อง แตะซ้ำที่ช่องคำตอบเพื่อนำออก' },
  classify: { label: 'ปฏิบัติ', hint: 'จำแนกแต่ละข้อให้อยู่ในประเภทที่ถูกต้อง' },
  flow: { label: 'ปฏิบัติ', hint: 'แตะเลือกข้อความ 1 ข้อในแต่ละช่องสีม่วง' }
};

export const typeOf = (q) => q.type || 'choice';

const flowSlots = (q) => q.script.filter((line) => line.slot !== undefined).map((line) => q.slots[line.slot]);

/** ตอบครบแล้วหรือยัง */
export function isAnswered(q, ans) {
  if (ans === null || ans === undefined) return false;
  switch (typeOf(q)) {
    case 'order':
      return Array.isArray(ans) && ans.length === q.items.length;
    case 'classify':
      return Array.isArray(ans) && q.items.every((_, i) => Boolean(ans[i]));
    case 'flow':
      return Array.isArray(ans) && q.slots.every((_, i) => ans[i] !== null && ans[i] !== undefined);
    default:
      return typeof ans === 'number';
  }
}

/** ตอบถูกทั้งหมดหรือไม่ (ข้อละ 1 คะแนน) */
export function isCorrect(q, ans) {
  if (!isAnswered(q, ans)) return false;
  switch (typeOf(q)) {
    case 'order':
      return ans.every((itemIndex, pos) => itemIndex === pos);
    case 'classify':
      return q.items.every((item, i) => ans[i] === item.answer);
    case 'flow':
      return q.slots.every((slot, i) => ans[i] === slot.answer);
    default:
      return ans === q.answer;
  }
}

export function scoreQuiz(quiz, answers) {
  return quiz.questions.reduce((sum, q, i) => sum + (isCorrect(q, answers[i]) ? 1 : 0), 0);
}

const catLabel = (q, id) => q.categories.find((c) => c.id === id)?.label ?? '-';

/** ข้อความสรุปคำตอบของผู้เรียน */
export function describeAnswer(q, ans) {
  if (!isAnswered(q, ans)) return 'ไม่ได้ตอบ';
  switch (typeOf(q)) {
    case 'order':
      return ans.map((idx) => q.items[idx]).join(' → ');
    case 'classify':
      return q.items.map((item, i) => `${item.text} = ${catLabel(q, ans[i])}`).join(' · ');
    case 'flow':
      return `${q.slots.filter((s, i) => ans[i] === s.answer).length}/${q.slots.length} ช่องถูกต้อง`;
    default:
      return `${optionLetters[ans]}. ${q.options[ans]}`;
  }
}

/** ข้อความเฉลย */
export function describeCorrect(q) {
  switch (typeOf(q)) {
    case 'order':
      return q.items.join(' → ');
    case 'classify':
      return q.items.map((item) => `${item.text} = ${catLabel(q, item.answer)}`).join(' · ');
    case 'flow':
      return flowSlots(q)
        .map((slot, i) => `ช่องที่ ${i + 1}: “${slot.options[slot.answer]}”`)
        .join(' · ');
    default:
      return `${optionLetters[q.answer]}. ${q.options[q.answer]}`;
  }
}
