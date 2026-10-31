import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * ฉาก 3 มิติหน้าแบบทดสอบ (โทนฟ้า–น้ำเงิน–ขาว)
 * - เครื่องหมาย "?" ขนาดใหญ่ เงาวาว ลอยหมุนช้า ๆ (คลิกเพื่อหมุนเร็ว)
 * - การ์ดตัวเลือก A B C D โคจรรอบ ทุก ๆ ไม่กี่วินาทีจะมีข้อหนึ่ง "ตอบถูก" เรืองสีเขียว พร้อมเครื่องหมายถูกเด้ง และพลุกระดาษ
 * - ดาว เครื่องหมายถูก ลูกบอลลอย · กล้องขยับตามเมาส์
 */
const LETTERS = [
  { l: 'A', c: '#3b5bdb' },
  { l: 'B', c: '#1c7ed6' },
  { l: 'C', c: '#7048e8' },
  { l: 'D', c: '#0ca678' }
];

function tex(c) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** หน้าการ์ดตัวเลือก: วงกลมตัวอักษร + เส้นข้อความ */
function cardFace(letter, color, good = false) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 300;
  const x = c.getContext('2d');
  x.fillStyle = good ? '#ebfbee' : '#ffffff';
  x.fillRect(0, 0, 512, 300);
  x.fillStyle = good ? '#2f9e44' : color;
  x.beginPath();
  x.arc(110, 150, 70, 0, Math.PI * 2);
  x.fill();
  x.fillStyle = '#fff';
  x.font = '700 84px "Prompt", "IBM Plex Sans Thai", sans-serif';
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.fillText(good ? '✓' : letter, 110, 156);
  x.fillStyle = good ? '#8ce99a' : '#dbe4ff';
  [[210, 112, 250], [210, 152, 200], [210, 192, 150]].forEach(([sx, sy, w]) => {
    x.beginPath();
    x.roundRect(sx, sy - 12, w, 24, 12);
    x.fill();
  });
  return tex(c);
}

function dotTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.4, 'rgba(165,216,255,0.8)');
  g.addColorStop(1, 'rgba(165,216,255,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, 64, 64);
  return tex(c);
}

function shadowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 2, 64, 64, 62);
  g.addColorStop(0, 'rgba(28,60,160,0.35)');
  g.addColorStop(1, 'rgba(28,60,160,0)');
  x.fillStyle = g;
  x.fillRect(0, 0, 128, 128);
  return tex(c);
}

function roundedRect(w, h, r) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2 + r, -h / 2);
  s.lineTo(w / 2 - r, -h / 2);
  s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  s.lineTo(w / 2, h / 2 - r);
  s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  s.lineTo(-w / 2 + r, h / 2);
  s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  s.lineTo(-w / 2, -h / 2 + r);
  s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  return s;
}

function starShape(r1, r2) {
  const s = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? r2 : r1;
    const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
    const p = [Math.cos(a) * r, Math.sin(a) * r];
    if (i) s.lineTo(...p);
    else s.moveTo(...p);
  }
  s.closePath();
  return s;
}

export default function QuizScene3D({ className = '' }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      host.classList.add('qx3d--fallback');
      return undefined;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    host.appendChild(renderer.domElement);

    const trash = [];
    const keep = (o) => (trash.push(o), o);
    const phys = (o) => keep(new THREE.MeshPhysicalMaterial(o));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 80);

    scene.add(new THREE.HemisphereLight(0xffffff, 0xa5c8ff, 1.5));
    const key = new THREE.DirectionalLight(0xffffff, 2.6);
    key.position.set(4, 6, 6);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x74c0fc, 1.6);
    fill.position.set(-5, 1, 3);
    scene.add(fill);
    const back = new THREE.DirectionalLight(0x9775fa, 1.4);
    back.position.set(0, 3, -6);
    scene.add(back);

    const world = new THREE.Group();
    scene.add(world);

    /* ---------- เครื่องหมาย ? ---------- */
    const qGroup = new THREE.Group();
    world.add(qGroup);
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.78, 0.95, 0),
      new THREE.Vector3(-0.55, 1.5, 0),
      new THREE.Vector3(0, 1.72, 0),
      new THREE.Vector3(0.6, 1.5, 0),
      new THREE.Vector3(0.78, 0.98, 0),
      new THREE.Vector3(0.5, 0.45, 0),
      new THREE.Vector3(0.05, 0.12, 0),
      new THREE.Vector3(0, -0.35, 0)
    ]);
    const qMat = phys({ color: 0x3b5bdb, roughness: 0.12, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.05, sheen: 0.4, sheenColor: 0x91a7ff });
    const qTube = new THREE.Mesh(keep(new THREE.TubeGeometry(curve, 120, 0.24, 32, false)), qMat);
    qGroup.add(qTube);
    [curve.getPoint(0), curve.getPoint(1)].forEach((p) => {
      const cap = new THREE.Mesh(keep(new THREE.SphereGeometry(0.24, 32, 20)), qMat);
      cap.position.copy(p);
      qGroup.add(cap);
    });
    const qDot = new THREE.Mesh(keep(new THREE.SphereGeometry(0.3, 40, 28)), phys({ color: 0x1c7ed6, roughness: 0.1, clearcoat: 1 }));
    qDot.position.y = -0.98;
    qGroup.add(qDot);
    qGroup.position.y = -0.25;

    // แท่นวงแหวนใต้ ?
    const ringMat = phys({ color: 0xffffff, roughness: 0.2, clearcoat: 1, transmission: 0.2 });
    const ring = new THREE.Mesh(keep(new THREE.TorusGeometry(1.25, 0.07, 16, 96)), ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -1.75;
    world.add(ring);
    const ring2 = new THREE.Mesh(keep(new THREE.TorusGeometry(1.6, 0.025, 8, 96)), keep(new THREE.MeshBasicMaterial({ color: 0x74c0fc, transparent: true, opacity: 0.7 })));
    ring2.rotation.x = Math.PI / 2;
    ring2.position.y = -1.75;
    world.add(ring2);
    const shadow = new THREE.Mesh(keep(new THREE.PlaneGeometry(5, 5)), keep(new THREE.MeshBasicMaterial({ map: keep(shadowTexture()), transparent: true, depthWrite: false })));
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = -1.82;
    world.add(shadow);

    /* ---------- การ์ดตัวเลือก ---------- */
    const cardGeo = keep(
      new THREE.ExtrudeGeometry(roundedRect(1.5, 0.88, 0.16), { depth: 0.1, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 3 })
    );
    cardGeo.center();
    const faceGeo = keep(new THREE.PlaneGeometry(1.42, 0.8));
    const cards = LETTERS.map((o, i) => {
      const g = new THREE.Group();
      const body = new THREE.Mesh(cardGeo, phys({ color: 0xffffff, roughness: 0.3, clearcoat: 0.6 }));
      g.add(body);
      const normal = keep(cardFace(o.l, o.c));
      const good = keep(cardFace(o.l, o.c, true));
      const faceMat = keep(new THREE.MeshBasicMaterial({ map: normal }));
      const face = new THREE.Mesh(faceGeo, faceMat);
      face.position.z = 0.085;
      g.add(face);
      g.userData = { a: (i / 4) * Math.PI * 2 + 0.4, normal, good, faceMat, body, pop: 0 };
      world.add(g);
      return g;
    });

    /* ---------- เครื่องหมายถูก / ดาว / ลูกบอล ---------- */
    const check = new THREE.Mesh(
      keep(
        new THREE.TubeGeometry(
          new THREE.CatmullRomCurve3([new THREE.Vector3(-0.3, 0, 0), new THREE.Vector3(-0.08, -0.22, 0), new THREE.Vector3(0.36, 0.3, 0)], false, 'catmullrom', 0.05),
          40,
          0.07,
          16
        )
      ),
      phys({ color: 0x40c057, roughness: 0.2, clearcoat: 1, emissive: 0x2b8a3e, emissiveIntensity: 0.3 })
    );
    check.scale.setScalar(0.001);
    world.add(check);

    const star = new THREE.Mesh(
      keep(new THREE.ExtrudeGeometry(starShape(0.34, 0.15), { depth: 0.1, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.03, bevelSegments: 3 })),
      phys({ color: 0xfcc419, roughness: 0.25, metalness: 0.2, clearcoat: 1, emissive: 0xf59f00, emissiveIntensity: 0.25 })
    );
    star.geometry.center();
    star.position.set(2.3, 1.7, -0.6);
    world.add(star);

    const balls = [
      [-2.5, 1.4, -1, 0.22, 0x74c0fc],
      [2.6, -0.9, 0.2, 0.18, 0x9775fa],
      [-2.2, -1.2, 0.4, 0.14, 0x4dabf7],
      [0.9, 2.3, -1.6, 0.12, 0xb197fc]
    ].map(([x, y, z, r, c], i) => {
      const m = new THREE.Mesh(keep(new THREE.SphereGeometry(r, 32, 20)), phys({ color: c, roughness: 0.1, clearcoat: 1 }));
      m.position.set(x, y, z);
      m.userData = { y, ph: i * 1.7 };
      world.add(m);
      return m;
    });

    /* ---------- อนุภาค + พลุกระดาษ ---------- */
    const dot = keep(dotTexture());
    const pn = 90;
    const pp = new Float32Array(pn * 3);
    for (let i = 0; i < pn; i++) {
      pp[i * 3] = (Math.random() - 0.5) * 9;
      pp[i * 3 + 1] = (Math.random() - 0.5) * 6;
      pp[i * 3 + 2] = (Math.random() - 0.5) * 4 - 2;
    }
    const pGeo = keep(new THREE.BufferGeometry());
    pGeo.setAttribute('position', new THREE.BufferAttribute(pp, 3));
    const sparkle = new THREE.Points(pGeo, keep(new THREE.PointsMaterial({ map: dot, size: 0.16, transparent: true, depthWrite: false, color: 0x91a7ff })));
    world.add(sparkle);

    const confColors = [0x4dabf7, 0x3b5bdb, 0xfcc419, 0x51cf66, 0x9775fa, 0xff8787];
    const confGeo = keep(new THREE.PlaneGeometry(0.09, 0.16));
    const confetti = Array.from({ length: 40 }, (_, i) => {
      const m = new THREE.Mesh(confGeo, keep(new THREE.MeshBasicMaterial({ color: confColors[i % confColors.length], side: THREE.DoubleSide, transparent: true })));
      m.visible = false;
      m.userData = { v: new THREE.Vector3(), life: 0, spin: new THREE.Vector3() };
      world.add(m);
      return m;
    });
    const burst = (from) => {
      confetti.forEach((m) => {
        m.visible = true;
        m.position.copy(from);
        m.userData.v.set((Math.random() - 0.5) * 4, Math.random() * 3 + 1.5, (Math.random() - 0.5) * 2);
        m.userData.spin.set(Math.random() * 8, Math.random() * 8, Math.random() * 8);
        m.userData.life = 1.6;
        m.material.opacity = 1;
      });
    };

    /* ---------- ขนาด ---------- */
    let wide = true;
    const resize = () => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      wide = camera.aspect > 0.9;
      camera.fov = wide ? 35 : 48;
      camera.updateProjectionMatrix();
      world.scale.setScalar(wide ? 1 : 0.82);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    /* ---------- เมาส์ / คลิก ---------- */
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e) => {
      const r = host.getBoundingClientRect();
      mouse.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
      mouse.ty = -(((e.clientY - r.top) / r.height) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    let spinBoost = 0;
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const onClick = (e) => {
      const r = renderer.domElement.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      if (ray.intersectObject(qGroup, true).length) spinBoost = Math.PI * 4;
    };
    renderer.domElement.addEventListener('click', onClick);

    /* ---------- วนเรนเดอร์ ---------- */
    const clock = new THREE.Clock();
    let raf = 0;
    let visible = true;
    let correct = -1;
    let nextPick = 1.5;
    let checkT = -1;
    const target = new THREE.Vector3();

    const frame = () => {
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;
      camera.position.set(mouse.x * 0.8, 0.5 + mouse.y * 0.5, 9);
      camera.lookAt(0, 0.1, 0);

      // ?
      const sb = spinBoost * 0.08;
      spinBoost -= sb;
      qGroup.rotation.y = Math.sin(t * 0.6) * 0.5 + (qGroup.userData.extra = (qGroup.userData.extra || 0) + sb);
      qGroup.position.y = -0.25 + Math.sin(t * 1.3) * 0.12;
      ring.rotation.z = t * 0.4;
      ring2.scale.setScalar(1 + Math.sin(t * 2) * 0.03);

      // เลือกข้อที่ถูก
      if (t > nextPick) {
        if (correct >= 0) cards[correct].userData.faceMat.map = cards[correct].userData.normal;
        correct = (correct + 1 + Math.floor(Math.random() * 3)) % 4;
        const u = cards[correct].userData;
        u.faceMat.map = u.good;
        u.pop = 1;
        checkT = 0;
        burst(cards[correct].position);
        nextPick = t + 3.6;
      }

      // การ์ดโคจร
      cards.forEach((c, i) => {
        const u = c.userData;
        const a = u.a + t * 0.32;
        c.position.set(Math.cos(a) * (wide ? 2.55 : 2.1), Math.sin(t * 1.1 + i) * 0.2 + (i % 2 ? 0.55 : -0.45), Math.sin(a) * 1.4);
        target.set(camera.position.x, camera.position.y, camera.position.z);
        c.lookAt(target);
        c.rotation.z += Math.sin(t + i) * 0.06;
        u.pop = Math.max(0, u.pop - dt * 0.9);
        const s = 1 + Math.sin(u.pop * Math.PI) * 0.18;
        c.scale.setScalar(s);
      });

      // เครื่องหมายถูกเด้งเหนือการ์ดที่ถูก
      if (checkT >= 0 && correct >= 0) {
        checkT += dt;
        const k = Math.min(1, checkT / 0.45);
        const out = checkT > 2.6 ? Math.max(0, 1 - (checkT - 2.6) / 0.4) : 1;
        const s = (1 - Math.pow(1 - k, 3)) * 1.3 * out + 0.001;
        check.scale.setScalar(s);
        check.position.copy(cards[correct].position).add(new THREE.Vector3(0, 0.75, 0.2));
        check.lookAt(camera.position);
        if (out <= 0) checkT = -1;
      }

      // พลุกระดาษ
      confetti.forEach((m) => {
        const u = m.userData;
        if (u.life <= 0) {
          m.visible = false;
          return;
        }
        u.life -= dt;
        u.v.y -= 6 * dt;
        m.position.addScaledVector(u.v, dt);
        m.rotation.x += u.spin.x * dt;
        m.rotation.y += u.spin.y * dt;
        m.material.opacity = Math.min(1, u.life);
      });

      star.rotation.y = t * 1.2;
      star.position.y = 1.7 + Math.sin(t * 1.5) * 0.15;
      balls.forEach((b) => (b.position.y = b.userData.y + Math.sin(t * 1.2 + b.userData.ph) * 0.2));
      sparkle.rotation.y = t * 0.03;
      sparkle.material.opacity = 0.6 + Math.sin(t * 2) * 0.25;

      renderer.render(scene, camera);
    };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (visible && !document.hidden) frame();
    };
    if (reduce) frame();
    else loop();
    const io = new IntersectionObserver(([en]) => (visible = en.isIntersecting));
    io.observe(host);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      renderer.domElement.removeEventListener('click', onClick);
      trash.forEach((d) => d.dispose?.());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={hostRef} className={`qx3d ${className}`} aria-hidden="true" />;
}
