import { useEffect, useRef, useState } from 'react';
import { Lock, MousePointer2 } from 'lucide-react';
import MockScreen, { CODE_LINE, SCREEN_URL } from './MockScreens';
import { GUIDE_CANVAS } from '../../data/guideTours';

const { width: W, height: H } = GUIDE_CANVAS;

/** กรอบเป้าหมายของขั้น (ข้อโค้ดคำนวณจากช่วงบรรทัดที่ highlight) */
export function targetOf(step) {
  if (step.target) return step.target;
  if (step.code) {
    const [from, to] = step.code.highlight;
    return { x: 214, y: CODE_LINE.top + from * CODE_LINE.height - 4, w: 770, h: (to - from + 1) * CODE_LINE.height + 8 };
  }
  return { x: 0, y: 0, w: W, h: H };
}

/**
 * หน้าจอจำลองที่ซูมเข้าหาส่วนที่กำลังอธิบาย พร้อมไฟสปอตไลต์และเคอร์เซอร์จำลอง
 * @param {object}  step      ขั้นปัจจุบัน
 * @param {number}  stepKey   ใช้รีสตาร์ตแอนิเมชันคลิกเมื่อเปลี่ยนขั้น
 * @param {boolean} zoom      false = แสดงทั้งหน้าจอ ไม่ซูม (ใช้ในส่วนหัว)
 */
export default function TourStage({ step, stepKey = 0, zoom = true, label = 'ภาพตัวอย่าง · ข้อมูลสมมติ' }) {
  const viewRef = useRef(null);
  const [vw, setVw] = useState(0);

  useEffect(() => {
    const el = viewRef.current;
    if (!el) return undefined;
    const update = () => setVw(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const base = vw / W || 0.0001;
  const vh = H * base;
  const r = targetOf(step);
  const z = zoom ? Math.min(2.3, Math.max(1, Math.min(W / r.w, H / r.h) * 0.8)) : 1;
  const s = base * z;
  const cx = r.x + r.w / 2;
  const cy = r.y + r.h / 2;
  const tx = Math.min(0, Math.max(vw - W * s, vw / 2 - cx * s));
  const ty = Math.min(0, Math.max(vh - H * s, vh / 2 - cy * s));

  return (
    <div className="tour-stage">
      <div className="tour-stage__chrome">
        <span className="tour-stage__dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="tour-stage__url">{SCREEN_URL[step.screen]}</span>
        {zoom && <span className="tour-stage__zoom">{Math.round(z * 100)}%</span>}
      </div>

      <div className="tour-stage__view" ref={viewRef} aria-hidden="true">
        <div
          className="tour-stage__canvas"
          style={{ width: W, height: H, transform: `translate(${tx}px, ${ty}px) scale(${s})` }}
        >
          <div key={`${step.screen}-${step.code?.file ?? ''}`} className="tour-stage__screen">
            <MockScreen screen={step.screen} code={step.code} />
          </div>

          {zoom && (
            <>
              <div
                className="tour-spot"
                style={{ left: r.x - 8, top: r.y - 8, width: r.w + 16, height: r.h + 16, '--inv': 1 / z }}
              />
              <div
                key={stepKey}
                className="tour-pointer"
                style={{ left: cx + r.w * 0.18, top: cy + r.h * 0.12, '--inv': 1 / z }}
              >
                <MousePointer2 size={28} fill="#ffffff" strokeWidth={1.6} />
                <span className="tour-pointer__ripple" />
              </div>
            </>
          )}
        </div>

        {step.soon && (
          <span className="tour-stage__soon">
            <Lock size={13} aria-hidden="true" /> หน้านี้อยู่ระหว่างจัดทำเนื้อหา
          </span>
        )}
      </div>

      {label && <span className="tour-stage__label">{label}</span>}
    </div>
  );
}
