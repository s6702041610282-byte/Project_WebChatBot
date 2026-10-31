import { useId } from 'react';

/**
 * มาสคอต “บิท” — หุ่นยนต์ผู้ช่วยของ Chatbot Quest (SVG สไตล์อนิเมะ มีแสงเงา)
 * mood : happy | wave | think | cheer | sad | love
 * color: ชุดสีลำตัว (รูปโปรไฟล์บอทที่นักเรียนเลือกได้)
 * acc  : เครื่องประดับบนหัว none | cap | chef | crown | headset | bow
 * head : แสดงเฉพาะหัว (ใช้เป็นรูปโปรไฟล์ในแชต)
 * live : เปิดอนิเมชัน (ลอยตัว กะพริบตา)
 */
export const ROBOT_COLORS = {
  blue: { main: '#3b5bdb', dark: '#2b44b0', light: '#91a7ff', label: 'น้ำเงิน' },
  violet: { main: '#7048e8', dark: '#5530c4', light: '#b197fc', label: 'ม่วง' },
  sky: { main: '#1c7ed6', dark: '#1864ab', light: '#74c0fc', label: 'ฟ้า' },
  teal: { main: '#0ca678', dark: '#08805c', light: '#63e6be', label: 'เขียวมิ้นต์' },
  orange: { main: '#f76707', dark: '#c94f00', light: '#ffa94d', label: 'ส้ม' },
  pink: { main: '#d6336c', dark: '#a61e4d', light: '#faa2c1', label: 'ชมพู' }
};

export const ROBOT_ACCS = {
  none: 'ไม่มี',
  cap: 'หมวกแก๊ป',
  chef: 'หมวกเชฟ',
  crown: 'มงกุฎ',
  headset: 'หูฟัง',
  bow: 'โบว์'
};

export const robotColor = (key) => ROBOT_COLORS[key] || ROBOT_COLORS.blue;

function Eyes({ mood, uid }) {
  const eye = '#5ff5e0';
  if (mood === 'cheer') {
    return (
      <g stroke={eye} strokeWidth="6" strokeLinecap="round" fill="none">
        <path d="M70 80 Q81 64 92 80" />
        <path d="M108 80 Q119 64 130 80" />
      </g>
    );
  }
  if (mood === 'love') {
    return (
      <g fill="#ff6b9a">
        {[81, 119].map((cx) => (
          <path key={cx} d={`M${cx} 90 l-12 -12 a7 7 0 0 1 12 -9 a7 7 0 0 1 12 9z`} className="robot__heart" />
        ))}
      </g>
    );
  }
  const dy = mood === 'think' ? -4 : 0;
  const dx = mood === 'think' ? -4 : 0;
  const ry = mood === 'sad' ? 11 : 14;
  return (
    <g className="robot__eyes">
      {[81, 119].map((cx) => (
        <g key={cx} transform={`translate(${dx} ${dy})`}>
          <ellipse cx={cx} cy={76} rx="11.5" ry={ry} fill={`url(#${uid}-eye)`} />
          <circle cx={cx - 4} cy={70} r="4.4" fill="#fff" />
          <circle cx={cx + 4} cy={84} r="2" fill="#fff" opacity="0.9" />
        </g>
      ))}
      {mood === 'sad' && (
        <g stroke={eye} strokeWidth="3.5" strokeLinecap="round">
          <path d="M70 58 L90 63" />
          <path d="M130 58 L110 63" />
        </g>
      )}
    </g>
  );
}

function Mouth({ mood }) {
  const c = '#5ff5e0';
  if (mood === 'cheer' || mood === 'love') return <path d="M89 92 Q100 108 111 92 Z" fill={c} />;
  if (mood === 'sad') return <path d="M92 99 Q100 92 108 99" stroke={c} strokeWidth="3.5" fill="none" strokeLinecap="round" />;
  if (mood === 'think') return <path d="M94 97 H106" stroke={c} strokeWidth="3.5" strokeLinecap="round" />;
  return <path d="M91 93 Q100 101 109 93" stroke={c} strokeWidth="3.5" fill="none" strokeLinecap="round" />;
}

function Arms({ mood, c, uid }) {
  const arm = (d, hand) => (
    <g>
      <path d={d} stroke={`url(#${uid}-body)`} strokeWidth="14" strokeLinecap="round" fill="none" />
      <circle cx={hand[0]} cy={hand[1]} r="10" fill="#fff" stroke={c.light} strokeWidth="3" />
    </g>
  );
  const left = mood === 'cheer' || mood === 'love' ? arm('M66 146 Q46 128 40 104', [40, 100]) : arm('M66 146 Q50 160 50 176', [50, 180]);
  let right;
  if (mood === 'wave') right = <g className="bot-wave">{arm('M134 146 Q156 132 162 106', [163, 101])}</g>;
  else if (mood === 'cheer' || mood === 'love') right = arm('M134 146 Q154 128 160 104', [160, 100]);
  else if (mood === 'think') right = arm('M134 150 Q120 150 116 134', [116, 128]);
  else right = <g className="bot-arm-r">{arm('M134 146 Q150 160 150 176', [150, 180])}</g>;
  return (
    <>
      {left}
      {right}
    </>
  );
}

function Accessory({ acc, c }) {
  switch (acc) {
    case 'cap':
      return (
        <g>
          <path d="M46 52 Q48 14 100 12 Q152 14 154 52 Z" fill={c.main} />
          <path d="M46 52 Q48 14 100 12 Q120 13 134 20 Q90 18 62 48Z" fill="#fff" opacity="0.18" />
          <path d="M100 50 Q150 46 182 60 Q150 64 120 58Z" fill={c.dark} />
          <circle cx="100" cy="13" r="5" fill={c.light} />
        </g>
      );
    case 'chef':
      return (
        <g>
          <rect x="62" y="22" width="76" height="20" rx="6" fill="#fff" stroke="#e3e7f3" />
          <circle cx="72" cy="12" r="16" fill="#fff" />
          <circle cx="100" cy="2" r="20" fill="#fff" />
          <circle cx="128" cy="12" r="16" fill="#fff" />
          <path d="M66 22 Q100 30 134 22" stroke="#e3e7f3" strokeWidth="2" fill="none" />
        </g>
      );
    case 'crown':
      return (
        <g className="robot__crown">
          <path d="M66 36 L70 6 L86 22 L100 0 L114 22 L130 6 L134 36 Z" fill="#fcc419" stroke="#f08c00" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="100" cy="24" r="5" fill="#f03e3e" />
          <circle cx="80" cy="28" r="3.5" fill="#4dabf7" />
          <circle cx="120" cy="28" r="3.5" fill="#4dabf7" />
        </g>
      );
    case 'headset':
      return (
        <g>
          <path d="M34 76 Q34 6 100 6 Q166 6 166 76" stroke="#343a63" strokeWidth="8" fill="none" strokeLinecap="round" />
          <rect x="24" y="60" width="20" height="36" rx="9" fill="#343a63" />
          <rect x="156" y="60" width="20" height="36" rx="9" fill="#343a63" />
          <path d="M34 92 Q40 122 76 120" stroke="#343a63" strokeWidth="4" fill="none" strokeLinecap="round" />
          <circle cx="78" cy="120" r="6" fill="#ff922b" />
        </g>
      );
    case 'bow':
      return (
        <g transform="translate(134 30) rotate(18)" className="robot__bow">
          <path d="M0 0 L-24 -14 Q-30 0 -24 14 Z" fill="#ff6b9a" />
          <path d="M0 0 L24 -14 Q30 0 24 14 Z" fill="#ff6b9a" />
          <circle r="7" fill="#f06595" />
        </g>
      );
    default:
      return null;
  }
}

export default function Robot({ mood = 'happy', color = 'blue', acc = 'none', head = false, size = 120, className = '', title, live = false }) {
  const c = robotColor(color);
  const uid = `rb${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const vb = head ? '22 -8 156 146' : '0 -10 200 230';
  const h = head ? size * (146 / 156) : size * 1.15;
  const hatted = acc === 'cap' || acc === 'chef' || acc === 'crown';
  return (
    <svg
      viewBox={vb}
      width={size}
      height={h}
      className={`robot ${live ? 'robot--live' : ''} ${className}`}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : 'true'}
    >
      <defs>
        <linearGradient id={`${uid}-head`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e6eaf7" />
        </linearGradient>
        <linearGradient id={`${uid}-visor`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#2a3a7a" />
          <stop offset="1" stopColor="#131b42" />
        </linearGradient>
        <linearGradient id={`${uid}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c.light} />
          <stop offset="0.35" stopColor={c.main} />
          <stop offset="1" stopColor={c.dark} />
        </linearGradient>
        <radialGradient id={`${uid}-eye`} cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#b8fff5" />
          <stop offset="0.55" stopColor="#3ff0d8" />
          <stop offset="1" stopColor="#12b8a6" />
        </radialGradient>
        <radialGradient id={`${uid}-glow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd43b" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ff922b" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g className="robot__float">
        {!head && <ellipse cx="100" cy="212" rx="46" ry="7" fill="#1e2a5a" opacity="0.12" className="robot__shadow" />}
        {!head && (
          <g>
            <Arms mood={mood} c={c} uid={uid} />
            <rect x="88" y="118" width="24" height="14" rx="5" fill="#c5cbe3" />
            <rect x="62" y="128" width="76" height="64" rx="26" fill={`url(#${uid}-body)`} />
            <path d="M70 140 Q74 132 86 131" stroke="#fff" strokeOpacity="0.35" strokeWidth="5" strokeLinecap="round" fill="none" />
            <rect x="80" y="142" width="40" height="28" rx="10" fill="#fff" />
            <g className="robot__chat">
              <circle cx="91" cy="156" r="3.2" fill={c.main} />
              <circle cx="100" cy="156" r="3.2" fill={c.main} />
              <circle cx="109" cy="156" r="3.2" fill={c.main} />
            </g>
            <rect x="72" y="188" width="18" height="12" rx="6" fill="#1e2a5a" />
            <rect x="110" y="188" width="18" height="12" rx="6" fill="#1e2a5a" />
          </g>
        )}
        {/* เสาอากาศ */}
        {!hatted && (
          <g>
            <line x1="100" y1="30" x2="100" y2="12" stroke="#c5cbe3" strokeWidth="5" strokeLinecap="round" />
            <circle cx="100" cy="11" r="16" fill={`url(#${uid}-glow)`} className="bot-light" />
            <circle cx="100" cy="11" r="8" fill="#ff922b" />
            <circle cx="97" cy="8" r="2.5" fill="#fff" opacity="0.8" />
          </g>
        )}
        {/* หู */}
        {acc !== 'headset' && (
          <>
            <circle cx="40" cy="78" r="15" fill={`url(#${uid}-body)`} />
            <circle cx="40" cy="78" r="7" fill={c.light} />
            <circle cx="160" cy="78" r="15" fill={`url(#${uid}-body)`} />
            <circle cx="160" cy="78" r="7" fill={c.light} />
          </>
        )}
        {/* หัว */}
        <rect x="42" y="28" width="116" height="98" rx="44" fill={`url(#${uid}-head)`} />
        <rect x="56" y="44" width="88" height="66" rx="30" fill={`url(#${uid}-visor)`} />
        <path d="M64 52 Q72 46 86 46" stroke="#fff" strokeOpacity="0.3" strokeWidth="5" strokeLinecap="round" fill="none" />
        <Eyes mood={mood} uid={uid} />
        <Mouth mood={mood} />
        <ellipse cx="62" cy="114" rx="8" ry="4.5" fill="#ff8fab" opacity="0.75" />
        <ellipse cx="138" cy="114" rx="8" ry="4.5" fill="#ff8fab" opacity="0.75" />
        <Accessory acc={acc} c={c} />
      </g>
    </svg>
  );
}
