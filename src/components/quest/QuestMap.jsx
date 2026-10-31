import { Check, Lock, Star } from 'lucide-react';
import MissionScene from './art/MissionScene';
import { isUnlocked } from '../../utils/progress';

/**
 * แผนที่ภารกิจ — การ์ด 3 ภารกิจเรียงตามเส้นทาง (ผ่านด่านก่อนหน้าจึงปลดล็อก)
 */
export default function QuestMap({ missions, progress, selected, onSelect }) {
  const states = missions.map((m, i) => {
    const mp = progress.missions[m.id] || {};
    const open = isUnlocked(progress, i);
    const status = mp.stars > 0 ? 'done' : open ? (mp.attempts || mp.design ? 'doing' : 'ready') : 'locked';
    return { m, mp, open, status };
  });
  const label = { done: 'ผ่านแล้ว', doing: 'กำลังทำ', ready: 'พร้อมเริ่ม', locked: 'ล็อกอยู่' };

  return (
    <section className="qpanel qmap" aria-labelledby="qmap-title">
      <div className="qpanel__head">
        <h2 id="qmap-title">แผนที่ภารกิจ</h2>
        <span className="qpanel__meta">เลือกภารกิจเพื่อดูรายละเอียด · ผ่านด่านก่อนหน้าเพื่อปลดล็อก</span>
      </div>

      {/* เส้นทางเชื่อมภารกิจ */}
      <ol className="qroute" aria-hidden="true">
        {states.map(({ m, status }, i) => (
          <li key={m.id} className={`qroute__stop is-${status} ${i < states.length - 1 && states[i + 1].open ? 'is-linked' : ''}`}>
            <span className="qroute__node">{status === 'done' ? <Check size={16} /> : status === 'locked' ? <Lock size={14} /> : m.no}</span>
          </li>
        ))}
      </ol>

      <div className="qmap__cards" role="listbox" aria-label="ภารกิจ">
        {states.map(({ m, mp, open, status }) => {
          const pct = mp.best || 0;
          return (
            <button
              key={m.id}
              type="button"
              role="option"
              aria-selected={selected === m.id}
              className={`mcard is-${status} ${selected === m.id ? 'is-selected' : ''}`}
              onClick={() => onSelect(m.id)}
            >
              <span className="mcard__art">
                <MissionScene id={m.id} locked={!open} />
                <span className={`mcard__status is-${status}`}>{label[status]}</span>
              </span>
              <span className="mcard__body">
                <span className="mcard__no">ภารกิจที่ {m.no}</span>
                <span className="mcard__title">{m.title}</span>
                <span className="mcard__desc">{m.tagline}</span>
                <span className="mcard__foot">
                  <span className="mcard__stars" aria-label={`${mp.stars || 0} จาก 3 ดาว`}>
                    {[0, 1, 2].map((k) => (
                      <Star key={k} size={14} className={k < (mp.stars || 0) ? 'is-on' : ''} />
                    ))}
                  </span>
                  <span className="mcard__pct">{open ? `${pct}%` : '—'}</span>
                </span>
                <span className="qbar qbar--thin" aria-hidden="true">
                  <i style={{ width: `${pct}%` }} />
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
