import { FlaskConical, MessageSquarePlus, PenTool, Rocket, Search } from 'lucide-react';
import { buildSteps } from '../../data/missions';

const ICONS = [Search, PenTool, MessageSquarePlus, FlaskConical, Rocket];

/** Stepper 5 ขั้นตอนการสร้างแชตบอต — current = ขั้นที่กำลังทำ */
export default function LearningSteps({ current = 0 }) {
  return (
    <section className="qpanel qsteps" aria-labelledby="qsteps-title">
      <div className="qpanel__head">
        <h2 id="qsteps-title">ขั้นตอนการสร้างแชตบอต</h2>
        <span className="qpanel__meta">
          ขั้นที่ {Math.min(current + 1, buildSteps.length)}/{buildSteps.length}
        </span>
      </div>
      <ol className="qsteps__list">
        {buildSteps.map((s, i) => {
          const Icon = ICONS[i];
          const state = i < current ? 'is-done' : i === current ? 'is-now' : '';
          return (
            <li key={s.title} className={state} aria-current={i === current ? 'step' : undefined}>
              <span className="qsteps__icon">
                <Icon size={20} aria-hidden="true" />
                <em>{i + 1}</em>
              </span>
              <b>{s.title}</b>
              <small>{s.text}</small>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
