import { useId } from 'react';
import { Ambulance, BUILDINGS, Bush, Cloud, Lamp, Tree, Walker } from './Town';

/**
 * ภาพฉากภารกิจแบบการ์ตูน 2D (SVG 320×180) — ใช้ในการ์ดภารกิจ แผงรายละเอียด และหน้าภารกิจ
 * id: coffee | helpdesk | care
 */
const SKY = {
  coffee: ['#bfe3ff', '#fff1db'],
  helpdesk: ['#c5d4ff', '#eef2ff'],
  care: ['#ffd6e7', '#fff4f8']
};

const PEOPLE = {
  coffee: [
    { x: 30, shirt: '#f76707', hair: '#5c3b28', dur: 16, delay: 0 },
    { x: 200, shirt: '#4c6ef5', hair: '#2b2340', dur: 13, delay: -6, flip: true }
  ],
  helpdesk: [
    { x: 20, shirt: '#7048e8', hair: '#2b2340', dur: 15, delay: -2 },
    { x: 230, shirt: '#12b886', hair: '#7a4a2a', dur: 12, delay: -8, flip: true }
  ],
  care: [{ x: 40, shirt: '#e64980', hair: '#d7dbe6', dur: 20, delay: -4 }]
};

export default function MissionScene({ id, className = '', locked = false, title }) {
  const u = `ms${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const Building = BUILDINGS[id] || BUILDINGS.coffee;
  const [top, bottom] = SKY[id] || SKY.coffee;
  return (
    <svg
      viewBox="0 0 320 180"
      preserveAspectRatio="xMidYMid slice"
      className={`scene ${locked ? 'scene--locked' : ''} ${className}`}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : 'true'}
    >
      <defs>
        <linearGradient id={`${u}s`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
        <linearGradient id={`${u}g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a9e39a" />
          <stop offset="1" stopColor="#7ccf6d" />
        </linearGradient>
        <radialGradient id={`${u}sun`}>
          <stop offset="0" stopColor="#fff3bf" />
          <stop offset="0.5" stopColor="#ffe066" stopOpacity="0.6" />
          <stop offset="1" stopColor="#ffe066" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="320" height="180" fill={`url(#${u}s)`} />
      <circle cx="270" cy="36" r="34" fill={`url(#${u}sun)`} className="tw-pulse" />
      <circle cx="270" cy="36" r="13" fill="#ffd43b" />
      <Cloud x={60} y={30} s={0.8} />
      <Cloud x={200} y={22} s={0.6} slow />
      {/* เนินเขาไกล ๆ */}
      <path d="M0 132 Q60 104 120 126 T240 120 T320 124 V180 H0Z" fill="#c3e6b4" />
      <path d="M0 140 Q80 122 160 136 T320 132 V180 H0Z" fill="#b2dda0" />
      <rect y="150" width="320" height="30" fill={`url(#${u}g)`} />
      <rect y="150" width="320" height="5" fill="#dee2e6" />
      <g transform="translate(160 152) scale(0.82)">
        <Building />
      </g>
      <Tree x={22} y={152} s={0.85} d={-1} />
      <Tree x={300} y={152} s={0.7} c="#51cf66" d={-2.5} />
      <Bush x={56} y={153} s={0.7} />
      <Bush x={268} y={153} s={0.6} c="#69db7c" />
      {id === 'care' && <Ambulance x={262} y={160} s={0.7} />}
      {id === 'helpdesk' && <Lamp x={46} y={152} />}
      <rect y="160" width="320" height="20" fill="#adb5bd" opacity="0.35" />
      {(PEOPLE[id] || []).map((p, i) => (
        <Walker key={i} y={168} dist={80} {...p} />
      ))}
    </svg>
  );
}
