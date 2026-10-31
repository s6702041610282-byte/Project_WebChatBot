import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Lock, MapPin, Play, RotateCcw, Target, UserRound } from 'lucide-react';
import MissionScene from './art/MissionScene';
import Person from './art/Person';

/** การ์ดรายละเอียดภารกิจที่เลือก (คอลัมน์ขวาของหน้าแผนที่) */
export default function MissionDetail({ mission: m, mp = {}, open, lockText, wide = false }) {
  const goals = [
    `สร้าง FAQ ครบ ${m.facts.length} หัวข้อ หัวข้อละ ≥ ${m.rules.minKeywords} คำสำคัญ`,
    `Rich Menu ≥ ${m.rules.minMenu} ปุ่ม และข้อความ Fallback`,
    m.rules.maxAnswer ? `คำตอบสั้น ไม่เกิน ${m.rules.maxAnswer} ตัวอักษร` : 'ข้อความต้อนรับบอกวิธีใช้งาน'
  ];

  return (
    <aside className={`qpanel qdetail ${wide ? 'qdetail--wide' : ''}`} aria-labelledby="qdetail-title" key={m.id}>
      <div className="qdetail__art">
        <MissionScene id={m.id} locked={!open} title={`ภาพสถานการณ์ ${m.title}`} />
      </div>

      <div className="qdetail__head">
        <Person kind={m.owner.kind} seed={m.no} mood="neutral" size={48} className="qdetail__owner" title={m.owner.name} />
        <div>
          <span className="qdetail__no">ภารกิจที่ {m.no}</span>
          <h2 id="qdetail-title">{m.title}</h2>
          <p className="qdetail__place">
            <MapPin size={13} aria-hidden="true" /> {m.place}
          </p>
        </div>
      </div>

      <dl className="qdetail__info">
        <div>
          <dt>
            <AlertCircle size={15} aria-hidden="true" /> ปัญหาที่ต้องแก้ไข
          </dt>
          <dd>{m.problem}</dd>
        </div>
        <div>
          <dt>
            <UserRound size={15} aria-hidden="true" /> ความต้องการของผู้ใช้
          </dt>
          <dd>{m.want}</dd>
        </div>
        <div>
          <dt>
            <Target size={15} aria-hidden="true" /> เป้าหมาย
          </dt>
          <dd>
            <ul className="qdetail__goals">
              {goals.map((g) => (
                <li key={g}>
                  <CheckCircle2 size={14} aria-hidden="true" /> {g}
                </li>
              ))}
            </ul>
          </dd>
        </div>
      </dl>

      <div className="qdetail__pass">
        <span>เกณฑ์ผ่าน</span>
        <b>ตอบลูกค้า {m.customers.length} คนถูก ≥ {m.rules.passPercent}%</b>
        <small>ทดสอบครบ 4 แบบ · ได้ {m.reward}</small>
      </div>

      {open ? (
        <Link to={`/quest/${m.id}`} className="qbtn qbtn--primary qbtn--block">
          {mp.stars > 0 ? <RotateCcw size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
          {mp.stars > 0 ? 'เล่นอีกครั้ง' : mp.design ? 'ทำภารกิจต่อ' : 'เริ่มภารกิจ'}
        </Link>
      ) : (
        <p className="qdetail__locked">
          <Lock size={16} aria-hidden="true" /> {lockText || `ผ่านภารกิจที่ ${m.no - 1} ก่อนเพื่อปลดล็อก`}
        </p>
      )}
    </aside>
  );
}
