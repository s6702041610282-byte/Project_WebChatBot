import { useEffect, useId, useRef } from 'react';

/**
 * "น้องบอท" — มาสคอตหุ่นยนต์ประจำเว็บไซต์ (ภาพ SVG วาดขึ้นใหม่ทั้งหมด)
 * - ลอยขึ้นลง โบกมือ กะพริบตา ไฟเสาอากาศเรืองแสง
 * - ดวงตามองตามเมาส์ (ปิดได้ด้วย followCursor={false})
 *
 * @param {number}  size          ความกว้างเป็นพิกเซล
 * @param {boolean} followCursor  ให้ดวงตามองตามเมาส์หรือไม่
 * @param {boolean} headset       สวมหูฟังพร้อมไมค์ (แบบพนักงานตอบแชท)
 * @param {boolean} holdBubble    ถือป้ายฟองแชท "Hi!" ไว้ในมือที่โบก
 * @param {string}  className     คลาสเพิ่มเติม
 */
export default function Mascot({ size = 180, followCursor = true, headset = false, holdBubble = false, className = '' }) {
  const svgRef = useRef(null);
  const eyesRef = useRef(null);
  const uid = useId().replace(/:/g, '');

  useEffect(() => {
    if (!followCursor) return undefined;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return undefined;

    let frame = 0;
    const onMove = (e) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const svg = svgRef.current;
        const eyes = eyesRef.current;
        if (!svg || !eyes) return;
        const rect = svg.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height * 0.42;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy) || 1;
        const max = 6;
        const k = Math.min(1, dist / 300);
        eyes.setAttribute('transform', `translate(${((dx / dist) * max * k).toFixed(2)} ${((dy / dist) * max * k * 0.7).toFixed(2)})`);
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
    };
  }, [followCursor]);

  const g = (name) => `${name}-${uid}`;

  return (
    <svg
      ref={svgRef}
      className={`mascot ${className}`}
      width={size}
      height={size * 1.12}
      viewBox="0 0 200 224" overflow="visible"
      role="img"
      aria-label="น้องบอท มาสคอตหุ่นยนต์ของ ChatBot Learning"
    >
      <defs>
        <linearGradient id={g('head')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f2f8ff" />
          <stop offset="1" stopColor="#b9d6ff" />
        </linearGradient>
        <linearGradient id={g('body')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#dbeafe" />
          <stop offset="1" stopColor="#93c5fd" />
        </linearGradient>
        <linearGradient id={g('screen')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0d1745" />
          <stop offset="1" stopColor="#050a24" />
        </linearGradient>
        <radialGradient id={g('bulb')}>
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.45" stopColor="#67e8f9" />
          <stop offset="1" stopColor="#22d3ee" stopOpacity="0" />
        </radialGradient>
        <filter id={g('glow')} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* เงาที่พื้น */}
      <ellipse className="mascot__shadow" cx="100" cy="214" rx="46" ry="7" fill="#22d3ee" opacity="0.25" />

      <g className="mascot__float">
        {/* เสาอากาศ */}
        <line x1="100" y1="42" x2="100" y2="20" stroke="#93c5fd" strokeWidth="4" strokeLinecap="round" />
        <circle className="mascot__bulb-glow" cx="100" cy="16" r="16" fill={`url(#${g('bulb')})`} />
        <circle className="mascot__bulb" cx="100" cy="16" r="6.5" fill="#67e8f9" filter={`url(#${g('glow')})`} />

        {/* หู */}
        <rect x="18" y="74" width="20" height="38" rx="10" fill="#60a5fa" />
        <rect x="162" y="74" width="20" height="38" rx="10" fill="#60a5fa" />
        <rect x="22" y="84" width="6" height="18" rx="3" fill="#22d3ee" className="mascot__ear-light" />
        <rect x="172" y="84" width="6" height="18" rx="3" fill="#22d3ee" className="mascot__ear-light" />

        {/* หัว */}
        <rect x="30" y="40" width="140" height="106" rx="46" fill={`url(#${g('head')})`} />
        <path d="M58 50 Q100 38 142 50" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.8" />

        {/* หน้าจอใบหน้า */}
        <rect x="46" y="62" width="108" height="68" rx="30" fill={`url(#${g('screen')})`} />
        <rect x="46" y="62" width="108" height="68" rx="30" fill="none" stroke="#22d3ee" strokeOpacity="0.35" strokeWidth="2" />

        {/* ดวงตา (เคลื่อนตามเมาส์ + กะพริบ) */}
        <g ref={eyesRef} className="mascot__eyes-track">
          <g className="mascot__eyes" filter={`url(#${g('glow')})`}>
            <ellipse cx="78" cy="92" rx="9" ry="11" fill="#67e8f9" />
            <ellipse cx="122" cy="92" rx="9" ry="11" fill="#67e8f9" />
            <circle cx="81" cy="88" r="3" fill="#ffffff" />
            <circle cx="125" cy="88" r="3" fill="#ffffff" />
          </g>
        </g>

        {/* แก้ม + ปาก */}
        <ellipse cx="62" cy="112" rx="8" ry="4.5" fill="#f472b6" opacity="0.55" />
        <ellipse cx="138" cy="112" rx="8" ry="4.5" fill="#f472b6" opacity="0.55" />
        <path d="M88 112 Q100 122 112 112" stroke="#67e8f9" strokeWidth="4" strokeLinecap="round" fill="none" filter={`url(#${g('glow')})`} />

        {/* หูฟังพร้อมไมค์ */}
        {headset && (
          <g className="mascot__headset">
            <path d="M26 88 C22 14 178 14 174 88" fill="none" stroke="#1e3a8a" strokeWidth="9" strokeLinecap="round" />
            <path d="M26 88 C22 14 178 14 174 88" fill="none" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
            <circle cx="26" cy="94" r="17" fill="#1e3a8a" />
            <circle cx="26" cy="94" r="10" fill="#3b82f6" />
            <circle cx="174" cy="94" r="17" fill="#1e3a8a" />
            <circle cx="174" cy="94" r="10" fill="#3b82f6" />
            <path d="M30 108 C34 132 50 136 64 132" fill="none" stroke="#1e3a8a" strokeWidth="5" strokeLinecap="round" />
            <circle className="mascot__mic" cx="67" cy="131" r="6" fill="#38bdf8" />
          </g>
        )}

        {/* แขนซ้าย */}
        <rect x="40" y="156" width="20" height="40" rx="10" fill="#60a5fa" transform="rotate(18 50 158)" />

        {/* ลำตัว */}
        <rect x="60" y="146" width="80" height="60" rx="24" fill={`url(#${g('body')})`} />
        <circle className="mascot__heart" cx="100" cy="174" r="11" fill="#0d1745" />
        <path
          className="mascot__heart"
          d="M100 181 l-6.5 -6.5 a4 4 0 0 1 6.5 -5 a4 4 0 0 1 6.5 5 z"
          fill="#22d3ee"
          filter={`url(#${g('glow')})`}
        />

        {/* แขนขวา (โบกมือ) */}
        <g className="mascot__wave">
          <rect x="140" y="128" width="20" height="44" rx="10" fill="#60a5fa" />
          <circle cx="150" cy="128" r="12" fill="#93c5fd" />
          {holdBubble && (
            <g className="mascot__hold">
              <path d="M128 70 H186 A12 12 0 0 1 198 82 V104 A12 12 0 0 1 186 116 H166 L156 128 L154 116 H128 A12 12 0 0 1 116 104 V82 A12 12 0 0 1 128 70 Z" fill="#38bdf8" stroke="#0ea5e9" strokeWidth="2" />
              <text x="157" y="100" textAnchor="middle" fontFamily="Prompt, sans-serif" fontWeight="700" fontSize="20" fill="#04122e">Hi!</text>
            </g>
          )}
        </g>
      </g>
    </svg>
  );
}
