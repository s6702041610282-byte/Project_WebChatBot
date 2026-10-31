import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Hand } from 'lucide-react';
import Capsule from './Capsule';

const MIN_X = 4;
const MAX_X = 96;
const SPEED = 38; // % ต่อวินาที
const FLOOR = 18; // ความสูงพื้นตู้ (px)
const STACK = 0.74; // ระยะซ้อนแต่ละแถว (สัดส่วนของขนาดแคปซูล)
const DROP_MS = 800;
const CLOSE_MS = 320;
const RISE_MS = 800;
const POP_MS = 450;

/**
 * สร้างกองแคปซูลเรียงเต็มพื้นตู้ ซ้อนกันเป็นชั้นเตี้ย ๆ (สุ่มสีและมุมเอียง)
 * แถวล่างเรียงชิดกันเต็มความกว้าง แถวถัดไปวางอยู่ในร่องระหว่างลูกด้านล่าง
 * @param {number[]} rowCounts  จำนวนแคปซูลในแต่ละแถว จากล่างขึ้นบน เช่น [10, 9, 1] = 20 ลูก
 * @param {number}   capPct     ความกว้างแคปซูล (% ของความกว้างตู้)
 * @param {string[]} colors     ชุดสีแคปซูล
 */
export function createCapsulePile(rowCounts, capPct, colors) {
  const base = rowCounts[0];
  const start = capPct * 0.55;
  const spacing = (100 - capPct * 1.1) / (base - 1);
  const pile = [];
  let below = new Set(Array.from({ length: base }, (_, j) => j));

  rowCounts.forEach((count, row) => {
    // ช่องที่วางได้ต้องมีแคปซูลรองรับทั้งสองลูกด้านล่าง
    const slots = Array.from({ length: base - row }, (_, j) => j).filter((j) => row === 0 || (below.has(j) && below.has(j + 1)));
    for (let k = slots.length - 1; k > 0; k -= 1) {
      const m = Math.floor(Math.random() * (k + 1));
      [slots[k], slots[m]] = [slots[m], slots[k]];
    }
    const chosen = new Set(slots.slice(0, count));
    chosen.forEach((j) => {
      pile.push({
        id: `c-${row}-${j}`,
        row,
        x: start + (j + row / 2) * spacing + (Math.random() - 0.5) * spacing * 0.12,
        rot: Math.round((Math.random() - 0.5) * 60),
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    });
    below = chosen;
  });
  return pile;
}

/**
 * ตู้คีบกาชาปอง
 * ผู้เล่นเลื่อนที่คีบ (กดค้าง ◀ ▶ หรือปุ่มลูกศร) แล้วกด "คีบ!" (หรือ Space / ↓)
 * ที่คีบจะคีบแคปซูลลูกบนสุดที่อยู่ใต้ที่คีบ
 *
 * @param {{id:string,row:number,x:number,rot:number,color:string}[]} capsules  แคปซูลที่ยังอยู่ในตู้
 * @param {number} capPct   ความกว้างแคปซูล (% ของความกว้างกระจกตู้)
 * @param {(capsuleId:string) => void} onGrab  เรียกเมื่อคีบแคปซูลขึ้นมาได้
 * @param {boolean} locked  ล็อกการควบคุม (เช่น ระหว่างแสดงคำถาม)
 */
const ClawMachine = forwardRef(function ClawMachine({ capsules, capPct, onGrab, locked = false }, ref) {
  const [x, setX] = useState(50);
  const [phase, setPhase] = useState('idle'); // idle | down | closing | up | pop | holding
  const [grabbedId, setGrabbedId] = useState(null);
  const [depth, setDepth] = useState(0);
  const [snapping, setSnapping] = useState(false);
  const [message, setMessage] = useState('');
  const [capPx, setCapPx] = useState(60);

  const glassRef = useRef(null);
  const clawRef = useRef(null);
  const xRef = useRef(50);
  const dirRef = useRef(0);
  const timers = useRef([]);
  const canControl = phase === 'idle' && !locked;
  const hitRange = capPct * 0.58;

  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // ขนาดแคปซูล (px) ตามความกว้างของตู้
  useEffect(() => {
    const glass = glassRef.current;
    if (!glass) return undefined;
    const update = () => setCapPx((glass.clientWidth * capPct) / 100);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(glass);
    return () => ro.disconnect();
  }, [capPct]);

  // เมื่อแคปซูลที่คีบถูกนำออกจากตู้แล้ว (ตอบคำถามเสร็จ) ให้รีเซ็ตที่คีบ
  useEffect(() => {
    if (grabbedId && !capsules.some((c) => c.id === grabbedId)) {
      setGrabbedId(null);
      setDepth(0);
      setPhase('idle');
    }
  }, [capsules, grabbedId]);

  const updateX = useCallback((value) => {
    const v = Math.min(MAX_X, Math.max(MIN_X, value));
    xRef.current = v;
    setX(v);
  }, []);

  // เคลื่อนที่ต่อเนื่องขณะกดค้าง
  useEffect(() => {
    if (!canControl) return undefined;
    let frame;
    let last = performance.now();
    const tick = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      if (dirRef.current !== 0) updateX(xRef.current + dirRef.current * SPEED * dt);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [canControl, updateX]);

  const setDir = (d) => {
    dirRef.current = d;
    if (d !== 0) setMessage('');
  };

  /** หาแคปซูลบนสุดที่อยู่ใต้ที่คีบ และระยะที่ที่คีบต้องลงไป (px) */
  const measure = useCallback(() => {
    const H = glassRef.current.clientHeight;
    const claw = clawRef.current;
    const clawTop = claw.offsetTop;
    const clawH = claw.offsetHeight;
    const dist = (c) => Math.abs(c.x - xRef.current);

    const target =
      capsules
        .filter((c) => dist(c) <= hitRange)
        .sort((a, b) => b.row - a.row || dist(a) - dist(b))[0] || null;

    if (!target) return { target: null, depth: H - FLOOR - clawTop - clawH - 4 };
    const capTop = H - FLOOR - target.row * capPx * STACK - capPx;
    return { target, depth: capTop + capPx * 0.3 - clawTop - clawH };
  }, [capsules, capPx, hitRange]);

  const drop = useCallback(() => {
    if (!canControl) return;
    dirRef.current = 0;
    setMessage('');
    const { target, depth: d } = measure();
    setDepth(d);
    setPhase('down');

    later(() => {
      setPhase('closing');
      if (target) {
        setSnapping(true);
        updateX(target.x);
        setGrabbedId(target.id);
      }
      later(() => {
        setPhase('up');
        later(() => {
          setSnapping(false);
          if (target) {
            setPhase('pop');
            later(() => {
              setPhase('holding');
              onGrab(target.id);
            }, POP_MS);
          } else {
            setPhase('idle');
            setDepth(0);
            setMessage('อุ๊ย! คีบไม่โดน ลองใหม่อีกครั้งนะ');
          }
        }, RISE_MS);
      }, CLOSE_MS);
    }, DROP_MS);
  }, [canControl, measure, onGrab, updateX]);

  useImperativeHandle(ref, () => ({ drop }), [drop]);

  // ควบคุมด้วยคีย์บอร์ด
  useEffect(() => {
    if (!canControl) return undefined;
    const onDown = (e) => {
      if (e.target.closest?.('input, textarea, select')) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setDir(-1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setDir(1);
      } else if (e.key === 'ArrowDown' || (e.key === ' ' && !e.target.closest?.('button, a'))) {
        e.preventDefault();
        drop();
      }
    };
    const onUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') setDir(0);
    };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
      dirRef.current = 0;
    };
  }, [canControl, drop]);

  const lowered = phase === 'down' || phase === 'closing';
  const closed = ['closing', 'up', 'pop', 'holding'].includes(phase);
  const popped = phase === 'pop' || phase === 'holding';

  const holdProps = (d) => ({
    onPointerDown: (e) => {
      e.currentTarget.setPointerCapture?.(e.pointerId);
      setDir(d);
    },
    onPointerUp: () => setDir(0),
    onPointerCancel: () => setDir(0),
    onLostPointerCapture: () => setDir(0),
    onContextMenu: (e) => e.preventDefault()
  });

  return (
    <div className="arcade">
      {/* ป้ายไฟด้านบน */}
      <div className="arcade__marquee" aria-hidden="true">
        <span className="arcade__bulbs" />
        <strong>GACHA QUIZ</strong>
        <span className="arcade__bulbs" />
      </div>

      <div className="arcade__body">
        <div className="arcade__glass" ref={glassRef} style={{ '--cap': `${capPx}px`, '--cap-pct': `${capPct}%` }}>
          <div className="arcade__rail" aria-hidden="true" />

          {/* ที่คีบ */}
          <div
            ref={clawRef}
            className={`claw ${closed ? 'is-closed' : ''} ${snapping ? 'is-snapping' : ''}`}
            style={{ left: `${x}%`, transform: `translate(-50%, ${lowered ? depth : 0}px)` }}
            aria-hidden="true"
          >
            <svg className="claw__svg" viewBox="0 0 80 76">
              <rect x="24" y="0" width="32" height="16" rx="7" className="claw__cap" />
              <circle cx="40" cy="24" r="12" className="claw__hub" />
              <circle cx="40" cy="24" r="4.5" className="claw__light" />
              <g className="claw__arm claw__arm--left">
                <path d="M34 28 L18 50 L24 72" />
              </g>
              <g className="claw__arm claw__arm--right">
                <path d="M46 28 L62 50 L56 72" />
              </g>
            </svg>
          </div>

          {/* กองแคปซูล */}
          {capsules.map((c) => {
            const isGrabbed = c.id === grabbedId;
            const lifted = isGrabbed && ['up', 'pop', 'holding'].includes(phase);
            return (
              <div
                key={c.id}
                className={`gacha ${lifted ? 'is-lifted' : ''} ${isGrabbed && popped ? 'is-popped' : ''}`}
                style={{
                  left: `${isGrabbed ? x : c.x}%`,
                  '--row': c.row,
                  '--rot': `${isGrabbed ? 0 : c.rot}deg`,
                  '--lift': `${-depth}px`
                }}
                aria-hidden="true"
              >
                <Capsule color={c.color} letter="" open={isGrabbed && popped} />
              </div>
            );
          })}

          <div className="arcade__floor" aria-hidden="true" />

          {message && (
            <p className="arcade__toast" role="status">
              {message}
            </p>
          )}
        </div>

        <div className="arcade__panel">
          <button type="button" className="arcade__btn arcade__btn--move" aria-label="เลื่อนที่คีบไปทางซ้าย (กดค้าง)" disabled={!canControl} {...holdProps(-1)}>
            <ChevronLeft size={32} strokeWidth={3} />
          </button>
          <button type="button" className="arcade__btn arcade__btn--grab" onClick={drop} disabled={!canControl}>
            <Hand size={24} aria-hidden="true" />
            คีบ!
          </button>
          <button type="button" className="arcade__btn arcade__btn--move" aria-label="เลื่อนที่คีบไปทางขวา (กดค้าง)" disabled={!canControl} {...holdProps(1)}>
            <ChevronRight size={32} strokeWidth={3} />
          </button>
        </div>
        <p className="arcade__hint">กดค้าง ◀ ▶ หรือปุ่มลูกศรบนคีย์บอร์ด · กด “คีบ!” หรือ Space เพื่อคีบ</p>
      </div>
    </div>
  );
});

export default ClawMachine;
