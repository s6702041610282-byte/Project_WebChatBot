/**
 * ตัวละครนักเรียน/ลูกค้าสไตล์อนิเมะ (SVG ครึ่งตัวในกรอบวงกลม)
 * kind : girl | boy | teacher | woman | man | grandma | grandpa | barista | nurse
 * seed : เลขสำหรับสลับสีผม/เสื้อ ให้ตัวละครหลากหลาย
 * mood : neutral | happy | love | confused | angry
 */
const SKINS = ['#ffe0c7', '#f9d2b0', '#eec19c', '#ffd8bf'];
const HAIRS = ['#2b2340', '#5c3b28', '#3b2d63', '#7a4a2a', '#1f2b4d'];
const SHIRTS = ['#4c6ef5', '#7950f2', '#12b886', '#f783ac', '#339af0', '#ff922b', '#845ef7'];
const BGS = ['#e7ecff', '#efe9ff', '#e3f6ff', '#fff0e6', '#e6fcf5', '#fff0f6'];

const pick = (arr, n) => arr[Math.abs(n) % arr.length];

function Hair({ kind, color }) {
  switch (kind) {
    case 'girl':
    case 'woman':
    case 'nurse':
      return (
        <path d="M27 47 Q25 21 50 20 Q75 21 73 47 Q70 37 62 33 Q56 40 45 36 Q38 41 31 38 Q28 42 27 47Z" fill={color} />
      );
    case 'teacher':
      return <path d="M27 46 Q26 21 50 20 Q74 21 73 46 Q64 30 50 32 Q36 30 27 46Z" fill={color} />;
    case 'grandma':
      return <path d="M28 44 Q29 23 50 22 Q71 23 72 44 Q62 31 50 32 Q38 31 28 44Z" fill="#d7dbe6" />;
    case 'grandpa':
      return (
        <g fill="#d7dbe6">
          <path d="M27 48 Q26 36 33 32 Q34 40 31 49Z" />
          <path d="M73 48 Q74 36 67 32 Q66 40 69 49Z" />
        </g>
      );
    default:
      // boy / man / barista — ผมสั้นปลายแหลม
      return <path d="M27 46 Q24 22 46 19 Q60 15 70 26 Q76 34 73 46 Q70 36 64 33 L60 38 L55 32 L48 38 L43 32 L36 39 Q30 38 27 46Z" fill={color} />;
  }
}

function BackHair({ kind, color }) {
  if (kind === 'girl' || kind === 'woman' || kind === 'nurse') {
    return <path d="M25 46 Q22 80 32 88 H68 Q78 80 75 46Z" fill={color} />;
  }
  if (kind === 'teacher') return <circle cx="50" cy="20" r="9" fill={color} />;
  if (kind === 'grandma') return <circle cx="50" cy="20" r="9" fill="#d7dbe6" />;
  return null;
}

function Face({ mood, old }) {
  const ink = '#2b2340';
  const eyes =
    mood === 'love' ? (
      <g stroke={ink} strokeWidth="2.4" strokeLinecap="round" fill="none">
        <path d="M37 51 Q41 46 45 51" />
        <path d="M55 51 Q59 46 63 51" />
      </g>
    ) : (
      <g>
        {[41, 59].map((x, i) => (
          <g key={x}>
            <ellipse cx={x} cy="51" rx={old ? 3 : 4.4} ry={old ? 3.4 : mood === 'confused' && i === 1 ? 4 : 5.6} fill={ink} />
            {!old && <ellipse cx={x} cy="53" rx="2.6" ry="2.8" fill="#5b4bc4" />}
            <circle cx={x - 1.5} cy="48.6" r="1.5" fill="#fff" />
          </g>
        ))}
      </g>
    );
  let mouth = <path d="M46 62 H54" stroke={ink} strokeWidth="2" strokeLinecap="round" />;
  if (mood === 'happy') mouth = <path d="M45 61 Q50 65.5 55 61" stroke={ink} strokeWidth="2" fill="none" strokeLinecap="round" />;
  if (mood === 'love') mouth = <path d="M44 60 Q50 68 56 60 Z" fill="#e8590c" />;
  if (mood === 'confused') mouth = <path d="M45 63 q2.5 -2.5 5 0 q2.5 2.5 5 0" stroke={ink} strokeWidth="2" fill="none" strokeLinecap="round" />;
  if (mood === 'angry') mouth = <path d="M45 64 Q50 59.5 55 64" stroke={ink} strokeWidth="2.2" fill="none" strokeLinecap="round" />;
  return (
    <g>
      {mood === 'angry' && (
        <g stroke={ink} strokeWidth="2.2" strokeLinecap="round">
          <path d="M36 43 L45 46" />
          <path d="M64 43 L55 46" />
        </g>
      )}
      {old && mood !== 'angry' && (
        <g stroke="#9aa3b8" strokeWidth="1.8" strokeLinecap="round">
          <path d="M36 43 H45" />
          <path d="M55 43 H64" />
        </g>
      )}
      {eyes}
      {mouth}
      <ellipse cx="35" cy="59" rx="4.2" ry="2.2" fill="#ff6b8b" opacity={mood === 'love' ? 0.6 : 0.3} />
      <ellipse cx="65" cy="59" rx="4.2" ry="2.2" fill="#ff6b8b" opacity={mood === 'love' ? 0.6 : 0.3} />
      {mood === 'confused' && <path d="M73 30 q4 6 0 9 q-4 -3 0 -9z" fill="#74c0fc" />}
      {mood === 'angry' && (
        <g stroke="#f03e3e" strokeWidth="2" strokeLinecap="round">
          <path d="M70 28 l4 4 M74 28 l-4 4" />
        </g>
      )}
    </g>
  );
}

function Accessory({ kind }) {
  if (kind === 'teacher') {
    return (
      <g stroke="#2b2340" strokeWidth="1.6" fill="none">
        <circle cx="41" cy="51" r="7" />
        <circle cx="59" cy="51" r="7" />
        <path d="M48 51 H52" />
      </g>
    );
  }
  if (kind === 'grandpa' || kind === 'grandma') {
    return (
      <g stroke="#7c6a55" strokeWidth="1.6" fill="none">
        <rect x="34" y="46" width="13" height="10" rx="4" />
        <rect x="53" y="46" width="13" height="10" rx="4" />
        <path d="M47 50 H53" />
      </g>
    );
  }
  if (kind === 'barista') {
    return (
      <g>
        <path d="M26 30 Q50 10 74 30 Z" fill="#7c4a2d" />
        <rect x="24" y="28" width="52" height="6" rx="3" fill="#5c361f" />
      </g>
    );
  }
  if (kind === 'nurse') {
    return (
      <g>
        <path d="M32 24 L36 14 H64 L68 24 Z" fill="#fff" stroke="#e5e7f0" strokeWidth="1" />
        <rect x="48" y="15" width="4" height="8" fill="#f03e3e" />
        <rect x="46" y="17" width="8" height="4" fill="#f03e3e" />
      </g>
    );
  }
  return null;
}

export default function Person({ kind = 'girl', seed = 0, mood = 'neutral', size = 56, className = '', title }) {
  const old = kind === 'grandma' || kind === 'grandpa';
  const skin = pick(SKINS, seed);
  const hair = pick(HAIRS, seed + 1);
  const shirt = kind === 'nurse' ? '#f8f9fc' : kind === 'barista' ? '#a9714b' : kind === 'teacher' ? '#5f3dc4' : pick(SHIRTS, seed);
  const bg = kind === 'nurse' ? '#fff0f6' : pick(BGS, seed + 2);
  const clip = `pc-${kind}-${seed}`;
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`person ${className}`}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : 'true'}
    >
      <defs>
        <clipPath id={clip}>
          <circle cx="50" cy="50" r="50" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <rect width="100" height="100" fill={bg} />
        <BackHair kind={kind} color={hair} />
        <path d="M14 104 Q16 76 50 74 Q84 76 86 104Z" fill={shirt} />
        {kind === 'nurse' && <path d="M42 76 L50 86 L58 76" stroke="#f783ac" strokeWidth="3" fill="none" />}
        {(kind === 'boy' || kind === 'girl') && <path d="M44 75 L50 84 L56 75" fill="#fff" />}
        {kind === 'barista' && <rect x="38" y="80" width="24" height="24" rx="4" fill="#5c361f" />}
        <rect x="44" y="62" width="12" height="14" rx="5" fill={skin} />
        <ellipse cx="28" cy="52" rx="4" ry="6" fill={skin} />
        <ellipse cx="72" cy="52" rx="4" ry="6" fill={skin} />
        <ellipse cx="50" cy="48" rx="22" ry="23.5" fill={skin} />
        <Hair kind={kind} color={hair} />
        <Face mood={mood} old={old} />
        <Accessory kind={kind} />
      </g>
    </svg>
  );
}
