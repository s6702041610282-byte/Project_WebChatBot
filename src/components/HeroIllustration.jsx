import { Bot, Heart, MessageSquareText, Settings2, Sparkles, ThumbsUp, Zap } from 'lucide-react';
import Mascot from './Mascot';

/** ไอคอนที่โคจรรอบน้องบอท — แทนความสามารถของ ChatBot */
const ORBIT_ICONS = [
  { icon: MessageSquareText, tone: 'blue' },
  { icon: Sparkles, tone: 'yellow' },
  { icon: Settings2, tone: 'blue' },
  { icon: Zap, tone: 'yellow' },
  { icon: Heart, tone: 'pink' }
];

/**
 * ภาพประกอบ Hero: น้องบอทใส่หูฟังถือป้าย Hi! วงโคจรไอคอน
 * และหน้าต่างแชทที่ข้อความเด้งขึ้นทีละข้อความ
 * (เป็นภาพตกแต่ง ไม่ใช่แชทที่ใช้งานได้ จึงซ่อนจาก screen reader)
 */
export default function HeroIllustration() {
  return (
    <div className="hero-art" aria-hidden="true">
      <div className="hero-art__halo" />

      {/* วงโคจรไอคอน */}
      <div className="orbit">
        <div className="orbit__ring" />
        <div className="orbit__ring orbit__ring--inner" />
        <div className="orbit__spin">
          {ORBIT_ICONS.map(({ icon: Icon, tone }, i) => (
            <span
              key={i}
              className={`orbit__node orbit__node--${tone}`}
              style={{ '--angle': `${(360 / ORBIT_ICONS.length) * i}deg` }}
            >
              <span className="orbit__node-inner">
                <Icon size={20} />
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* น้องบอท */}
      <div className="hero-art__mascot">
        <Mascot size={250} headset holdBubble />
      </div>

      {/* หน้าต่างแชทจำลอง (ข้อความเด้งขึ้นวนซ้ำ) */}
      <div className="mini-chat">
        <div className="mini-chat__head">
          <span className="mini-chat__avatar">
            <Bot size={16} />
          </span>
          <span className="mini-chat__name">น้องบอท</span>
          <span className="mini-chat__status">ออนไลน์</span>
        </div>
        <div className="mini-chat__body">
          <p className="mini-msg mini-msg--user mini-msg--1">ChatBot คืออะไรเหรอ?</p>
          <div className="mini-slot">
            <span className="mini-typing">
              <i />
              <i />
              <i />
            </span>
            <p className="mini-msg mini-msg--bot mini-msg--2">โปรแกรมที่คุยโต้ตอบกับเราได้อัตโนมัติ 🤖</p>
          </div>
          <p className="mini-msg mini-msg--user mini-msg--3">อยากลองออกแบบเอง!</p>
        </div>
      </div>

      {/* ป้ายรีแอ็กชันลอย */}
      <div className="badge-float badge-float--1">
        <span className="badge-float__avatar badge-float__avatar--warm">
          <ThumbsUp size={15} />
        </span>
        เข้าใจแล้ว!
      </div>
      <div className="badge-float badge-float--2">
        <span className="badge-float__avatar badge-float__avatar--pink">
          <Heart size={15} />
        </span>
        ตอบเร็วมาก
      </div>
    </div>
  );
}
