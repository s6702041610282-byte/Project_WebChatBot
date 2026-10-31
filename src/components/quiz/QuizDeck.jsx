import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, Clock, ListChecks, ListOrdered, RotateCcw, Send, Wrench } from 'lucide-react';
import Robot from '../quest/art/Robot';
import { optionLetters } from '../../data/quizzes';
import { QUESTION_TYPES, isAnswered, typeOf } from '../../utils/quizGrading';

const TYPE_ICONS = { choice: ListChecks, order: ListOrdered, classify: Wrench, flow: Wrench };

/** สลับลำดับโดยไม่ให้ตรงกับลำดับที่ถูกต้อง */
function shuffledIndexes(n) {
  const a = Array.from({ length: n }, (_, i) => i);
  do {
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
  } while (n > 1 && a.every((v, i) => v === i));
  return a;
}

const mmss = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

/* ---------- ปรนัย ---------- */
function Choice({ q, value, onChange }) {
  return (
    <div className="qz-opts" role="radiogroup" aria-label="ตัวเลือก">
      {q.options.map((opt, i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={value === i}
          className={`qz-opt ${value === i ? 'is-on' : ''}`}
          onClick={() => onChange(i)}
          style={{ animationDelay: `${0.08 + i * 0.05}s` }}
        >
          <span className="qz-opt__letter">{optionLetters[i]}</span>
          <span className="qz-opt__text">{opt}</span>
          <span className="qz-opt__check" aria-hidden="true">
            <Check size={16} strokeWidth={3} />
          </span>
        </button>
      ))}
    </div>
  );
}

/* ---------- เรียงลำดับ ---------- */
function Order({ q, value, onChange, pool }) {
  const placed = value || [];
  const remaining = pool.filter((idx) => !placed.includes(idx));
  const move = (pos, dir) => {
    const next = [...placed];
    const t = pos + dir;
    if (t < 0 || t >= next.length) return;
    [next[pos], next[t]] = [next[t], next[pos]];
    onChange(next);
  };
  return (
    <div className="qz-order">
      <div>
        <p className="qz-order__label">แตะการ์ดเพื่อวางลงช่องถัดไป</p>
        <div className="qz-order__pool">
          {remaining.length === 0 && <p className="qz-order__empty">วางครบแล้ว</p>}
          {remaining.map((idx) => (
            <button key={idx} type="button" className="qz-chip" onClick={() => onChange([...placed, idx])}>
              {q.items[idx]}
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="qz-order__head">
          <p className="qz-order__label">ลำดับของคุณ</p>
          {placed.length > 0 && (
            <button type="button" className="qz-link" onClick={() => onChange(null)}>
              <RotateCcw size={14} aria-hidden="true" /> เริ่มใหม่
            </button>
          )}
        </div>
        <ol className="qz-slots">
          {q.items.map((_, pos) => {
            const idx = placed[pos];
            const filled = idx !== undefined;
            return (
              <li key={pos} className={filled ? 'is-filled' : ''}>
                <span className="qz-slots__no">{pos + 1}</span>
                {filled ? (
                  <>
                    <button
                      type="button"
                      className="qz-slots__text"
                      onClick={() => {
                        const next = placed.filter((_, i) => i !== pos);
                        onChange(next.length ? next : null);
                      }}
                      title="แตะเพื่อนำออก"
                    >
                      {q.items[idx]}
                    </button>
                    <span className="qz-slots__tools">
                      <button type="button" aria-label="เลื่อนขึ้น" onClick={() => move(pos, -1)} disabled={pos === 0}>
                        <ArrowUp size={14} />
                      </button>
                      <button type="button" aria-label="เลื่อนลง" onClick={() => move(pos, 1)} disabled={pos === placed.length - 1}>
                        <ArrowDown size={14} />
                      </button>
                    </span>
                  </>
                ) : (
                  <span className="qz-slots__ph">วางการ์ดที่นี่</span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

/* ---------- จำแนกประเภท ---------- */
function Classify({ q, value, onChange }) {
  const cur = value || [];
  const set = (i, cat) => onChange(q.items.map((_, k) => (k === i ? cat : cur[k] ?? null)));
  return (
    <div className="qz-classify">
      {q.items.map((item, i) => (
        <div key={item.text} className="qz-classify__row">
          <p>
            <b>{i + 1}.</b> {item.text}
          </p>
          <div className="qz-seg" role="radiogroup" aria-label={`ประเภทของข้อ ${i + 1}`}>
            {q.categories.map((c) => (
              <button key={c.id} type="button" role="radio" aria-checked={cur[i] === c.id} className={cur[i] === c.id ? 'is-on' : ''} onClick={() => set(i, c.id)}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- ออกแบบบทสนทนา ---------- */
function Flow({ q, value, onChange }) {
  const cur = value || [];
  const set = (s, o) => onChange(q.slots.map((_, k) => (k === s ? o : cur[k] ?? null)));
  return (
    <div className="qz-flow">
      {q.script.map((line, i) =>
        line.from === 'user' ? (
          <p key={i} className="qz-flow__user">
            {line.text}
          </p>
        ) : (
          <div key={i} className="qz-flow__slot">
            <small>
              ช่องที่ {line.slot + 1} · {q.slots[line.slot].label}
            </small>
            <div className="qz-seg">
              {q.slots[line.slot].options.map((o, oi) => (
                <button key={oi} type="button" className={cur[line.slot] === oi ? 'is-on' : ''} onClick={() => set(line.slot, oi)}>
                  {o}
                </button>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}

/**
 * ข้อสอบแบบสำรับการ์ด — แสดงทีละข้อ เลื่อนซ้าย/ขวา (ปุ่ม · ลูกศรคีย์บอร์ด · ปัดบนมือถือ)
 * ตอบได้อิสระ ย้อนกลับไปแก้ได้ แล้วส่งคำตอบทั้งหมดตอนท้าย
 */
export default function QuizDeck({ quiz, onFinish }) {
  const total = quiz.questions.length;
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [answers, setAnswers] = useState(() => Array(total).fill(null));
  const [confirm, setConfirm] = useState(false);
  const [sec, setSec] = useState(0);
  const pools = useMemo(() => quiz.questions.map((q) => (typeOf(q) === 'order' ? shuffledIndexes(q.items.length) : null)), [quiz]);
  const touch = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const q = quiz.questions[i];
  const type = typeOf(q);
  const TypeIcon = TYPE_ICONS[type];
  const done = answers.filter((a, k) => isAnswered(quiz.questions[k], a)).length;
  const answered = isAnswered(q, answers[i]);
  const missing = quiz.questions.map((qq, k) => (isAnswered(qq, answers[k]) ? null : k + 1)).filter(Boolean);
  const last = i === total - 1;

  const go = useCallback(
    (to) => {
      if (to < 0 || to >= total) return;
      setDir(to > i ? 1 : -1);
      setI(to);
    },
    [i, total]
  );
  const setAns = (v) => setAnswers((a) => a.map((x, k) => (k === i ? v : x)));

  // คีย์บอร์ด: ← → เปลี่ยนข้อ · 1–4 เลือกตัวเลือก
  useEffect(() => {
    const onKey = (e) => {
      if (confirm || e.target.closest?.('input,textarea')) return;
      if (e.key === 'ArrowRight') go(i + 1);
      if (e.key === 'ArrowLeft') go(i - 1);
      if (type === 'choice' && /^[1-4]$/.test(e.key)) setAnswers((a) => a.map((x, k) => (k === i ? Number(e.key) - 1 : x)));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, i, type, confirm]);

  const submit = () => (missing.length ? setConfirm(true) : onFinish(answers, sec));

  const tip = !answered
    ? type === 'choice'
      ? 'อ่านโจทย์ให้ครบก่อนนะ แล้วเลือกคำตอบที่ถูกที่สุด'
      : 'แตะการ์ดเรียงตามลำดับให้ครบทุกช่อง'
    : last
      ? 'ข้อสุดท้ายแล้ว! ตรวจทานแล้วกดส่งคำตอบได้เลย'
      : 'เยี่ยม! เลื่อนไปข้อถัดไปได้เลย';

  return (
    <div className="qz">
      {/* แถบความคืบหน้า */}
      <div className="qz-bar">
        <div className="qz-bar__count">
          <p>
            ข้อ <b>{i + 1}</b> / {total}
          </p>
          <span>ตอบแล้ว {done} ข้อ</span>
        </div>
        <ol className="qz-dots" aria-label="เลือกข้อ">
          {quiz.questions.map((qq, k) => (
            <li key={qq.id}>
              <button
                type="button"
                className={`${k === i ? 'is-now' : ''} ${isAnswered(qq, answers[k]) ? 'is-done' : ''}`}
                onClick={() => go(k)}
                aria-label={`ไปข้อ ${k + 1}${isAnswered(qq, answers[k]) ? ' (ตอบแล้ว)' : ''}`}
                aria-current={k === i ? 'step' : undefined}
              >
                {k + 1}
              </button>
            </li>
          ))}
        </ol>
        <div className={`qz-bar__time ${sec > 300 ? 'is-over' : ''}`} title="เวลาที่แนะนำ 5 นาที">
          <Clock size={15} aria-hidden="true" /> {mmss(sec)}
          <small>/ 05:00</small>
        </div>
      </div>
      <div className="qbar qbar--thin qz-progress" aria-hidden="true">
        <i style={{ width: `${(done / total) * 100}%` }} />
      </div>

      <div className="qz-stage">
        {/* สำรับการ์ด */}
        <div
          className="qz-deck"
          onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touch.current == null) return;
            const dx = e.changedTouches[0].clientX - touch.current;
            touch.current = null;
            if (Math.abs(dx) > 60) go(i + (dx < 0 ? 1 : -1));
          }}
        >
          {i < total - 2 && <div className="qz-ghost qz-ghost--2" aria-hidden="true" />}
          {i < total - 1 && <div className="qz-ghost qz-ghost--1" aria-hidden="true" />}
          <article key={i} className={`qz-card ${dir > 0 ? 'from-right' : 'from-left'}`} aria-live="polite">
            <header className="qz-card__head">
              <span className="qz-card__no">
                <small>ข้อ</small>
                {i + 1}
              </span>
              <span className="qz-card__type">
                <TypeIcon size={14} aria-hidden="true" /> {QUESTION_TYPES[type].label}
              </span>
              {answered && (
                <span className="qz-card__ok">
                  <Check size={14} aria-hidden="true" /> ตอบแล้ว
                </span>
              )}
            </header>
            <h2 className="qz-card__q">{q.question}</h2>
            <p className="qz-card__hint">{QUESTION_TYPES[type].hint}</p>

            {type === 'choice' && <Choice q={q} value={answers[i]} onChange={setAns} />}
            {type === 'order' && <Order q={q} value={answers[i]} onChange={setAns} pool={pools[i]} />}
            {type === 'classify' && <Classify q={q} value={answers[i]} onChange={setAns} />}
            {type === 'flow' && <Flow q={q} value={answers[i]} onChange={setAns} />}
          </article>
        </div>

        {/* ผู้ช่วย */}
        <aside className="qz-buddy" aria-live="polite">
          <div className="qz-buddy__bubble">{tip}</div>
          <Robot size={110} mood={answered ? (last ? 'cheer' : 'happy') : 'think'} />
          <p className="qz-buddy__keys">
            ใช้ปุ่ม <kbd>←</kbd> <kbd>→</kbd> เปลี่ยนข้อ
            {type === 'choice' && (
              <>
                {' '}
                · <kbd>1</kbd>–<kbd>4</kbd> เลือกคำตอบ
              </>
            )}
          </p>
        </aside>
      </div>

      {/* ปุ่มเลื่อน */}
      <nav className="qz-nav" aria-label="เปลี่ยนข้อ">
        <button type="button" className="qbtn qbtn--ghost qbtn--lg" onClick={() => go(i - 1)} disabled={i === 0}>
          <ArrowLeft size={18} aria-hidden="true" /> ข้อก่อนหน้า
        </button>
        {last ? (
          <button type="button" className="qbtn qbtn--primary qbtn--lg" onClick={submit}>
            <Send size={18} aria-hidden="true" /> ส่งคำตอบ
          </button>
        ) : (
          <button type="button" className={`qbtn qbtn--lg ${answered ? 'qbtn--primary' : 'qbtn--soft'}`} onClick={() => go(i + 1)}>
            ข้อถัดไป <ArrowRight size={18} aria-hidden="true" />
          </button>
        )}
      </nav>
      {!last && done === total && (
        <p className="qz-allset">
          ตอบครบทุกข้อแล้ว{' '}
          <button type="button" className="qz-link" onClick={submit}>
            ส่งคำตอบเลย
          </button>
        </p>
      )}

      {confirm && (
        <div className="qz-confirm" role="dialog" aria-modal="true" aria-labelledby="qz-confirm-title">
          <div className="qz-confirm__card">
            <Robot head size={64} mood="think" />
            <h3 id="qz-confirm-title">ยังตอบไม่ครบ {missing.length} ข้อ</h3>
            <p>ข้อที่ยังไม่ได้ตอบ: {missing.join(', ')} — ข้อที่ไม่ตอบจะนับเป็นตอบผิด</p>
            <div className="qz-confirm__actions">
              <button
                type="button"
                className="qbtn qbtn--primary"
                onClick={() => {
                  setConfirm(false);
                  go(missing[0] - 1);
                }}
              >
                กลับไปตอบข้อ {missing[0]}
              </button>
              <button type="button" className="qbtn qbtn--ghost" onClick={() => onFinish(answers, sec)}>
                ส่งเลย
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
