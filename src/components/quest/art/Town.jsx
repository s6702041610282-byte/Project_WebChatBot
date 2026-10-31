import { useId } from 'react';

/**
 * ชิ้นส่วนฉากเมืองการ์ตูน (SVG) — ใช้ร่วมกันใน MissionScene และ TownMap
 * อาคารทุกหลังวาดโดยให้จุด (0,0) อยู่ที่พื้นกึ่งกลางอาคาร (ตัวอาคารอยู่ที่ y ติดลบ)
 * การขยับใช้ CSS (คลาส tw-*) บนกลุ่มชั้นใน — ตำแหน่งใช้ transform ของกลุ่มชั้นนอกเสมอ
 */
const sid = () => `t${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

export function Cloud({ x, y, s = 1, slow }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className={`tw-cloud ${slow ? 'tw-cloud--slow' : ''}`} fill="#fff">
        <ellipse cx="0" cy="0" rx="34" ry="12" />
        <ellipse cx="14" cy="-9" rx="18" ry="13" />
        <ellipse cx="-12" cy="-5" rx="14" ry="10" />
        <ellipse cx="0" cy="4" rx="30" ry="6" fill="#e7ecff" />
      </g>
    </g>
  );
}

export function Tree({ x, y, s = 1, c = '#40c057', d = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="1" rx="16" ry="4" fill="#1b2559" opacity="0.1" />
      <rect x="-3.5" y="-20" width="7" height="21" rx="2" fill="#8d5b3a" />
      <g className="tw-sway" style={{ animationDelay: `${d}s` }}>
        <circle cx="0" cy="-32" r="17" fill={c} />
        <circle cx="-11" cy="-24" r="11" fill={c} />
        <circle cx="11" cy="-25" r="11" fill={c} />
        <circle cx="-5" cy="-39" r="8" fill="#fff" opacity="0.18" />
        <circle cx="8" cy="-22" r="7" fill="#000" opacity="0.07" />
      </g>
    </g>
  );
}

export function Bush({ x, y, s = 1, c = '#51cf66' }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="-8" cy="-6" rx="10" ry="8" fill={c} />
      <ellipse cx="6" cy="-7" rx="11" ry="9" fill={c} />
      <ellipse cx="0" cy="-3" rx="16" ry="5" fill="#37b24d" />
      <circle cx="-4" cy="-10" r="2" fill="#ff8fab" />
      <circle cx="8" cy="-12" r="2" fill="#fff" />
    </g>
  );
}

export function Lamp({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-1.5" y="-46" width="3" height="46" fill="#495057" />
      <path d="M-1 -46 q0 -8 10 -8" stroke="#495057" strokeWidth="3" fill="none" />
      <circle cx="10" cy="-50" r="4" fill="#ffe066" className="tw-glow" />
    </g>
  );
}

/** คนเดินเล่น (เดินจากซ้ายไปขวาวนไปเรื่อย ๆ ระยะ dist) */
export function Walker({ x, y, shirt = '#4c6ef5', hair = '#2b2340', skin = '#ffd8bf', dur = 14, delay = 0, dist = 120, flip, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <g className="tw-walk" style={{ '--dist': `${dist}px`, animationDuration: `${dur}s`, animationDelay: `${delay}s` }}>
        <g className="tw-bob">
          <ellipse cx="0" cy="0.5" rx="7" ry="1.6" fill="#1b2559" opacity="0.12" />
          <g className="tw-leg" style={{ transformOrigin: '0px -9px' }}>
            <rect x="-2.5" y="-9" width="3" height="9" rx="1.5" fill="#343a63" />
          </g>
          <g className="tw-leg tw-leg--b" style={{ transformOrigin: '0px -9px' }}>
            <rect x="-0.5" y="-9" width="3" height="9" rx="1.5" fill="#495082" />
          </g>
          <rect x="-5" y="-21" width="10" height="13" rx="4" fill={shirt} />
          <circle cx="0" cy="-26" r="5.5" fill={skin} />
          <path d="M-5.5 -27 q0 -7 5.5 -7 q6 0 6 6 q-3 -2 -6 -2 q-3 0 -5.5 3z" fill={hair} />
        </g>
      </g>
    </g>
  );
}

/* ---------- ร้านกาแฟ CED Coffee ---------- */
export function CoffeeShop() {
  const u = sid();
  return (
    <g>
      <defs>
        <linearGradient id={`${u}w`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff4e2" />
          <stop offset="1" stopColor="#f3d6ab" />
        </linearGradient>
        <linearGradient id={`${u}g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe9b8" />
          <stop offset="1" stopColor="#f7b267" />
        </linearGradient>
      </defs>
      <ellipse cx="0" cy="2" rx="126" ry="6" fill="#1b2559" opacity="0.1" />
      {/* ตัวอาคาร */}
      <rect x="-100" y="-122" width="200" height="122" fill={`url(#${u}w)`} />
      {[-104, -90, -76].map((yy, i) => (
        <g key={yy} stroke="#e8c894" strokeWidth="1" opacity="0.7">
          <line x1={-100 + (i % 2) * 14} y1={yy} x2={-80 + (i % 2) * 14} y2={yy} />
          <line x1={60 - (i % 2) * 12} y1={yy} x2={84 - (i % 2) * 12} y2={yy} />
        </g>
      ))}
      {/* หน้าต่างชั้นบน */}
      {[-58, 0, 58].map((wx) => (
        <g key={wx} transform={`translate(${wx} -110)`}>
          <path d="M-16 24 V2 a16 14 0 0 1 32 0 V24Z" fill="#a5d8ff" stroke="#8d5b3a" strokeWidth="3" />
          <path d="M-10 18 V4 a10 8 0 0 1 8 -6" stroke="#fff" strokeWidth="2" opacity="0.6" fill="none" />
          <rect x="-19" y="22" width="38" height="7" rx="2" fill="#8d5b3a" />
          <circle cx="-10" cy="20" r="3.5" fill="#ff6b6b" />
          <circle cx="0" cy="19" r="3.5" fill="#ffd43b" />
          <circle cx="10" cy="20" r="3.5" fill="#ff8fab" />
        </g>
      ))}
      {/* หลังคาและป้าย */}
      <rect x="-108" y="-134" width="216" height="14" rx="3" fill="#6b3e26" />
      <rect x="-108" y="-122" width="216" height="3" fill="#4a2a19" />
      <g transform="translate(0 -150)">
        <rect x="-64" y="-12" width="128" height="26" rx="8" fill="#3b2416" />
        <rect x="-60" y="-8" width="120" height="18" rx="5" fill="none" stroke="#ffd8a8" strokeWidth="1" opacity="0.5" />
        <text x="6" y="6" textAnchor="middle" className="tw-sign" fill="#ffd8a8">
          CED COFFEE
        </text>
        <path d="M-52 -3 h10 v6 a5 5 0 0 1 -10 0z M-42 -1 a3 3 0 0 1 0 6" fill="#ffd8a8" stroke="#ffd8a8" strokeWidth="1" />
      </g>
      {/* กันสาด */}
      <path d="M-108 -78 H108 L100 -56 H-100Z" fill="#ff922b" />
      {Array.from({ length: 8 }).map((_, k) => (
        <path key={k} d={`M${-100 + k * 25} -78 h12 l-1 22 h-12z`} fill="#fff4e6" />
      ))}
      <path
        d={`M-100 -56 ${Array.from({ length: 8 })
          .map(() => 'q12.5 10 25 0')
          .join(' ')}`}
        fill="#ff922b"
      />
      {/* ไฟประดับ */}
      <path d="M-100 -50 Q-50 -40 0 -50 Q50 -40 100 -50" stroke="#495057" strokeWidth="1" fill="none" />
      {[-84, -60, -36, -12, 12, 36, 60, 84].map((lx, k) => (
        <circle key={lx} cx={lx} cy={-46 + Math.abs(Math.sin(k)) * 2} r="2.6" fill={['#ffe066', '#ff8fab', '#74c0fc'][k % 3]} className="tw-twinkle" style={{ animationDelay: `${k * 0.25}s` }} />
      ))}
      {/* หน้าต่างร้าน + บาริสต้าบอท */}
      <rect x="-92" y="-40" width="78" height="38" rx="3" fill={`url(#${u}g)`} />
      <rect x="-92" y="-14" width="78" height="12" fill="#a0673d" />
      <g transform="translate(-60 -18)">
        <rect x="-10" y="-14" width="20" height="16" rx="7" fill="#fff" />
        <rect x="-7" y="-11" width="14" height="9" rx="4" fill="#1e2a5a" />
        <circle cx="-3" cy="-7" r="1.8" fill="#5ff5e0" className="tw-blink" />
        <circle cx="3" cy="-7" r="1.8" fill="#5ff5e0" className="tw-blink" />
        <line x1="0" y1="-14" x2="0" y2="-19" stroke="#c5cbe3" strokeWidth="1.5" />
        <circle cx="0" cy="-20" r="2" fill="#ff922b" />
      </g>
      <rect x="-34" y="-34" width="12" height="20" rx="2" fill="#495057" />
      <path d="M-92 -40 l20 0 l-26 38z" fill="#fff" opacity="0.25" />
      <rect x="-94" y="-42" width="82" height="42" rx="3" fill="none" stroke="#6b3e26" strokeWidth="3" />
      {/* ประตู */}
      <rect x="-4" y="-46" width="34" height="46" rx="3" fill="#7c4a2d" />
      <rect x="2" y="-40" width="22" height="20" rx="2" fill="#ffe9b8" opacity="0.9" />
      <circle cx="24" cy="-18" r="2" fill="#ffd43b" />
      <text x="13" y="-28" textAnchor="middle" className="tw-tiny" fill="#7c4a2d">
        OPEN
      </text>
      {/* ตู้โชว์ */}
      <rect x="40" y="-40" width="52" height="38" rx="3" fill={`url(#${u}g)`} />
      <path d="M48 -18 h10 v6 a5 5 0 0 1 -10 0z" fill="#fff" />
      <path d="M66 -16 q8 -10 16 0 q-8 6 -16 0z" fill="#e8a33d" />
      <rect x="40" y="-12" width="52" height="4" fill="#a0673d" />
      <rect x="38" y="-42" width="56" height="42" rx="3" fill="none" stroke="#6b3e26" strokeWidth="3" />
      {/* ไอน้ำจากถ้วย */}
      <g transform="translate(53 -22)" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round">
        <path d="M0 0 q-3 -4 0 -8" className="tw-steam" />
        <path d="M5 0 q-3 -4 0 -8" className="tw-steam" style={{ animationDelay: '0.6s' }} />
      </g>
      {/* กระถางต้นไม้ */}
      {[-14, 40].map((px) => (
        <g key={px} transform={`translate(${px === -14 ? -12 : 36} 0)`}>
          <path d="M-6 0 l2 -10 h8 l2 10z" fill="#c2410c" />
          <circle cx="0" cy="-14" r="6" fill="#40c057" />
        </g>
      ))}
      {/* ป้ายเมนู */}
      <g transform="translate(-118 0)">
        <path d="M-10 0 L-6 -30 H6 L10 0" stroke="#8d5b3a" strokeWidth="2" fill="none" />
        <rect x="-8" y="-30" width="16" height="22" rx="2" fill="#343a40" />
        <path d="M-5 -24 h10 M-5 -19 h8 M-5 -14 h10" stroke="#fff" strokeWidth="1.2" />
      </g>
    </g>
  );
}

/* ---------- วิทยาลัย / ฝ่ายทะเบียน ---------- */
export function School() {
  const u = sid();
  return (
    <g>
      <defs>
        <linearGradient id={`${u}w`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbfcff" />
          <stop offset="1" stopColor="#e3e9fb" />
        </linearGradient>
        <linearGradient id={`${u}g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d0ebff" />
          <stop offset="1" stopColor="#74c0fc" />
        </linearGradient>
      </defs>
      <ellipse cx="0" cy="2" rx="150" ry="7" fill="#1b2559" opacity="0.1" />
      {/* ปีกอาคาร */}
      {[-1, 1].map((side) => (
        <g key={side} transform={`translate(${side * 82} 0)`}>
          <rect x="-50" y="-104" width="100" height="104" fill={`url(#${u}w)`} />
          <rect x="-54" y="-112" width="108" height="10" rx="2" fill="#364fc7" />
          {[0, 1].map((r) =>
            [-34, -11, 12, 35].map((wx) => (
              <g key={`${r}${wx}`} transform={`translate(${wx} ${-90 + r * 38})`}>
                <rect x="-8" y="-12" width="16" height="22" rx="2" fill={`url(#${u}g)`} />
                <path d="M-8 -1 h16 M0 -12 v22" stroke="#fff" strokeWidth="1.5" />
                <rect x="-10" y="10" width="20" height="3" rx="1" fill="#bac8ff" />
                {(wx + r * 7) % 3 === 0 && <rect x="-8" y="-12" width="16" height="22" rx="2" fill="#fff3bf" opacity="0.7" className="tw-twinkle" style={{ animationDelay: `${wx * 0.05}s` }} />}
              </g>
            ))
          )}
        </g>
      ))}
      {/* หอนาฬิกา */}
      <rect x="-34" y="-150" width="68" height="150" fill="#f8f9ff" />
      <path d="M-42 -148 L0 -182 L42 -148Z" fill="#364fc7" />
      <path d="M-42 -148 L0 -182 L8 -176 L-28 -148Z" fill="#fff" opacity="0.15" />
      <g transform="translate(0 -128)">
        <circle r="15" fill="#fff" stroke="#364fc7" strokeWidth="3" />
        <line x1="0" y1="0" x2="0" y2="-9" stroke="#1b2559" strokeWidth="2" strokeLinecap="round" className="tw-hand-m" />
        <line x1="0" y1="0" x2="6" y2="0" stroke="#1b2559" strokeWidth="2.5" strokeLinecap="round" className="tw-hand-h" />
        <circle r="2" fill="#f76707" />
      </g>
      <line x1="0" y1="-182" x2="0" y2="-210" stroke="#868e96" strokeWidth="2" />
      <g transform="translate(0 -210)">
        <path d="M0 0 h22 l-5 6 l5 6 h-22z" fill="#fa5252" className="tw-flag" />
      </g>
      {/* ป้าย Help Desk + ทางเข้า */}
      <rect x="-30" y="-86" width="60" height="16" rx="5" fill="#ff922b" />
      <text x="0" y="-74.5" textAnchor="middle" className="tw-sign tw-sign--s" fill="#fff">
        HELP DESK
      </text>
      <rect x="-24" y="-62" width="48" height="56" rx="3" fill="#1c3a8c" />
      <rect x="-20" y="-58" width="19" height="48" rx="2" fill={`url(#${u}g)`} />
      <rect x="1" y="-58" width="19" height="48" rx="2" fill={`url(#${u}g)`} />
      <rect x="-30" y="-62" width="4" height="62" fill="#dbe4ff" />
      <rect x="26" y="-62" width="4" height="62" fill="#dbe4ff" />
      <rect x="-38" y="-6" width="76" height="6" fill="#ced4da" />
      <rect x="-44" y="-2" width="88" height="3" fill="#adb5bd" />
      {/* จักรยาน */}
      <g transform="translate(118 -2)" stroke="#495057" strokeWidth="1.6" fill="none">
        <circle cx="-8" cy="-6" r="6" />
        <circle cx="8" cy="-6" r="6" />
        <path d="M-8 -6 l6 -9 h8 l2 9 M-2 -15 l-2 -3" stroke="#f03e3e" />
      </g>
    </g>
  );
}

/* ---------- โรงพยาบาล / คลินิก ---------- */
export function Hospital() {
  const u = sid();
  return (
    <g>
      <defs>
        <linearGradient id={`${u}w`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#edf0f7" />
        </linearGradient>
        <linearGradient id={`${u}g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e7f5ff" />
          <stop offset="1" stopColor="#91c8f5" />
        </linearGradient>
      </defs>
      <ellipse cx="0" cy="2" rx="140" ry="7" fill="#1b2559" opacity="0.1" />
      <rect x="-112" y="-150" width="224" height="150" rx="4" fill={`url(#${u}w)`} />
      <rect x="-112" y="-150" width="224" height="10" rx="4" fill="#e64980" />
      <rect x="-30" y="-150" width="60" height="150" fill="#fff0f6" />
      {/* แถบหน้าต่าง */}
      {[-128, -98, -68].map((wy) => (
        <g key={wy}>
          <rect x="-104" y={wy} width="68" height="20" rx="3" fill={`url(#${u}g)`} />
          <rect x="36" y={wy} width="68" height="20" rx="3" fill={`url(#${u}g)`} />
          {[-87, -70, -53, 53, 70, 87].map((mx) => (
            <rect key={mx} x={mx} y={wy} width="2" height="20" fill="#fff" />
          ))}
        </g>
      ))}
      <rect x="-104" y="-98" width="20" height="20" rx="3" fill="#fff3bf" className="tw-twinkle" />
      <rect x="70" y="-128" width="16" height="20" rx="1" fill="#fff3bf" className="tw-twinkle" style={{ animationDelay: '1.2s' }} />
      {/* ป้ายกากบาท */}
      <g transform="translate(0 -170)">
        <circle r="24" fill="#ff6b6b" opacity="0.25" className="tw-pulse" />
        <circle r="17" fill="#fff" stroke="#e64980" strokeWidth="3" />
        <rect x="-4" y="-11" width="8" height="22" rx="2" fill="#fa5252" />
        <rect x="-11" y="-4" width="22" height="8" rx="2" fill="#fa5252" />
      </g>
      <rect x="-24" y="-118" width="48" height="12" rx="4" fill="#e64980" />
      <text x="0" y="-109" textAnchor="middle" className="tw-sign tw-sign--s" fill="#fff">
        CLINIC
      </text>
      {/* ทางเข้า */}
      <path d="M-46 -54 H46 L52 -44 H-52Z" fill="#e64980" />
      <rect x="-26" y="-44" width="52" height="44" fill={`url(#${u}g)`} />
      <rect x="-1" y="-44" width="2" height="44" fill="#fff" />
      <rect x="-30" y="-44" width="4" height="44" fill="#dee2e6" />
      <rect x="26" y="-44" width="4" height="44" fill="#dee2e6" />
      {/* ทางลาด */}
      <path d="M30 0 L80 -12 V0Z" fill="#dee2e6" />
      <path d="M32 -10 L80 -22" stroke="#868e96" strokeWidth="2" />
      {/* ม้านั่ง */}
      <g transform="translate(-82 0)">
        <rect x="-16" y="-12" width="32" height="4" rx="2" fill="#a9714b" />
        <rect x="-16" y="-20" width="32" height="3" rx="1.5" fill="#a9714b" />
        <rect x="-14" y="-8" width="3" height="8" fill="#868e96" />
        <rect x="11" y="-8" width="3" height="8" fill="#868e96" />
      </g>
    </g>
  );
}

/** รถพยาบาล (ไฟกะพริบ) */
export function Ambulance({ x, y, s = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x="-26" y="-24" width="52" height="22" rx="5" fill="#fff" stroke="#e9ecef" />
      <path d="M14 -24 h8 a6 6 0 0 1 6 6 v16 h-14z" fill="#fff" stroke="#e9ecef" />
      <rect x="16" y="-21" width="9" height="8" rx="2" fill="#a5d8ff" />
      <rect x="-26" y="-12" width="54" height="3" fill="#fa5252" />
      <rect x="-12" y="-21" width="4" height="10" fill="#fa5252" />
      <rect x="-15" y="-18" width="10" height="4" fill="#fa5252" />
      <rect x="-6" y="-28" width="6" height="4" rx="1" fill="#f03e3e" className="tw-siren" />
      <rect x="1" y="-28" width="6" height="4" rx="1" fill="#339af0" className="tw-siren tw-siren--b" />
      <circle cx="-14" cy="-1" r="5" fill="#343a40" />
      <circle cx="16" cy="-1" r="5" fill="#343a40" />
    </g>
  );
}

/** รถตู้บอทวิ่งบนถนน */
export function BotVan({ s = 1 }) {
  return (
    <g transform={`scale(${s})`}>
      <ellipse cx="0" cy="2" rx="30" ry="3" fill="#1b2559" opacity="0.15" />
      <path d="M-30 -6 v-16 a8 8 0 0 1 8 -8 h30 l14 12 h4 a4 4 0 0 1 4 4 v8z" fill="#3b5bdb" />
      <path d="M10 -30 l12 11 h-12z" fill="#a5d8ff" />
      <rect x="-22" y="-26" width="26" height="11" rx="3" fill="#a5d8ff" />
      <rect x="-30" y="-10" width="60" height="4" fill="#2b44b0" />
      <g transform="translate(-9 -21)">
        <rect x="-5" y="-4" width="10" height="8" rx="3" fill="#1e2a5a" />
        <circle cx="-2" cy="0" r="1.2" fill="#5ff5e0" />
        <circle cx="2" cy="0" r="1.2" fill="#5ff5e0" />
      </g>
      <g className="tw-wheel">
        <circle cx="-16" cy="-4" r="6" fill="#343a40" />
        <circle cx="-16" cy="-4" r="2" fill="#adb5bd" />
      </g>
      <g className="tw-wheel">
        <circle cx="18" cy="-4" r="6" fill="#343a40" />
        <circle cx="18" cy="-4" r="2" fill="#adb5bd" />
      </g>
    </g>
  );
}

export const BUILDINGS = { coffee: CoffeeShop, helpdesk: School, care: Hospital };
