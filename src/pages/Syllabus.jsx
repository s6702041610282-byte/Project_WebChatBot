import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Check,
  Clock,
  Coffee,
  Cpu,
  FileText,
  GraduationCap,
  HeartHandshake,
  Lightbulb,
  MessagesSquare,
  BadgeCheck,
  FlaskConical,
  Gift,
  LayoutGrid,
  LifeBuoy,
  MessageCircle,
  Paperclip,
  Phone,
  Reply,
  Smartphone,
  Sparkles,
  Store,
  Table2,
  Target,
  Trophy,
  Users,
  Wrench,
  Zap
} from 'lucide-react';
import Mascot from '../components/Mascot';
import TypeMark from '../components/TypeMark';
import { course, domains, learningPath, materials, objectives, practice, units } from '../data/course';
import { useInView } from '../hooks/useInView';
import { useAuth } from '../contexts/AuthContext';

const TOPIC_ICONS = [BookOpen, Cpu, Lightbulb, Wrench, Users, MessagesSquare];
const DOMAIN_ICONS = { K: Lightbulb, P: Wrench, A: HeartHandshake };
const TOTAL_ITEMS = units.reduce((s, u) => s + u.examItems, 0);


function useMedia(query) {
  const get = () => typeof window !== 'undefined' && window.matchMedia(query).matches;
  const [match, setMatch] = useState(get);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return match;
}

/* =========================================================
   ภาพประกอบประจำหัวข้อ (SVG วาดเอง ใช้สีของหัวข้อ)
   ========================================================= */
function TopicArt({ no }) {
  const c = 'var(--c)';
  const soft = 'color-mix(in srgb, var(--c) 18%, #fff)';
  const mid = 'color-mix(in srgb, var(--c) 45%, #fff)';
  const arts = {
    // 1 ความหมาย: คนคุยกับบอท
    1: (
      <>
        <rect x="8" y="16" width="62" height="34" rx="14" fill={soft} />
        <circle cx="26" cy="33" r="4" fill={c} />
        <circle cx="39" cy="33" r="4" fill={c} />
        <circle cx="52" cy="33" r="4" fill={c} />
        <path d="M20 50 L16 60 L30 50Z" fill={soft} />
        <rect x="52" y="56" width="64" height="30" rx="13" fill={c} />
        <rect x="62" y="66" width="34" height="5" rx="2.5" fill="#fff" />
        <rect x="62" y="75" width="22" height="5" rx="2.5" fill="#fff" opacity=".7" />
        <path d="M104 86 L112 94 L98 86Z" fill={c} />
      </>
    ),
    // 2 หลักการทำงาน: input → สมองบอท → output
    2: (
      <>
        <rect x="6" y="38" width="28" height="22" rx="7" fill={soft} />
        <path d="M38 49 H50" stroke={c} strokeWidth="4" strokeLinecap="round" strokeDasharray="3 6" />
        <circle cx="64" cy="49" r="22" fill={c} />
        <circle cx="64" cy="49" r="10" fill="none" stroke="#fff" strokeWidth="4" />
        {[0, 60, 120, 180, 240, 300].map((a) => (
          <rect key={a} x="62" y="22" width="4" height="8" rx="2" fill={c} transform={`rotate(${a} 64 49)`} />
        ))}
        <path d="M88 49 H100" stroke={c} strokeWidth="4" strokeLinecap="round" strokeDasharray="3 6" />
        <rect x="102" y="36" width="20" height="26" rx="7" fill={mid} />
        <path d="M107 49 l4 4 l7 -9" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    // 3 ประโยชน์: โรงเรียน · ร้านค้า · องค์กร
    3: (
      <>
        <path d="M6 54 L24 40 L42 54 V86 H6Z" fill={soft} />
        <rect x="19" y="66" width="10" height="20" rx="2" fill={c} />
        <path d="M46 62 H82 V86 H46Z" fill={c} />
        <path d="M44 62 L50 50 H78 L84 62Z" fill={mid} />
        <rect x="56" y="70" width="16" height="16" rx="2" fill="#fff" />
        <rect x="88" y="34" width="30" height="52" rx="4" fill={soft} />
        {[42, 54, 66].map((y) => (
          <g key={y}>
            <rect x="94" y={y} width="7" height="7" rx="1.5" fill={c} />
            <rect x="105" y={y} width="7" height="7" rx="1.5" fill={c} />
          </g>
        ))}
        <circle cx="64" cy="22" r="10" fill={c} />
        <path d="M60 22 l3 3 l6 -6" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
      </>
    ),
    // 4 ขั้นตอนการสร้าง: เช็กลิสต์ + ไม้บรรทัด
    4: (
      <>
        <rect x="26" y="10" width="64" height="80" rx="10" fill={soft} />
        <rect x="44" y="5" width="28" height="12" rx="5" fill={c} />
        {[30, 48, 66].map((y, k) => (
          <g key={y}>
            <rect x="36" y={y} width="12" height="12" rx="3.5" fill={k < 2 ? c : '#fff'} stroke={c} strokeWidth="2" />
            {k < 2 && <path d={`M39 ${y + 6} l3 3 l5 -6`} stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" />}
            <rect x="54" y={y + 3} width={k === 2 ? 18 : 28} height="6" rx="3" fill={mid} />
          </g>
        ))}
        <rect x="88" y="48" width="12" height="44" rx="4" fill={c} transform="rotate(28 94 70)" />
      </>
    ),
    // 5 วิเคราะห์ผู้ใช้: ผู้ใช้ + แว่นขยาย
    5: (
      <>
        <circle cx="46" cy="34" r="15" fill={mid} />
        <path d="M18 88 C18 64, 74 64, 74 88Z" fill={soft} />
        <circle cx="46" cy="34" r="8" fill="#fff" opacity=".6" />
        <circle cx="88" cy="50" r="20" fill="#fff" stroke={c} strokeWidth="6" />
        <path d="M80 50 a8 8 0 0 1 8 -8" stroke={c} strokeWidth="3" fill="none" strokeLinecap="round" />
        <rect x="100" y="64" width="10" height="26" rx="4" fill={c} transform="rotate(-42 105 77)" />
      </>
    ),
    // 6 เตรียม FAQ: ตาราง Q/A
    6: (
      <>
        <rect x="10" y="14" width="100" height="74" rx="12" fill={soft} />
        <rect x="10" y="14" width="100" height="18" rx="12" fill={c} />
        <text x="26" y="27" fontSize="11" fontWeight="800" fill="#fff">Q</text>
        <text x="66" y="27" fontSize="11" fontWeight="800" fill="#fff">A</text>
        {[42, 58, 74].map((y) => (
          <g key={y}>
            <rect x="20" y={y} width="30" height="7" rx="3.5" fill={c} opacity=".75" />
            <rect x="60" y={y} width="40" height="7" rx="3.5" fill={mid} />
          </g>
        ))}
        <circle cx="106" cy="18" r="11" fill="#fde047" />
        <text x="102" y="23" fontSize="13" fontWeight="800" fill="#92400e">?</text>
      </>
    )
  };
  return (
    <svg className="o3-art" viewBox="0 0 124 96" aria-hidden="true">
      {arts[no]}
    </svg>
  );
}

/* =========================================================
   น้องบอทบาริสต้า — ตัวละครกลางเวที
   ========================================================= */
const BOT_LINES = [
  'Chat Bot คือเพื่อนคุยอัตโนมัติ!',
  'รับข้อความ → เข้าใจ → ตอบกลับ',
  'ช่วยได้ทั้งโรงเรียน ร้านค้า องค์กร',
  'สร้างบอทได้ใน 8 ขั้นตอน',
  'ผู้ใช้ต้องการอะไรนะ? 🔍',
  'เตรียม FAQ ให้พร้อมก่อนสร้าง'
];

function BaristaBot({ topic, color }) {
  const [typing, setTyping] = useState(true);
  useEffect(() => {
    setTyping(true);
    const t = setTimeout(() => setTyping(false), 700);
    return () => clearTimeout(t);
  }, [topic]);

  return (
    <div className="bb" style={{ '--c': color }}>
      {/* ฟองคำพูด */}
      <div className="bb-say" key={topic}>
        {typing ? (
          <span className="bb-say__dots">
            <i />
            <i />
            <i />
          </span>
        ) : (
          <span className="bb-say__text">{BOT_LINES[topic]}</span>
        )}
      </div>

      {/* วงแหวนดาวหมุนรอบตัว */}
      <div className="bb-ring" aria-hidden="true">
        {['✦', '★', '✦', '♥', '✦', '★'].map((g, k) => (
          <span key={k} style={{ '--k': k }}>
            {g}
          </span>
        ))}
      </div>

      {/* ของลอยขึ้น: หัวใจ โน้ต */}
      <div className="bb-pops" aria-hidden="true">
        {['♥', '♪', '♥', '♫', '♥'].map((g, k) => (
          <span key={k} style={{ '--k': k }}>
            {g}
          </span>
        ))}
      </div>

      <div className="bb-body">
        {/* หมวกบาริสต้า */}
        <svg className="bb-hat" viewBox="0 0 120 60" aria-hidden="true">
          <path d="M14 46 Q60 6 106 46 Z" fill="#8b5a2b" />
          <path d="M14 46 Q60 18 106 46" fill="none" stroke="#a9733f" strokeWidth="4" />
          <rect x="6" y="42" width="108" height="12" rx="6" fill="#6b4220" />
          <circle cx="60" cy="16" r="7" fill="#fde68a" />
          <rect x="46" y="30" width="28" height="10" rx="5" fill="#fde68a" />
          <text x="60" y="38.5" fontSize="8" fontWeight="800" textAnchor="middle" fill="#6b4220">CED</text>
        </svg>

        <Mascot size={130} followCursor={false} />

        {/* ผ้ากันเปื้อน */}
        <svg className="bb-apron" viewBox="0 0 60 50" aria-hidden="true">
          <path d="M10 4 H50 L54 46 Q30 52 6 46 Z" fill="#8b5a2b" />
          <path d="M10 4 Q4 -4 16 -2 M50 4 Q56 -4 44 -2" stroke="#6b4220" strokeWidth="2.5" fill="none" />
          <rect x="20" y="20" width="20" height="12" rx="4" fill="#a9733f" />
          <path d="M26 26 h8 M30 22 v8" stroke="#fde68a" strokeWidth="2.4" strokeLinecap="round" />
        </svg>

        {/* แก้วกาแฟลอยข้างตัว */}
        <div className="bb-cup" aria-hidden="true">
          <span className="bb-cup__steam">
            <i />
            <i />
            <i />
          </span>
          <svg viewBox="0 0 44 44">
            <path d="M6 14 H34 L31 38 Q20 43 9 38 Z" fill="#fff" stroke="#e7d7bd" strokeWidth="2" />
            <path d="M34 19 Q43 19 42 27 Q41 34 32 33" fill="none" stroke="#e7d7bd" strokeWidth="4" />
            <rect x="4" y="10" width="32" height="6" rx="3" fill="#8b5a2b" />
            <path d="M14 26 q3 -5 6 0 q3 -5 6 0 l-6 7 Z" fill="#f472b6" />
          </svg>
        </div>
      </div>

      <span className="bb-shadow" aria-hidden="true" />
    </div>
  );
}

/* =========================================================
   Hero: วงโคจร 3 มิติ — มุมหน้า หมุนอัตโนมัติ
   ========================================================= */
const STEP = 360 / units.length;
const FLOATERS = [
  { t: 'สวัสดี! 👋', x: 6, y: 10 },
  { t: 'FAQ', x: 86, y: 14 },
  { t: 'Intent', x: 14, y: 46 },
  { t: '24/7', x: 90, y: 44 },
  { t: 'Rich Menu', x: 4, y: 76 },
  { t: '☕ CED Coffee', x: 80, y: 74 },
  { t: 'Entity', x: 26, y: 24 },
  { t: '💬', x: 72, y: 26 }
];

function Orbit3D() {
  const mobile = useMedia('(max-width: 760px)');
  const R = mobile ? 175 : 330;
  const worldRef = useRef(null);
  const angle = useRef(0);
  const [front, setFront] = useState(0);
  const [ref, inView] = useInView({ threshold: 0.15 });

  useEffect(() => {
    let frame = 0;
    const loop = () => {
      if (inView) angle.current -= 0.14;
      const w = worldRef.current;
      if (w) w.style.setProperty('--ry', `${angle.current}deg`);
      const idx = ((Math.round(-angle.current / STEP) % units.length) + units.length) % units.length;
      setFront((f) => (f === idx ? f : idx));
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [inView]);

  const u = units[front];
  const Icon = TOPIC_ICONS[front];

  return (
    <div ref={ref} className={`o3 ${inView ? 'is-in' : ''}`}>
      <div className="o3-stage" role="img" aria-label="ฉาก 3 มิติ การ์ด 6 หัวข้อหมุนรอบน้องบอท">
        {/* ฟองแชทลอยรอบฉาก */}
        <div className="o3-floaters" aria-hidden="true">
          {FLOATERS.map((f, k) => (
            <span key={f.t} style={{ '--k': k, top: `${f.y}%`, left: `${f.x}%` }}>
              {f.t}
            </span>
          ))}
        </div>

        <div ref={worldRef} className="o3-world" style={{ '--r': `${R}px` }}>
          <div className="o3-floor">
            <span className="o3-floor__ring o3-floor__ring--1" />
            <span className="o3-floor__ring o3-floor__ring--2" />
            <span className="o3-floor__ring o3-floor__ring--3" />
          </div>

          <div className="o3-pedestal">
            <span />
            <span />
            <span />
          </div>
          <div className="o3-bot">
            <BaristaBot topic={front} color={units[front].color} />
          </div>

          {Array.from({ length: 14 }, (_, k) => (
            <i
              key={k}
              className="o3-spark"
              style={{
                '--a': `${k * 51}deg`,
                '--d': `${R * (0.35 + ((k * 37) % 60) / 100)}px`,
                '--h': `${-40 - ((k * 53) % 220)}px`,
                '--t': `${(k % 5) * 0.6}s`
              }}
            />
          ))}

          {units.map((t, i) => (
            <div key={t.no} className={`o3-card ${front === i ? 'is-front' : ''}`} style={{ '--c': t.color, '--ang': `${i * STEP}deg`, '--i': i }}>
              <div className="o3-card__face">
                <span className="o3-card__num">{String(t.no).padStart(2, '0')}</span>
                <span className="o3-card__pic">
                  <TopicArt no={t.no} />
                </span>
                <b>{t.short}</b>
                <small>{Math.round((t.examItems / TOTAL_ITEMS) * 100)}% ของเนื้อหา</small>
              </div>
              <span className="o3-card__back" aria-hidden="true">
                {t.no}
              </span>
              <span className="o3-card__beam" aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>

      {/* หัวข้อที่อยู่ด้านหน้า */}
      <div className="o3-detail" key={front} style={{ '--c': u.color }}>
        <span className="o3-detail__icon">
          <Icon size={22} aria-hidden="true" />
        </span>
        <div>
          <small>
            สถานีที่ {u.no} · จุดประสงค์ข้อ {u.objective} · {Math.round((u.examItems / TOTAL_ITEMS) * 100)}% ของเนื้อหา
          </small>
          <b>{u.title}</b>
          <p>{u.topics.join(' · ')}</p>
        </div>
        <button type="button" onClick={() => document.getElementById(`sy-stop-${u.no}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
          ไปที่หัวข้อนี้ <ArrowRight size={16} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   ขั้นตอนการสอน MIAP
   ========================================================= */
function Miap({ isLoggedIn }) {
  const [ref, inView] = useInView({ threshold: 0.35 });
  return (
    <ol ref={ref} className={`sy-miap ${inView ? 'is-in' : ''}`} style={{ '--n': learningPath.length }}>
      <span className="sy-miap__line" aria-hidden="true">
        <i />
      </span>
      {learningPath.map((p, i) => (
        <li key={p.label} style={{ '--i': i }}>
          <Link to={isLoggedIn ? p.to : '/login'} state={isLoggedIn ? undefined : { from: p.to }} className="sy-miap__step">
            <span className="sy-miap__node">{p.step === 'ก่อนเรียน' ? '★' : p.step}</span>
            <small>{p.step === 'ก่อนเรียน' ? 'ก่อนเรียน' : `ขั้น ${p.step}`}</small>
            <b>{p.label}</b>
            <span className="sy-miap__note">{p.note}</span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

/* =========================================================
   เส้นทาง 6 หัวข้อ — ถนนวาดตามการเลื่อนจอ น้องบอทเดินตาม
   ========================================================= */
function Road() {
  const wrapRef = useRef(null);
  const pathRef = useRef(null);
  const mobile = useMedia('(max-width: 760px)');
  const stopRefs = useRef([]);
  const [size, setSize] = useState({ w: 0, h: 0, ys: [] });
  const [progress, setProgress] = useState(0);
  const [bot, setBot] = useState({ x: 0, y: 0 });
  const [len, setLen] = useState(0);

  // วัดขนาดพื้นที่จริง เพื่อให้เส้นทางไม่บิดเบี้ยว
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    // ตำแหน่งจุดแวะ = กึ่งกลางของการ์ดแต่ละหัวข้อจริง
    const measure = () =>
      setSize({
        w: el.clientWidth,
        h: el.clientHeight,
        ys: stopRefs.current.map((s) => (s ? s.offsetTop + s.offsetHeight / 2 : 0))
      });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pts = units.map((_, i) => ({
    x: size.w * (mobile ? (i % 2 ? 0.13 : 0.06) : i % 2 ? 0.7 : 0.3),
    y: size.ys[i] || 0
  }));
  let d = '';
  if (size.w) {
    d = `M ${pts[0].x} 0 L ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i += 1) {
      const a = pts[i - 1];
      const b = pts[i];
      const half = (b.y - a.y) * 0.55;
      d += ` C ${a.x} ${a.y + half}, ${b.x} ${b.y - half}, ${b.x} ${b.y}`;
    }
    d += ` L ${pts[pts.length - 1].x} ${size.h}`;
  }

  useEffect(() => {
    if (pathRef.current) setLen(pathRef.current.getTotalLength());
  }, [d]);

  const update = useCallback(() => {
    const el = wrapRef.current;
    const path = pathRef.current;
    if (!el || !path || !len) return;
    const rect = el.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (window.innerHeight * 0.55 - rect.top) / rect.height));
    setProgress(p);
    // หาจุดบนเส้นที่ตรงกับความสูงที่เลื่อนมาถึง
    const targetY = p * size.h;
    let lo = 0;
    let hi = len;
    for (let k = 0; k < 18; k += 1) {
      const mid = (lo + hi) / 2;
      if (path.getPointAtLength(mid).y < targetY) lo = mid;
      else hi = mid;
    }
    const pt = path.getPointAtLength(lo);
    setBot({ x: pt.x, y: pt.y, l: lo });
  }, [len, size.h]);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [update]);

  const reachedY = progress * size.h;
  const current = Math.max(0, pts.findLastIndex ? pts.findLastIndex((p) => p.y <= reachedY + 40) : 0);

  return (
    <div ref={wrapRef} className={`sy-road ${mobile ? 'is-mobile' : ''}`} style={{ '--rows': units.length }}>
      {size.w > 0 && (
        <svg className="sy-road__svg" viewBox={`0 0 ${size.w} ${size.h}`} aria-hidden="true">
          <defs>
            <linearGradient id="sy-road-grad" x1="0" y1="0" x2="0" y2="1">
              {units.map((u, i) => (
                <stop key={u.no} offset={`${(i / (units.length - 1)) * 100}%`} stopColor={u.color} />
              ))}
            </linearGradient>
          </defs>
          <path className="sy-road__base" d={d} />
          <path className="sy-road__dash" d={d} />
          <path
            ref={pathRef}
            className="sy-road__done"
            d={d}
            stroke="url(#sy-road-grad)"
            strokeDasharray={len || 1}
            strokeDashoffset={len ? len - (bot.l || 0) : 1}
          />
          {pts.map((p, i) => (
            <g key={units[i].no} className={`sy-road__node ${p.y <= reachedY + 40 ? 'is-on' : ''}`} transform={`translate(${p.x} ${p.y})`}>
              <circle r="26" fill="#fff" />
              <circle r="20" fill={units[i].color} />
              <text y="7">{units[i].no}</text>
            </g>
          ))}
        </svg>
      )}

      {/* น้องบอทเดินตามเส้นทาง */}
      {size.w > 0 && (
        <div className="sy-road__bot" style={{ transform: `translate(${bot.x}px, ${bot.y}px)` }} aria-hidden="true">
          <span className="sy-road__tag" style={{ '--c': units[current].color }}>
            หัวข้อ {units[current].no} · {units[current].short}
          </span>
          <Mascot size={64} followCursor={false} />
        </div>
      )}

      {units.map((u, i) => {
        const Icon = TOPIC_ICONS[i];
        const side = mobile ? 'right' : i % 2 ? 'left' : 'right';
        const goal = objectives.find((o) => o.no === u.objective)?.text;
        const on = size.w > 0 && pts[i].y <= reachedY + 120;
        return (
          <section
            key={u.no}
            ref={(el) => {
              stopRefs.current[i] = el;
            }}
            id={`sy-stop-${u.no}`}
            className={`sy-stop sy-stop--${side} ${on ? 'is-on' : ''}`} style={{ '--c': u.color }}>
            <article className="sy-card">
              <header>
                <span className="sy-card__icon">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <div>
                  <small>
                    หัวข้อที่ {u.no} · จุดประสงค์ข้อ {u.objective}
                  </small>
                  <h3>{u.title}</h3>
                </div>
                <span className="sy-card__pct" title="สัดส่วนจากจำนวนข้อสอบ">
                  {Math.round((u.examItems / TOTAL_ITEMS) * 100)}%
                </span>
              </header>
              <p className="sy-card__goal">
                <Target size={15} aria-hidden="true" /> {goal}
              </p>
              <ul className="sy-card__chips">
                {u.topics.map((t, k) => (
                  <li key={t} style={{ '--k': k }}>
                    {t}
                  </li>
                ))}
              </ul>
            </article>
          </section>
        );
      })}
    </div>
  );
}

/* =========================================================
   ภารกิจสร้างบอท CED Coffee — กดขั้นตอนแล้วมือถือสาธิตส่วนนั้น
   ========================================================= */
const MENU_ICONS = { 'เวลาเปิด–ปิด': Clock, 'เมนูแนะนำ': Coffee, โปรโมชัน: Gift, ช่องทางติดต่อ: Phone };
const MENU = practice.faq.filter((f) => MENU_ICONS[f.topic]);
const faqOf = (topic) => practice.faq.findIndex((f) => f.topic === topic);

// แต่ละขั้นของใบสั่งงาน → ส่วนที่ไฮไลต์ในมือถือ
const MISSION = [
  { icon: Store, focus: 'profile', label: 'ชื่อบัญชี + รูปโปรไฟล์' },
  { icon: MessageCircle, focus: 'greeting', label: 'ข้อความทักทาย' },
  { icon: Table2, focus: 'faq', label: 'ตารางข้อมูล FAQ' },
  { icon: Reply, focus: 'reply', label: 'ตอบกลับอัตโนมัติ' },
  { icon: LayoutGrid, focus: 'menu', label: 'Rich Menu' },
  { icon: LifeBuoy, focus: 'fallback', label: 'ข้อความ Fallback' },
  { icon: FlaskConical, focus: 'test', label: 'ทดสอบ 4 ประเภท' }
];

const TEST_CASES = [
  { type: 'พิมพ์คำถามปกติ', q: 'ร้านเปิดกี่โมงคะ', faq: faqOf('เวลาเปิด–ปิด') },
  { type: 'กดปุ่ม Rich Menu', q: 'โปรโมชัน', faq: faqOf('โปรโมชัน'), menu: true },
  { type: 'สะกดผิด / คำอื่น', q: 'ร้านเปิกกี่โมง', faq: faqOf('เวลาเปิด–ปิด') },
  { type: 'นอกขอบเขต', q: 'ขายรองเท้าไหมคะ', faq: -1 }
];

const clockNow = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

function Mission() {
  const [ref, inView] = useInView({ threshold: 0.3 });
  const [step, setStep] = useState(-1);
  const [touring, setTouring] = useState(true);
  const [msgs, setMsgs] = useState([{ from: 'bot', text: practice.greeting, id: 0, time: '07:00' }]);
  const [typing, setTyping] = useState(false);
  const [row, setRow] = useState(-1);
  const [results, setResults] = useState([]);
  const [pressed, setPressed] = useState('');
  const listRef = useRef(null);
  const timers = useRef([]);

  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));
  const clearAll = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  /** ส่งคำถามแล้วให้บอทตอบ (faq = ลำดับข้อมูลร้าน, -1 = fallback) */
  const ask = useCallback((q, faq, delay = 0, onDone) => {
    later(() => {
      setMsgs((m) => [...m, { from: 'user', text: q, id: Math.random(), time: clockNow() }]);
      setTyping(true);
      setRow(-1);
    }, delay);
    later(() => {
      setTyping(false);
      const text = faq >= 0 ? practice.faq[faq].answer : practice.fallback;
      setMsgs((m) => [...m, { from: 'bot', text, id: Math.random(), time: clockNow(), fallback: faq < 0 }]);
      setRow(faq);
      onDone?.();
    }, delay + 1000);
  }, []);

  const press = (f) => {
    setPressed(f.topic);
    later(() => setPressed(''), 400);
    ask(f.topic, faqOf(f.topic));
  };

  const run = useCallback(
    (n) => {
      clearAll();
      setStep(n);
      setResults([]);
      const focus = MISSION[n].focus;
      if (focus === 'greeting') {
        setRow(-1);
        setMsgs([{ from: 'bot', text: practice.greeting, id: Math.random(), time: clockNow() }]);
      }
      if (focus === 'reply') ask('มีเมนูอะไรแนะนำบ้าง', faqOf('เมนูแนะนำ'), 300);
      if (focus === 'menu') {
        later(() => setPressed('โปรโมชัน'), 500);
        later(() => setPressed(''), 900);
        ask('โปรโมชัน', faqOf('โปรโมชัน'), 900);
      }
      if (focus === 'fallback') ask('วันนี้ฝนตกไหม 🌧️', -1, 300);
      if (focus === 'test') {
        setMsgs([{ from: 'bot', text: practice.greeting, id: Math.random(), time: clockNow() }]);
        TEST_CASES.forEach((c, k) => {
          ask(c.q, c.faq, 400 + k * 1700, () => setResults((r) => [...r, k]));
        });
      }
    },
    [ask]
  );

  // ทัวร์อัตโนมัติ 1 รอบเมื่อเลื่อนมาถึง (หยุดเมื่อผู้ใช้กดเอง)
  useEffect(() => {
    if (!inView || !touring) return undefined;
    const next = step + 1;
    if (next >= MISSION.length) {
      setTouring(false);
      return undefined;
    }
    const wait = step < 0 ? 600 : MISSION[step].focus === 'test' ? 7600 : 2800;
    const t = setTimeout(() => run(next), wait);
    return () => clearTimeout(t);
  }, [inView, touring, step, run]);

  useEffect(() => () => clearAll(), []);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [msgs, typing]);

  const choose = (n) => {
    setTouring(false);
    run(n);
  };
  const focus = step >= 0 ? MISSION[step].focus : '';
  const passed = results.length;

  return (
    <div ref={ref} className={`sy-mission ${inView ? 'is-in' : ''}`} data-focus={focus}>
      {/* ---------- ภารกิจ ---------- */}
      <div className="sy-quest">
        <header className="sy-quest__head">
          <span>
            <Trophy size={16} aria-hidden="true" /> ภารกิจ
          </span>
          <b>
            {Math.max(0, step + 1)}/{MISSION.length}
          </b>
        </header>
        <span className="sy-quest__bar" aria-hidden="true">
          <i style={{ width: `${((step + 1) / MISSION.length) * 100}%` }} />
        </span>
        <ol className="sy-quest__list">
          {practice.steps.map((t, n) => {
            const Icon = MISSION[n].icon;
            return (
              <li key={t} style={{ '--i': n }}>
                <button
                  type="button"
                  className={`${n === step ? 'is-active' : ''} ${n < step ? 'is-done' : ''}`}
                  onClick={() => choose(n)}
                  aria-pressed={n === step}
                >
                  <span className="sy-quest__icon">{n < step ? <Check size={16} strokeWidth={3} /> : <Icon size={17} />}</span>
                  <span className="sy-quest__text">
                    <small>ขั้นที่ {n + 1}</small>
                    {t}
                  </span>
                  <ArrowRight className="sy-quest__go" size={16} aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ol>
        <p className="sy-quest__hint">
          <Sparkles size={14} aria-hidden="true" /> กดที่ขั้นตอน แล้วดูมือถือสาธิตส่วนนั้นให้
        </p>
      </div>

      {/* ---------- มือถือ ---------- */}
      <div className="sy-stage">
        <span className="sy-sticker sy-sticker--a" aria-hidden="true">24/7</span>
        <span className="sy-sticker sy-sticker--b" aria-hidden="true">
          <Zap size={13} /> Auto-reply
        </span>
        <span className="sy-sticker sy-sticker--c" aria-hidden="true">
          <LayoutGrid size={13} /> Rich Menu
        </span>
        {focus && (
          <span className="sy-stage__label" key={focus}>
            {MISSION[step].label}
          </span>
        )}

        <div className="sy-phone">
          <div className="sy-phone__status" aria-hidden="true">
            <b>9:41</b>
            <span className="sy-phone__island" />
            <span className="sy-phone__sig">
              <i />
              <i />
              <i />
            </span>
          </div>
          <header className={`sy-phone__head ${focus === 'profile' ? 'is-focus' : ''}`}>
            <span className="sy-phone__logo">
              <Coffee size={18} />
            </span>
            <div>
              <b>{practice.shop} by น้องบอท</b>
              <small>
                <BadgeCheck size={12} /> LINE Official Account
              </small>
            </div>
          </header>

          <div ref={listRef} className="sy-phone__chat" aria-live="polite">
            <span className="sy-phone__day">วันนี้</span>
            {msgs.map((m, k) => (
              <div
                key={m.id}
                className={`sy-row sy-row--${m.from} ${k === 0 && focus === 'greeting' ? 'is-focus' : ''} ${
                  m.fallback && focus === 'fallback' ? 'is-focus' : ''
                }`}
              >
                {m.from === 'bot' && (
                  <span className="sy-row__av" aria-hidden="true">
                    <Coffee size={12} />
                  </span>
                )}
                <p className={`sy-msg sy-msg--${m.from}`}>{m.text}</p>
                <time>{m.time}</time>
              </div>
            ))}
            {typing && (
              <div className="sy-row sy-row--bot">
                <span className="sy-row__av" aria-hidden="true">
                  <Coffee size={12} />
                </span>
                <p className="sy-msg sy-msg--bot sy-msg--typing" aria-label="กำลังพิมพ์">
                  <i />
                  <i />
                  <i />
                </p>
              </div>
            )}
          </div>

          {focus === 'test' && (
            <div className="sy-phone__tests">
              {TEST_CASES.map((c, k) => (
                <span key={c.type} className={results.includes(k) ? 'is-pass' : ''}>
                  {results.includes(k) ? <Check size={12} strokeWidth={3} /> : k + 1} {c.type}
                </span>
              ))}
              <b>
                ผ่าน {passed}/{TEST_CASES.length}
              </b>
            </div>
          )}

          <div className="sy-phone__quick">
            <button type="button" onClick={() => (setTouring(false), ask('มีที่จอดรถไหม 🛵', faqOf('ที่ตั้งร้าน')))}>
              มีที่จอดรถไหม
            </button>
            <button type="button" onClick={() => (setTouring(false), ask('วันนี้ฝนตกไหม 🌧️', -1))}>
              ถามนอกเรื่อง
            </button>
          </div>

          <nav className={`sy-phone__menu ${focus === 'menu' ? 'is-focus' : ''}`} aria-label="Rich Menu">
            {MENU.map((f) => {
              const Icon = MENU_ICONS[f.topic];
              return (
                <button
                  key={f.topic}
                  type="button"
                  className={pressed === f.topic ? 'is-pressed' : ''}
                  onClick={() => {
                    setTouring(false);
                    press(f);
                  }}
                >
                  <Icon size={20} aria-hidden="true" />
                  {f.topic}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* ---------- ใบเสร็จข้อมูลร้าน ---------- */}
      <div className={`sy-receipt ${focus === 'faq' ? 'is-focus' : ''}`}>
        <span className="sy-receipt__cup" aria-hidden="true">
          <i />
          <i />
          <i />
          <Coffee size={30} />
        </span>
        <header>
          <b>{practice.shop}</b>
          <small>ข้อมูลร้าน · ใช้สร้างคำตอบของบอท</small>
        </header>
        <ol>
          {practice.faq.map((f, k) => (
            <li key={f.topic} className={row === k ? 'is-hit' : ''}>
              <span>
                {String(k + 1).padStart(2, '0')} {f.topic}
              </span>
              <p>{f.answer}</p>
            </li>
          ))}
        </ol>
        <footer>
          <span className="sy-receipt__total">
            <b>FAQ</b>
            <b>5 หัวข้อ × 3 คำสำคัญ</b>
          </span>
          <span className="sy-receipt__barcode" aria-hidden="true" />
          <small>ขอบคุณที่ใช้บริการ ☕</small>
        </footer>
      </div>
    </div>
  );
}

/* =========================================================
   หน้าโครงสร้างรายวิชา
   ========================================================= */
export default function Syllabus() {
  const { isLoggedIn } = useAuth();

  return (
    <div className="cr sy">
      <div className="cr__light" aria-hidden="true">
        <span className="cr__glow cr__glow--1" />
        <span className="cr__glow cr__glow--2" />
        <span className="cr__glow cr__glow--3" />
      </div>

      {/* ---------- Hero ---------- */}
      <section className="sy-hero2">
        <span className="sy-hero2__ring sy-hero2__ring--1" aria-hidden="true" />
        <span className="sy-hero2__ring sy-hero2__ring--2" aria-hidden="true" />
        <div className="container">
          <div className="sy-hero2__head">
            <nav className="cr-crumb" aria-label="ตำแหน่งของหน้า">
              <Link to="/">Home</Link> <span aria-hidden="true">/</span> <span aria-current="page">โครงสร้างรายวิชา</span>
            </nav>
            <h1 className="sy-hero2__title">
              ออกเดินทาง
              <TypeMark>ไปกับน้องบอท</TypeMark>
            </h1>
            <p className="sy-hero2__lead">
              เรียนรู้ {course.title} ผ่าน {units.length} สถานีความรู้ ก่อนไปถึงปลายทาง สร้างบอทจริงบน LINE Official Account
            </p>

            <ul className="sy-facts" aria-label="ข้อมูลรายวิชา">
              <li>
                <BookOpen size={16} aria-hidden="true" /> {course.subject}
              </li>
              <li>
                <GraduationCap size={16} aria-hidden="true" /> {course.level}
              </li>
              <li>
                <Clock size={16} aria-hidden="true" /> {course.duration}
              </li>
              <li>
                <Coffee size={16} aria-hidden="true" /> ปลายทาง {practice.shop}
              </li>
            </ul>

            <div className="sy-hero2__actions">
              <a href="#sy-road" className="cr-btn">
                เริ่มเดินทาง <ArrowRight size={18} aria-hidden="true" />
              </a>
              <a href="#sy-practice" className="cr-btn cr-btn--ghost">
                <Smartphone size={18} aria-hidden="true" /> ลองบอท CED Coffee
              </a>
            </div>
          </div>

          <Orbit3D />
        </div>
      </section>

      {/* ---------- MIAP ---------- */}
      <section className="cr-section">
        <div className="container">
          <div className="cr-center-head">
            <h2 className="cr-title">
              เรียน 1 คาบ
              <TypeMark tone="sky">มี 5 ขั้น</TypeMark>
            </h2>
          </div>
          <Miap isLoggedIn={isLoggedIn} />
        </div>
      </section>

      {/* ---------- เส้นทาง 6 หัวข้อ ---------- */}
      <section className="cr-section cr-section--soft" id="sy-road">
        <div className="container">
          <div className="cr-center-head">
            <h2 className="cr-title">
              เส้นทาง
              <TypeMark tone="violet">{units.length} หัวข้อ</TypeMark>
            </h2>
            <p className="cr-lead sy-center-lead">เลื่อนลงช้า ๆ แล้วน้องบอทจะเดินพาไปทีละหัวข้อ</p>
          </div>
          <Road />
        </div>
      </section>

      {/* ---------- ใบสั่งงาน ---------- */}
      <section className="cr-section sy-mission-sec" id="sy-practice">
        <span className="sy-mission-sec__beans" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
          <i />
        </span>
        <div className="container">
          <div className="cr-center-head">
            <h2 className="cr-title">
              ปลายทาง:
              <TypeMark tone="green">{`บอทร้าน ${practice.shop}`}</TypeMark>
            </h2>
            <p className="cr-lead sy-center-lead">{practice.scenario}</p>
          </div>
          <Mission />
        </div>
      </section>

      <section className="sy-end">
        <div className="cr-cta container">
          <Link to="/criteria" className="cr-btn cr-btn--ghost">
            ดูสัดส่วนเนื้อหา
          </Link>
          <Link to={isLoggedIn ? '/learn' : '/login'} className="cr-btn">
            {isLoggedIn ? 'ไปที่หน้าเรียน' : 'เข้าสู่ระบบเพื่อเริ่มเรียน'} <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
