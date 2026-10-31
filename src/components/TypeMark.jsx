import { useEffect, useMemo, useState } from 'react';
import { useInView } from '../hooks/useInView';

/** แบ่งข้อความเป็นตัวอักษรที่แสดงผล (รองรับสระ/วรรณยุกต์ภาษาไทย) */
const graphemes = (text) =>
  typeof Intl !== 'undefined' && Intl.Segmenter
    ? Array.from(new Intl.Segmenter('th', { granularity: 'grapheme' }).segment(text), (x) => x.segment)
    : Array.from(text);

/**
 * หัวข้อเน้นแบบ "บอทกำลังพิมพ์" — ตัวอักษรไล่สีพิมพ์ออกมาทีละตัว มีเคอร์เซอร์กะพริบ
 * พิมพ์เสร็จแล้วมีเส้นใต้แบบลายมือวาดตาม และประกายเล็ก ๆ
 */
export default function TypeMark({ children, tone = 'blue' }) {
  const text = [].concat(children).join('');
  const chars = useMemo(() => graphemes(text), [text]);
  const [ref, inView] = useInView({ threshold: 0.6 });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView || n >= chars.length) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setN(chars.length);
      return undefined;
    }
    const t = setTimeout(() => setN((v) => v + 1), n === 0 ? 350 : 75);
    return () => clearTimeout(t);
  }, [inView, n, chars.length]);

  const done = n >= chars.length;
  return (
    <span ref={ref} className={`cr-type cr-type--${tone} ${done ? 'is-done' : ''}`} aria-label={text}>
      <span className="cr-type__ghost" aria-hidden="true">
        {text}
      </span>
      <span className="cr-type__live" aria-hidden="true">
        {chars.slice(0, n).join('')}
        <i className="cr-type__caret" />
      </span>
      <svg className="cr-type__line" viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden="true">
        <path d="M4 15 C 40 6, 70 22, 110 13 S 180 5, 220 14 S 275 19, 296 9" />
      </svg>
      <span className="cr-type__spark" aria-hidden="true">✦</span>
    </span>
  );
}
