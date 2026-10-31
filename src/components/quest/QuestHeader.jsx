import { BookOpen, Check, FlaskConical, PenTool, Wrench } from 'lucide-react';
import Robot from './art/Robot';
import { XP_PER_LEVEL, courseProgress, levelOf } from '../../utils/progress';

const STAGES = [
  { label: 'เรียนรู้', icon: BookOpen },
  { label: 'ออกแบบ', icon: PenTool },
  { label: 'สร้างจริง', icon: Wrench },
  { label: 'ทดสอบ', icon: FlaskConical }
];

/**
 * Mission Header — ชื่อเกม · ภารกิจปัจจุบัน · ขั้นตอน 4 ขั้น · ระดับและความคืบหน้า
 * stage: 0–3 ขั้นที่กำลังทำ
 */
export default function QuestHeader({ progress, stage = 0, title, desc }) {
  const level = levelOf(progress.xp);
  const inLevel = progress.xp % XP_PER_LEVEL;
  const course = courseProgress(progress);

  return (
    <header className="qhead">
      <div className="qhead__intro">
        <Robot head size={52} mood="happy" className="qhead__bot" />
        <div className="qhead__text">
          <span className="qhead__eyebrow">CHATBOT QUEST · ภารกิจนักสร้างแชตบอต</span>
          <h1 className="qhead__title">{title}</h1>
          {desc && <p className="qhead__desc">{desc}</p>}
        </div>
      </div>

      <ol className="qstages" aria-label="ขั้นตอนการเรียนรู้">
        {STAGES.map(({ label, icon: Icon }, i) => {
          const state = i < stage ? 'is-done' : i === stage ? 'is-now' : '';
          return (
            <li key={label} className={state} aria-current={i === stage ? 'step' : undefined}>
              <span className="qstages__dot">{i < stage ? <Check size={14} /> : <Icon size={14} />}</span>
              <span className="qstages__label">{label}</span>
            </li>
          );
        })}
      </ol>

      <div className="qlevel">
        <div className="qlevel__row">
          <span className="qlevel__badge">Level {level}</span>
          <span className="qlevel__xp">
            {inLevel}/{XP_PER_LEVEL} XP
          </span>
        </div>
        <div className="qbar" role="progressbar" aria-label="ค่าประสบการณ์สู่เลเวลถัดไป" aria-valuemin={0} aria-valuemax={XP_PER_LEVEL} aria-valuenow={inLevel}>
          <i style={{ width: `${(inLevel / XP_PER_LEVEL) * 100}%` }} />
        </div>
        <span className="qlevel__course">ความคืบหน้ารายวิชา {course}%</span>
      </div>
    </header>
  );
}
