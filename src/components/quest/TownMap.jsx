import { useId } from 'react';
import { Ambulance, BotVan, BUILDINGS, Bush, Cloud, Lamp, Tree, Walker } from './art/Town';
import { isUnlocked } from '../../utils/progress';

/**
 * เมืองภารกิจแบบพาโนรามา — 3 สถานที่ตั้งอยู่ริมถนน มีรถบอทวิ่ง คนเดิน เมฆลอย
 * คลิกอาคารเพื่อเลือกภารกิจ
 */
const SPOTS = { coffee: 210, helpdesk: 600, care: 990 };

export default function TownMap({ missions, progress, selected, onSelect, practiceOpen = true }) {
  const u = `tm${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <svg viewBox="0 0 1200 440" className="town" role="group" aria-label="เมืองภารกิจ เลือกสถานที่เพื่อดูภารกิจ">
      <defs>
        <linearGradient id={`${u}sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a5c8ff" />
          <stop offset="0.6" stopColor="#d9e4ff" />
          <stop offset="1" stopColor="#f6eaff" />
        </linearGradient>
        <linearGradient id={`${u}grass`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a9e39a" />
          <stop offset="1" stopColor="#78c86a" />
        </linearGradient>
        <radialGradient id={`${u}sun`}>
          <stop offset="0" stopColor="#fff9db" />
          <stop offset="0.45" stopColor="#ffe066" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffe066" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${u}sel`}>
          <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <filter id={`${u}gray`}>
          <feColorMatrix type="saturate" values="0.15" />
        </filter>
      </defs>

      {/* ท้องฟ้า */}
      <rect width="1200" height="440" fill={`url(#${u}sky)`} />
      <circle cx="1080" cy="78" r="90" fill={`url(#${u}sun)`} className="tw-pulse" />
      <circle cx="1080" cy="78" r="30" fill="#ffd43b" />
      <Cloud x={160} y={70} s={1.3} />
      <Cloud x={470} y={46} s={0.9} slow />
      <Cloud x={820} y={84} s={1.1} />
      {[[300, 120], [340, 110], [760, 60]].map(([bx, by], i) => (
        <g key={i} transform={`translate(${bx} ${by})`}>
          <path d="M0 0 q5 -5 10 0 q5 -5 10 0" stroke="#5c6aa8" strokeWidth="2" fill="none" className="tw-bird" style={{ animationDelay: `${i * 0.4}s` }} />
        </g>
      ))}

      {/* เมืองไกล ๆ และเนินเขา */}
      <g fill="#c5c9f2" opacity="0.8">
        {[[40, 70], [90, 110], [150, 80], [700, 96], [760, 64], [820, 120], [1120, 90], [1160, 70]].map(([x, h]) => (
          <rect key={x} x={x} y={300 - h} width="44" height={h} rx="3" />
        ))}
      </g>
      <path d="M0 300 Q150 250 320 292 T640 284 T960 276 T1200 290 V440 H0Z" fill="#c3e6b4" />
      <path d="M0 316 Q200 290 420 312 T840 304 T1200 310 V440 H0Z" fill="#b2dda0" />
      <rect y="322" width="1200" height="118" fill={`url(#${u}grass)`} />

      {/* ทางเท้าและถนน */}
      <rect y="330" width="1200" height="12" fill="#e9ecef" />
      <rect y="342" width="1200" height="54" fill="#5c6274" />
      <rect y="342" width="1200" height="4" fill="#4a4f60" />
      <g className="tw-lane">
        {Array.from({ length: 26 }).map((_, k) => (
          <rect key={k} x={k * 50 - 50} y="367" width="28" height="4" rx="2" fill="#fff" opacity="0.85" />
        ))}
      </g>
      <rect y="396" width="1200" height="8" fill="#e9ecef" />

      {/* ต้นไม้ / ไฟถนน */}
      {[40, 400, 470, 800, 860, 1170].map((x, i) => (
        <Tree key={x} x={x} y={330} s={1.1 - (i % 2) * 0.2} d={-i * 0.7} c={i % 2 ? '#51cf66' : '#40c057'} />
      ))}
      {[120, 330, 690, 1060].map((x) => (
        <Bush key={x} x={x} y={331} s={0.9} />
      ))}
      {[300, 760, 1120].map((x) => (
        <Lamp key={x} x={x} y={330} />
      ))}

      {/* อาคารภารกิจ */}
      {missions.map((m, i) => {
        const Building = BUILDINGS[m.id];
        const x = SPOTS[m.id];
        const open = practiceOpen && isUnlocked(progress, i);
        const stars = progress.missions[m.id]?.stars || 0;
        const sel = selected === m.id;
        return (
          <g
            key={m.id}
            transform={`translate(${x} 330)`}
            className={`town__spot ${sel ? 'is-sel' : ''} ${open ? '' : 'is-locked'}`}
            role="button"
            tabIndex={0}
            aria-pressed={sel}
            aria-label={`ภารกิจที่ ${m.no} ${m.title}${open ? '' : ' (ล็อกอยู่)'}${stars ? ` ได้ ${stars} ดาว` : ''}`}
            onClick={() => onSelect(m.id)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onSelect(m.id))}
          >
            {sel && <ellipse cx="0" cy="4" rx="170" ry="26" fill={`url(#${u}sel)`} className="town__glow" />}
            <g filter={open ? undefined : `url(#${u}gray)`} className="town__bld">
              <Building />
            </g>
            {/* หมุดสถานะ */}
            <g transform="translate(0 -236)">
              <g className={sel ? 'town__pin is-bounce' : 'town__pin'}>
                <path d="M0 34 L-10 18 H10Z" fill={open ? (stars ? '#2f9e44' : '#f76707') : '#868e96'} />
                <rect x="-112" y="-22" width="224" height="44" rx="22" fill="#fff" stroke={open ? (stars ? '#2f9e44' : '#f76707') : '#ced4da'} strokeWidth="3" />
                <circle cx="-88" cy="0" r="15" fill={open ? (stars ? '#2f9e44' : '#f76707') : '#adb5bd'} />
                {open ? (
                  <text x="-88" y="5" textAnchor="middle" className="town__no">
                    {m.no}
                  </text>
                ) : (
                  <g transform="translate(-88 1)" fill="#fff">
                    <rect x="-6" y="-3" width="12" height="9" rx="2" />
                    <path d="M-4 -3 v-3 a4 4 0 0 1 8 0 v3" stroke="#fff" strokeWidth="2" fill="none" />
                  </g>
                )}
                <text x="14" y="-3" textAnchor="middle" className="town__name">
                  {m.title}
                </text>
                <g transform="translate(14 11)">
                  {[0, 1, 2].map((k) => (
                    <path
                      key={k}
                      transform={`translate(${(k - 1) * 14} 0) scale(0.55)`}
                      d="M0 -9 L2.6 -2.8 L9.4 -2.8 L4 1.4 L6 8 L0 4.2 L-6 8 L-4 1.4 L-9.4 -2.8 L-2.6 -2.8Z"
                      fill={k < stars ? '#fab005' : '#e9ecef'}
                    />
                  ))}
                </g>
              </g>
            </g>
          </g>
        );
      })}

      <Ambulance x={1110} y={338} s={1.1} />

      {/* คนเดินบนทางเท้า */}
      <Walker x={20} y={340} shirt="#f76707" dur={22} dist={360} />
      <Walker x={420} y={340} shirt="#7048e8" hair="#7a4a2a" dur={18} delay={-6} dist={300} />
      <Walker x={1180} y={340} shirt="#12b886" dur={20} delay={-3} dist={380} flip />
      <Walker x={780} y={404} shirt="#e64980" hair="#d7dbe6" dur={26} delay={-10} dist={260} />

      {/* รถบอทวิ่งบนถนน */}
      <g transform="translate(0 384)">
        <g className="tw-drive">
          <BotVan s={1.3} />
        </g>
      </g>
      <g transform="translate(1200 362) scale(-1 1)">
        <g className="tw-drive tw-drive--back">
          <g transform="scale(0.9)">
            <rect x="-24" y="-20" width="48" height="16" rx="6" fill="#fab005" />
            <rect x="-14" y="-28" width="26" height="12" rx="4" fill="#ffe066" />
            <rect x="-10" y="-26" width="9" height="8" rx="2" fill="#a5d8ff" />
            <rect x="2" y="-26" width="8" height="8" rx="2" fill="#a5d8ff" />
            <circle cx="-13" cy="-4" r="5.5" fill="#343a40" />
            <circle cx="13" cy="-4" r="5.5" fill="#343a40" />
          </g>
        </g>
      </g>
    </svg>
  );
}
