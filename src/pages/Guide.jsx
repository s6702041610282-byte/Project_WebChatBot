import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  Check,
  ClipboardCheck,
  GraduationCap,
  Home,
  Lightbulb,
  Lock,
  LogIn,
  Map as MapIcon,
  Palette,
  Rocket,
  RotateCw,
  Sparkles,
  Star
} from 'lucide-react';
import Robot from '../components/quest/art/Robot';
import Person from '../components/quest/art/Person';
import MissionScene from '../components/quest/art/MissionScene';
import { useAuth } from '../contexts/AuthContext';

/* ---------- ภาพจำลองหน้าจอของแต่ละขั้น ---------- */
function MockLogin() {
  return (
    <div className="gm gm-login">
      <Robot head size={56} mood="wave" live />
      <b>เข้าสู่ระบบ</b>
      <span className="gm-input">อีเมล</span>
      <span className="gm-input">รหัสผ่าน</span>
      <span className="gm-btn gm-btn--o">เข้าสู่ระบบ</span>
    </div>
  );
}

function MockJourney() {
  const s = [
    ['แบบทดสอบก่อนเรียน', 'is-done'],
    ['บทเรียน 6 พาร์ท', 'is-now'],
    ['ลงมือปฏิบัติ', 'is-lock'],
    ['แบบทดสอบหลังเรียน', 'is-lock']
  ];
  return (
    <div className="gm gm-journey">
      {s.map(([t, c], i) => (
        <div key={t} className={`gm-jc ${c}`}>
          <span>{c === 'is-done' ? <Check size={14} /> : c === 'is-lock' ? <Lock size={12} /> : i + 1}</span>
          <b>{t}</b>
          {c === 'is-now' && <em>ทำขั้นนี้</em>}
        </div>
      ))}
    </div>
  );
}

function MockQuiz() {
  return (
    <div className="gm gm-quiz">
      <div className="gm-dots">
        {Array.from({ length: 10 }).map((_, i) => (
          <i key={i} className={i < 2 ? 'is-done' : i === 2 ? 'is-now' : ''} />
        ))}
      </div>
      <div className="gm-card">
        <span className="gm-qno">ข้อ 3</span>
        <b>Chat Bot หมายถึงข้อใด</b>
        {['ก', 'ข', 'ค', 'ง'].map((l, i) => (
          <span key={l} className={`gm-opt ${i === 1 ? 'is-on' : ''}`}>
            <em>{l}</em>
            <i />
          </span>
        ))}
      </div>
      <div className="gm-nav">
        <span>← ข้อก่อนหน้า</span>
        <span className="is-o">ข้อถัดไป →</span>
      </div>
    </div>
  );
}

function MockLessons() {
  return (
    <div className="gm gm-lessons">
      <div className="gm-track">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <span key={n} className={n < 3 ? 'is-done' : n === 3 ? 'is-now' : ''}>
            {n < 3 ? <Check size={11} /> : n}
          </span>
        ))}
        <span className="is-go">
          <Rocket size={11} />
        </span>
      </div>
      <div className="gm-key">
        <b>สาระสำคัญที่ต้องจำ</b>
        <i />
        <i />
        <i className="short" />
      </div>
      <div className="gm-check">
        <Robot head size={30} mood="cheer" />
        <span>เช็กความเข้าใจ 2 ข้อ · ตอบถูกครบ +20 XP</span>
      </div>
    </div>
  );
}

function MockTown() {
  return (
    <div className="gm gm-town">
      {['coffee', 'helpdesk', 'care'].map((id, i) => (
        <div key={id} className={`gm-place ${i === 0 ? 'is-on' : 'is-lock'}`}>
          <MissionScene id={id} locked={i > 0} />
          <b>{['CED Coffee', 'Help Desk', 'Care'][i]}</b>
        </div>
      ))}
    </div>
  );
}

function MockDesign() {
  return (
    <div className="gm gm-design">
      <div className="gm-studio">
        <Robot size={92} mood="wave" color="orange" acc="chef" live />
        <b>CED Coffee Bot</b>
      </div>
      <div className="gm-faq">
        <span className="gm-tab">FAQ · เวลาเปิด–ปิด</span>
        <div className="gm-chips">
          <i>กี่โมง</i>
          <i>เปิด</i>
          <i>ปิด</i>
        </div>
        <span className="gm-ans">เปิดทุกวัน 07.00–18.00 น.</span>
        <div className="gm-menu">
          <i>เวลาเปิด</i>
          <i>เมนู</i>
          <i>โปรโมชัน</i>
          <i>ติดต่อ</i>
        </div>
      </div>
    </div>
  );
}

function MockLive() {
  return (
    <div className="gm gm-live">
      <div className="gm-people">
        {[
          ['girl', 'love'],
          ['boy', 'happy'],
          ['grandma', 'confused'],
          ['woman', 'love']
        ].map(([k, m], i) => (
          <Person key={i} kind={k} seed={i + 2} mood={m} size={48} />
        ))}
      </div>
      <div className="gm-result">
        <div className="ring" style={{ '--p': 90, '--c': '#2f9e44' }}>
          <b>90%</b>
          <small>ตอบถูก</small>
        </div>
        <div>
          <b className="gm-pass">ผ่านภารกิจ!</b>
          <span className="gm-stars">
            <Star size={16} />
            <Star size={16} />
            <Star size={16} className="off" />
          </span>
          <small>+150 XP</small>
        </div>
      </div>
    </div>
  );
}

function MockPost() {
  return (
    <div className="gm gm-post">
      {[
        ['ก่อนเรียน', 40, 'pre'],
        ['หลังเรียน', 90, 'post']
      ].map(([l, v, c]) => (
        <div key={l} className={`gm-bar gm-bar--${c}`}>
          <span>{l}</span>
          <i>
            <b style={{ width: `${v}%` }} />
          </i>
          <em>{v / 10}</em>
        </div>
      ))}
      <p>พัฒนาขึ้น +5 คะแนน เก่งมาก!</p>
    </div>
  );
}

function MockLevel() {
  return (
    <div className="gm gm-level">
      <div className="gm-lv">
        <span>Level 2</span>
        <em>180/300 XP</em>
      </div>
      <i className="gm-xp">
        <b />
      </i>
      <ul>
        <li>ผ่านพาร์ทบทเรียน · +20 XP</li>
        <li>ผ่านภารกิจครั้งแรก · +100 XP</li>
        <li>ได้ดาวเพิ่ม · +50 XP ต่อดาว</li>
      </ul>
    </div>
  );
}

const STEPS = [
  {
    id: 'login',
    title: 'เข้าสู่ระบบ',
    lead: 'สมัครด้วยอีเมล กรอกชื่อ–นามสกุล เลขที่ และห้อง ระบบจะบันทึกความคืบหน้าของแต่ละคนไว้บนระบบ',
    how: ['กดปุ่ม “เข้าสู่ระบบ” มุมขวาบน', 'สมัครครั้งแรก: กรอกชื่อ นามสกุล เลขที่ ห้อง อีเมล และรหัสผ่าน', 'ครั้งต่อไปเข้าด้วยอีเมลและรหัสผ่านเดิม จะเครื่องไหนก็ได้'],
    tip: 'กรอกชื่อ เลขที่ และห้องให้ถูกต้อง เพราะครูใช้ข้อมูลนี้ดูผลการเรียน',
    Mock: MockLogin
  },
  {
    id: 'home',
    title: 'หน้าหลัก: เส้นทางการเรียน 4 ขั้น',
    lead: 'หน้าหลักบอกว่าต้องทำอะไรต่อ ปุ่มสีส้มจะพาไปขั้นที่ต้องทำเสมอ แต่ละขั้นปลดล็อกเมื่อทำขั้นก่อนหน้าเสร็จ',
    how: ['ขั้นที่ 1 แบบทดสอบก่อนเรียน', 'ขั้นที่ 2 บทเรียน 6 พาร์ท', 'ขั้นที่ 3 ลงมือปฏิบัติ (เมนู “กิจกรรม”)', 'ขั้นที่ 4 แบบทดสอบหลังเรียน'],
    tip: 'คลิกที่หุ่นยนต์บิท 3 มิติบนหน้าหลัก บิทจะกระโดดทักทาย',
    Mock: MockJourney
  },
  {
    id: 'pretest',
    title: 'แบบทดสอบก่อนเรียน',
    lead: 'ข้อสอบ 10 ข้อ แสดงทีละข้อบนการ์ด ใช้เวลาประมาณ 5 นาที ไม่นำมาคิดคะแนน ใช้ดูพื้นฐานของตัวเอง ทำได้ครั้งเดียว',
    how: ['เลือกคำตอบ แล้วกด “ข้อถัดไป” (หรือปัดการ์ดบนมือถือ)', 'กดเลขข้อด้านบนเพื่อย้อนกลับไปแก้ได้', 'ตรวจให้ครบแล้วกด “ส่งคำตอบ” (ส่งได้ครั้งเดียว) ดูคะแนนและเฉลยทีละข้อ'],
    tip: 'บนคอมกดปุ่ม ← → เปลี่ยนข้อ และกด 1–4 เลือกคำตอบได้เลย',
    Mock: MockQuiz
  },
  {
    id: 'lessons',
    title: 'บทเรียน 6 พาร์ท',
    lead: 'เรียนทีละพาร์ท แต่ละพาร์ทมีภาพเคลื่อนไหว สาระสำคัญที่ต้องจำ และคำสำคัญที่ไฮไลต์ไว้',
    how: ['อ่าน “สาระสำคัญที่ต้องจำ” ก่อน แล้วอ่านหัวข้อย่อย', 'ใช้สารบัญด้านขวากระโดดไปหัวข้อที่ต้องการ', 'ตอบ “เช็กความเข้าใจ” ท้ายพาร์ทให้ถูกครบ จึงไปพาร์ทถัดไปได้'],
    tip: 'ตอบผิดไม่เป็นไร เลือกใหม่ได้จนกว่าจะถูก',
    Mock: MockLessons
  },
  {
    id: 'activity',
    title: 'กิจกรรม: เลือกภารกิจในเมือง',
    lead: 'เมื่อเรียนครบ 6 พาร์ท เมนู “กิจกรรม” จะปลดล็อก มีภารกิจ 3 สถานที่ เล่นเรียงตามลำดับ',
    how: ['แตะอาคารในเมืองเพื่อดูโจทย์ ปัญหา และเกณฑ์ผ่าน', 'กด “เริ่มภารกิจ” แล้วอ่านสถานการณ์และข้อมูลจริงให้ครบ', 'ผ่านภารกิจที่ 1 → ปลดล็อกภารกิจที่ 2 และ 3'],
    tip: 'ภารกิจที่ 1 ร้าน CED Coffee ต้องผ่าน จึงจะทำแบบทดสอบหลังเรียนได้',
    Mock: MockTown
  },
  {
    id: 'design',
    title: 'ออกแบบบอทและทดลองแชต',
    lead: 'แต่งบอทในสตูดิโอ แล้วสร้าง FAQ คำสำคัญ Rich Menu และ Fallback ทดลองคุยในมือถือจำลองได้ทันที',
    how: [
      'ตั้งค่าบอท: ชื่อ สี เครื่องประดับ และข้อความต้อนรับ',
      'FAQ: เลือกหัวข้อ ใส่คำสำคัญอย่างน้อย 3 คำ และคำตอบจากข้อมูลจริง',
      'Rich Menu ≥ 4 ปุ่ม และข้อความ Fallback ที่สุภาพ',
      'ลองพิมพ์ถามในมือถือจำลอง ดูว่าบอทจับคู่คำถามถูกหัวข้อไหม'
    ],
    tip: 'ติดตรงไหน กด “ขอคำใบ้” ใต้ช่องคำสำคัญได้ งานบันทึกอัตโนมัติ',
    Mock: MockDesign
  },
  {
    id: 'live',
    title: 'เปิดใช้งานจริงและดูผลประเมิน',
    lead: 'กด “เปิดใช้งานจริง” ลูกค้า 10 คนจะเข้ามาถามทีละคน ทดสอบครบ 4 แบบ ตอบถูก 80% ขึ้นไปจึงผ่าน',
    how: ['ดูสีหน้าลูกค้า: พอใจ / งง / ไม่พอใจ', 'ไม่ผ่าน → อ่าน “ข้อเสนอแนะ” แล้วกด “กลับไปแก้บอท”', 'ผ่าน → ได้ดาว 1–3 ดวง และ XP'],
    tip: 'ระวังคำสำคัญสั้นเกินไป เช่น “ร้าน” จะทำให้บอทจับคำถามผิดเรื่อง',
    Mock: MockLive
  },
  {
    id: 'posttest',
    title: 'แบบทดสอบหลังเรียน',
    lead: 'ขั้นสุดท้าย ข้อสอบ 10 ข้อ (มีข้อเรียงลำดับด้วย) ระบบเปรียบเทียบคะแนนก่อน–หลังเรียนให้ดูพัฒนาการ',
    how: ['ปลดล็อกเมื่อเรียนครบ 6 พาร์ท และผ่านภารกิจ CED Coffee', 'ข้อเรียงลำดับ: แตะการ์ดเรียงลงช่องตามลำดับที่ถูก', 'ทำได้ครั้งเดียว ส่งแล้วกลับมาดูผลและเฉลยได้ตลอด'],
    tip: 'ดูกราฟพัฒนาการได้ที่เมนู “แบบทดสอบ”',
    Mock: MockPost
  },
  {
    id: 'xp',
    title: 'XP · Level · ความคืบหน้า',
    lead: 'ทุกอย่างที่ทำจะได้ XP สะสมไว้เลื่อน Level ดูได้ที่มุมขวาบนและแถบหัวของทุกหน้า',
    how: ['ครบ 300 XP ขึ้น 1 Level', 'ความคืบหน้ารายวิชา = บทเรียน 40% + ภารกิจ 60%', 'ผลการเรียนส่งให้ครูผู้สอนอัตโนมัติ'],
    tip: 'เล่นภารกิจซ้ำเพื่อเก็บดาวให้ครบ 3 ดวงได้',
    Mock: MockLevel
  }
];

const FAQS = [
  ['ทำไมบางเมนูยังกดไม่ได้ / มีรูปกุญแจ', 'เว็บล็อกตามลำดับการเรียน ต้องทำแบบทดสอบก่อนเรียน → บทเรียนครบ 6 พาร์ท → ผ่านภารกิจ CED Coffee แล้วขั้นถัดไปจะปลดล็อกเอง'],
  ['งานที่ทำไว้จะหายไหม', 'ไม่หาย ระบบบันทึกความคืบหน้า แบบร่างบอท และคะแนนให้อัตโนมัติ ออกจากระบบแล้วเข้าด้วยบัญชีเดิม ข้อมูลยังอยู่ครบ'],
  ['ลืมรหัสผ่านทำอย่างไร', 'กด “ลืมรหัสผ่าน” ในหน้าเข้าสู่ระบบ กรอกอีเมล ระบบจะส่งรหัส 6 หลักไปที่อีเมล แล้วตั้งรหัสผ่านใหม่'],
  ['ภารกิจไม่ผ่านต้องทำอย่างไร', 'ดู “สิ่งที่ต้องแก้” ในหน้าผลประเมิน แก้คำสำคัญหรือคำตอบตามคำแนะนำ แล้วเปิดใช้งานอีกครั้ง ลองได้ไม่จำกัด'],
  ['ทำแบบทดสอบซ้ำได้ไหม', 'ไม่ได้ แบบทดสอบก่อนและหลังเรียนทำได้คนละ 1 ครั้ง ส่งแล้วกลับมาดูคะแนนและเฉลยได้ตลอด'],
  ['แก้ชื่อหรือเลขที่ได้ไหม', 'ได้ กดรูปโปรไฟล์มุมขวาบน → “ข้อมูลส่วนตัว”'],
  ['ใช้บนมือถือได้ไหม', 'ได้ ทุกหน้าปรับให้เหมาะกับจอมือถือ ในแบบทดสอบปัดการ์ดเพื่อเปลี่ยนข้อได้'],
  ['ติดปัญหาตรงไหนถามใคร', 'ถามครูผู้สอนได้เลย หรือกลับมาเปิดคู่มือนี้ ใช้แถบขั้นตอนด้านซ้ายกระโดดไปหัวข้อที่สงสัย']
];

const ICONS = [LogIn, Home, ClipboardCheck, BookOpen, MapIcon, Palette, Rocket, GraduationCap, Star];
const short = (t) => t.split(':')[0];

function graphemes(text) {
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    return [...new Intl.Segmenter('th', { granularity: 'grapheme' }).segment(text)].map((x) => x.segment);
  }
  return [...text];
}

/** ตัวอักษรเด้งเข้ามาเป็นคลื่น */
function WaveText({ text, className = '', start = 0 }) {
  const chars = useMemo(() => graphemes(text), [text]);
  return (
    <span className={`g2-wave ${className}`} aria-label={text}>
      {chars.map((c, i) => (
        <span key={i} aria-hidden="true" style={{ '--i': i + start }}>
          {c === ' ' ? ' ' : c}
        </span>
      ))}
    </span>
  );
}

/** ค่อย ๆ ปรากฏเมื่อเลื่อนถึง */
function useReveal() {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, on];
}

function Chapter({ step, i, setRef }) {
  const [ref, on] = useReveal();
  const Icon = ICONS[i];
  const { id, title, lead, how, tip, Mock } = step;
  return (
    <section
      id={`g-${id}`}
      data-i={i}
      ref={(el) => {
        ref.current = el;
        setRef(i, el);
      }}
      className={`g2-ch ${i % 2 ? 'is-flip' : ''} ${on ? 'is-in' : ''}`}
      aria-labelledby={`g2-h-${id}`}
    >
      <div className="g2-ch__text">
        <div className="g2-ch__badge">
          <span className="g2-ch__icon">
            <Icon size={26} aria-hidden="true" />
          </span>
          <span className="g2-ch__no">{String(i + 1).padStart(2, '0')}</span>
          <span className="g2-ch__of">ขั้นที่ {i + 1} จาก {STEPS.length}</span>
        </div>
        <h2 id={`g2-h-${id}`}>{title}</h2>
        <p className="g2-ch__lead">{lead}</p>
        <ol className="g2-how">
          {how.map((h, k) => (
            <li key={h} style={{ '--k': k }}>
              <span>{k + 1}</span>
              <p>{h}</p>
            </li>
          ))}
        </ol>
        <div className="g2-tip">
          <span className="g2-tip__bot" aria-hidden="true">
            <Robot head size={46} mood="happy" />
          </span>
          <p>
            <b>
              <Lightbulb size={15} aria-hidden="true" /> เคล็ดลับจากบิท
            </b>
            {tip}
          </p>
        </div>
      </div>

      <div className="g2-ch__visual" aria-hidden="true">
        <span className="g2-ch__blob" />
        <div className="g2-device">
          <div className="g2-device__bar">
            <i />
            <i />
            <i />
            <span>chatbot-learning / {id}</span>
          </div>
          <div className="g2-device__screen">
            <div className="g2-device__page">
              <Mock />
            </div>
          </div>
        </div>
        <span className="g2-ch__sticker">{short(title)}</span>
      </div>
    </section>
  );
}

/** หน้าคู่มือการใช้งานสำหรับนักเรียน (อ่านเพื่อทำความเข้าใจ) */
export default function Guide() {
  const { isLoggedIn } = useAuth();
  const [active, setActive] = useState(-1);
  const [flip, setFlip] = useState({});
  const [read, setRead] = useState(0);
  const refs = useRef([]);
  const chips = useRef(null);
  const setRef = useCallback((i, el) => {
    refs.current[i] = el;
  }, []);

  // ขั้นที่กำลังอ่าน
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(Number(e.target.dataset.i))),
      { rootMargin: '-40% 0px -55% 0px' }
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  // แถบอ่านแล้วกี่ %
  useEffect(() => {
    const on = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setRead(h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0);
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  // เลื่อนชิปขั้นที่กำลังอ่านให้อยู่ในจอ
  useEffect(() => {
    const el = chips.current?.querySelector('.is-on');
    if (el && chips.current) {
      const box = chips.current;
      box.scrollTo({ left: el.offsetLeft - box.clientWidth / 2 + el.clientWidth / 2, behavior: 'smooth' });
    }
  }, [active]);

  const go = (i) => {
    const el = refs.current[i];
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 140;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  return (
    <div className="quest g2">
      <div className="g2-read" aria-hidden="true">
        <i style={{ width: `${read}%` }} />
      </div>

      {/* ---------- HERO ---------- */}
      <section className="g2-hero" aria-labelledby="g2-title">
        <div className="g2-wrap g2-hero__inner">
          <div className="g2-hero__text">
            <span className="g2-chip">
              <Sparkles size={15} aria-hidden="true" /> คู่มือนักเรียน
            </span>
            <h1 id="g2-title">
              <WaveText text="เรียนรู้วิธีใช้งาน" />
              <WaveText text="ChatBot Learning" className="g2-wave--grad" start={10} />
            </h1>
            <p>อ่านทีละขั้น ตั้งแต่เข้าสู่ระบบ ทำแบบทดสอบ เรียนบทเรียน ไปจนถึงสร้างบอทในภารกิจ แต่ละขั้นมีภาพหน้าจอจริงประกอบให้เข้าใจง่าย</p>
            <div className="g2-hero__cta">
              <button type="button" className="g2-btn g2-btn--main" onClick={() => go(0)}>
                เริ่มอ่านคู่มือ <ArrowDown size={18} aria-hidden="true" />
              </button>
              <Link to={isLoggedIn ? '/learn' : '/login'} className="g2-btn g2-btn--glass">
                {isLoggedIn ? 'ไปหน้าหลัก' : 'เข้าสู่ระบบ'} <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="g2-hero__art" aria-hidden="true">
            <span className="g2-orbit g2-orbit--1" />
            <span className="g2-orbit g2-orbit--2" />
            <div className="g2-hero__bot">
              <Robot size={250} mood="wave" acc="headset" live />
            </div>
            <span className="g2-float g2-float--a">
              <ClipboardCheck size={20} /> แบบทดสอบ
            </span>
            <span className="g2-float g2-float--b">
              <BookOpen size={20} /> บทเรียน 6 พาร์ท
            </span>
            <span className="g2-float g2-float--c">
              <MapIcon size={20} /> ภารกิจในเมือง
            </span>
            <span className="g2-float g2-float--d">
              <Star size={20} /> XP · Level
            </span>
          </div>
        </div>
      </section>

      {/* ---------- สารบัญ ---------- */}
      <section className="g2-wrap g2-toc" aria-labelledby="g2-toc-title">
        <h2 id="g2-toc-title">
          ทั้งหมด <span>9 ขั้น</span> เลือกอ่านขั้นไหนก็ได้
        </h2>
        <ol>
          {STEPS.map((s, i) => {
            const Icon = ICONS[i];
            return (
              <li key={s.id} style={{ '--i': i }}>
                <button type="button" onClick={() => go(i)}>
                  <span className="g2-toc__icon">
                    <Icon size={24} aria-hidden="true" />
                  </span>
                  <em>{String(i + 1).padStart(2, '0')}</em>
                  <b>{short(s.title)}</b>
                  <ArrowRight size={16} aria-hidden="true" className="g2-toc__go" />
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      {/* ---------- แถบขั้นติดด้านบน ---------- */}
      <nav className={`g2-chips ${active >= 0 ? 'is-show' : ''}`} aria-label="ขั้นตอนในคู่มือ">
        <div className="g2-wrap">
          <ol ref={chips}>
            {STEPS.map((s, i) => (
              <li key={s.id}>
                <button type="button" className={active === i ? 'is-on' : i < active ? 'is-past' : ''} onClick={() => go(i)}>
                  <em>{i < active ? <Check size={12} aria-hidden="true" /> : i + 1}</em>
                  {short(s.title)}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </nav>

      {/* ---------- เนื้อหาแต่ละขั้น ---------- */}
      <div className="g2-chapters">
        {STEPS.map((step, i) => (
          <div key={step.id} className={`g2-band ${i % 2 ? 'is-tint' : ''}`}>
            <div className="g2-wrap">
              <Chapter step={step} i={i} setRef={setRef} />
            </div>
          </div>
        ))}
      </div>

      {/* ---------- คำถามที่พบบ่อย ---------- */}
      <section className="g2-wrap g2-faq" aria-labelledby="g2-faq-title">
        <header>
          <span className="g2-chip g2-chip--soft">
            <RotateCw size={14} aria-hidden="true" /> แตะการ์ดเพื่อพลิกดูคำตอบ
          </span>
          <h2 id="g2-faq-title">คำถามที่พบบ่อย</h2>
        </header>
        <ul>
          {FAQS.map(([q, a], i) => (
            <li key={q}>
              <button type="button" className={`g2-flip ${flip[i] ? 'is-flipped' : ''}`} onClick={() => setFlip((f) => ({ ...f, [i]: !f[i] }))} aria-pressed={Boolean(flip[i])}>
                <span className="g2-flip__face g2-flip__front">
                  <em>Q{i + 1}</em>
                  <b>{q}</b>
                  <small>
                    แตะเพื่อดูคำตอบ <RotateCw size={13} aria-hidden="true" />
                  </small>
                </span>
                <span className="g2-flip__face g2-flip__back">
                  <em>คำตอบ</em>
                  <span>{a}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- ปิดท้าย ---------- */}
      <section className="g2-wrap">
        <div className="g2-end">
          <span className="g2-orbit g2-orbit--end" aria-hidden="true" />
          <div className="g2-end__bot" aria-hidden="true">
            <Robot size={170} mood="cheer" acc="headset" live />
          </div>
          <div className="g2-end__text">
            <h2>อ่านครบแล้ว ไปเริ่มภารกิจกันเลย!</h2>
            <p>เริ่มจากแบบทดสอบก่อนเรียน แล้วเดินตามเส้นทางทีละขั้น ปุ่มสีส้มบนหน้าหลักจะพาไปขั้นที่ต้องทำเสมอ</p>
            <Link to={isLoggedIn ? '/learn' : '/login'} className="g2-btn g2-btn--main">
              <Rocket size={18} aria-hidden="true" /> {isLoggedIn ? 'ไปหน้าหลัก' : 'เข้าสู่ระบบเพื่อเริ่มเรียน'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
