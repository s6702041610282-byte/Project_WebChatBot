import { units } from '../data/course';

/**
 * ลำดับการเรียน 4 ขั้น (ต้องทำตามลำดับ)
 * 1 แบบทดสอบก่อนเรียน → 2 บทเรียน 6 พาร์ท → 3 ลงมือปฏิบัติ (ผ่านภารกิจ CED Coffee) → 4 แบบทดสอบหลังเรียน
 */
export function journey(progress, results) {
  const read = Object.keys(progress.lessons).length;
  const done = {
    pre: Boolean(results.pretest),
    lessons: read >= units.length,
    practice: (progress.missions.coffee?.stars || 0) > 0,
    post: Boolean(results.posttest)
  };
  const can = {
    lessons: done.pre,
    practice: done.pre && done.lessons,
    posttest: done.pre && done.lessons && done.practice
  };
  const current = !done.pre ? 0 : !done.lessons ? 1 : !done.practice ? 2 : !done.post ? 3 : 4;
  return { done, can, current, read };
}
