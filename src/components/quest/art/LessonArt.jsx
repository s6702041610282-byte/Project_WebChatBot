import Robot from './Robot';
import Person from './Person';

/**
 * ภาพอนิเมชันประกอบบทเรียนแต่ละพาร์ท (SVG 360×240 + CSS animation ใน quest.css)
 * no: 1–6 ตามบทเรียน
 */
const seq = (i, step = 0.9) => ({ animationDelay: `${i * step}s` });

function Bubble({ x, y, w = 120, text, user, i }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="la-seq" style={seq(i)}>
        <rect width={w} height="30" rx="14" fill={user ? '#b9f6a5' : '#fff'} stroke={user ? '#8ce99a' : '#dbe4ff'} />
        <text x={w / 2} y="20" textAnchor="middle" className="la-txt">
          {text}
        </text>
      </g>
    </g>
  );
}

function Meaning() {
  return (
    <>
      <rect width="360" height="240" rx="16" fill="#edf2ff" />
      <circle cx="300" cy="44" r="40" fill="#dbe4ff" />
      <g transform="translate(18 64)">
        <Robot size={120} mood="wave" />
      </g>
      <Bubble x={170} y={30} w={150} text="ร้านเปิดกี่โมงคะ?" user i={0} />
      <g transform="translate(150 74)">
        <g className="la-seq" style={seq(1)}>
          <rect width="64" height="30" rx="14" fill="#fff" stroke="#dbe4ff" />
          {[18, 32, 46].map((cx, k) => (
            <circle key={cx} cx={cx} cy="15" r="4" fill="#91a7ff" className="la-dot" style={{ animationDelay: `${k * 0.15}s` }} />
          ))}
        </g>
      </g>
      <Bubble x={150} y={116} w={190} text="เปิด 07.00–18.00 น. ค่ะ" i={2} />
      <g transform="translate(160 182)">
        <rect width="64" height="34" rx="10" fill="#3b5bdb" />
        <text x="32" y="23" textAnchor="middle" className="la-big" fill="#fff">
          Chat
        </text>
        <text x="84" y="24" textAnchor="middle" className="la-big" fill="#3b5bdb">
          +
        </text>
        <rect x="104" width="64" height="34" rx="10" fill="#7048e8" />
        <text x="136" y="23" textAnchor="middle" className="la-big" fill="#fff">
          Bot
        </text>
      </g>
    </>
  );
}

function Pipeline() {
  const nodes = [
    { x: 40, label: 'รับข้อความ', c: '#4c6ef5' },
    { x: 112, label: 'วิเคราะห์', c: '#7048e8' },
    { x: 184, label: 'ค้นหาคำตอบ', c: '#1c7ed6' },
    { x: 256, label: 'ตอบกลับ', c: '#0ca678' },
    { x: 322, label: 'ปรับปรุง', c: '#f76707' }
  ];
  return (
    <>
      <rect width="360" height="240" rx="16" fill="#e7f5ff" />
      <path id="la-path" d="M40 128 H322" stroke="#a5d8ff" strokeWidth="4" strokeDasharray="6 8" className="la-dash" />
      <circle r="7" fill="#f76707" className="la-runner">
        <animateMotion dur="3.6s" repeatCount="indefinite" path="M40 128 H322" />
      </circle>
      {nodes.map((n, i) => (
        <g key={n.label} transform={`translate(${n.x} 128)`}>
          <circle r="24" fill="#fff" stroke={n.c} strokeWidth="3" className="la-pulse" style={{ animationDelay: `${i * 0.72}s` }} />
          {i === 1 ? (
            <g className="la-spin">
              <circle r="9" fill="none" stroke={n.c} strokeWidth="5" strokeDasharray="4 3.1" />
              <circle r="3.5" fill={n.c} />
            </g>
          ) : i === 2 ? (
            <g fill={n.c}>
              <ellipse cy="-7" rx="10" ry="4" />
              <rect x="-10" y="-7" width="20" height="14" />
              <ellipse cy="7" rx="10" ry="4" />
            </g>
          ) : (
            <text y="6" textAnchor="middle" className="la-big" fill={n.c}>
              {i + 1}
            </text>
          )}
          <text y="46" textAnchor="middle" className="la-txt">
            {n.label}
          </text>
        </g>
      ))}
      <g transform="translate(14 22)">
        <Person kind="girl" seed={3} mood="happy" size={46} />
      </g>
      <Bubble x={66} y={30} w={130} text="อยากรู้วันสอบ" user i={0} />
      <g transform="translate(296 18)">
        <Robot head size={50} mood="happy" />
      </g>
    </>
  );
}

function Benefits() {
  const items = [
    { a: 0, label: 'การศึกษา', c: '#3b5bdb', d: 'M-8 2 l8 -6 l8 6 l-8 5z M-5 4 v4 q5 3 10 0 v-4' },
    { a: 120, label: 'ธุรกิจ', c: '#f76707', d: 'M-8 -3 h16 l-2 11 h-12z M-4 -3 v-3 a4 4 0 0 1 8 0 v3' },
    { a: 240, label: 'บริการ', c: '#d6336c', d: 'M-2 -8 h4 v6 h6 v4 h-6 v6 h-4 v-6 h-6 v-4 h6z' }
  ];
  return (
    <>
      <rect width="360" height="240" rx="16" fill="#f3f0ff" />
      <circle cx="180" cy="112" r="96" fill="none" stroke="#d0bfff" strokeWidth="2" strokeDasharray="5 7" />
      <g transform="translate(138 58)">
        <Robot size={84} mood="cheer" />
      </g>
      <g className="la-orbit">
        {items.map((it) => (
          <g key={it.label} transform={`rotate(${it.a} 180 112) translate(276 112) rotate(${-it.a})`}>
            <g className="la-counter">
              <circle r="26" fill="#fff" stroke={it.c} strokeWidth="3" />
              <path d={it.d} fill={it.c} stroke={it.c} strokeWidth="1.5" strokeLinejoin="round" />
            </g>
          </g>
        ))}
      </g>
      <g transform="translate(0 222)">
        {items.map((it, i) => (
          <g key={it.label} transform={`translate(${84 + i * 96} 0)`}>
            <circle cx="-30" cy="-5" r="5" fill={it.c} />
            <text x="4" y="0" textAnchor="middle" className="la-txt" fill={it.c}>
              {it.label}
            </text>
          </g>
        ))}
      </g>
    </>
  );
}

function Platform() {
  const blocks = [
    { t: 'ข้อความต้อนรับ', c: '#3b5bdb' },
    { t: 'FAQ + คำสำคัญ', c: '#7048e8' },
    { t: 'Rich Menu', c: '#0ca678' },
    { t: 'Fallback', c: '#f76707' }
  ];
  return (
    <>
      <rect width="360" height="240" rx="16" fill="#fff4e6" />
      <g transform="translate(206 18)">
        <rect width="124" height="204" rx="18" fill="#1b2559" />
        <rect x="7" y="8" width="110" height="188" rx="12" fill="#fff" />
        <rect x="7" y="8" width="110" height="28" rx="12" fill="#06c755" />
        <text x="62" y="27" textAnchor="middle" className="la-txt" fill="#fff">
          LINE OA
        </text>
        {blocks.map((b, i) => (
          <g key={b.t} transform={`translate(14 ${46 + i * 36})`}>
            <g className="la-slide" style={seq(i, 0.8)}>
              <rect width="96" height="28" rx="8" fill={b.c} opacity="0.14" />
              <rect width="6" height="28" rx="3" fill={b.c} />
              <text x="52" y="18" textAnchor="middle" className="la-sm" fill={b.c}>
                {b.t}
              </text>
            </g>
          </g>
        ))}
      </g>
      <g transform="translate(16 26)">
        {['Dialogflow', 'Botpress', 'LINE OA'].map((t, i) => (
          <g key={t} transform={`translate(0 ${i * 46})`}>
           <g className="la-float" style={{ animationDelay: `${i * 0.5}s` }}>
            <rect width="132" height="36" rx="10" fill="#fff" stroke="#ffd8a8" />
            <circle cx="20" cy="18" r="8" fill={['#4c6ef5', '#7048e8', '#06c755'][i]} />
            <text x="76" y="23" textAnchor="middle" className="la-txt">
              {t}
            </text>
           </g>
          </g>
        ))}
      </g>
      <g transform="translate(52 160)">
        <Robot size={70} mood="think" />
      </g>
    </>
  );
}

function Persona() {
  const people = [
    { kind: 'girl', label: 'นักเรียน', note: 'พิมพ์เร็ว ใช้คำย่อ' },
    { kind: 'barista', label: 'ลูกค้า', note: 'อยากได้คำตอบไว' },
    { kind: 'grandma', label: 'ผู้สูงอายุ', note: 'ชอบกดปุ่ม' }
  ];
  return (
    <>
      <rect width="360" height="240" rx="16" fill="#fff0f6" />
      {people.map((p, i) => (
        <g key={p.label} transform={`translate(${16 + i * 114} 46)`}>
         <g className="la-card" style={{ animationDelay: `${i * 1.2}s` }}>
          <rect width="100" height="132" rx="14" fill="#fff" stroke="#fcc2d7" />
          <g transform="translate(22 12)">
            <Person kind={p.kind} seed={i + 2} mood="happy" size={56} />
          </g>
          <text x="50" y="90" textAnchor="middle" className="la-txt">
            {p.label}
          </text>
          <text x="50" y="110" textAnchor="middle" className="la-sm" fill="#a61e4d">
            {p.note}
          </text>
         </g>
        </g>
      ))}
      <g className="la-scan">
        <circle cx="0" cy="0" r="22" fill="#fff" fillOpacity="0.35" stroke="#d6336c" strokeWidth="5" />
        <line x1="16" y1="16" x2="32" y2="32" stroke="#d6336c" strokeWidth="7" strokeLinecap="round" />
      </g>
      <text x="180" y="214" textAnchor="middle" className="la-txt" fill="#a61e4d">
        ใครคือผู้ใช้ · ปัญหาคืออะไร · ต้องการอะไร
      </text>
    </>
  );
}

function Faq() {
  const rows = [
    ['เปิดกี่โมง', 'เปิด 07.00–18.00 น.'],
    ['มีโปรไหม', 'สะสม 10 แก้ว ฟรี 1'],
    ['ร้านอยู่ไหน', 'ตรงข้ามประตู 2']
  ];
  return (
    <>
      <rect width="360" height="240" rx="16" fill="#e6fcf5" />
      <text x="96" y="34" textAnchor="middle" className="la-txt" fill="#087f5b">
        Question
      </text>
      <text x="262" y="34" textAnchor="middle" className="la-txt" fill="#087f5b">
        Answer
      </text>
      {rows.map(([q, a], i) => (
        <g key={q} transform={`translate(20 ${50 + i * 52})`}>
          <g className="la-seq" style={seq(i * 2, 0.7)}>
            <rect width="152" height="38" rx="10" fill="#fff" stroke="#96f2d7" />
            <text x="76" y="24" textAnchor="middle" className="la-txt">
              {q}
            </text>
          </g>
          <g className="la-seq" style={seq(i * 2 + 1, 0.7)}>
            <path d="M158 19 h14 m-5 -5 l5 5 l-5 5" stroke="#0ca678" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <rect x="178" width="142" height="38" rx="10" fill="#0ca678" />
            <text x="249" y="24" textAnchor="middle" className="la-sm" fill="#fff">
              {a}
            </text>
          </g>
        </g>
      ))}
      <g transform="translate(300 176)">
        <Robot head size={46} mood="happy" />
      </g>
    </>
  );
}

const ARTS = { 1: Meaning, 2: Pipeline, 3: Benefits, 4: Platform, 5: Persona, 6: Faq };

export default function LessonArt({ no, className = '' }) {
  const Art = ARTS[no] || Meaning;
  return (
    <svg viewBox="0 0 360 240" className={`lessonart ${className}`} aria-hidden="true">
      <Art />
    </svg>
  );
}
