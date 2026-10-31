import { useMemo } from 'react';

/** สุ่มแบบกำหนดค่าเริ่มต้น (seed) เพื่อให้ตำแหน่งเหมือนเดิมทุกครั้งที่โหลด */
function seeded(seed) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** ฟองแชทลอย (ตกแต่งพื้นหลัง) */
const BUBBLES = [
  { left: 4, top: 14, size: 90, delay: 0, flip: false },
  { left: 88, top: 10, size: 64, delay: 2, flip: true },
  { left: 46, top: 6, size: 48, delay: 4, flip: false },
  { left: 92, top: 62, size: 110, delay: 1, flip: true },
  { left: 2, top: 70, size: 56, delay: 3, flip: false },
  { left: 36, top: 82, size: 70, delay: 5, flip: true }
];

/** ฟองแชทสำหรับหัวหน้าย่อย (อยู่ด้านขวาและต่ำกว่าแถบเมนู) */
const HEADER_BUBBLES = [
  { left: 66, top: 44, size: 56, delay: 0, flip: true },
  { left: 82, top: 52, size: 86, delay: 1.5, flip: false },
  { left: 56, top: 70, size: 40, delay: 3, flip: false }
];

/**
 * ฉากหลังธีมแชทบอท: ฟองแชทกระจกลอย จุดแสงระยิบ ลำแสง และคลื่นด้านล่าง
 * @param {'hero'|'header'} variant  hero = หน้าแรก, header = หัวหน้าย่อย
 */
export default function ChatBackdrop({ variant = 'hero' }) {
  const sparkles = useMemo(() => {
    const rand = seeded(variant === 'hero' ? 21 : 9);
    return Array.from({ length: variant === 'hero' ? 40 : 22 }, (_, i) => ({
      id: i,
      left: rand() * 100,
      top: rand() * 100,
      size: 2 + rand() * 3,
      delay: rand() * 4,
      duration: 2.5 + rand() * 3
    }));
  }, [variant]);

  const bubbles = variant === 'hero' ? BUBBLES : HEADER_BUBBLES;

  return (
    <div className={`backdrop backdrop--${variant}`} aria-hidden="true">
      <div className="backdrop__beam" />
      <div className="backdrop__grid" />

      {bubbles.map((b, i) => (
        <svg
          key={i}
          className="backdrop__bubble"
          viewBox="0 0 100 86"
          style={{
            left: `${b.left}%`,
            top: `${b.top}%`,
            width: `${b.size}px`,
            animationDelay: `${b.delay}s`,
            '--flip': b.flip ? -1 : 1
          }}
        >
          <path d="M18 4 H82 A16 16 0 0 1 98 20 V52 A16 16 0 0 1 82 68 H40 L20 84 V68 H18 A16 16 0 0 1 2 52 V20 A16 16 0 0 1 18 4 Z" />
          <circle cx="32" cy="36" r="5" />
          <circle cx="50" cy="36" r="5" />
          <circle cx="68" cy="36" r="5" />
        </svg>
      ))}

      {sparkles.map((s) => (
        <span
          key={s.id}
          className="backdrop__sparkle"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`
          }}
        />
      ))}

      {variant === 'hero' && (
        <svg className="backdrop__wave" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path
            className="backdrop__wave-back"
            d="M0 70 C240 20 480 110 720 70 C960 30 1200 100 1440 60 V120 H0 Z"
          />
          <path d="M0 90 C260 50 520 120 760 88 C1000 56 1220 110 1440 84 V120 H0 Z" />
        </svg>
      )}
    </div>
  );
}
