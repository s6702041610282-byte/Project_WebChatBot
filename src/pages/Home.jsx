import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  ClipboardCheck,
  Cpu,
  FileQuestion,
  Flag,
  GraduationCap,
  HeartHandshake,
  Lightbulb,
  ListChecks,
  ListTree,
  Lock,
  LogIn,
  MessageSquare,
  Rocket,
  Sparkles,
  Target,
  Users,
  Wrench
} from 'lucide-react';
import HomeScene3D from '../components/HomeScene3D';
import Robot from '../components/quest/art/Robot';
import { learningCategories } from '../data/navigation';
import { course, domains, objectives, units } from '../data/course';
import { useAuth } from '../contexts/AuthContext';

const UNIT_ICONS = [MessageSquare, Cpu, Sparkles, ListChecks, Users, FileQuestion];
const DOMAIN_ICONS = { K: Lightbulb, P: Wrench, A: HeartHandshake };
const TYPED = ['ตอบลูกค้าร้านกาแฟ', 'ช่วยงานฝ่ายทะเบียน', 'นัดหมายคลินิกให้คนไข้', 'ตอบคำถามได้ 24 ชั่วโมง'];
const KEYWORDS = ['Chat + Bot', 'Intent', 'Keyword', 'FAQ', 'Rich Menu', 'Fallback', 'Persona', 'User Analysis', 'Test & Improve', 'LINE OA'];
const STATS = [
  { value: 6, label: 'หัวข้อเนื้อหา' },
  { value: 10, label: 'จุดประสงค์การเรียนรู้' },
  { value: 3, label: 'ภารกิจลงมือสร้าง' },
  { value: 60, label: 'นาทีเรียน' }
];
const DEMO = [
  { from: 'user', text: 'มีเมนูอะไรแนะนำบ้างคะ' },
  { from: 'bot', text: 'วันนี้แนะนำลาเต้เย็น กับชาไทยปั่นเลยค่ะ' },
  { from: 'user', text: 'ร้านเปิดกี่โมง' },
  { from: 'bot', text: 'เปิดทุกวัน 07:00–18:00 น. ค่ะ' },
  { from: 'user', text: 'สั่งกลับบ้านได้ไหม' },
  { from: 'bot', text: 'ได้เลยค่ะ กดปุ่ม "สั่งกลับบ้าน" ที่เมนูด้านล่างได้เลย' }
];
const JOURNEY = [
  { icon: ClipboardCheck, title: 'แบบทดสอบก่อนเรียน', desc: 'วัดพื้นฐาน 10 ข้อ ไม่มีถูกผิด แค่รู้ว่าเริ่มจากตรงไหน' },
  { icon: BookOpen, title: 'บทเรียน 6 พาร์ท', desc: 'อ่านสั้น ดูภาพเคลื่อนไหว แล้วเช็กความเข้าใจท้ายพาร์ท' },
  { icon: Flag, title: 'กิจกรรมภารกิจ', desc: 'ออกแบบบอทให้ร้านกาแฟ ฝ่ายทะเบียน และคลินิก แล้วเปิดให้ลูกค้าทดลองคุย' },
  { icon: GraduationCap, title: 'แบบทดสอบหลังเรียน', desc: 'เทียบคะแนนก่อน–หลัง เห็นพัฒนาการของตัวเองชัด ๆ' }
];

/* ---------- เครื่องมือเล็ก ๆ ---------- */
function useInView(threshold = 0.2) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (!('IntersectionObserver' in window)) {
      setOn(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, on];
}

/** ค่อย ๆ ปรากฏเมื่อเลื่อนมาถึง */
function Reveal({ as: Tag = 'div', className = '', delay = 0, children, ...rest }) {
  const [ref, on] = useInView(0.15);
  return (
    <Tag ref={ref} className={`hx-rv ${on ? 'is-in' : ''} ${className}`} style={{ '--d': `${delay}ms` }} {...rest}>
      {children}
    </Tag>
  );
}

/** ตัวเลขนับขึ้น */
function CountUp({ to }) {
  const [ref, on] = useInView(0.5);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!on) return undefined;
    let raf;
    const start = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - start) / 1400);
      setN(Math.round(to * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [on, to]);
  return <b ref={ref}>{n}</b>;
}

/** พิมพ์ทีละตัวแล้วลบ วนไปเรื่อย ๆ */
function useTypewriter(words) {
  const [text, setText] = useState('');
  useEffect(() => {
    let i = 0;
    let len = 0;
    let del = false;
    let timer;
    const tick = () => {
      const w = words[i];
      len += del ? -1 : 1;
      setText(w.slice(0, len));
      let wait = del ? 35 : 85;
      if (!del && len === w.length) {
        del = true;
        wait = 1800;
      } else if (del && len === 0) {
        del = false;
        i = (i + 1) % words.length;
        wait = 300;
      }
      timer = setTimeout(tick, wait);
    };
    timer = setTimeout(tick, 600);
    return () => clearTimeout(timer);
  }, [words]);
  return text;
}

/** การ์ดเอียงตามเมาส์ + แสงสปอตไลต์ */
function tilt(e) {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width;
  const y = (e.clientY - r.top) / r.height;
  el.style.setProperty('--mx', `${x * 100}%`);
  el.style.setProperty('--my', `${y * 100}%`);
  el.style.setProperty('--ry', `${(x - 0.5) * 10}deg`);
  el.style.setProperty('--rx', `${(0.5 - y) * 10}deg`);
}
function untilt(e) {
  e.currentTarget.style.setProperty('--ry', '0deg');
  e.currentTarget.style.setProperty('--rx', '0deg');
}

/** หน้าต่างแชตตัวอย่าง เล่นวนไปเรื่อย ๆ */
function LiveChat() {
  const [ref, on] = useInView(0.3);
  const [count, setCount] = useState(0);
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    if (!on) return undefined;
    let timer;
    const next = (n) => {
      if (n >= DEMO.length) {
        timer = setTimeout(() => {
          setCount(0);
          next(0);
        }, 3200);
        return;
      }
      const isBot = DEMO[n].from === 'bot';
      setTyping(isBot);
      timer = setTimeout(
        () => {
          setTyping(false);
          setCount(n + 1);
          timer = setTimeout(() => next(n + 1), 700);
        },
        isBot ? 1300 : 650
      );
    };
    next(0);
    return () => clearTimeout(timer);
  }, [on]);

  return (
    <div ref={ref} className="hx-chat">
      <div className="hx-chat__head">
        <span className="hx-chat__avatar">
          <Robot head size={34} mood="happy" />
        </span>
        <div>
          <b>CED Coffee Bot</b>
          <small>
            <i /> ออนไลน์ · ตอบทันที
          </small>
        </div>
      </div>
      <div className="hx-chat__body">
        {DEMO.slice(0, count).map((m, i) => (
          <p key={i} className={`hx-msg hx-msg--${m.from}`}>
            {m.text}
          </p>
        ))}
        {typing && (
          <p className="hx-msg hx-msg--bot hx-msg--typing" aria-label="บอทกำลังพิมพ์">
            <span />
            <span />
            <span />
          </p>
        )}
      </div>
      <div className="hx-chat__menu" aria-hidden="true">
        <span>เมนูแนะนำ</span>
        <span>เวลาเปิด–ปิด</span>
        <span>สั่งกลับบ้าน</span>
      </div>
    </div>
  );
}

/* ================================================================== */
/** หน้าแรก — แนะนำรายวิชาแบบ 3 มิติ */
export default function Home() {
  const { isLoggedIn, user } = useAuth();
  const typed = useTypewriter(TYPED);
  const [tab, setTab] = useState('K');
  const [journeyRef, journeyOn] = useInView(0.3);
  const goIntro = () => document.getElementById('hx-about')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const tabItems = objectives.filter((o) => o.domain === tab);
  const TabIcon = DOMAIN_ICONS[tab];

  return (
    <div className="hx">
      {/* ====== HERO 3D ====== */}
      <section className="hx-hero" aria-labelledby="hx-title">
        <HomeScene3D />
        <div className="hx-hero__veil" aria-hidden="true" />

        <div className="container hx-hero__inner">
          <div className="hx-hero__text">
            <span className="hx-chip">
              <span className="hx-chip__dot" aria-hidden="true" />
              {course.titleEn} · {course.level}
            </span>
            <h1 id="hx-title" className="hx-hero__title">
              <span className="hx-hero__l1">การออกแบบและสร้าง</span>
              <span className="hx-hero__big" data-text="ChatBot">
                ChatBot
              </span>
            </h1>
            <p className="hx-hero__type" aria-live="off">
              บอทของเรา <b>{typed}</b>
              <i className="hx-caret" aria-hidden="true" />
            </p>
            <p className="hx-hero__lead">{course.tagline}</p>

            <div className="hx-hero__actions">
              {isLoggedIn ? (
                <Link to="/learn" className="hx-btn hx-btn--cta">
                  <Rocket size={18} aria-hidden="true" /> ไปที่หน้าเรียน
                </Link>
              ) : (
                <Link to="/login" className="hx-btn hx-btn--cta">
                  <LogIn size={18} aria-hidden="true" /> เข้าสู่ระบบเพื่อเริ่มเรียน
                </Link>
              )}
              <Link to="/syllabus" className="hx-btn hx-btn--glass">
                <ListTree size={18} aria-hidden="true" /> ดูโครงสร้างรายวิชา
              </Link>
            </div>
            {isLoggedIn && <p className="hx-hero__hi">ยินดีต้อนรับกลับมา {user.displayName}</p>}
          </div>
        </div>

        {/* แผงข้อมูลลอย (HUD) */}
        <div className="hx-hud" aria-hidden="true">
          <div className="hx-hud__card hx-hud__card--a">
            <small>Intent detected</small>
            <b>ถามเมนูแนะนำ</b>
            <span className="hx-hud__bar">
              <i />
            </span>
            <em>ความมั่นใจ 98%</em>
          </div>
          <div className="hx-hud__card hx-hud__card--b">
            <span className="hx-hud__live" />
            <b>ลูกค้ากำลังพิมพ์</b>
            <span className="hx-hud__dots">
              <i />
              <i />
              <i />
            </span>
          </div>
          <div className="hx-hud__card hx-hud__card--c">
            <small>ภารกิจรอคุณอยู่</small>
            <b>3 สถานที่</b>
            <em>ร้านกาแฟ · ฝ่ายทะเบียน · คลินิก</em>
          </div>
        </div>

        <button type="button" className="hx-scroll" onClick={goIntro} aria-label="เลื่อนลงไปดูรายละเอียดรายวิชา">
          <span>เลื่อนลง</span>
          <ChevronDown size={18} aria-hidden="true" />
        </button>
      </section>

      {/* ====== แถบคำสำคัญวิ่ง ====== */}
      <div className="hx-marquee" aria-hidden="true">
        {[0, 1].map((row) => (
          <div key={row} className={`hx-marquee__row ${row ? 'is-rev' : ''}`}>
            {[...KEYWORDS, ...KEYWORDS].map((k, i) => (
              <span key={i}>
                {k}
                <Sparkles size={14} />
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* ====== เกี่ยวกับรายวิชา ====== */}
      <section className="hx-sec" id="hx-about" aria-labelledby="hx-about-title">
        <div className="container hx-about">
          <Reveal className="hx-card hx-about__main">
            <span className="hx-kicker">About the course</span>
            <h2 id="hx-about-title" className="hx-h2">
              แชตบอต คือผู้ช่วย<span className="hx-grad">ที่ไม่เคยหลับ</span>
            </h2>
            <p>{course.description}</p>
            <ul className="hx-about__meta">
              <li>
                <small>วิชา</small>
                <b>{course.subject}</b>
              </li>
              <li>
                <small>ระดับชั้น</small>
                <b>{course.level}</b>
              </li>
              <li>
                <small>เวลาเรียน</small>
                <b>{course.duration}</b>
              </li>
            </ul>
          </Reveal>

          <Reveal className="hx-about__chat" delay={120}>
            <LiveChat />
          </Reveal>

          <ul className="hx-stats">
            {STATS.map((s, i) => (
              <Reveal as="li" key={s.label} className="hx-stat" delay={i * 90}>
                <CountUp to={s.value} />
                <span>{s.label}</span>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ====== 6 หัวข้อ ====== */}
      <section className="hx-sec" aria-labelledby="hx-units-title">
        <div className="container">
          <Reveal as="header" className="hx-head">
            <span className="hx-kicker">Course Content</span>
            <h2 id="hx-units-title" className="hx-h2">
              6 สถานี<span className="hx-grad"> สู่การสร้างบอท</span>
            </h2>
            <p>เริ่มจากรู้จักแชตบอต เข้าใจการทำงาน วิเคราะห์ผู้ใช้ แล้วเตรียม FAQ พร้อมลงมือสร้างจริง</p>
          </Reveal>

          <ol className="hx-units">
            {units.map((u, i) => {
              const Icon = UNIT_ICONS[i] || Sparkles;
              return (
                <Reveal as="li" key={u.no} delay={i * 80} className="hx-unitwrap">
                  <div className="hx-unit" onPointerMove={tilt} onPointerLeave={untilt} style={{ '--uc': u.color }}>
                    <span className="hx-unit__no">0{u.no}</span>
                    <span className="hx-unit__icon">
                      <Icon size={24} aria-hidden="true" />
                    </span>
                    <h3>{u.title}</h3>
                    <p>{u.topics.slice(0, 2).join(' · ')}</p>
                    <span className="hx-unit__obj">
                      <Target size={13} aria-hidden="true" /> จุดประสงค์ข้อ {u.objective}
                    </span>
                  </div>
                </Reveal>
              );
            })}
          </ol>

          <Reveal className="hx-center">
            <Link to="/syllabus" className="hx-btn hx-btn--glass">
              ดูรายละเอียดทุกหัวข้อ <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ====== เส้นทางการเรียน ====== */}
      <section className="hx-sec hx-sec--glow" aria-labelledby="hx-journey-title">
        <div className="container">
          <Reveal as="header" className="hx-head">
            <span className="hx-kicker">Chatbot Quest</span>
            <h2 id="hx-journey-title" className="hx-h2">
              เรียนแบบเล่นเกม<span className="hx-grad"> 4 ด่าน</span>
            </h2>
            <p>ทำตามลำดับ ด่านถัดไปจะปลดล็อกเมื่อผ่านด่านก่อนหน้า สะสม XP และดาวไปพร้อมกัน</p>
          </Reveal>

          <ol ref={journeyRef} className={`hx-journey ${journeyOn ? 'is-on' : ''}`}>
            <svg className="hx-journey__path" viewBox="0 0 1000 120" preserveAspectRatio="none" aria-hidden="true">
              <path d="M40 60 C 180 -10, 300 130, 500 60 S 820 -10, 960 60" pathLength="1" />
            </svg>
            {JOURNEY.map(({ icon: Icon, title, desc }, i) => (
              <li key={title} style={{ '--i': i }}>
                <span className="hx-journey__node">
                  <Icon size={24} aria-hidden="true" />
                  <em>{i + 1}</em>
                </span>
                <h3>{title}</h3>
                <p>{desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ====== ในห้องเรียน ====== */}
      <section className="hx-sec" aria-labelledby="hx-class-title">
        <div className="container">
          <Reveal as="header" className="hx-head">
            <span className="hx-kicker">Inside the classroom</span>
            <h2 id="hx-class-title" className="hx-h2">
              สิ่งที่รออยู่<span className="hx-grad">ในห้องเรียน</span>
            </h2>
            <p>{isLoggedIn ? 'เลือกหมวดที่ต้องการเริ่มได้เลย' : 'เข้าสู่ระบบเพื่อเปิดใช้งานทุกหมวด และบันทึกคะแนนของตัวเอง'}</p>
          </Reveal>

          <div className="hx-bento">
            {learningCategories.map(({ path, label, description, icon: Icon }, i) => (
              <Reveal key={path} delay={i * 90} className={`hx-bento__cell hx-bento__cell--${i}`}>
                <Link
                  to={isLoggedIn ? path : '/login'}
                  state={isLoggedIn ? undefined : { from: path }}
                  className="hx-cat"
                  onPointerMove={tilt}
                  onPointerLeave={untilt}
                >
                  <span className="hx-cat__no">0{i + 1}</span>
                  <span className="hx-cat__icon">
                    <Icon size={28} aria-hidden="true" />
                  </span>
                  <h3>{label}</h3>
                  <p>{description}</p>
                  <span className="hx-cat__go">
                    {isLoggedIn ? (
                      <>
                        ไปที่{label} <ArrowRight size={16} aria-hidden="true" />
                      </>
                    ) : (
                      <>
                        <Lock size={14} aria-hidden="true" /> เข้าสู่ระบบเพื่อเปิด
                      </>
                    )}
                  </span>
                  {i === 0 && (
                    <span className="hx-cat__art" aria-hidden="true">
                      <Robot size={150} mood="happy" acc="headset" live />
                    </span>
                  )}
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ====== วัตถุประสงค์ ====== */}
      <section className="hx-sec" aria-labelledby="hx-obj-title">
        <div className="container hx-obj">
          <Reveal as="header" className="hx-head hx-head--left">
            <span className="hx-kicker">Learning Objectives</span>
            <h2 id="hx-obj-title" className="hx-h2">
              เรียนจบแล้ว<span className="hx-grad">ทำอะไรได้</span>
            </h2>
            <p>จุดประสงค์เชิงพฤติกรรม 10 ข้อ ครอบคลุมความรู้ ทักษะ และเจตคติ</p>
            <div className="hx-tabs" role="tablist" aria-label="ด้านของจุดประสงค์">
              {Object.entries(domains).map(([k, d]) => {
                const Icon = DOMAIN_ICONS[k];
                return (
                  <button
                    key={k}
                    type="button"
                    role="tab"
                    aria-selected={tab === k}
                    className={tab === k ? 'is-on' : ''}
                    style={{ '--dc': d.color }}
                    onClick={() => setTab(k)}
                  >
                    <Icon size={16} aria-hidden="true" /> {d.label}
                    <small>{objectives.filter((o) => o.domain === k).length} ข้อ</small>
                  </button>
                );
              })}
            </div>
          </Reveal>

          <Reveal className="hx-card hx-obj__panel" style={{ '--dc': domains[tab].color }} role="tabpanel">
            <div className="hx-obj__top">
              <span className="hx-obj__icon">
                <TabIcon size={26} aria-hidden="true" />
              </span>
              <div>
                <small>ด้าน {tab}</small>
                <b>{domains[tab].label}</b>
              </div>
            </div>
            <ol key={tab} className="hx-obj__list">
              {tabItems.map((o, i) => (
                <li key={o.no} style={{ '--i': i }}>
                  <span>{o.no}</span>
                  <p>
                    {o.text}
                    <small>วัดผลด้วย {o.assess}</small>
                  </p>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      {/* ====== ชวนเริ่มเรียน ====== */}
      <section className="hx-sec hx-sec--last">
        <div className="container">
          <Reveal className="hx-cta">
            <span className="hx-cta__ring hx-cta__ring--1" aria-hidden="true" />
            <span className="hx-cta__ring hx-cta__ring--2" aria-hidden="true" />
            <div className="hx-cta__bot" aria-hidden="true">
              <Robot size={170} mood="cheer" acc="headset" live />
            </div>
            <div className="hx-cta__text">
              <h2>{isLoggedIn ? 'พร้อมเรียนต่อแล้วใช่ไหม?' : 'พร้อมสร้างบอทตัวแรกแล้วหรือยัง?'}</h2>
              <p>
                {isLoggedIn
                  ? 'กลับไปที่หน้าเรียน ระบบจำไว้แล้วว่าเราถึงด่านไหน'
                  : 'สมัครด้วยอีเมลไม่ถึง 1 นาที เริ่มจากแบบทดสอบก่อนเรียน แล้วไปลุยภารกิจกันเลย'}
              </p>
              <div className="hx-cta__actions">
                {isLoggedIn ? (
                  <Link to="/learn" className="hx-btn hx-btn--cta">
                    <Rocket size={18} aria-hidden="true" /> ไปที่หน้าเรียน
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="hx-btn hx-btn--cta">
                      สมัครสมาชิก <ArrowRight size={18} aria-hidden="true" />
                    </Link>
                    <Link to="/login" className="hx-btn hx-btn--glass">
                      มีบัญชีแล้ว เข้าสู่ระบบ
                    </Link>
                  </>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
