import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Boxes,
  Brain,
  Check,
  CheckCircle2,
  Clock,
  Database,
  Drama,
  Frown,
  GraduationCap,
  Landmark,
  Lightbulb,
  ListTree,
  Lock,
  MessageCircle,
  MessageSquareText,
  MessagesSquare,
  Puzzle,
  Rocket,
  Route,
  Ruler,
  Search,
  Settings2,
  ShoppingBag,
  Sparkles,
  Star,
  Target,
  UserRound,
  Workflow,
  XCircle
} from 'lucide-react';
import QuestHeader from '../components/quest/QuestHeader';
import BotTip from '../components/quest/BotTip';
import LessonArt from '../components/quest/art/LessonArt';
import Robot from '../components/quest/art/Robot';
import { lessons } from '../data/lessons';
import { units } from '../data/course';
import { useAuth } from '../contexts/AuthContext';
import { useProgress } from '../utils/progress';
import { getAllResults } from '../utils/quizStorage';
import { journey } from '../utils/journey';
import { logEvent } from '../services/sheetLogger';

const ICONS = {
  Bot,
  Boxes,
  Brain,
  Database,
  Drama,
  Frown,
  GraduationCap,
  Landmark,
  MessageCircle,
  MessageSquareText,
  MessagesSquare,
  Puzzle,
  Route,
  Ruler,
  Search,
  Settings2,
  ShoppingBag,
  Sparkles,
  UserRound,
  Workflow
};
const Icon = ({ name, size = 20 }) => {
  const C = ICONS[name] || Sparkles;
  return <C size={size} aria-hidden="true" />;
};

/** ไฮไลต์คำสำคัญของพาร์ทในข้อความ */
function hl(text, terms) {
  if (!terms?.length || !text) return text;
  const pats = [...terms]
    .sort((a, b) => b.length - a.length)
    .map((t) => {
      const e = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return /^[\x20-\x7E]+$/.test(t) ? `(?<![A-Za-z])${e}(?![A-Za-z])` : e;
    });
  const parts = String(text).split(new RegExp(`(${pats.join('|')})`, 'g'));
  return parts.map((p, i) =>
    terms.includes(p) ? (
      <mark key={i} className="kw-mark">
        {p}
      </mark>
    ) : (
      <Fragment key={i}>{p}</Fragment>
    )
  );
}

/** แบ่งเนื้อหาเป็นหัวข้อย่อยตามบล็อก 'h' */
function toSections(blocks) {
  const out = [{ title: null, blocks: [] }];
  blocks.forEach((b) => {
    if (b.type === 'h') out.push({ title: b.text, blocks: [] });
    else out[out.length - 1].blocks.push(b);
  });
  return out.filter((s) => s.blocks.length);
}

function tilt(e) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--rx', `${((e.clientY - r.top) / r.height - 0.5) * -10}deg`);
  e.currentTarget.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - 0.5) * 12}deg`);
}
function untilt(e) {
  e.currentTarget.style.setProperty('--rx', '0deg');
  e.currentTarget.style.setProperty('--ry', '0deg');
}

function Block({ b, terms }) {
  switch (b.type) {
    case 'p':
      return (
        <div className="ls-lead">
          <span className="ls-lead__icon">
            <MessageSquareText size={20} aria-hidden="true" />
          </span>
          <p>{hl(b.text, terms)}</p>
        </div>
      );
    case 'cards':
      return (
        <div className={`ls-cards ls-cards--${Math.min(b.items.length, 4)}`}>
          {b.items.map((c, i) => (
            <div key={c.title} className="ls-card" style={{ '--d': `${i * 0.12}s` }} onPointerMove={tilt} onPointerLeave={untilt}>
              <span className="ls-card__icon">
                <Icon name={c.icon} />
              </span>
              <b>{c.title}</b>
              <p>{hl(c.text, terms)}</p>
            </div>
          ))}
        </div>
      );
    case 'steps':
      return (
        <ol className="ls-steps">
          {b.items.map(([t, d], i) => (
            <li key={t} style={{ '--d': `${i * 0.1}s` }}>
              <span>{i + 1}</span>
              <div>
                <b>{hl(t, terms)}</b>
                <small>{hl(d, terms)}</small>
              </div>
            </li>
          ))}
        </ol>
      );
    case 'flow':
      return (
        <ol className="ls-flow" style={{ '--n': b.items.length }}>
          {b.items.map(([t, d], i) => (
            <li key={t} style={{ animationDelay: `${i * 0.6}s` }}>
              <em>{i + 1}</em>
              <b>{t}</b>
              {d && <small>{d}</small>}
            </li>
          ))}
        </ol>
      );
    case 'table':
      return (
        <div className="ls-tablewrap">
          <table className="ls-table">
            <thead>
              <tr>
                {b.head.map((h) => (
                  <th key={h} scope="col">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((r, ri) => (
                <tr key={r.join()} style={{ '--d': `${ri * 0.08}s` }}>
                  {r.map((c, i) => (
                    <td key={i}>{i === 0 ? <b>{c}</b> : c}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'example':
      return <BotTip title="บิทชวนคิด">{b.text}</BotTip>;
    default:
      return null;
  }
}

/** เช็กความเข้าใจท้ายพาร์ท — ตอบถูกครบจึงผ่านพาร์ท */
function CheckQuiz({ lesson, done, onPass }) {
  const [picked, setPicked] = useState({});
  const allRight = lesson.checks.every((c, i) => picked[i] === c.answer);
  const [party, setParty] = useState(false);
  const fired = useRef(false);

  useEffect(() => {
    if (allRight && !done && !fired.current) {
      fired.current = true;
      onPass();
      setParty(true);
      const t = setTimeout(() => setParty(false), 2600);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [allRight, done, onPass]);

  return (
    <section id="ls-check" className={`qpanel ls-check ${allRight || done ? 'is-pass' : ''}`} aria-labelledby={`check-${lesson.no}`}>
      {party && (
        <div className="confetti" aria-hidden="true">
          {Array.from({ length: 24 }).map((_, i) => (
            <i key={i} style={{ '--i': i }} />
          ))}
          <span className="ls-check__xp">+20 XP</span>
        </div>
      )}
      <div className="ls-check__head">
        <Robot head live size={52} mood={allRight || done ? 'cheer' : 'think'} />
        <div>
          <h3 id={`check-${lesson.no}`}>เช็กความเข้าใจ · พาร์ท {lesson.no}</h3>
          <p>{done ? 'ผ่านพาร์ทนี้แล้ว ทบทวนได้ตลอด' : `ตอบถูกครบ ${lesson.checks.length} ข้อ เพื่อผ่านพาร์ทนี้ (+20 XP)`}</p>
        </div>
      </div>
      <ol className="ls-check__list">
        {lesson.checks.map((c, i) => {
          const p = picked[i];
          const answered = p != null;
          const right = p === c.answer;
          return (
            <li key={c.q}>
              <b>
                {i + 1}. {c.q}
              </b>
              <div className="ls-check__opts" role="radiogroup" aria-label={c.q}>
                {c.options.map((o, k) => {
                  const state = answered && k === p ? (right ? 'is-right' : 'is-wrong') : '';
                  return (
                    <button
                      key={o}
                      type="button"
                      role="radio"
                      aria-checked={k === p}
                      className={state}
                      disabled={answered && right}
                      onClick={() => setPicked((s) => ({ ...s, [i]: k }))}
                    >
                      <span>{String.fromCharCode(65 + k)}</span>
                      {o}
                      {state === 'is-right' && <CheckCircle2 size={16} aria-hidden="true" />}
                      {state === 'is-wrong' && <XCircle size={16} aria-hidden="true" />}
                    </button>
                  );
                })}
              </div>
              {answered && (
                <p className={`ls-check__fb ${right ? 'is-right' : 'is-wrong'}`} role="status">
                  {right ? `ถูกต้อง! ${c.explain}` : 'ยังไม่ใช่ ลองอ่านหัวข้อด้านบนอีกครั้ง แล้วเลือกใหม่'}
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/** เส้นทางพาร์ท 1–6 → ลงมือปฏิบัติ */
function PartTrack({ no, setNo, isDone, isOpen, lessonsDone, read }) {
  const nodes = lessons.length + 1;
  const reached = Math.min(read, lessons.length);
  return (
    <nav className="track" aria-label="พาร์ทบทเรียน">
      <div className="track__rail" aria-hidden="true">
        <i style={{ width: `${(reached / (nodes - 1)) * 100}%` }} />
      </div>
      <ol>
        {lessons.map((l) => {
          const open = isOpen(l.no);
          const state = l.no === no ? 'is-on' : isDone(l.no) ? 'is-done' : open ? 'is-open' : 'is-locked';
          const short = units.find((u) => u.no === l.no)?.short || l.title;
          return (
            <li key={l.no} className={`track__node ${state}`}>
              <button type="button" disabled={!open} onClick={() => setNo(l.no)} aria-current={l.no === no ? 'step' : undefined} aria-label={`พาร์ท ${l.no} ${l.title}${isDone(l.no) ? ' (ผ่านแล้ว)' : ''}`}>
                <span className="track__dot">
                  {isDone(l.no) && l.no !== no ? <Check size={18} aria-hidden="true" /> : open ? <Icon name={l.icon} size={18} /> : <Lock size={15} aria-hidden="true" />}
                  {isDone(l.no) && <em className="track__star" aria-hidden="true"><Star size={10} /></em>}
                </span>
                <span className="track__label">
                  <small>พาร์ท {l.no}</small>
                  <b>{short}</b>
                </span>
              </button>
            </li>
          );
        })}
        <li className={`track__node track__node--go ${lessonsDone ? 'is-open' : 'is-locked'}`}>
          <Link to="/worksheets" aria-disabled={!lessonsDone} tabIndex={lessonsDone ? 0 : -1} onClick={(e) => !lessonsDone && e.preventDefault()}>
            <span className="track__dot">
              <Rocket size={18} aria-hidden="true" />
            </span>
            <span className="track__label">
              <small>เป้าหมาย</small>
              <b>ลงมือปฏิบัติ</b>
            </span>
          </Link>
        </li>
      </ol>
    </nav>
  );
}

/** บทเรียน (ใบเนื้อหา) 6 พาร์ท — ผ่านทีละพาร์ท แล้วไปลงมือปฏิบัติ */
export default function ContentSheets() {
  const { user, isPreview: preview } = useAuth();
  const { progress, readLesson } = useProgress(user?.uid);
  const j = journey(progress, getAllResults());
  const isDone = (n) => Boolean(progress.lessons[n]);
  const isOpen = (n) => preview || n === 1 || isDone(n - 1);

  const [no, setNo] = useState(() => {
    const first = lessons.find((l) => !progress.lessons[l.no]);
    return first ? first.no : 1;
  });
  const lesson = lessons.find((l) => l.no === no);
  const unit = units.find((u) => u.no === no);
  const sections = useMemo(() => toSections(lesson.blocks), [lesson]);
  const done = isDone(no);
  const next = lessons.find((l) => l.no === no + 1);
  const prev = lessons.find((l) => l.no === no - 1);
  const secNo = (i) => `${lesson.no}.${i + (sections[0].title ? 1 : 0)}`;

  // บันทึกการเริ่มเรียน (ครั้งแรกที่เปิดบทเรียน)
  useEffect(() => {
    if (!j.can.lessons || !user) return;
    const k = `chatbot-learning:started:${user.uid}`;
    try {
      if (!localStorage.getItem(k)) {
        localStorage.setItem(k, new Date().toISOString());
        logEvent('lesson_start', { part: no });
      }
    } catch {
      /* ไม่เป็นไร */
    }
  }, [j.can.lessons, user, no]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [no]);

  // เผยเนื้อหาเมื่อเลื่อนถึง · แถบอ่าน · หัวข้อที่กำลังอ่าน
  const artRef = useRef(null);
  const [readPct, setReadPct] = useState(0);
  const [activeSec, setActiveSec] = useState(0);
  useEffect(() => {
    const root = artRef.current;
    if (!root) return undefined;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => en.isIntersecting && (en.target.classList.add('is-in'), io.unobserve(en.target))),
      { threshold: 0.12 }
    );
    root.querySelectorAll('.rv').forEach((el) => io.observe(el));
    const onScroll = () => {
      const r = root.getBoundingClientRect();
      const total = r.height - window.innerHeight * 0.6;
      setReadPct(Math.max(0, Math.min(100, (-r.top / Math.max(total, 1)) * 100)));
      const secs = [...root.querySelectorAll('.lesson__sec')];
      let idx = 0;
      secs.forEach((s, i) => {
        if (s.getBoundingClientRect().top < window.innerHeight * 0.4) idx = i;
      });
      setActiveSec(idx);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, [no, j.can.lessons]);

  const pass = () => {
    readLesson(no);
    logEvent('lesson_pass', { part: no, title: lesson.title });
  };

  if (!j.can.lessons) {
    return (
      <div className="quest">
        <div className="qwrap">
          <section className="qpanel gate">
            <Robot mood="think" size={120} live />
            <h1>ทำแบบทดสอบก่อนเรียนก่อนนะ</h1>
            <p>บทเรียนจะปลดล็อกเมื่อทำแบบทดสอบก่อนเรียนเสร็จ เพื่อวัดพื้นฐานของตัวเองก่อนเริ่มเรียน</p>
            <Link to="/quizzes/pretest" className="qbtn qbtn--primary">
              ไปทำแบบทดสอบก่อนเรียน <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </section>
        </div>
      </div>
    );
  }

  const goSec = (i) => document.getElementById(`sec-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className="quest">
      <div className="qwrap">
        <QuestHeader
          progress={progress}
          stage={0}
          title="บทเรียน: ความรู้ก่อนลงมือสร้างแชตบอต"
          desc={`เรียนทีละพาร์ท ตอบเช็กความเข้าใจให้ผ่าน แล้วไปลงมือปฏิบัติ · ผ่านแล้ว ${j.read}/${lessons.length} พาร์ท`}
        />

        <PartTrack no={no} setNo={setNo} isDone={isDone} isOpen={isOpen} lessonsDone={preview || j.done.lessons} read={j.read} />

        <div className="readbar" aria-hidden="true">
          <i style={{ width: `${readPct}%` }} />
        </div>

        <article className="lesson" key={no} ref={artRef} style={{ '--lc': lesson.color }}>
          {/* ส่วนหัวพาร์ท */}
          <header className="qpanel lesson__hero">
            <div className="lesson__bg" aria-hidden="true">
              <span className="blob b1" />
              <span className="blob b2" />
              <span className="blob b3" />
              {[0, 1, 2, 3, 4, 5].map((k) => (
                <i key={k} className="lesson__float" style={{ '--k': k }}>
                  <Icon name={lesson.icon} size={16 + (k % 3) * 6} />
                </i>
              ))}
            </div>
            <div className="lesson__intro">
              <span className="lesson__badge">
                <Icon name={lesson.icon} size={16} /> พาร์ท {lesson.no} จาก {lessons.length}
              </span>
              <h2>{lesson.title}</h2>
              <div className="lesson__goal">
                <Target size={18} aria-hidden="true" />
                <div>
                  <small>จุดประสงค์ข้อ {lesson.no} · เรียนจบแล้วนักเรียนจะ…</small>
                  <p>{lesson.goal}</p>
                </div>
              </div>
              <div className="lesson__meta">
                <span>
                  <Clock size={15} aria-hidden="true" /> {lesson.minutes} นาที
                </span>
                <span>
                  <ListTree size={15} aria-hidden="true" /> {sections.length} หัวข้อ
                </span>
                <span>
                  <CheckCircle2 size={15} aria-hidden="true" /> เช็กความเข้าใจ {lesson.checks.length} ข้อ
                </span>
                {done && <span className="is-done">ผ่านแล้ว</span>}
              </div>
            </div>
            <div className="lesson__art">
              <div className="lesson__screen">
                <span className="lesson__dots" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <LessonArt no={lesson.no} />
              </div>
            </div>
          </header>

          {/* สาระสำคัญ */}
          <section className="keybox rv" aria-labelledby="keybox-title">
            <div className="keybox__head">
              <span className="keybox__icon">
                <Lightbulb size={20} aria-hidden="true" />
              </span>
              <h3 id="keybox-title">สาระสำคัญที่ต้องจำ</h3>
            </div>
            <ol className="keybox__list">
              {lesson.keypoints.map((k, i) => (
                <li key={k} style={{ '--d': `${i * 0.12}s` }}>
                  <em>{i + 1}</em>
                  <p>{hl(k, lesson.terms)}</p>
                </li>
              ))}
            </ol>
          </section>

          <div className="lesson__body">
            <div className="lesson__main">
              {sections.map((s, i) => (
                <section key={i} id={`sec-${i}`} className="qpanel lesson__sec rv" style={{ '--sn': `"${String(i + 1).padStart(2, '0')}"` }}>
                  {s.title ? (
                    <h3 className="lesson__h">
                      <span>{secNo(i)}</span>
                      {s.title}
                    </h3>
                  ) : (
                    <h3 className="lesson__h">
                      <span>{lesson.no}.0</span>
                      {unit?.topics?.[0] || 'บทนำ'}
                    </h3>
                  )}
                  {s.blocks.map((b, k) => (
                    <Block key={k} b={b} terms={lesson.terms} />
                  ))}
                </section>
              ))}

              <CheckQuiz key={no} lesson={lesson} done={done} onPass={pass} />

              <footer className="lesson__foot">
                {prev ? (
                  <button type="button" className="qbtn qbtn--ghost" onClick={() => setNo(prev.no)}>
                    <ArrowLeft size={16} aria-hidden="true" /> พาร์ท {prev.no}
                  </button>
                ) : (
                  <Link to="/learn" className="qbtn qbtn--ghost">
                    <ArrowLeft size={16} aria-hidden="true" /> หน้าหลัก
                  </Link>
                )}
                {next ? (
                  <button type="button" className="qbtn qbtn--primary" disabled={!done} onClick={() => setNo(next.no)}>
                    {done ? `ไปพาร์ท ${next.no}` : 'ตอบเช็กความเข้าใจให้ผ่านก่อน'} <ArrowRight size={16} aria-hidden="true" />
                  </button>
                ) : j.done.lessons ? (
                  <Link to="/worksheets" className="qbtn qbtn--primary">
                    <Rocket size={16} aria-hidden="true" /> ลงมือปฏิบัติ: ภารกิจสร้างบอท
                  </Link>
                ) : (
                  <button type="button" className="qbtn qbtn--primary" disabled>
                    ผ่านทุกพาร์ทก่อนลงมือปฏิบัติ
                  </button>
                )}
              </footer>
            </div>

            {/* สารบัญข้างเนื้อหา */}
            <aside className="lesson__aside" aria-label="สารบัญพาร์ทนี้">
              <div className="toc">
                <div className="toc__ring" style={{ '--p': readPct }}>
                  <b>{Math.round(readPct)}%</b>
                  <small>อ่านแล้ว</small>
                </div>
                <h4>ในพาร์ทนี้</h4>
                <ol>
                  {sections.map((s, i) => (
                    <li key={i}>
                      <button type="button" className={activeSec === i ? 'is-on' : ''} onClick={() => goSec(i)}>
                        <em>{secNo(i)}</em>
                        {s.title || unit?.topics?.[0] || 'บทนำ'}
                      </button>
                    </li>
                  ))}
                  <li>
                    <button type="button" className="toc__check" onClick={() => document.getElementById('ls-check')?.scrollIntoView({ behavior: 'smooth' })}>
                      <em>
                        <CheckCircle2 size={13} aria-hidden="true" />
                      </em>
                      เช็กความเข้าใจ
                    </button>
                  </li>
                </ol>
              </div>
            </aside>
          </div>
        </article>
      </div>
    </div>
  );
}
