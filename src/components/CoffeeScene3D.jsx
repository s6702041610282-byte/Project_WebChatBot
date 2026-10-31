import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * ฉาก 3 มิติ (Three.js) — แก้วเครื่องดื่มความรู้ 6 ชั้น
 * - ชั้นเครื่องดื่มหนาตามสัดส่วนของแต่ละหัวข้อ เทลงทีละชั้นตอนเปิดหน้า
 * - วิปครีม เชอร์รี หลอด ไอร้อน เมล็ดกาแฟลอยรอบแก้ว
 * - น้องบอท 3 มิตินั่งเกาะขอบแก้วและโบกมือ
 * - ชี้/แตะที่ชั้นเพื่อเลือกหัวข้อ ลากเพื่อหมุนแก้ว
 *
 * @param {{no:number,short:string,percent:number,color:string}[]} parts
 * @param {number|null} active      ชั้นที่เลือกอยู่
 * @param {(i:number)=>void} onPick เรียกเมื่อผู้ใช้ชี้/แตะชั้น
 */
export default function CoffeeScene3D({ parts, active, onPick }) {
  const wrapRef = useRef(null);
  const labelRef = useRef(null);
  const activeRef = useRef(active);
  const pickRef = useRef(onPick);
  activeRef.current = active;
  pickRef.current = onPick;

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return undefined;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------- พื้นฐาน ---------- */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    wrap.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    camera.position.set(0, 3.9, 11.4);
    camera.lookAt(0, 2.0, 0);

    scene.add(new THREE.HemisphereLight(0xeaf2ff, 0xf3e3cf, 1.25));
    const sun = new THREE.DirectionalLight(0xffffff, 2.2);
    sun.position.set(4, 8, 5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -4;
    sun.shadow.camera.right = 4;
    sun.shadow.camera.top = 6;
    sun.shadow.camera.bottom = -2;
    sun.shadow.radius = 6;
    scene.add(sun);
    const rim = new THREE.PointLight(0x7dd3fc, 18, 14);
    rim.position.set(-4, 3, -3);
    scene.add(rim);
    const warm = new THREE.PointLight(0xfbbf24, 10, 12);
    warm.position.set(3.5, 1, 3);
    scene.add(warm);

    const world = new THREE.Group();
    scene.add(world);
    const disposables = [];
    const keep = (x) => {
      disposables.push(x);
      return x;
    };

    /* ---------- แก้ว ---------- */
    const H = 2.5; // ความสูงของเครื่องดื่ม
    const R0 = 0.78; // รัศมีก้นแก้ว
    const R1 = 1.02; // รัศมีปากแก้ว
    const radiusAt = (y) => R0 + (R1 - R0) * (y / H);

    const glassPts = [
      new THREE.Vector2(0, -0.1),
      new THREE.Vector2(R0 + 0.08, -0.1),
      new THREE.Vector2(R0 + 0.1, 0),
      new THREE.Vector2(R1 + 0.12, H + 0.32),
      new THREE.Vector2(R1 + 0.06, H + 0.36),
      new THREE.Vector2(R0 + 0.03, 0.03),
      new THREE.Vector2(0, 0.03)
    ];
    const glass = new THREE.Mesh(
      keep(new THREE.LatheGeometry(glassPts, 72)),
      keep(
        new THREE.MeshPhysicalMaterial({
          color: 0xffffff,
          roughness: 0.05,
          metalness: 0,
          transparent: true,
          opacity: 0.28,
          clearcoat: 1,
          clearcoatRoughness: 0.05,
          side: THREE.DoubleSide,
          depthWrite: false
        })
      )
    );
    glass.renderOrder = 10;
    world.add(glass);

    // ขอบปากแก้ว
    const lip = new THREE.Mesh(
      keep(new THREE.TorusGeometry(R1 + 0.09, 0.045, 12, 72)),
      keep(new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.7, roughness: 0.1, clearcoat: 1 }))
    );
    lip.rotation.x = Math.PI / 2;
    lip.position.y = H + 0.34;
    world.add(lip);

    // จานรอง
    const saucer = new THREE.Mesh(
      keep(new THREE.CylinderGeometry(1.75, 1.45, 0.14, 64)),
      keep(new THREE.MeshStandardMaterial({ color: 0xfffaf0, roughness: 0.35 }))
    );
    saucer.position.y = -0.18;
    saucer.receiveShadow = true;
    saucer.castShadow = true;
    world.add(saucer);
    const saucerRing = new THREE.Mesh(
      keep(new THREE.TorusGeometry(1.62, 0.035, 8, 64)),
      keep(new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.5 }))
    );
    saucerRing.rotation.x = Math.PI / 2;
    saucerRing.position.y = -0.1;
    world.add(saucerRing);

    // เงานุ่ม ๆ บนพื้น
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = shadowCanvas.height = 128;
    const sctx = shadowCanvas.getContext('2d');
    const sg = sctx.createRadialGradient(64, 64, 4, 64, 64, 64);
    sg.addColorStop(0, 'rgba(37,99,235,0.35)');
    sg.addColorStop(1, 'rgba(37,99,235,0)');
    sctx.fillStyle = sg;
    sctx.fillRect(0, 0, 128, 128);
    const floor = new THREE.Mesh(
      keep(new THREE.PlaneGeometry(6, 6)),
      keep(new THREE.MeshBasicMaterial({ map: keep(new THREE.CanvasTexture(shadowCanvas)), transparent: true, depthWrite: false }))
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.26;
    world.add(floor);

    /* ---------- ชั้นเครื่องดื่ม 6 ชั้น ---------- */
    const layers = [];
    let y = 0.04;
    const usable = H - 0.04 - 0.02 * (parts.length - 1);
    parts.forEach((p, i) => {
      const h = (p.percent / 100) * usable;
      const geo = keep(new THREE.CylinderGeometry(radiusAt(y + h) - 0.03, radiusAt(y) - 0.03, h, 64, 1));
      geo.translate(0, h / 2, 0);
      const col = new THREE.Color(p.color);
      const mat = keep(
        new THREE.MeshPhysicalMaterial({
          color: col,
          roughness: 0.25,
          clearcoat: 0.6,
          sheen: 0.5,
          emissive: col,
          emissiveIntensity: 0.06
        })
      );
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.y = y;
      mesh.scale.y = 0.0001;
      mesh.castShadow = true;
      mesh.userData = { index: i, mid: y + h / 2, radius: radiusAt(y + h / 2) };
      world.add(mesh);
      layers.push(mesh);
      y += h + 0.02;
    });

    /* ---------- วิปครีม + เชอร์รี ---------- */
    const creamMat = keep(new THREE.MeshStandardMaterial({ color: 0xfffdf7, roughness: 0.55 }));
    const cream = new THREE.Group();
    [0.95, 0.78, 0.6, 0.42, 0.24].forEach((r, k) => {
      const t = new THREE.Mesh(keep(new THREE.TorusGeometry(r, 0.2 - k * 0.018, 16, 48)), creamMat);
      t.rotation.x = Math.PI / 2;
      t.position.y = 0.12 + k * 0.2;
      t.castShadow = true;
      cream.add(t);
    });
    const tip = new THREE.Mesh(keep(new THREE.SphereGeometry(0.2, 24, 16)), creamMat);
    tip.position.y = 1.12;
    tip.scale.set(1, 1.3, 1);
    cream.add(tip);
    const cherry = new THREE.Mesh(
      keep(new THREE.SphereGeometry(0.19, 32, 24)),
      keep(new THREE.MeshPhysicalMaterial({ color: 0xe11d48, roughness: 0.15, clearcoat: 1 }))
    );
    cherry.position.y = 1.42;
    cream.add(cherry);
    const stem = new THREE.Mesh(
      keep(
        new THREE.TubeGeometry(
          new THREE.CatmullRomCurve3([new THREE.Vector3(0, 1.55, 0), new THREE.Vector3(0.06, 1.75, 0), new THREE.Vector3(0.2, 1.88, 0)]),
          12,
          0.025,
          6
        )
      ),
      keep(new THREE.MeshStandardMaterial({ color: 0x15803d }))
    );
    cream.add(stem);
    // เกล็ดน้ำตาลสี
    const sprinkleColors = [0x8b5cf6, 0x38bdf8, 0xf472b6, 0xfbbf24, 0x10b981];
    for (let k = 0; k < 26; k += 1) {
      const sp = new THREE.Mesh(
        keep(new THREE.CapsuleGeometry(0.025, 0.08, 4, 6)),
        keep(new THREE.MeshStandardMaterial({ color: sprinkleColors[k % 5], roughness: 0.4 }))
      );
      const a = k * 2.4;
      const rr = 0.25 + (k % 5) * 0.16;
      sp.position.set(Math.cos(a) * rr, 0.35 + (1 - rr) * 0.75, Math.sin(a) * rr);
      sp.rotation.set(a, a * 0.7, a * 1.3);
      cream.add(sp);
    }
    cream.position.y = H + 0.25;
    cream.scale.setScalar(0.0001);
    world.add(cream);

    /* ---------- หลอด ---------- */
    const straw = new THREE.Mesh(
      keep(
        new THREE.TubeGeometry(
          new THREE.CatmullRomCurve3([
            new THREE.Vector3(0.35, 0.5, 0.15),
            new THREE.Vector3(0.62, 3.6, 0.25),
            new THREE.Vector3(0.75, 4.15, 0.28),
            new THREE.Vector3(1.2, 4.3, 0.3)
          ]),
          48,
          0.075,
          12
        )
      ),
      keep(new THREE.MeshPhysicalMaterial({ color: 0xf472b6, roughness: 0.3, clearcoat: 0.8 }))
    );
    straw.castShadow = true;
    world.add(straw);

    /* ---------- เมล็ดกาแฟลอย ---------- */
    const beanGeo = keep(new THREE.SphereGeometry(0.17, 24, 16));
    const beanMat = keep(new THREE.MeshPhysicalMaterial({ color: 0x6b3f1d, roughness: 0.35, clearcoat: 0.6 }));
    const grooveGeo = keep(new THREE.TorusGeometry(0.14, 0.018, 6, 24, Math.PI));
    const grooveMat = keep(new THREE.MeshStandardMaterial({ color: 0x3b1f0b }));
    const beans = [];
    for (let k = 0; k < 9; k += 1) {
      const bean = new THREE.Group();
      const body = new THREE.Mesh(beanGeo, beanMat);
      body.scale.set(1, 0.72, 1.35);
      body.castShadow = true;
      const groove = new THREE.Mesh(grooveGeo, grooveMat);
      groove.rotation.set(0, Math.PI / 2, 0);
      groove.position.y = 0.11;
      groove.scale.set(1, 1, 1.3);
      bean.add(body, groove);
      bean.userData = { a: (k / 9) * Math.PI * 2, r: 2.05 + (k % 3) * 0.28, y: 0.4 + ((k * 0.73) % 2.6), s: 0.25 + (k % 4) * 0.06 };
      world.add(bean);
      beans.push(bean);
    }

    /* ---------- ไอร้อน ---------- */
    const steamCanvas = document.createElement('canvas');
    steamCanvas.width = steamCanvas.height = 64;
    const stx = steamCanvas.getContext('2d');
    const stg = stx.createRadialGradient(32, 32, 2, 32, 32, 32);
    stg.addColorStop(0, 'rgba(255,255,255,0.9)');
    stg.addColorStop(1, 'rgba(255,255,255,0)');
    stx.fillStyle = stg;
    stx.fillRect(0, 0, 64, 64);
    const steamTex = keep(new THREE.CanvasTexture(steamCanvas));
    const steams = [];
    for (let k = 0; k < 7; k += 1) {
      const s = new THREE.Sprite(keep(new THREE.SpriteMaterial({ map: steamTex, transparent: true, depthWrite: false, opacity: 0 })));
      s.userData = { off: k / 7, x: (k % 3) * 0.25 - 0.25 };
      world.add(s);
      steams.push(s);
    }

    /* ---------- น้องบอท 3 มิติ ---------- */
    const bot = new THREE.Group();
    const white = keep(new THREE.MeshPhysicalMaterial({ color: 0xf8fbff, roughness: 0.3, clearcoat: 0.8 }));
    const blue = keep(new THREE.MeshPhysicalMaterial({ color: 0x60a5fa, roughness: 0.3, clearcoat: 0.6 }));
    const visor = keep(new THREE.MeshPhysicalMaterial({ color: 0x0b1530, roughness: 0.1, clearcoat: 1 }));
    const glow = keep(new THREE.MeshBasicMaterial({ color: 0x67e8f9 }));
    const pink = keep(new THREE.MeshBasicMaterial({ color: 0xf9a8d4 }));

    const body = new THREE.Mesh(keep(new THREE.SphereGeometry(0.34, 32, 24)), white);
    body.scale.set(1, 0.9, 0.85);
    body.position.y = 0.35;
    const heart = new THREE.Mesh(keep(new THREE.SphereGeometry(0.07, 16, 12)), glow);
    heart.position.set(0, 0.36, 0.29);
    const head = new THREE.Group();
    head.position.y = 0.92;
    const skull = new THREE.Mesh(keep(new THREE.SphereGeometry(0.42, 40, 28)), white);
    skull.scale.set(1.25, 0.95, 1);
    const face = new THREE.Mesh(keep(new THREE.SphereGeometry(0.36, 40, 28)), visor);
    face.scale.set(1.18, 0.78, 0.6);
    face.position.z = 0.17;
    face.scale.z = 0.75;
    const eyeGeo = keep(new THREE.SphereGeometry(0.075, 16, 12));
    const eyeL = new THREE.Mesh(eyeGeo, glow);
    const eyeR = new THREE.Mesh(eyeGeo, glow);
    eyeL.position.set(-0.15, 0.03, 0.43);
    eyeR.position.set(0.15, 0.03, 0.43);
    eyeL.scale.z = eyeR.scale.z = 0.35;
    const blushL = new THREE.Mesh(keep(new THREE.CircleGeometry(0.05, 16)), pink);
    const blushR = blushL.clone();
    blushL.position.set(-0.27, -0.09, 0.4);
    blushR.position.set(0.27, -0.09, 0.4);
    const earGeo = keep(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 20));
    const earL = new THREE.Mesh(earGeo, blue);
    const earR = new THREE.Mesh(earGeo, blue);
    earL.rotation.z = earR.rotation.z = Math.PI / 2;
    earL.position.x = -0.53;
    earR.position.x = 0.53;
    const antenna = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.022, 0.022, 0.24, 8)), blue);
    antenna.position.y = 0.48;
    const bulb = new THREE.Mesh(keep(new THREE.SphereGeometry(0.075, 16, 12)), glow);
    bulb.position.y = 0.63;
    head.add(skull, face, eyeL, eyeR, blushL, blushR, earL, earR, antenna, bulb);

    const armGeo = keep(new THREE.CapsuleGeometry(0.07, 0.26, 6, 12));
    const armL = new THREE.Group();
    const armR = new THREE.Group();
    const armMeshL = new THREE.Mesh(armGeo, blue);
    const armMeshR = new THREE.Mesh(armGeo, blue);
    armMeshL.position.y = -0.17;
    armMeshR.position.y = -0.17;
    armL.add(armMeshL);
    armR.add(armMeshR);
    armL.position.set(-0.36, 0.5, 0);
    armR.position.set(0.36, 0.5, 0);
    armL.rotation.z = -0.5;
    const legGeo = keep(new THREE.CapsuleGeometry(0.075, 0.18, 6, 12));
    const legL = new THREE.Mesh(legGeo, blue);
    const legR = new THREE.Mesh(legGeo, blue);
    legL.position.set(-0.15, 0.02, 0.18);
    legR.position.set(0.15, 0.02, 0.18);
    legL.rotation.x = legR.rotation.x = 1.25;
    bot.add(body, heart, head, armL, armR, legL, legR);
    bot.traverse((o) => {
      if (o.isMesh) o.castShadow = true;
    });
    bot.scale.setScalar(0.88);
    bot.position.set(-0.98, H + 0.3, 0.42);
    bot.rotation.y = 0.45;
    world.add(bot);

    /* ---------- ขนาด / การมองเห็น ---------- */
    const resize = () => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.position.z = w < 420 ? 13 : 11.4;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    io.observe(wrap);

    /* ---------- เมาส์ / แตะ ---------- */
    const pointer = new THREE.Vector2(9, 9);
    const ray = new THREE.Raycaster();
    let dragging = null;
    let spin = 0;
    let spinVel = 0;
    let tiltX = 0;
    let tiltY = 0;
    let lastPicked = -1;
    const onMove = (e) => {
      const r = wrap.getBoundingClientRect();
      pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      pointer.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      if (dragging) {
        const dx = e.clientX - dragging.x;
        spin = dragging.spin + dx * 0.01;
        spinVel = (e.clientX - dragging.lx) * 0.01;
        dragging.lx = e.clientX;
      }
    };
    const onDown = (e) => {
      dragging = { x: e.clientX, lx: e.clientX, spin };
      wrap.setPointerCapture?.(e.pointerId);
    };
    const onUp = () => {
      dragging = null;
    };
    const onLeave = () => {
      pointer.set(9, 9);
    };
    const onClick = () => {
      ray.setFromCamera(pointer, camera);
      const hit = ray.intersectObjects(layers, false)[0];
      if (hit) pickRef.current?.(hit.object.userData.index);
    };
    wrap.addEventListener('pointermove', onMove);
    wrap.addEventListener('pointerdown', onDown);
    wrap.addEventListener('pointerup', onUp);
    wrap.addEventListener('pointerleave', onLeave);
    wrap.addEventListener('click', onClick);

    /* ---------- แอนิเมชัน ---------- */
    const clock = new THREE.Clock();
    const easeOutBack = (t) => {
      const c = 1.6;
      return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
    };
    const v = new THREE.Vector3();
    let frame = 0;

    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (!visible) return;
      const t = clock.getElapsedTime();

      // เทเครื่องดื่มทีละชั้น
      layers.forEach((m, i) => {
        const start = 0.3 + i * 0.32;
        const k = Math.min(1, Math.max(0, (t - start) / 0.7));
        const isActive = activeRef.current === i;
        const grow = k > 0 ? easeOutBack(k) : 0.0001;
        m.scale.y = Math.max(0.0001, grow);
        const target = isActive ? 1.07 : 1;
        m.scale.x += (target - m.scale.x) * 0.15;
        m.scale.z = m.scale.x;
        m.material.emissiveIntensity += ((isActive ? 0.45 : 0.05) - m.material.emissiveIntensity) * 0.12;
      });
      const creamK = Math.min(1, Math.max(0, (t - (0.4 + parts.length * 0.32)) / 0.6));
      cream.scale.setScalar(creamK > 0 ? Math.max(0.0001, easeOutBack(creamK)) : 0.0001);

      // หมุนแก้ว: อัตโนมัติ + ลาก + แรงเฉื่อย
      if (!dragging) {
        spin += spinVel;
        spinVel *= 0.94;
        if (!reduce) spin += 0.0035;
      }
      tiltX += (pointer.y > 5 ? 0 : pointer.y * 0.08 - tiltX) * 0.05;
      tiltY += (pointer.x > 5 ? 0 : pointer.x * 0.15 - tiltY) * 0.05;
      world.rotation.y = spin + tiltY;
      world.rotation.x = -tiltX;
      world.position.y = Math.sin(t * 1.2) * 0.05;

      // เมล็ดกาแฟโคจรรอบแก้ว
      beans.forEach((b) => {
        const d = b.userData;
        const a = d.a + t * d.s;
        b.position.set(Math.cos(a) * d.r, d.y + Math.sin(t * 1.5 + d.a * 3) * 0.18, Math.sin(a) * d.r);
        b.rotation.set(t * 0.8 + d.a, t * 1.1, d.a);
      });

      // ไอร้อนลอยขึ้น
      steams.forEach((s) => {
        const p = (t * 0.32 + s.userData.off) % 1;
        s.position.set(s.userData.x + Math.sin(p * 6 + s.userData.off * 9) * 0.15, H + 1.9 + p * 1.5, 0);
        const sc = 0.35 + p * 0.65;
        s.scale.set(sc, sc, sc);
        s.material.opacity = creamK * Math.sin(p * Math.PI) * 0.55;
      });

      // น้องบอท: หายใจ โบกมือ กะพริบตา มองตามเมาส์
      bot.position.y = H + 0.3 + Math.abs(Math.sin(t * 2.2)) * 0.06;
      armR.rotation.z = 2.4 + Math.sin(t * 6) * 0.35;
      head.rotation.y = pointer.x > 5 ? Math.sin(t * 0.8) * 0.2 : pointer.x * 0.4;
      head.rotation.x = pointer.y > 5 ? 0 : -pointer.y * 0.2;
      head.rotation.z = Math.sin(t * 1.3) * 0.06;
      const blink = (t % 3.4) > 3.27 ? 0.1 : 1;
      eyeL.scale.y = eyeR.scale.y = blink;
      bulb.scale.setScalar(1 + Math.sin(t * 4) * 0.15);

      // ชี้เพื่อเลือกชั้น
      if (!dragging && pointer.x < 5) {
        ray.setFromCamera(pointer, camera);
        const hit = ray.intersectObjects(layers, false)[0];
        wrap.style.cursor = hit ? 'pointer' : 'grab';
        if (hit && hit.object.userData.index !== lastPicked) {
          lastPicked = hit.object.userData.index;
          pickRef.current?.(lastPicked);
        }
        if (!hit) lastPicked = -1;
      }

      // ป้ายชื่อติดตามชั้นที่เลือก
      const ai = activeRef.current;
      const label = labelRef.current;
      if (label) {
        if (ai !== null && ai !== undefined && layers[ai] && layers[ai].scale.y > 0.5) {
          const m = layers[ai];
          v.set(m.userData.radius + 0.1, m.userData.mid, 0);
          v.applyAxisAngle(new THREE.Vector3(0, 1, 0), -world.rotation.y);
          world.localToWorld(v);
          v.project(camera);
          label.style.opacity = '1';
          const px = ((v.x + 1) / 2) * wrap.clientWidth;
          const py = ((1 - v.y) / 2) * wrap.clientHeight;
          const flip = px + label.offsetWidth + 24 > wrap.clientWidth;
          label.classList.toggle('is-flip', flip);
          label.style.transform = flip
            ? `translate(${px - 60}px, ${py}px) translate(-100%, -50%)`
            : `translate(${px}px, ${py}px) translate(16px, -50%)`;
        } else {
          label.style.opacity = '0';
        }
      }

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
      wrap.removeEventListener('pointermove', onMove);
      wrap.removeEventListener('pointerdown', onDown);
      wrap.removeEventListener('pointerup', onUp);
      wrap.removeEventListener('pointerleave', onLeave);
      wrap.removeEventListener('click', onClick);
      disposables.forEach((d) => d.dispose?.());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [parts]);

  const cur = active !== null && active !== undefined ? parts[active] : null;

  return (
    <div ref={wrapRef} className="c3d" role="img" aria-label="แก้วเครื่องดื่ม 3 มิติ 6 ชั้น แทนสัดส่วนเนื้อหา 6 หัวข้อ">
      <span ref={labelRef} className="c3d-label" style={{ '--c': cur?.color }} aria-hidden="true">
        {cur && (
          <>
            <b>{cur.percent}%</b> {cur.no}. {cur.short}
          </>
        )}
      </span>
    </div>
  );
}
