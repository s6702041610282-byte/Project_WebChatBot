import { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Check,
  ClipboardList,
  Coffee,
  Cpu,
  FlaskConical,
  HeartHandshake,
  Info,
  Lightbulb,
  MessageCircle,
  MessagesSquare,
  RotateCcw,
  Star,
  Users,
  Wrench,
  Zap
} from 'lucide-react';
import Mascot from '../components/Mascot';

const CoffeeScene3D = lazy(() => import('../components/CoffeeScene3D'));
import TypeMark from '../components/TypeMark';
import { criteria, units } from '../data/course';
import { useCountUp, useInView } from '../hooks/useInView';
import { useAuth } from '../contexts/AuthContext';

/* ---------- สัดส่วนเนื้อหา 6 หัวข้อ ---------- */
const TOTAL_ITEMS = units.reduce((s, u) => s + u.examItems, 0);
const parts = units.map((u) => ({ ...u, label: u.short, percent: Math.round((u.examItems / TOTAL_ITEMS) * 100) }));
const TOPIC_ICONS = [BookOpen, Cpu, Lightbulb, Wrench, Users, MessagesSquare];
const iconOf = (p) => TOPIC_ICONS[p.no - 1] || Star;


/* ---------- การทดสอบบอท: ผ่านกี่กรณีจากทั้งหมด ---------- */
const TOTAL_CASES = criteria.testing.cases;
const PASS_CASES = Math.ceil((criteria.testing.passPercent / 100) * TOTAL_CASES);
const STEPS = Array.from({ length: TOTAL_CASES + 1 }, (_, i) => i);

const LEVEL_COLORS = ['#16a34a', '#2563eb', '#f59e0b', '#ef4444'];

/** ข้อความที่มีคำไฮไลต์ */
function Highlight({ text, hl }) {
  if (!hl || !text.includes(hl)) return text;
  const [before, after] = text.split(hl);
  return (
    <>
      {before}
      <mark>{hl}</mark>
      {after}
    </>
  );
}


/* =========================================================
   การ์ดเลื่อนดูทีละส่วน
   ========================================================= */
function PartCard({ active, setActive, onInteract }) {
  const i = active ?? 0;
  const p = parts[i];
  const Icon = iconOf(p);
  const go = (dir) => {
    onInteract();
    setActive((i + dir + parts.length) % parts.length);
  };

  return (
    <div className="cr-card" style={{ '--c': p.color }}>
      <button type="button" className="cr-card__nav" onClick={() => go(-1)} aria-label="หัวข้อก่อนหน้า">
        <ArrowLeft size={20} />
      </button>

      <div className="cr-card__body" key={i}>
        <span className="cr-card__kicker">
          <i /> หัวข้อที่ {p.no} จาก {parts.length} · จุดประสงค์ข้อ {p.objective}
        </span>
        <h3>
          <span className="cr-card__icon">
            <Icon size={18} aria-hidden="true" />
          </span>
          {p.title}
        </h3>
        <div className="cr-card__row">
          <b>{p.percent}%</b>
          <span className="cr-card__pill">{p.percent}% ของเนื้อหา</span>
          <span className="cr-card__bar">
            <i style={{ width: `${p.percent}%` }} />
          </span>
        </div>
        <p>{p.topics.join(' · ')}</p>
      </div>

      <button type="button" className="cr-card__nav" onClick={() => go(1)} aria-label="หัวข้อถัดไป">
        <ArrowRight size={20} />
      </button>

      <div className="cr-card__dots" role="tablist" aria-label="เลือกหัวข้อ">
        {parts.map((q, n) => (
          <button
            key={q.label}
            type="button"
            role="tab"
            aria-selected={n === i}
            className={n === i ? 'is-active' : ''}
            style={{ '--c': q.color }}
            onClick={() => {
              onInteract();
              setActive(n);
            }}
          >
            {q.no}
          </button>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   แชตถาม–ตอบกับน้องบอท
   ========================================================= */
function ChatFaq({ start }) {
  const faq = criteria.faq || [];
  const total = faq.length * 3;
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!start || step >= total) return undefined;
    const t = setTimeout(() => setStep((s) => s + 1), step % 3 === 1 ? 900 : 650);
    return () => clearTimeout(t);
  }, [start, step, total]);

  return (
    <div className="cr-chat">
      <header className="cr-chat__head">
        <span className="cr-chat__avatar">
          <Mascot size={40} followCursor={false} />
        </span>
        <div>
          <b>น้องบอท</b>
          <small>
            <i /> ออนไลน์ · ผู้ช่วยเรื่องเกณฑ์
          </small>
        </div>
        <button type="button" className="cr-chat__replay" onClick={() => setStep(0)} aria-label="เล่นบทสนทนาอีกครั้ง">
          <RotateCcw size={16} />
        </button>
      </header>

      <ol className="cr-chat__body" aria-live="polite">
        {faq.map((m, i) => (
          <li key={m.q} className="cr-chat__pair">
            {step >= i * 3 + 1 && <p className="cr-msg cr-msg--user">{m.q}</p>}
            {step === i * 3 + 2 && (
              <p className="cr-msg cr-msg--bot cr-msg--typing" aria-label="กำลังพิมพ์">
                <i />
                <i />
                <i />
              </p>
            )}
            {step >= i * 3 + 3 && (
              <p className="cr-msg cr-msg--bot">
                <Highlight text={m.a} hl={m.hl} />
              </p>
            )}
          </li>
        ))}
      </ol>

      <div className="cr-chat__input" aria-hidden="true">
        <span>พิมพ์คำถามเกี่ยวกับเกณฑ์…</span>
        <i>
          <ArrowRight size={16} />
        </i>
      </div>
    </div>
  );
}

/* =========================================================
   ใบประเมินผลการปฏิบัติงาน — บัตรสะสมแต้มร้าน CED Coffee
   ========================================================= */
function StampCard({ start }) {
  const items = criteria.checklist;
  const [done, setDone] = useState(() => items.map(() => false));
  const [auto, setAuto] = useState(0);
  const [hover, setHover] = useState(-1);

  useEffect(() => {
    if (!start || auto >= items.length) return undefined;
    const t = setTimeout(() => {
      setDone((d) => d.map((v, i) => (i === auto ? true : v)));
      setAuto((a) => a + 1);
    }, auto === 0 ? 600 : 380);
    return () => clearTimeout(t);
  }, [start, auto, items.length]);

  const count = done.filter(Boolean).length;
  const toggle = (i) => {
    setAuto(items.length);
    setDone((d) => d.map((v, n) => (n === i ? !v : v)));
  };
  const show = hover >= 0 ? hover : Math.max(0, Math.min(items.length - 1, count - 1));

  return (
    <div className={`sc ${count === items.length ? 'is-full' : ''}`}>
      <div className="sc-card">
        <header className="sc-head">
          <span className="sc-logo">
            <Coffee size={20} aria-hidden="true" />
          </span>
          <div>
            <b>CED Coffee</b>
            <small>บัตรสะสมแต้ม · ใบประเมินผลการปฏิบัติงาน</small>
          </div>
          <span className="sc-count">
            <b>{count}</b>/{items.length}
          </span>
        </header>

        <ol className="sc-grid">
          {items.map((t, i) => (
            <li key={t}>
              <button
                type="button"
                className={`sc-slot ${done[i] ? 'is-done' : ''} ${show === i ? 'is-show' : ''}`}
                onClick={() => toggle(i)}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(-1)}
                aria-pressed={done[i]}
                aria-label={`ขั้นที่ ${i + 1} ${t}`}
              >
                <span className="sc-slot__no">{i + 1}</span>
                <span className="sc-stamp" aria-hidden="true">
                  <Coffee size={22} />
                  <small>PASS</small>
                </span>
              </button>
            </li>
          ))}
        </ol>

        <p className="sc-step" key={show}>
          <b>ขั้นที่ {show + 1}</b> {items[show]}
        </p>
        <footer className="sc-foot">
          {count === items.length ? '🎉 ครบทุกช่อง! ผลงานพร้อมส่งครู' : 'กดที่ช่องเพื่อปั๊มตราเช็กงานของตัวเอง'}
        </footer>
      </div>
      <span className="sc-card-back" aria-hidden="true" />
    </div>
  );
}

/* =========================================================
   ทดสอบบอท — เครื่องชงกาแฟเทลงแก้ว มีขีดผ่าน 80%
   ========================================================= */
function BrewTest({ cases, setCases, start }) {
  const percent = Math.round((cases / TOTAL_CASES) * 100);
  const passed = cases >= PASS_CASES;
  const [pour, setPour] = useState(0);
  useEffect(() => {
    setPour((n) => n + 1);
  }, [cases]);

  return (
    <div className={`bt ${start ? 'is-on' : ''} ${passed ? 'is-pass' : 'is-fail'}`}>
      <div className="bt-machine">
        <div className="bt-top">
          <span className="bt-screen">
            <b>{cases}</b>/{TOTAL_CASES} กรณี
          </span>
          <span className="bt-lights" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </div>
        <div className="bt-body">
          <span className="bt-nozzle" aria-hidden="true" />
          <span className="bt-stream" key={pour} aria-hidden="true" />
          <div className="bt-cup">
            <span className="bt-cup__steam" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="bt-cup__glass">
              <span className="bt-cup__fill" style={{ height: `${percent}%` }}>
                <span className="bt-cup__wave" />
              </span>
              <span className="bt-cup__pass" style={{ bottom: `${criteria.testing.passPercent}%` }}>
                <em>ผ่าน {criteria.testing.passPercent}%</em>
              </span>
              <span className="bt-cup__pct">{percent}%</span>
            </span>
            <span className="bt-cup__handle" aria-hidden="true" />
          </div>
          <span className="bt-tray" aria-hidden="true" />
        </div>
      </div>

      <div className="bt-panel">
        <span className="bt-badge">{passed ? '✓ ผ่านเกณฑ์' : 'ยังไม่ผ่าน'}</span>
        <p className="bt-say">
          {!passed
            ? `อีก ${PASS_CASES - cases} กรณี! แก้บอทแล้วลองใหม่ 💪`
            : cases === TOTAL_CASES
              ? 'ตอบถูกครบทุกกรณี สุดยอด! 🎉'
              : 'ผ่านเกณฑ์แล้ว เก่งมาก ✨'}
        </p>

        <div className="bt-buttons" role="group" aria-label="เลือกจำนวนกรณีที่บอทตอบถูก">
          {STEPS.map((n) => (
            <button
              key={n}
              type="button"
              className={`${n === cases ? 'is-active' : ''} ${n >= PASS_CASES ? 'is-ok' : ''}`}
              onClick={() => setCases(n)}
            >
              {n}
            </button>
          ))}
        </div>
        <small className="bt-help">กดจำนวนกรณีที่บอทตอบถูก (จาก {TOTAL_CASES} กรณี) แล้วดูเครื่องชงเทลงแก้ว</small>

        <p className="bt-sub">ทดสอบให้ครบ 4 ประเภท</p>
        <ol className="bt-types">
          {criteria.testing.types.map((t, i) => (
            <li key={t} style={{ '--i': i }}>
              <span>{i + 1}</span>
              {t}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/* ระดับคะแนน 4 ระดับเป็นแก้ว 4 ขนาด */
function CupIcon({ size, color }) {
  return (
    <svg viewBox="0 0 60 70" width={size} height={size * 1.16} aria-hidden="true">
      <path d="M8 14 H52 L47 64 Q30 70 13 64 Z" fill="#fff" stroke={color} strokeWidth="3" />
      <path d="M11 30 H49 L47 64 Q30 70 13 64 Z" fill={color} opacity=".85" />
      <rect x="4" y="8" width="52" height="8" rx="4" fill={color} />
      <path d="M22 4 q3 -4 0 -8 M30 4 q3 -4 0 -8 M38 4 q3 -4 0 -8" stroke={color} strokeWidth="2" fill="none" opacity=".5" transform="translate(0 6)" />
    </svg>
  );
}

/* =========================================================
   หน้าเกณฑ์การวัดผล
   ========================================================= */
export default function Criteria() {
  const { isLoggedIn } = useAuth();
  const [heroPart, setHeroPart] = useState(0);
  const [auto, setAuto] = useState(true);
  const [cases, setCases] = useState(7);
  const [topic, setTopic] = useState(0);

  const [heroRef, heroIn] = useInView({ threshold: 0.2 });
  const [chatRef, chatIn] = useInView({ threshold: 0.35 });
  const [checkRef, checkIn] = useInView({ threshold: 0.3 });
  const [testRef, testIn] = useInView({ threshold: 0.25 });

  useEffect(() => {
    if (!auto || !heroIn) return undefined;
    const t = setInterval(() => setHeroPart((n) => (n + 1) % parts.length), 3600);
    return () => clearInterval(t);
  }, [auto, heroIn]);

  const stopAuto = () => setAuto(false);
  const rubric = criteria.rubric[topic];

  return (
    <div className="cr">
      <div className="cr__light" aria-hidden="true">
        <span className="cr__glow cr__glow--1" />
        <span className="cr__glow cr__glow--2" />
        <span className="cr__glow cr__glow--3" />
      </div>

      {/* ---------- 1. Hero ---------- */}
      <section className="cr-hero" ref={heroRef}>
        <div className="container cr-hero__inner">
          <div className="cr-hero__text">
            <nav className="cr-crumb" aria-label="ตำแหน่งของหน้า">
              <Link to="/">Home</Link> <span aria-hidden="true">/</span> <span aria-current="page">สัดส่วนเนื้อหา</span>
            </nav>
            <h1 className="cr-hero__title">
              เนื้อหา 6 หัวข้อ
              <TypeMark>ชงรวมกันได้ 100</TypeMark>
            </h1>
            <p className="cr-hero__lead">
              เหมือนเมนูพิเศษของร้าน CED Coffee เติมความรู้ทีละชั้น ชั้นหนาคือหัวข้อที่มีสัดส่วนมาก
              ลากเพื่อหมุนแก้ว แล้วแตะที่ชั้นเพื่อดูว่าแต่ละหัวข้อเรียนอะไร
            </p>
            <div className="cr-hero__actions">
              <a href="#cr-check" className="cr-btn">
                ดูเกณฑ์ประเมินผลงาน <ArrowRight size={18} aria-hidden="true" />
              </a>
              <a href="#cr-chat" className="cr-btn cr-btn--ghost">
                <MessageCircle size={18} aria-hidden="true" /> ถามน้องบอท
              </a>
            </div>

          </div>

          <div className="cr-hero__visual" onMouseEnter={stopAuto} onTouchStart={stopAuto}>
            <Suspense fallback={<div className="c3d c3d--loading">กำลังชงเครื่องดื่ม 3 มิติ… ☕</div>}>
              <CoffeeScene3D parts={parts} active={heroPart} onPick={setHeroPart} />
            </Suspense>
            <PartCard active={heroPart} setActive={setHeroPart} onInteract={stopAuto} />
          </div>
        </div>
      </section>


      {/* ---------- 2. ถามน้องบอท ---------- */}
      <section className="cr-section" id="cr-chat" ref={chatRef}>
        <div className="container cr-split">
          <div className="cr-split__text">
            <h2 className="cr-title">
              สงสัยตรงไหน
              <TypeMark tone="sky">ถามน้องบอท</TypeMark>
              ได้เลย
            </h2>
            <p className="cr-lead">รวมคำถามที่ถามบ่อยเรื่องการวัดผล ดูคำตอบสั้น ๆ ก่อนเริ่มทำใบสั่งงานจะได้ไม่พลาด</p>
          </div>
          <ChatFaq start={chatIn} />
        </div>
      </section>

      {/* ---------- 3. ใบประเมินผลการปฏิบัติงาน ---------- */}
      <section className="cr-section cr-section--soft" id="cr-check" ref={checkRef}>
        <div className="container cr-split cr-split--rev">
          <StampCard start={checkIn} />
          <div className="cr-split__text">
            <h2 className="cr-title">
              สะสมแต้มให้ครบ
              <TypeMark tone="green">8 ขั้นตอน</TypeMark>
            </h2>
            <p className="cr-lead">ใบประเมินผลการปฏิบัติงานเหมือนบัตรสะสมแต้มของร้าน ทำแต่ละขั้นผ่านก็ได้ตราหนึ่งดวง และผลงานต้องผ่านเกณฑ์คุณภาพ 4 ข้อนี้</p>
            <ul className="cr-quality">
              {criteria.quality.map((q, i) => (
                <li key={q.label} style={{ '--i': i }} className={checkIn ? 'is-in' : ''}>
                  <b>{q.value}</b>
                  <span>{q.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ---------- 4. จำลองการทดสอบบอท ---------- */}
      <section className="cr-section" id="cr-test" ref={testRef}>
        <div className="container">
          <div className="cr-center-head">
            <h2 className="cr-title">
              ชงให้ถึงขีด
              <TypeMark tone="violet">บอทผ่านไหม?</TypeMark>
            </h2>
          </div>

          <BrewTest cases={cases} setCases={setCases} start={testIn} />
        </div>
      </section>

      {/* ---------- 5. ใบสังเกตการณ์ (rubric) ---------- */}
      <section className="cr-section cr-section--soft">
        <div className="container">
          <div className="cr-center-head">
            <h2 className="cr-title">
              ครูให้คะแนน
              <TypeMark tone="sky">4 ขนาดแก้ว</TypeMark>
            </h2>
          </div>

          <div className="cr-rubric">
            <div className="cr-rubric__tabs" role="tablist" aria-label="จุดประเมิน">
              {criteria.rubric.map((r, i) => (
                <button
                  key={r.topic}
                  type="button"
                  role="tab"
                  aria-selected={topic === i}
                  className={topic === i ? 'is-active' : ''}
                  onClick={() => setTopic(i)}
                >
                  <span>{i + 1}</span>
                  {r.topic}
                </button>
              ))}
            </div>

            <ol className="cr-levels" key={topic}>
              {rubric.levels.map((text, i) => (
                <li key={criteria.levels[i]} style={{ '--c': LEVEL_COLORS[i], '--i': i }}>
                  <span className="cr-levels__cup">
                    <CupIcon size={[60, 50, 40, 30][i]} color={LEVEL_COLORS[i]} />
                    <em>{['L', 'M', 'S', 'XS'][i]}</em>
                  </span>
                  <span className="cr-levels__stars" aria-hidden="true">
                    {Array.from({ length: 4 - i }, (_, n) => (
                      <Star key={n} size={14} fill="currentColor" />
                    ))}
                  </span>
                  <b>{criteria.levels[i]}</b>
                  <p>{text}</p>
                </li>
              ))}
            </ol>

            <div className="cr-attitude">
              <b>
                <HeartHandshake size={18} aria-hidden="true" /> เจตคติ (กิจนิสัย) ในการทำงาน
              </b>
              <ul>
                {criteria.attitudes.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- 6. ชวนเริ่มเรียน ---------- */}
      <section className="cr-section">
        <div className="container">
          <div className="cr-final">
            <span className="cr-final__glow" aria-hidden="true" />
            <div className="cr-final__text">
              <h2 className="cr-title">
                ชงทีละแก้ว
                <TypeMark>เดี๋ยวก็ครบ!</TypeMark>
              </h2>
              <p className="cr-lead">เรียนใบเนื้อหาทีละหัวข้อ แล้วลงมือสร้างบอทร้าน CED Coffee พลังของเราจะค่อย ๆ เต็มเอง</p>
              <div className="cr-hero__actions">
                <Link to={isLoggedIn ? '/learn' : '/login'} className="cr-btn cr-btn--dark">
                  {isLoggedIn ? 'ไปที่หน้าเรียน' : 'เริ่มเรียนเลย'} <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <Link to="/syllabus" className="cr-final__link">
                  ดูโครงสร้างรายวิชา
                </Link>
              </div>
            </div>

            <div className="cr-final__art" aria-hidden="true">
              <div className="cr-tray">
                <div className="cr-tray__cups">
                  {parts.map((p, i) => (
                    <span key={p.no} className="cr-tray__cup" style={{ '--c': p.color, '--i': i, '--h': `${40 + p.percent * 1.6}px` }}>
                      <i className="cr-tray__liquid" />
                      <b>{p.no}</b>
                    </span>
                  ))}
                </div>
                <span className="cr-tray__plate" />
                <small>เสิร์ฟครบ 6 หัวข้อ ☕</small>
              </div>
              <div className="cr-final__bot">
                <Mascot size={120} holdBubble />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
