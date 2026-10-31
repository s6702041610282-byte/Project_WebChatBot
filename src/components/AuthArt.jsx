import { BarChart3, Bot, Mail, Megaphone, MessageCircle, Send } from 'lucide-react';
import Robot from './quest/art/Robot';

/** ไอคอนลูกแก้วที่ลอยรอบน้องบอท: ตำแหน่ง (%) · สี · ไอคอน */
const ORBS = [
  { x: 50, y: 13, size: 74, from: '#a5d8ff', to: '#4dabf7', icon: MessageCircle, d: 0 },
  { x: 80, y: 30, size: 82, from: '#ffc078', to: '#fd7e14', icon: Mail, d: -1.2 },
  { x: 84, y: 64, size: 76, from: '#ffe066', to: '#fab005', icon: BarChart3, d: -2.4 },
  { x: 60, y: 86, size: 64, from: '#ffa8a8', to: '#fa5252', icon: Bot, d: -3.1 },
  { x: 24, y: 72, size: 88, from: '#d0bfff', to: '#845ef7', icon: Megaphone, d: -1.8 },
  { x: 20, y: 36, size: 62, from: '#99e9f2', to: '#22b8cf', icon: Send, d: -0.6 }
];

const Leaf = ({ className, flip }) => (
  <svg className={className} viewBox="0 0 120 200" aria-hidden="true" style={flip ? { transform: 'scaleX(-1)' } : undefined}>
    <g className="aart__leafsway">
      <path d="M60 196 C58 140 50 80 62 6" stroke="#1d2a7a" strokeWidth="4" fill="none" strokeLinecap="round" />
      {[22, 46, 70, 94, 118, 142].map((y, i) => (
        <g key={y}>
          <path d={`M61 ${y + 8} C40 ${y - 6} 18 ${y + 2} 4 ${y + 22} C26 ${y + 22} 46 ${y + 18} 61 ${y + 8}Z`} fill={i % 2 ? '#24318f' : '#1b2675'} />
          <path d={`M61 ${y + 8} C82 ${y - 6} 104 ${y + 2} 118 ${y + 22} C96 ${y + 22} 76 ${y + 18} 61 ${y + 8}Z`} fill={i % 2 ? '#1b2675' : '#24318f'} />
        </g>
      ))}
    </g>
  </svg>
);

/** ฉากด้านขวาของหน้าเข้าสู่ระบบ — วงกลมใหญ่ น้องบอทลอย ลูกแก้วไอคอนเชื่อมด้วยเส้นแสง ใบไม้ไหว */
export default function AuthArt({ mood = 'wave', bubble = 'สวัสดี!' }) {
  return (
    <div className="aart" aria-hidden="true">
      <div className="aart__circle">
        <span className="aart__halo" />
        <Leaf className="aart__leaf aart__leaf--top" />
        <Leaf className="aart__leaf aart__leaf--bottom" flip />
        <Leaf className="aart__leaf aart__leaf--mid" />

        {/* เส้นแสงเชื่อมบอทกับไอคอน */}
        <svg className="aart__links" viewBox="0 0 100 100" preserveAspectRatio="none">
          {ORBS.map((o, i) => (
            <line key={i} x1="50" y1="50" x2={o.x} y2={o.y} style={{ animationDelay: `${i * 0.35}s` }} />
          ))}
        </svg>

        {/* ประกายดาว */}
        {[
          [34, 22],
          [70, 16],
          [92, 46],
          [40, 90],
          [12, 56],
          [72, 76]
        ].map(([x, y], i) => (
          <span key={i} className="aart__spark" style={{ '--px': x / 100, '--py': y / 100, animationDelay: `${i * 0.7}s` }} />
        ))}

        {ORBS.map(({ x, y, size, from, to, icon: Icon, d }, i) => (
          <span
            key={i}
            className="aart__orb"
            style={{
              '--px': x / 100,
              '--py': y / 100,
              width: size,
              height: size,
              '--from': from,
              '--to': to,
              animationDelay: `${d}s`
            }}
          >
            <span className="aart__orbin">
              <Icon size={Math.round(size * 0.4)} strokeWidth={2.2} />
            </span>
          </span>
        ))}

        <div className="aart__bot">
          <span className="aart__say">{bubble}</span>
          <Robot size={190} mood={mood} acc="headset" live />
          <span className="aart__shadow" />
        </div>
      </div>
    </div>
  );
}
