import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import Robot from './quest/art/Robot';

/**
 * ฉาก 3 มิติเต็มจอของหน้า Home (Three.js)
 * - น้องบอทลอยบนแท่นโฮโลแกรม หันตามเมาส์ กะพริบตา โบกมือ จุดบนอกเต้นเหมือนกำลังพิมพ์
 * - ฟองแชตคำสำคัญโคจรรอบตัว · ลูกแก้วข้อมูลลอย ส่ง "แพ็กเก็ตข้อความ" เข้าหาบอท
 * - สายข้อมูลเกลียววิ่งขึ้น · ลูกโลกเครือข่ายประสาทด้านหลัง · ดาวระยิบระยับ
 * - เลื่อนหน้าจอ = กล้องถอยและบอทหมุน · คลิกบอทให้กระโดดหมุนตัว
 * - หยุดเรนเดอร์เมื่อเลื่อนพ้นจอหรือสลับแท็บ (ประหยัดแบตเตอรี่)
 */
const WORDS = ['สวัสดีครับ', 'Intent', 'Keyword', 'FAQ', 'Rich Menu', 'Fallback', 'ตอบได้ 24 ชม.', 'ถามเมนูได้เลย'];
const FONT = '"Prompt", "IBM Plex Sans Thai", "Sarabun", sans-serif';

function canvasTex(c) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** ฟองแชตกระจกสีเข้ม ขอบเรืองแสง */
function bubbleTexture(text, accent) {
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  const font = `600 46px ${FONT}`;
  ctx.font = font;
  const w = Math.ceil(ctx.measureText(text).width) + 100;
  const h = 120;
  c.width = w;
  c.height = h;
  ctx.font = font;
  const r = 40;
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(r + 4, 6);
    ctx.arcTo(w - 6, 6, w - 6, 92, r);
    ctx.arcTo(w - 6, 92, 6, 92, r);
    ctx.lineTo(62, 92);
    ctx.lineTo(40, 114);
    ctx.lineTo(44, 92);
    ctx.arcTo(6, 92, 6, 6, r);
    ctx.arcTo(6, 6, w - 6, 6, r);
    ctx.closePath();
  };
  const g = ctx.createLinearGradient(0, 0, w, 92);
  g.addColorStop(0, 'rgba(22, 36, 88, 0.92)');
  g.addColorStop(1, 'rgba(10, 18, 52, 0.92)');
  path();
  ctx.fillStyle = g;
  ctx.shadowColor = accent;
  ctx.shadowBlur = 18;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.lineWidth = 4;
  ctx.strokeStyle = accent;
  ctx.stroke();
  // จุดสถานะ
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(40, 49, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 62, 51);
  return { tex: canvasTex(c), aspect: w / h };
}

/** จุดกลมเรืองแสง (ใช้กับอนุภาค / แสงฟุ้ง) */
function glowTexture(inner = 'rgba(255,255,255,1)', mid = 'rgba(125,211,252,0.6)') {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, inner);
  g.addColorStop(0.25, mid);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return canvasTex(c);
}

/** ไล่สีแนวตั้งสำหรับลำแสงโฮโลแกรม */
function beamTexture() {
  const c = document.createElement('canvas');
  c.width = 4;
  c.height = 256;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, 'rgba(56,189,248,0)');
  g.addColorStop(0.7, 'rgba(56,189,248,0.18)');
  g.addColorStop(1, 'rgba(125,211,252,0.55)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 4, 256);
  return canvasTex(c);
}

export default function HomeScene3D({ className = '' }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const small = window.innerWidth < 760;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: !small, alpha: true, powerPreference: 'high-performance' });
    } catch {
      host.classList.add('hx3d--fallback');
      return undefined;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, small ? 1.5 : 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    host.appendChild(renderer.domElement);

    const disposables = [];
    const keep = (x) => {
      disposables.push(x);
      return x;
    };
    const std = (o) => keep(new THREE.MeshStandardMaterial(o));
    const phys = (o) => keep(new THREE.MeshPhysicalMaterial(o));

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050a1f, 0.028);
    const camera = new THREE.PerspectiveCamera(small ? 42 : 34, 1, 0.1, 120);

    /* ---------- แสง ---------- */
    scene.add(new THREE.HemisphereLight(0x9cc3ff, 0x0a0f2e, 1.1));
    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(4, 6, 7);
    scene.add(key);
    const rimC = new THREE.DirectionalLight(0x38bdf8, 3);
    rimC.position.set(-6, 2, -3);
    scene.add(rimC);
    const rimV = new THREE.DirectionalLight(0x8b5cf6, 2.4);
    rimV.position.set(6, 1, -4);
    scene.add(rimV);
    const under = new THREE.PointLight(0x38bdf8, 18, 9, 1.6);
    under.position.set(0, -1.4, 1);

    /* ---------- กลุ่มหลัก (เลื่อนซ้าย/ขวาตามขนาดจอ) ---------- */
    const world = new THREE.Group();
    scene.add(world);
    world.add(under);

    /* ---------- น้องบอท ---------- */
    const white = phys({ color: 0xf4f7ff, roughness: 0.25, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.15 });
    const navy = phys({ color: 0x0b1438, roughness: 0.08, metalness: 0.3, clearcoat: 1 });
    const blue = phys({ color: 0x2f5bff, roughness: 0.3, metalness: 0.15, clearcoat: 0.8 });
    const blueLight = std({ color: 0x93c5fd, roughness: 0.4, emissive: 0x1d4ed8, emissiveIntensity: 0.35 });
    const cyan = std({ color: 0x22d3ee, emissive: 0x06b6d4, emissiveIntensity: 1.1, roughness: 0.2 });
    const orange = std({ color: 0xffa94d, emissive: 0xff7a00, emissiveIntensity: 1.6 });
    const pink = std({ color: 0xff8fab, roughness: 0.6, transparent: true, opacity: 0.7 });
    const grey = std({ color: 0xaab4d6, roughness: 0.4, metalness: 0.5 });

    const bot = new THREE.Group();
    world.add(bot);
    const G = (g) => keep(g);

    const headPivot = new THREE.Group();
    headPivot.position.y = 1.55;
    bot.add(headPivot);
    const head = new THREE.Mesh(G(new THREE.SphereGeometry(1, 64, 40)), white);
    head.scale.set(1.22, 1, 1.02);
    headPivot.add(head);
    const visor = new THREE.Mesh(G(new THREE.SphereGeometry(1, 64, 40)), navy);
    visor.scale.set(0.98, 0.7, 0.5);
    visor.position.set(0, 0, 0.6);
    headPivot.add(visor);
    const eyes = [-0.36, 0.36].map((x) => {
      const e = new THREE.Mesh(G(new THREE.SphereGeometry(0.17, 24, 16)), cyan);
      e.scale.set(1, 1.3, 0.5);
      e.position.set(x, 0.06, 1.06);
      headPivot.add(e);
      const glint = new THREE.Mesh(G(new THREE.SphereGeometry(0.05, 12, 8)), white);
      glint.position.set(x - 0.06, 0.16, 1.13);
      headPivot.add(glint);
      return e;
    });
    const smile = new THREE.Mesh(G(new THREE.TorusGeometry(0.15, 0.035, 8, 24, Math.PI)), cyan);
    smile.rotation.z = Math.PI;
    smile.position.set(0, -0.22, 1.08);
    headPivot.add(smile);
    [-0.78, 0.78].forEach((x) => {
      const ch = new THREE.Mesh(G(new THREE.SphereGeometry(0.12, 16, 12)), pink);
      ch.scale.set(1.3, 0.7, 0.4);
      ch.position.set(x, -0.42, 0.78);
      headPivot.add(ch);
    });
    [-1.24, 1.24].forEach((x) => {
      const ear = new THREE.Mesh(G(new THREE.CylinderGeometry(0.3, 0.3, 0.22, 32)), blue);
      ear.rotation.z = Math.PI / 2;
      ear.position.set(x, 0, 0);
      headPivot.add(ear);
      const cap = new THREE.Mesh(G(new THREE.CylinderGeometry(0.16, 0.16, 0.24, 24)), cyan);
      cap.rotation.z = Math.PI / 2;
      cap.position.set(x * 1.04, 0, 0);
      headPivot.add(cap);
    });
    const stalk = new THREE.Mesh(G(new THREE.CylinderGeometry(0.05, 0.05, 0.45, 12)), grey);
    stalk.position.y = 1.15;
    headPivot.add(stalk);
    const bulb = new THREE.Mesh(G(new THREE.SphereGeometry(0.15, 20, 16)), orange);
    bulb.position.y = 1.42;
    headPivot.add(bulb);

    const body = new THREE.Mesh(G(new THREE.CapsuleGeometry(0.62, 0.5, 8, 32)), blue);
    body.position.y = 0.05;
    body.scale.set(1.05, 1, 0.85);
    bot.add(body);
    const chest = new THREE.Mesh(G(new THREE.BoxGeometry(0.74, 0.46, 0.08)), navy);
    chest.position.set(0, 0.12, 0.54);
    bot.add(chest);
    const dots = [-0.2, 0, 0.2].map((x) => {
      const d = new THREE.Mesh(G(new THREE.SphereGeometry(0.06, 14, 10)), cyan);
      d.position.set(x, 0.12, 0.6);
      bot.add(d);
      return d;
    });
    const belt = new THREE.Mesh(
      G(new THREE.TorusGeometry(0.6, 0.06, 12, 64)),
      std({ color: 0xc4b5fd, emissive: 0x8b5cf6, emissiveIntensity: 1.6 })
    );
    belt.rotation.x = Math.PI / 2;
    belt.position.y = -0.78;
    bot.add(belt);
    const arms = [-1, 1].map((side) => {
      const pivot = new THREE.Group();
      pivot.position.set(side * 0.72, 0.4, 0);
      const arm = new THREE.Mesh(G(new THREE.CapsuleGeometry(0.14, 0.5, 6, 16)), blue);
      arm.position.y = -0.38;
      pivot.add(arm);
      const hand = new THREE.Mesh(G(new THREE.SphereGeometry(0.2, 20, 16)), white);
      hand.position.y = -0.78;
      pivot.add(hand);
      pivot.rotation.z = side * 0.35;
      bot.add(pivot);
      return pivot;
    });
    // ไอพ่นใต้ตัว
    const jetTex = keep(glowTexture('rgba(255,255,255,1)', 'rgba(56,189,248,0.75)'));
    const jet = new THREE.Sprite(keep(new THREE.SpriteMaterial({ map: jetTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })));
    jet.scale.set(1.1, 1.1, 1);
    jet.position.y = -1.05;
    bot.add(jet);

    /* ---------- แท่นโฮโลแกรม ---------- */
    const platform = new THREE.Group();
    platform.position.y = -2.05;
    world.add(platform);
    const disc = new THREE.Mesh(
      G(new THREE.CylinderGeometry(1.75, 1.95, 0.16, 64)),
      phys({ color: 0x0c1748, roughness: 0.25, metalness: 0.7, clearcoat: 1, emissive: 0x0b2a7a, emissiveIntensity: 0.4 })
    );
    platform.add(disc);
    const additive = (color, opacity = 0.9) =>
      keep(new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false }));
    const rings = [
      [1.98, 0.025, 0x38bdf8],
      [2.45, 0.018, 0x60a5fa],
      [3.0, 0.014, 0x8b5cf6]
    ].map(([r, t, c], i) => {
      const m = new THREE.Mesh(G(new THREE.TorusGeometry(r, t, 8, 160)), additive(c, 0.9 - i * 0.2));
      m.rotation.x = Math.PI / 2;
      m.position.y = 0.09 + i * 0.01;
      platform.add(m);
      return m;
    });
    // ขีดเรืองแสงรอบแท่น
    const ticks = new THREE.Group();
    platform.add(ticks);
    const tickG = G(new THREE.BoxGeometry(0.28, 0.02, 0.05));
    const tickM = additive(0x7dd3fc, 0.85);
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      const t = new THREE.Mesh(tickG, tickM);
      t.position.set(Math.cos(a) * 2.72, 0.1, Math.sin(a) * 2.72);
      t.rotation.y = -a;
      ticks.add(t);
    }
    const beam = new THREE.Mesh(
      G(new THREE.CylinderGeometry(1.15, 1.85, 3.4, 64, 1, true)),
      keep(new THREE.MeshBasicMaterial({ map: keep(beamTexture()), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }))
    );
    beam.position.y = 1.78;
    platform.add(beam);
    const pool = new THREE.Sprite(keep(new THREE.SpriteMaterial({ map: jetTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.55 })));
    pool.scale.set(6, 2, 1);
    pool.position.y = 0.05;
    platform.add(pool);

    /* ---------- ลูกโลกเครือข่าย (พื้นหลัง) ---------- */
    const net = new THREE.Group();
    net.position.set(0.8, 0.6, -9);
    world.add(net);
    const icoG = G(new THREE.IcosahedronGeometry(6.2, 2));
    const wire = new THREE.LineSegments(G(new THREE.WireframeGeometry(icoG)), keep(new THREE.LineBasicMaterial({ color: 0x3b6cff, transparent: true, opacity: 0.16 })));
    net.add(wire);
    const dotTex = keep(glowTexture('rgba(255,255,255,1)', 'rgba(125,211,252,0.8)'));
    // จุดยอดของลูกโลก (เรขาคณิตใหม่ที่มีแค่ตำแหน่ง ไม่มี uv และไม่ซ้ำกัน)
    const seen = new Set();
    const nodePos = [];
    const ip = icoG.attributes.position;
    for (let i = 0; i < ip.count; i++) {
      const v = [ip.getX(i), ip.getY(i), ip.getZ(i)];
      const k = v.map((n) => n.toFixed(2)).join();
      if (!seen.has(k)) {
        seen.add(k);
        nodePos.push(...v);
      }
    }
    const nodeGeo = G(new THREE.BufferGeometry());
    nodeGeo.setAttribute('position', new THREE.Float32BufferAttribute(nodePos, 3));
    const nodes = new THREE.Points(
      nodeGeo,
      keep(new THREE.PointsMaterial({ map: dotTex, size: 0.32, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending, color: 0x7dd3fc }))
    );
    net.add(nodes);

    /* ---------- ดาว ---------- */
    const starN = small ? 350 : 700;
    const starPos = new Float32Array(starN * 3);
    for (let i = 0; i < starN; i++) {
      const r = 18 + Math.random() * 30;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(Math.random() * 2 - 1);
      starPos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      starPos[i * 3 + 1] = r * Math.cos(ph) * 0.7;
      starPos[i * 3 + 2] = -Math.abs(r * Math.sin(ph) * Math.sin(th)) - 4;
    }
    const starGeo = G(new THREE.BufferGeometry());
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = keep(new THREE.PointsMaterial({ map: dotTex, size: 0.22, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xbfdbfe }));
    scene.add(new THREE.Points(starGeo, starMat));

    /* ---------- สายข้อมูลเกลียว ---------- */
    const hN = small ? 160 : 280;
    const hPos = new Float32Array(hN * 3);
    const hCol = new Float32Array(hN * 3);
    const hSeed = new Float32Array(hN);
    const cA = new THREE.Color(0x38bdf8);
    const cB = new THREE.Color(0xa78bfa);
    for (let i = 0; i < hN; i++) {
      hSeed[i] = Math.random();
      const c = i % 2 ? cA : cB;
      hCol.set([c.r, c.g, c.b], i * 3);
    }
    const helixGeo = G(new THREE.BufferGeometry());
    helixGeo.setAttribute('position', new THREE.BufferAttribute(hPos, 3));
    helixGeo.setAttribute('color', new THREE.BufferAttribute(hCol, 3));
    const helix = new THREE.Points(
      helixGeo,
      keep(new THREE.PointsMaterial({ map: dotTex, size: 0.13, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }))
    );
    world.add(helix);

    /* ---------- ลูกแก้วข้อมูล ---------- */
    const orbSpec = [
      { p: [-2.7, 2.2, -0.6], r: 0.34, c: 0x38bdf8 },
      { p: [2.9, 2.6, -1.2], r: 0.4, c: 0xff922b },
      { p: [3.3, -0.4, 0.2], r: 0.3, c: 0xfacc15 },
      { p: [-3.1, -0.6, 0.4], r: 0.38, c: 0xa78bfa },
      { p: [0.4, 3.6, -1.8], r: 0.26, c: 0xf472b6 }
    ];
    const orbs = orbSpec.map((o, i) => {
      const g = new THREE.Group();
      g.position.set(...o.p);
      const s = new THREE.Mesh(
        G(new THREE.SphereGeometry(o.r, 40, 28)),
        phys({ color: o.c, roughness: 0.15, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.05, emissive: o.c, emissiveIntensity: 0.35 })
      );
      g.add(s);
      const halo = new THREE.Mesh(G(new THREE.TorusGeometry(o.r * 1.55, 0.012, 8, 80)), additive(o.c, 0.8));
      halo.rotation.x = Math.PI / 2.4;
      g.add(halo);
      const glow = new THREE.Sprite(
        keep(new THREE.SpriteMaterial({ map: jetTex, color: o.c, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.5 }))
      );
      glow.scale.set(o.r * 5, o.r * 5, 1);
      g.add(glow);
      g.userData = { base: o.p[1], speed: 0.5 + i * 0.13, phase: i * 1.3, halo };
      world.add(g);
      return g;
    });

    /* ---------- แพ็กเก็ตข้อความ วิ่งจากลูกแก้วเข้าหาบอท ---------- */
    const packetMat = keep(new THREE.SpriteMaterial({ map: dotTex, color: 0xffffff, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
    const packets = Array.from({ length: small ? 3 : 5 }, (_, i) => {
      const s = new THREE.Sprite(packetMat);
      s.scale.set(0.35, 0.35, 1);
      world.add(s);
      return { s, t: -i * 0.45, curve: null };
    });
    const newCurve = () => {
      const from = orbs[Math.floor(Math.random() * orbs.length)].position.clone();
      const to = new THREE.Vector3(0, 1.4, 0.6);
      const mid = from.clone().add(to).multiplyScalar(0.5).add(new THREE.Vector3(0, 1.4, 1.2));
      return new THREE.QuadraticBezierCurve3(from, mid, to);
    };

    /* ---------- ฟองแชตโคจร ---------- */
    const bubbles = [];
    const accents = ['#38bdf8', '#a78bfa', '#60a5fa', '#f472b6', '#facc15', '#34d399'];
    let alive = true;
    const buildBubbles = () => {
      if (!alive) return;
      WORDS.forEach((w, i) => {
        const { tex, aspect } = bubbleTexture(w, accents[i % accents.length]);
        const m = keep(new THREE.SpriteMaterial({ map: keep(tex), transparent: true, depthWrite: false }));
        const s = new THREE.Sprite(m);
        const h = 0.5;
        s.scale.set(h * aspect, h, 1);
        s.userData = { a: (i / WORDS.length) * Math.PI * 2, y: ((i % 3) - 1) * 0.85 + 0.9, h };
        world.add(s);
        bubbles.push(s);
      });
    };
    if (document.fonts?.ready) document.fonts.ready.then(buildBubbles);
    else buildBubbles();

    /* ---------- ขนาด / ตำแหน่งตามจอ ---------- */
    let wide = true;
    const resize = () => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      wide = camera.aspect > 1.15;
      camera.fov = wide ? 34 : 46;
      camera.updateProjectionMatrix();
      world.position.x = wide ? Math.min(4.4, 1.5 + camera.aspect * 1.35) : 0;
      world.userData.baseY = wide ? -0.1 : 1.75;
      world.scale.setScalar(wide ? 0.76 : 0.7);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    /* ---------- เมาส์ / เลื่อน / คลิก ---------- */
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e) => {
      mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.ty = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    let scrollP = 0;
    const onScroll = () => {
      scrollP = Math.min(1, Math.max(0, window.scrollY / (host.clientHeight || 1)));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    let jumpT = -1;
    const onClick = (e) => {
      const r = renderer.domElement.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      if (ray.intersectObject(bot, true).length) jumpT = 0;
    };
    renderer.domElement.addEventListener('click', onClick);

    /* ---------- วนเรนเดอร์ ---------- */
    const clock = new THREE.Clock();
    let raf = 0;
    let visible = true;
    const look = new THREE.Vector3();

    const frame = () => {
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;

      // กล้อง: พารัลแลกซ์ + ถอยเมื่อเลื่อน
      camera.position.set(mouse.x * 0.7, 0.9 + mouse.y * 0.4 + scrollP * 1.2, 12 + scrollP * 4);
      look.set(world.position.x * 0.2, 0.5 - scrollP * 0.6, 0);
      camera.lookAt(look);
      world.position.y = (world.userData.baseY || 0) + scrollP * 1.2;

      // บอทลอย + กระโดดหมุน
      let jy = 0;
      let spin = 0;
      if (jumpT >= 0) {
        jumpT += dt;
        const k = Math.min(1, jumpT / 1.1);
        jy = Math.sin(k * Math.PI) * 1.3;
        spin = k * Math.PI * 2;
        if (k >= 1) jumpT = -1;
      }
      bot.position.y = Math.sin(t * 1.4) * 0.16 + jy;
      bot.rotation.y = Math.sin(t * 0.5) * 0.18 + spin + scrollP * 1.4 - (wide ? 0.25 : 0);
      bot.rotation.z = Math.sin(t * 0.9) * 0.03;
      headPivot.rotation.y += (mouse.x * 0.6 - headPivot.rotation.y) * 0.08;
      headPivot.rotation.x += (-mouse.y * 0.25 - headPivot.rotation.x) * 0.08;
      // กะพริบตา
      const blink = t % 3.6 < 0.13 ? 0.15 : 1.3;
      eyes.forEach((e) => (e.scale.y += (blink - e.scale.y) * 0.5));
      // โบกมือทุก 6 วิ
      const wave = t % 6 < 1.8 ? Math.sin((t % 6) * 9) * 0.5 + 2.5 : 0.35;
      arms[1].rotation.z += (wave - arms[1].rotation.z) * 0.12;
      arms[0].rotation.z = -0.35 - Math.sin(t * 1.4) * 0.06;
      // จุดบนอก "กำลังพิมพ์"
      dots.forEach((d, i) => {
        const k = Math.max(0, Math.sin(t * 5 - i * 0.9));
        d.scale.setScalar(0.8 + k * 0.6);
        d.position.y = 0.12 + k * 0.04;
      });
      bulb.material.emissiveIntensity = 1.2 + Math.sin(t * 4) * 0.8;
      jet.material.opacity = 0.65 + Math.sin(t * 8) * 0.15;
      jet.scale.setScalar(1 + Math.sin(t * 1.4) * 0.12);

      // แท่น
      rings.forEach((r, i) => (r.rotation.z = t * (i % 2 ? -0.25 : 0.35) * (1 + i * 0.3)));
      ticks.rotation.y = -t * 0.3;
      beam.material.opacity = 0.75 + Math.sin(t * 2) * 0.2;
      under.intensity = 16 + Math.sin(t * 2) * 4;

      // ลูกโลกเครือข่าย
      net.rotation.y = t * 0.05;
      net.rotation.x = Math.sin(t * 0.1) * 0.2;
      nodes.material.opacity = 0.65 + Math.sin(t * 1.7) * 0.2;
      starMat.opacity = 0.6 + Math.sin(t * 0.8) * 0.2;

      // เกลียวข้อมูล
      for (let i = 0; i < hN; i++) {
        const s = hSeed[i];
        const k = (s + t * 0.08) % 1;
        const a = k * Math.PI * 6 + (i % 2) * Math.PI;
        const rad = 1.9 + Math.sin(k * Math.PI) * 0.4;
        hPos[i * 3] = Math.cos(a) * rad;
        hPos[i * 3 + 1] = -1.9 + k * 5.6;
        hPos[i * 3 + 2] = Math.sin(a) * rad;
      }
      helixGeo.attributes.position.needsUpdate = true;
      helix.material.opacity = 0.9;

      // ลูกแก้ว
      orbs.forEach((o) => {
        const u = o.userData;
        o.position.y = u.base + Math.sin(t * u.speed + u.phase) * 0.25;
        o.rotation.y = t * 0.4 + u.phase;
        u.halo.rotation.z = t * 0.8;
      });

      // แพ็กเก็ตข้อความ
      packets.forEach((p) => {
        p.t += dt * 0.75;
        if (!p.curve) p.curve = newCurve();
        if (p.t >= 1) {
          p.curve = newCurve();
          p.t = -Math.random() * 0.6;
        }
        if (p.t < 0) {
          p.s.visible = false;
          return;
        }
        p.s.visible = true;
        p.curve.getPoint(Math.min(1, p.t), p.s.position);
        const sc = 0.2 + Math.sin(p.t * Math.PI) * 0.3;
        p.s.scale.set(sc, sc, 1);
      });

      // ฟองแชตโคจร
      bubbles.forEach((b, i) => {
        const u = b.userData;
        const a = u.a + t * 0.22;
        const rx = wide ? 3.3 : 3.1;
        b.position.set(Math.cos(a) * rx, u.y + Math.sin(t * 0.9 + i) * 0.12, Math.sin(a) * 2);
        const front = (b.position.z + 2.2) / 4.4; // 0 = หลังสุด 1 = หน้าสุด
        b.material.opacity = 0.35 + front * 0.65;
        const sc = u.h * (0.82 + front * 0.3);
        b.scale.set((b.scale.x / b.scale.y) * sc, sc, 1);
      });

      renderer.render(scene, camera);
    };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (visible && !document.hidden) frame();
    };
    if (reduce) {
      frame();
      // เคลื่อนไหวน้อยลง: เรนเดอร์เฉพาะเมื่อขยับเมาส์/เลื่อน
      const once = () => requestAnimationFrame(frame);
      window.addEventListener('pointermove', once, { passive: true });
      window.addEventListener('scroll', once, { passive: true });
      disposables.push({ dispose: () => (window.removeEventListener('pointermove', once), window.removeEventListener('scroll', once)) });
    } else loop();

    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
    });
    io.observe(host);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll);
      renderer.domElement.removeEventListener('click', onClick);
      disposables.forEach((d) => d.dispose?.());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div ref={hostRef} className={`hx3d ${className}`} aria-hidden="true">
      <div className="hx3d__fallback">
        <Robot size={220} mood="wave" acc="headset" live />
      </div>
    </div>
  );
}
