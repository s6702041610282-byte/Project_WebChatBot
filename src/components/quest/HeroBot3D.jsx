import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * ฉาก Three.js หน้าหลัก — หุ่นยนต์ “บิท” 3 มิติ ลอยตัว โบกมือ กะพริบตา หันตามเมาส์
 * มีฟองแชตหมุนรอบตัว รูปทรงลอย และอนุภาค · คลิกที่บิทเพื่อให้กระโดดทักทาย
 */
const WORDS = ['สวัสดี!', 'ถามได้เลย', 'Intent', 'FAQ', 'Rich Menu', 'ตอบ 24 ชม.'];

function bubbleTexture(text, hue) {
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  const font = '600 44px "IBM Plex Sans Thai", "Noto Sans Thai", sans-serif';
  ctx.font = font;
  const w = Math.ceil(ctx.measureText(text).width) + 72;
  c.width = w;
  c.height = 112;
  ctx.font = font;
  const r = 36;
  ctx.fillStyle = hue.bg;
  ctx.strokeStyle = hue.line;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(r, 4);
  ctx.arcTo(w - 4, 4, w - 4, 84, r);
  ctx.arcTo(w - 4, 84, 4, 84, r);
  ctx.lineTo(54, 84);
  ctx.lineTo(34, 106);
  ctx.lineTo(38, 84);
  ctx.arcTo(4, 84, 4, 4, r);
  ctx.arcTo(4, 4, w - 4, 4, r);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = hue.ink;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 36, 46);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return { tex, aspect: w / 112 };
}

function shadowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d').createRadialGradient(64, 64, 4, 64, 64, 62);
  g.addColorStop(0, 'rgba(27,37,89,0.35)');
  g.addColorStop(1, 'rgba(27,37,89,0)');
  const ctx = c.getContext('2d');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

export default function HeroBot3D({ className = '' }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      host.classList.add('hero3d--fallback');
      return undefined;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 1.1, 10);
    camera.lookAt(0, 0.6, 0);

    scene.add(new THREE.HemisphereLight(0xffffff, 0xc5b8ff, 1.6));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(3, 5, 6);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x91a7ff, 1.4);
    rim.position.set(-5, 2, -4);
    scene.add(rim);

    const disposables = [];
    const mat = (o) => {
      const m = new THREE.MeshStandardMaterial(o);
      disposables.push(m);
      return m;
    };
    const geo = (g) => {
      disposables.push(g);
      return g;
    };

    const white = mat({ color: 0xffffff, roughness: 0.35, metalness: 0.05 });
    const navy = mat({ color: 0x1e2a5a, roughness: 0.15, metalness: 0.2 });
    const blue = mat({ color: 0x3b5bdb, roughness: 0.4, metalness: 0.1 });
    const blueLight = mat({ color: 0x91a7ff, roughness: 0.4 });
    const cyan = mat({ color: 0x5ff5e0, emissive: 0x2ee6cf, emissiveIntensity: 1.2, roughness: 0.2 });
    const orange = mat({ color: 0xff922b, emissive: 0xff7a00, emissiveIntensity: 0.8 });
    const pink = mat({ color: 0xff8fab, roughness: 0.6, transparent: true, opacity: 0.85 });
    const grey = mat({ color: 0xc5cbe3, roughness: 0.5 });

    const bot = new THREE.Group();
    scene.add(bot);

    // หัว
    const headPivot = new THREE.Group();
    headPivot.position.y = 1.55;
    bot.add(headPivot);
    const head = new THREE.Mesh(geo(new THREE.SphereGeometry(1, 48, 32)), white);
    head.scale.set(1.22, 1, 1.02);
    headPivot.add(head);
    const visor = new THREE.Mesh(geo(new THREE.SphereGeometry(1, 48, 32)), navy);
    visor.scale.set(0.98, 0.7, 0.5);
    visor.position.set(0, 0, 0.6);
    headPivot.add(visor);

    const eyes = [];
    [-0.36, 0.36].forEach((x) => {
      const e = new THREE.Mesh(geo(new THREE.SphereGeometry(0.17, 24, 16)), cyan);
      e.scale.set(1, 1.3, 0.5);
      e.position.set(x, 0.06, 1.06);
      headPivot.add(e);
      eyes.push(e);
      const glint = new THREE.Mesh(geo(new THREE.SphereGeometry(0.05, 12, 8)), white);
      glint.position.set(x - 0.06, 0.16, 1.13);
      headPivot.add(glint);
    });
    const smile = new THREE.Mesh(geo(new THREE.TorusGeometry(0.15, 0.035, 8, 24, Math.PI)), cyan);
    smile.rotation.z = Math.PI;
    smile.position.set(0, -0.22, 1.08);
    headPivot.add(smile);
    [-0.78, 0.78].forEach((x) => {
      const ch = new THREE.Mesh(geo(new THREE.SphereGeometry(0.12, 16, 12)), pink);
      ch.scale.set(1.3, 0.7, 0.4);
      ch.position.set(x, -0.42, 0.78);
      headPivot.add(ch);
    });
    [-1.24, 1.24].forEach((x) => {
      const ear = new THREE.Mesh(geo(new THREE.CylinderGeometry(0.3, 0.3, 0.22, 32)), blue);
      ear.rotation.z = Math.PI / 2;
      ear.position.set(x, 0, 0);
      headPivot.add(ear);
      const cap = new THREE.Mesh(geo(new THREE.CylinderGeometry(0.16, 0.16, 0.24, 24)), blueLight);
      cap.rotation.z = Math.PI / 2;
      cap.position.set(x * 1.04, 0, 0);
      headPivot.add(cap);
    });
    const stalk = new THREE.Mesh(geo(new THREE.CylinderGeometry(0.05, 0.05, 0.45, 12)), grey);
    stalk.position.y = 1.15;
    headPivot.add(stalk);
    const bulb = new THREE.Mesh(geo(new THREE.SphereGeometry(0.15, 20, 16)), orange);
    bulb.position.y = 1.42;
    headPivot.add(bulb);

    // ลำตัว
    const body = new THREE.Mesh(geo(new THREE.CapsuleGeometry(0.62, 0.5, 8, 24)), blue);
    body.position.y = 0.05;
    body.scale.set(1.05, 1, 0.85);
    bot.add(body);
    const chest = new THREE.Mesh(geo(new THREE.BoxGeometry(0.72, 0.46, 0.08)), white);
    chest.position.set(0, 0.12, 0.54);
    bot.add(chest);
    const dots = [];
    [-0.18, 0, 0.18].forEach((x) => {
      const d = new THREE.Mesh(geo(new THREE.SphereGeometry(0.055, 12, 8)), blueLight);
      d.position.set(x, 0.12, 0.6);
      bot.add(d);
      dots.push(d);
    });
    const ring = new THREE.Mesh(geo(new THREE.TorusGeometry(0.6, 0.06, 12, 48)), mat({ color: 0xb197fc, emissive: 0x9775fa, emissiveIntensity: 0.7 }));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -0.78;
    bot.add(ring);

    // แขน (หมุนที่หัวไหล่)
    const arms = [-1, 1].map((side) => {
      const pivot = new THREE.Group();
      pivot.position.set(side * 0.72, 0.4, 0);
      const arm = new THREE.Mesh(geo(new THREE.CapsuleGeometry(0.14, 0.5, 6, 16)), blue);
      arm.position.y = -0.38;
      pivot.add(arm);
      const hand = new THREE.Mesh(geo(new THREE.SphereGeometry(0.2, 20, 16)), white);
      hand.position.y = -0.78;
      pivot.add(hand);
      pivot.rotation.z = side * 0.35;
      bot.add(pivot);
      return pivot;
    });

    // เงา
    const shTex = shadowTexture();
    disposables.push(shTex);
    const shadowMat = new THREE.MeshBasicMaterial({ map: shTex, transparent: true, depthWrite: false });
    disposables.push(shadowMat);
    const shadow = new THREE.Mesh(geo(new THREE.PlaneGeometry(3, 3)), shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -1.65;
    scene.add(shadow);

    // รูปทรงลอยรอบ ๆ
    const shapes = [
      { g: new THREE.IcosahedronGeometry(0.34, 0), c: 0xb197fc, p: [-3.1, 2.1, -1] },
      { g: new THREE.TorusGeometry(0.3, 0.11, 16, 32), c: 0x74c0fc, p: [3.2, 2.3, -1.4] },
      { g: new THREE.OctahedronGeometry(0.28, 0), c: 0xffa94d, p: [3.3, -0.9, 0] },
      { g: new THREE.BoxGeometry(0.34, 0.34, 0.34), c: 0x91a7ff, p: [-3.2, -0.8, 0.2] },
      { g: new THREE.TetrahedronGeometry(0.26, 0), c: 0x63e6be, p: [-1.9, 3.2, -2] }
    ].map((s, i) => {
      const m = new THREE.Mesh(geo(s.g), mat({ color: s.c, roughness: 0.3, metalness: 0.1, flatShading: true }));
      m.position.set(...s.p);
      m.userData = { base: s.p[1], speed: 0.6 + i * 0.15, phase: i };
      scene.add(m);
      return m;
    });

    // อนุภาค
    const pCount = 70;
    const pos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 1] = Math.random() * 6 - 2;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 2;
    }
    const pGeo = geo(new THREE.BufferGeometry());
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x9775fa, size: 0.05, transparent: true, opacity: 0.6 });
    disposables.push(pMat);
    scene.add(new THREE.Points(pGeo, pMat));

    // ฟองแชตหมุนรอบตัว (สร้างหลังฟอนต์โหลด)
    const bubbles = [];
    const hues = [
      { bg: '#ffffff', line: '#bac8ff', ink: '#1b2559' },
      { bg: '#f3f0ff', line: '#b197fc', ink: '#5f3dc4' },
      { bg: '#e7f5ff', line: '#74c0fc', ink: '#1864ab' },
      { bg: '#fff4e6', line: '#ffc078', ink: '#d9480f' }
    ];
    let alive = true;
    const build = () => {
      if (!alive) return;
      WORDS.forEach((w, i) => {
        const { tex, aspect } = bubbleTexture(w, hues[i % hues.length]);
        const m = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
        disposables.push(tex, m);
        const s = new THREE.Sprite(m);
        const h = 0.42;
        s.scale.set(h * aspect, h, 1);
        s.userData = { a: (i / WORDS.length) * Math.PI * 2, y: 0.4 + (i % 3) * 0.9, h, aspect, pop: 0 };
        scene.add(s);
        bubbles.push(s);
      });
    };
    (document.fonts?.ready || Promise.resolve()).then(build);

    // ขนาด
    const resize = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.position.z = w < 520 ? 12.5 : 10;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    // เมาส์ / คลิก
    const pointer = new THREE.Vector2(0, 0);
    const look = new THREE.Vector2(0, 0);
    const ray = new THREE.Raycaster();
    let jump = 0;
    const onMove = (e) => {
      const r = host.getBoundingClientRect();
      pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    };
    const onClick = (e) => {
      onMove(e);
      ray.setFromCamera(pointer, camera);
      if (ray.intersectObject(bot, true).length) {
        jump = 1;
        bubbles.forEach((b) => (b.userData.pop = 1));
      }
    };
    host.addEventListener('pointermove', onMove);
    host.addEventListener('pointerdown', onClick);
    const onLeave = () => pointer.set(0, 0);
    host.addEventListener('pointerleave', onLeave);

    // เล่นเฉพาะเมื่ออยู่บนจอ
    let visible = true;
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
    });
    io.observe(host);

    const clock = new THREE.Clock();
    let raf;
    let blinkAt = 2;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime * (reduce ? 0.3 : 1);

      // ลอยขึ้นลง + กระโดดเมื่อถูกคลิก
      jump = Math.max(0, jump - dt * 1.6);
      const hop = Math.sin(jump * Math.PI) * 0.9;
      bot.position.y = Math.sin(t * 1.6) * 0.12 + hop;
      bot.rotation.y = Math.sin(t * 0.5) * 0.12 + jump * Math.PI * 2;
      shadow.scale.setScalar(1 - (bot.position.y + 0.2) * 0.25);
      ring.rotation.z = t;

      // หันหน้าตามเมาส์
      look.lerp(pointer, 0.06);
      headPivot.rotation.y = look.x * 0.55;
      headPivot.rotation.x = -look.y * 0.3;
      scene.rotation.y = look.x * 0.06;

      // โบกมือขวา / แขนซ้ายแกว่ง
      arms[1].rotation.z = 2.3 + Math.sin(t * 6) * 0.35;
      arms[0].rotation.z = -0.35 + Math.sin(t * 1.6) * 0.08;

      // กะพริบตา
      blinkAt -= dt;
      const blink = blinkAt < 0.12 ? 0.15 : 1;
      if (blinkAt < 0) blinkAt = 2.5 + Math.random() * 2.5;
      eyes.forEach((e) => (e.scale.y = 1.3 * blink));
      bulb.material.emissiveIntensity = 0.6 + Math.sin(t * 4) * 0.4;
      dots.forEach((d, i) => (d.position.y = 0.12 + Math.max(0, Math.sin(t * 5 - i * 0.7)) * 0.06));

      // ฟองแชตหมุนรอบ
      bubbles.forEach((b) => {
        const u = b.userData;
        const a = u.a + t * 0.35;
        b.position.set(Math.cos(a) * 3, u.y + Math.sin(t * 1.3 + u.a) * 0.15, Math.sin(a) * 1.8 - 0.4);
        u.pop = Math.max(0, u.pop - dt * 2);
        const k = 1 + Math.sin(u.pop * Math.PI) * 0.35;
        const depth = 0.75 + (Math.sin(a) + 1) * 0.18;
        b.scale.set(u.h * u.aspect * k * depth, u.h * k * depth, 1);
        b.material.opacity = 0.55 + (Math.sin(a) + 1) * 0.225;
      });

      shapes.forEach((m) => {
        const u = m.userData;
        m.rotation.x += dt * u.speed * 0.6;
        m.rotation.y += dt * u.speed;
        m.position.y = u.base + Math.sin(t * u.speed + u.phase) * 0.18;
      });

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      host.removeEventListener('pointermove', onMove);
      host.removeEventListener('pointerdown', onClick);
      host.removeEventListener('pointerleave', onLeave);
      disposables.forEach((d) => d.dispose?.());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={hostRef} className={`hero3d ${className}`} role="img" aria-label="หุ่นยนต์บิท 3 มิติ ลอยตัวและโบกมือทักทาย คลิกเพื่อให้กระโดด" />;
}
