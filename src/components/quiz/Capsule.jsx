import { useId } from 'react';

/**
 * แคปซูลกาชาปอง (SVG)
 * @param {string}  color   สีหลักของแคปซูล
 * @param {string}  letter  ข้อความบนแคปซูล (เช่น เลขข้อ)
 * @param {boolean} open    เปิดฝาแคปซูลหรือไม่
 * @param {'correct'|'wrong'|null} result  ผลที่แสดงเมื่อเปิดฝา
 */
export default function Capsule({ color, letter, open = false, result = null }) {
  const id = useId().replace(/:/g, '');

  return (
    <svg className={`capsule ${open ? 'is-open' : ''}`} viewBox="0 0 100 100" aria-hidden="true">
      <defs>
        <linearGradient id={`cb-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} />
          <stop offset="1" stopColor={color} stopOpacity="0.75" />
        </linearGradient>
        <radialGradient id={`ct-${id}`} cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="0.35" stopColor={color} stopOpacity="0.45" />
          <stop offset="1" stopColor={color} stopOpacity="0.7" />
        </radialGradient>
      </defs>

      {/* ของรางวัลด้านใน (เห็นเมื่อเปิดฝา) */}
      <g className="capsule__prize">
        <circle cx="50" cy="44" r="20" fill={result === 'correct' ? '#22c55e' : result === 'wrong' ? '#f43f5e' : '#facc15'} />
        {!result && (
          <text x="50" y="53" textAnchor="middle" className="capsule__question">
            ?
          </text>
        )}
        {result === 'correct' && (
          <path d="M40 44 l7 7 l13 -14" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        )}
        {result === 'wrong' && (
          <path d="M42 36 l16 16 M58 36 l-16 16" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
        )}
      </g>

      {/* ครึ่งล่าง */}
      <path d="M6 52 A44 44 0 0 0 94 52 Z" fill={`url(#cb-${id})`} />
      <text x="50" y="82" textAnchor="middle" className="capsule__letter">
        {letter}
      </text>

      {/* ครึ่งบน (ฝาใส) */}
      <g className="capsule__lid">
        <path d="M6 52 A44 44 0 0 1 94 52 Z" fill={`url(#ct-${id})`} />
        <path d="M22 30 Q34 16 52 14" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.85" />
        <rect x="4" y="48" width="92" height="8" rx="4" fill="#ffffff" opacity="0.85" />
      </g>
    </svg>
  );
}
