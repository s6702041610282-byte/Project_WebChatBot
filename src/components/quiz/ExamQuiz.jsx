import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Bot,
  Check,
  ClipboardCheck,
  ListOrdered,
  ListChecks,
  RotateCcw,
  Send,
  User,
  Wrench
} from 'lucide-react';
import { optionLetters } from '../../data/quizzes';
import { QUESTION_TYPES, isAnswered, typeOf } from '../../utils/quizGrading';

const TYPE_ICONS = { choice: ListChecks, order: ListOrdered, classify: Wrench, flow: Wrench };

/** สลับลำดับแบบสุ่ม โดยไม่ให้ตรงกับลำดับที่ถูกต้อง */
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

/* ---------- ปรนัย ---------- */
function ChoiceAnswer({ q, value, onChange }) {
  return (
    <div className="ex-choices" role="radiogroup" aria-label="ตัวเลือก">
      {q.options.map((opt, i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={value === i}
          className={`ex-choice ${value === i ? 'is-selected' : ''}`}
          onClick={() => onChange(i)}
        >
          <span className="ex-choice__letter">{optionLetters[i]}</span>
          <span className="ex-choice__text">{opt}</span>
          <span className="ex-choice__check" aria-hidden="true">
            <Check size={16} strokeWidth={3} />
          </span>
        </button>
      ))}
    </div>
  );
}

/* ---------- เรียงลำดับ ---------- */
function OrderAnswer({ q, value, onChange, pool }) {
  const placed = value || [];
  const remaining = pool.filter((idx) => !placed.includes(idx));

  const add = (idx) => onChange([...placed, idx]);
  const remove = (pos) => {
    const next = placed.filter((_, i) => i !== pos);
    onChange(next.length ? next : null);
  };
  const move = (pos, dir) => {
    const next = [...placed];
    const target = pos + dir;
    if (target < 0 || target >= next.length) return;
    [next[pos], next[target]] = [next[target], next[pos]];
    onChange(next);
  };

  return (
    <div className="ex-order">
      <div className="ex-order__col">
        <p className="ex-order__label">ตัวเลือก (แตะเพื่อวางลงช่องถัดไป)</p>
        <div className="ex-order__pool">
          {remaining.length === 0 && <p className="ex-order__empty">วางครบทุกการ์ดแล้ว</p>}
          {remaining.map((idx) => (
            <button key={idx} type="button" className="ex-chip" onClick={() => add(idx)}>
              {q.items[idx]}
            </button>
          ))}
        </div>
      </div>

      <div className="ex-order__col">
        <div className="ex-order__label-row">
          <p className="ex-order__label">ลำดับของคุณ</p>
          {placed.length > 0 && (
            <button type="button" className="ex-link" onClick={() => onChange(null)}>
              <RotateCcw size={14} aria-hidden="true" /> เริ่มใหม่
            </button>
          )}
        </div>
        <ol className="ex-order__slots">
          {q.items.map((_, pos) => {
            const idx = placed[pos];
            const filled = idx !== undefined;
            return (
              <li key={pos} className={`ex-slot ${filled ? 'is-filled' : ''}`}>
                <span className="ex-slot__no">{pos + 1}</span>
                {filled ? (
                  <>
                    <button type="button" className="ex-slot__text" onClick={() => remove(pos)} title="แตะเพื่อนำออก">
                      {q.items[idx]}
                    </button>
                    <span className="ex-slot__tools">
                      <button type="button" aria-label="เลื่อนขึ้น" onClick={() => move(pos, -1)} disabled={pos === 0}>
                        <ArrowUp size={15} />
                      </button>
                      <button type="button" aria-label="เลื่อนลง" onClick={() => move(pos, 1)} disabled={pos === placed.length - 1}>
                        <ArrowDown size={15} />
                      </button>
                    </span>
                  </>
                ) : (
                  <span className="ex-slot__placeholder">วางการ์ดที่นี่</span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

/* ---------- ปฏิบัติ: จำแนกประเภท ---------- */
function ClassifyAnswer({ q, value, onChange }) {
  const current = value || [];
  const set = (i, cat) => {
    const next = q.items.map((_, k) => current[k] ?? null);
    next[i] = cat;
    onChange(next);
  };
  return (
    <div className="ex-classify">
      <div className="ex-classify__legend" aria-hidden="true">
        {q.categories.map((c, ci) => (
          <span key={c.id} className={`ex-tag ex-tag--${ci}`}>
            {c.label}
          </span>
        ))}
      </div>
      {q.items.map((item, i) => (
        <div key={item.text} className={`ex-classify__row ${current[i] ? 'is-done' : ''}`}>
          <span className="ex-classify__no">{i + 1}</span>
          <p className="ex-classify__text">{item.text}</p>
          <div className="ex-seg" role="radiogroup" aria-label={`ประเภทของข้อ ${i + 1}`}>
            {q.categories.map((c, ci) => (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={current[i] === c.id}
                className={`ex-seg__btn ex-seg__btn--${ci} ${current[i] === c.id ? 'is-on' : ''}`}
                onClick={() => set(i, c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- ปฏิบัติ: ออกแบบบทสนทนา ---------- */
function FlowAnswer({ q, value, onChange }) {
  const current = value || [];
  const set = (slot, opt) => {
    const next = q.slots.map((_, k) => current[k] ?? null);
    next[slot] = opt;
    onChange(next);
  };
  return (
    <div className="ex-flow">
      {q.script.map((line, i) =>
        line.from === 'user' ? (
          <div key={i} className="ex-flow__line ex-flow__line--user">
            <p className="ex-flow__bubble">{line.text}</p>
            <span className="ex-flow__avatar" aria-hidden="true">
              <User size={15} />
            </span>
          </div>
        ) : (
          <div key={i} className="ex-flow__line ex-flow__line--bot">
            <span className="ex-flow__avatar ex-flow__avatar--bot" aria-hidden="true">
              <Bot size={15} />
            </span>
            <div className="ex-flow__slot">
              <p className="ex-flow__slot-label">
                ช่องที่ {line.slot + 1} · {q.slots[line.slot].label}
              </p>
              <div className="ex-flow__options" role="radiogroup" aria-label={q.slots[line.slot].label}>
                {q.slots[line.slot].options.map((opt, oi) => (
                  <button
                    key={oi}
                    type="button"
                    role="radio"
                    aria-checked={current[line.slot] === oi}
                    className={`ex-flow__option ${current[line.slot] === oi ? 'is-selected' : ''}`}
                    onClick={() => set(line.slot, oi)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}

/**
 * แบบทดสอบรูปแบบข้อสอบทีละข้อ (ปรนัย / เรียงลำดับ / ปฏิบัติ)
 * ตอบได้อิสระ ย้อนกลับไปแก้ได้ และส่งคำตอบทั้งหมดตอนท้าย
 */
export default function ExamQuiz({ quiz, onFinish }) {
  const total = quiz.questions.length;
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [answers, setAnswers] = useState(() => Array(total).fill(null));
  const [confirming, setConfirming] = useState(false);

  // ลำดับการ์ดที่สลับแล้วของข้อเรียงลำดับ (สุ่มครั้งเดียวต่อการทำแบบทดสอบ)
  const pools = useMemo(
    () => quiz.questions.map((q) => (typeOf(q) === 'order' ? shuffledIndexes(q.items.length) : null)),
    [quiz]
  );

  const q = quiz.questions[index];
  const type = typeOf(q);
  const TypeIcon = TYPE_ICONS[type];
  const answeredCount = quiz.questions.filter((qq, i) => isAnswered(qq, answers[i])).length;
  const unanswered = quiz.questions.map((qq, i) => (isAnswered(qq, answers[i]) ? null : i + 1)).filter(Boolean);

  const setAnswer = (val) =>
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = val;
      return next;
    });

  const go = (i) => {
    if (i < 0 || i >= total || i === index) return;
    setDir(i > index ? 1 : -1);
    setIndex(i);
    document.querySelector('.exam')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // เปลี่ยนข้อด้วยปุ่มลูกศรซ้าย/ขวาบนคีย์บอร์ด
  useEffect(() => {
    const onKey = (e) => {
      if (confirming || e.target.closest?.('input, textarea')) return;
      if (e.key === 'ArrowRight') go(index + 1);
      if (e.key === 'ArrowLeft') go(index - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="exam">
      {/* ---------- แถบรายการข้อ ---------- */}
      <nav className="exam-rail" aria-label="รายการข้อสอบ">
        <div className="exam-rail__head">
          <span>ตอบแล้ว</span>
          <b>
            {answeredCount}
            <small>/{total}</small>
          </b>
        </div>
        <div className="exam-rail__meter" aria-hidden="true">
          <span style={{ width: `${(answeredCount / total) * 100}%` }} />
        </div>
        <ol className="exam-rail__list">
          {quiz.questions.map((qq, i) => {
            const Icon = TYPE_ICONS[typeOf(qq)];
            const done = isAnswered(qq, answers[i]);
            return (
              <li key={qq.id}>
                <button
                  type="button"
                  className={`exam-rail__item ${i === index ? 'is-current' : ''} ${done ? 'is-done' : ''}`}
                  onClick={() => go(i)}
                  aria-current={i === index ? 'step' : undefined}
                  aria-label={`ข้อ ${i + 1} ${QUESTION_TYPES[typeOf(qq)].label}${done ? ' ตอบแล้ว' : ''}`}
                >
                  <span className="exam-rail__no">{String(i + 1).padStart(2, '0')}</span>
                  <Icon size={15} aria-hidden="true" />
                  {done && <Check className="exam-rail__tick" size={14} strokeWidth={3} aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ol>
        <button type="button" className="exam-rail__submit" onClick={() => setConfirming(true)}>
          <Send size={16} aria-hidden="true" /> ส่งคำตอบ
        </button>
      </nav>

      {/* ---------- กระดาษข้อสอบ ---------- */}
      <section className="exam-sheet" aria-live="polite">
        <div className="exam-sheet__ghost" aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </div>

        <article key={q.id} className={`exam-card exam-card--${type}`} style={{ '--dir': dir }}>
          <header className="exam-card__head">
            <span className={`exam-type exam-type--${type}`}>
              <TypeIcon size={15} aria-hidden="true" />
              {QUESTION_TYPES[type].label}
            </span>
            <span className="exam-card__count">
              ข้อ {index + 1} / {total}
            </span>
          </header>

          <h2 className="exam-card__question">{q.question}</h2>
          <p className="exam-card__hint">{QUESTION_TYPES[type].hint}</p>

          <div className="exam-card__answer">
            {type === 'choice' && <ChoiceAnswer q={q} value={answers[index]} onChange={setAnswer} />}
            {type === 'order' && <OrderAnswer q={q} value={answers[index]} onChange={setAnswer} pool={pools[index]} />}
            {type === 'classify' && <ClassifyAnswer q={q} value={answers[index]} onChange={setAnswer} />}
            {type === 'flow' && <FlowAnswer q={q} value={answers[index]} onChange={setAnswer} />}
          </div>
        </article>

        <footer className="exam-nav">
          <button type="button" className="exam-nav__btn" onClick={() => go(index - 1)} disabled={index === 0}>
            <ArrowLeft size={18} aria-hidden="true" /> ข้อก่อนหน้า
          </button>
          <span className={`exam-nav__state ${isAnswered(q, answers[index]) ? 'is-done' : ''}`}>
            {isAnswered(q, answers[index]) ? 'ตอบข้อนี้แล้ว' : 'ยังไม่ได้ตอบ'}
          </span>
          {index < total - 1 ? (
            <button type="button" className="exam-nav__btn exam-nav__btn--primary" onClick={() => go(index + 1)}>
              ข้อถัดไป <ArrowRight size={18} aria-hidden="true" />
            </button>
          ) : (
            <button type="button" className="exam-nav__btn exam-nav__btn--primary" onClick={() => setConfirming(true)}>
              ส่งคำตอบ <Send size={18} aria-hidden="true" />
            </button>
          )}
        </footer>
      </section>

      {/* ---------- ยืนยันการส่ง ---------- */}
      {confirming &&
        createPortal(
          <div className="exam-confirm" role="dialog" aria-modal="true" aria-labelledby="exam-confirm-title">
            <div className="exam-confirm__card">
              <span className="exam-confirm__icon" aria-hidden="true">
                <ClipboardCheck size={28} />
              </span>
              <h2 id="exam-confirm-title">ส่งคำตอบใช่ไหม?</h2>
              {unanswered.length > 0 ? (
                <p>
                  ยังไม่ได้ตอบ <b>{unanswered.length} ข้อ</b> (ข้อ {unanswered.join(', ')}) ข้อที่ไม่ได้ตอบจะไม่ได้คะแนน
                </p>
              ) : (
                <p>ตอบครบทั้ง {total} ข้อแล้ว ส่งแล้วจะแก้ไขคำตอบไม่ได้</p>
              )}
              <div className="exam-confirm__actions">
                <button
                  type="button"
                  className="exam-nav__btn"
                  onClick={() => {
                    setConfirming(false);
                    if (unanswered.length) go(unanswered[0] - 1);
                  }}
                  autoFocus
                >
                  {unanswered.length ? 'กลับไปตอบให้ครบ' : 'ตรวจทานอีกครั้ง'}
                </button>
                <button type="button" className="exam-nav__btn exam-nav__btn--primary" onClick={() => onFinish(answers)}>
                  ยืนยันส่งคำตอบ
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
