/* ─────────────────────────────────────────────────────
   BEN·01 — Field Report runtime
   clock · spotlight · reveals · gear teeth · smooth.
   ────────────────────────────────────────────────── */
(() => {
  'use strict';

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── lagos clock (UTC+01, no DST) ─── */
  const clockEl = document.getElementById('clock');
  if (clockEl) {
    const pad = n => String(n).padStart(2, '0');
    const tick = () => {
      const now = new Date();
      const lagos = new Date(now.getTime() + (now.getTimezoneOffset() + 60) * 60000);
      clockEl.textContent = `lagos ${pad(lagos.getHours())}:${pad(lagos.getMinutes())}:${pad(lagos.getSeconds())}`;
    };
    tick();
    setInterval(tick, 1000);
  }

  /* ─── cursor spotlight (throttled via rAF) ─── */
  const spot = document.querySelector('.spot');
  if (spot && !reduceMotion) {
    let tx = 50, ty = 30, cx = 50, cy = 30, rafId = 0;
    const apply = () => {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      spot.style.setProperty('--mx', cx + '%');
      spot.style.setProperty('--my', cy + '%');
      if (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05) {
        rafId = requestAnimationFrame(apply);
      } else {
        rafId = 0;
      }
    };
    window.addEventListener('pointermove', (e) => {
      tx = (e.clientX / window.innerWidth) * 100;
      ty = (e.clientY / window.innerHeight) * 100;
      if (!rafId) rafId = requestAnimationFrame(apply);
    }, { passive: true });
  }

  /* ─── scroll reveals (IntersectionObserver) ─── */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    revealEls.forEach(el => io.observe(el));
  }

  /* ─── stagger log entry reveals ─── */
  const logEntries = document.querySelectorAll('.log__entry');
  logEntries.forEach((el, i) => {
    el.style.transitionDelay = (i * 80) + 'ms';
  });

  /* ─── generate gear teeth (sun + ring) ─── */
  const makeTeeth = (hostId, { count, innerR, outerR, color, width = 0.8 }) => {
    const host = document.getElementById(hostId);
    if (!host) return;
    const ns = 'http://www.w3.org/2000/svg';
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const angle = (360 / count) * i;
      const line = document.createElementNS(ns, 'line');
      const rad = angle * Math.PI / 180;
      line.setAttribute('x1', (Math.cos(rad) * innerR).toFixed(2));
      line.setAttribute('y1', (Math.sin(rad) * innerR).toFixed(2));
      line.setAttribute('x2', (Math.cos(rad) * outerR).toFixed(2));
      line.setAttribute('y2', (Math.sin(rad) * outerR).toFixed(2));
      line.setAttribute('stroke', color);
      line.setAttribute('stroke-width', width);
      line.setAttribute('stroke-linecap', 'butt');
      frag.appendChild(line);
    }
    host.appendChild(frag);
  };
  makeTeeth('sunTeeth',  { count: 24, innerR: 42, outerR: 52, color: 'currentColor', width: 1 });
  makeTeeth('ringTeeth', { count: 82, innerR: 170, outerR: 180, color: 'currentColor', width: 0.6 });

  /* ─── planet teeth on each planet ─── */
  document.querySelectorAll('.planet-teeth').forEach((host) => {
    const ns = 'http://www.w3.org/2000/svg';
    const frag = document.createDocumentFragment();
    const count = 18;
    for (let i = 0; i < count; i++) {
      const angle = (360 / count) * i;
      const line = document.createElementNS(ns, 'line');
      const rad = angle * Math.PI / 180;
      line.setAttribute('x1', (Math.cos(rad) * 30).toFixed(2));
      line.setAttribute('y1', (Math.sin(rad) * 30).toFixed(2));
      line.setAttribute('x2', (Math.cos(rad) * 38).toFixed(2));
      line.setAttribute('y2', (Math.sin(rad) * 38).toFixed(2));
      line.setAttribute('stroke', 'currentColor');
      line.setAttribute('stroke-width', '0.7');
      frag.appendChild(line);
    }
    host.appendChild(frag);
  });

  /* ─── subtle parallax on hero name ─── */
  const heroName = document.querySelector('.hero__name');
  if (heroName && !reduceMotion) {
    let latestScrollY = 0, ticking = false;
    const onScroll = () => {
      latestScrollY = window.scrollY;
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = Math.min(latestScrollY, 600);
          heroName.style.transform = `translateY(${y * -0.08}px)`;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ─── active section highlight in topnav ─── */
  const navLinks = document.querySelectorAll('.nav a');
  const sectionTargets = [...navLinks]
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  if (sectionTargets.length && 'IntersectionObserver' in window) {
    const idToLink = new Map();
    navLinks.forEach(a => {
      const id = a.getAttribute('href').slice(1);
      idToLink.set(id, a);
    });
    const clear = () => navLinks.forEach(a => a.classList.remove('is-active'));
    const navIO = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          clear();
          const id = entry.target.id;
          const link = idToLink.get(id);
          if (link) link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    sectionTargets.forEach(t => navIO.observe(t));
  }

  /* ─── ambient background: hairline topo lines with scroll-parallax ───
     Skipped on narrow viewports (<900px) and under reduced-motion. */
  const desktop = window.matchMedia('(min-width: 900px)').matches;
  if (!reduceMotion && desktop) {
    const canvas = document.createElement('canvas');
    canvas.className = 'doodles';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d', { alpha: true });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rand = (a, b) => a + Math.random() * (b - a);

    let w = 0, h = 0;
    let lines = [];
    let scrollY = window.scrollY;
    let mx = -9999;
    let lastPointer = 0;

    const buildLines = () => {
      lines = [];
      const count = 7;
      const margin = h * 0.08;
      const step = (h - margin * 2) / (count - 1);
      for (let i = 0; i < count; i++) {
        lines.push({
          y:      margin + i * step,
          amp1:   rand(16, 40),
          freq1:  rand(0.0028, 0.0055),
          phase1: rand(0, Math.PI * 2),
          amp2:   rand(5, 14),
          freq2:  rand(0.011, 0.019),
          phase2: rand(0, Math.PI * 2),
          drift:  rand(0.035, 0.09),          // horizontal drift speed
          parallax: rand(0.10, 0.28),         // vertical scroll factor
          brightness: rand(0.07, 0.14),       // base alpha
        });
      }
    };

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width  = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width  = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildLines();
    };

    const tick = (t) => {
      if (document.hidden) { requestAnimationFrame(tick); return; }
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const hasCursor = (performance.now() - lastPointer) < 3000;

      for (const L of lines) {
        const yOffset = -scrollY * L.parallax;
        const driftX  = t * L.drift;
        // wrap vertically so lines stay on screen while still responding to scroll
        let baseY = L.y + yOffset;
        baseY = ((baseY % h) + h) % h;

        // pre-compute a sampled path; we also hunt for the segment nearest
        // the cursor X to draw a small amber highlight there.
        const step = 4;
        let amberSegAt = -1;
        let bestDx = 120;
        if (hasCursor) {
          for (let x = 0; x < w; x += step) {
            const dx = Math.abs(x - mx);
            if (dx < bestDx) { bestDx = dx; amberSegAt = x; }
          }
        }

        // base trace
        ctx.strokeStyle = `rgba(138,134,132,${L.brightness.toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = -20; x <= w + 20; x += step) {
          const y = baseY
            + Math.sin((x + driftX)        * L.freq1 + L.phase1) * L.amp1
            + Math.sin((x + driftX * 1.7)  * L.freq2 + L.phase2) * L.amp2;
          if (x === -20) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // tiny amber highlight near cursor X (only on the nearest couple of lines)
        if (amberSegAt >= 0 && Math.abs(L.y - window.innerHeight * 0.5) < h * 0.85) {
          const segHalf = 60;
          ctx.strokeStyle = 'rgba(255,107,43,0.55)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          for (let x = amberSegAt - segHalf; x <= amberSegAt + segHalf; x += 3) {
            const y = baseY
              + Math.sin((x + driftX)       * L.freq1 + L.phase1) * L.amp1
              + Math.sin((x + driftX * 1.7) * L.freq2 + L.phase2) * L.amp2;
            const distFromCenter = Math.abs(x - amberSegAt) / segHalf;
            const alpha = (1 - distFromCenter) * 0.55;
            if (x === amberSegAt - segHalf) {
              ctx.moveTo(x, y);
            } else {
              ctx.strokeStyle = `rgba(255,107,43,${alpha.toFixed(3)})`;
              ctx.lineTo(x, y);
              ctx.stroke();
              ctx.beginPath();
              ctx.moveTo(x, y);
            }
          }
        }
      }

      requestAnimationFrame(tick);
    };

    resize();
    requestAnimationFrame(tick);

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('scroll', () => {
      scrollY = window.scrollY;
    }, { passive: true });
    window.addEventListener('pointermove', (e) => {
      mx = e.clientX;
      lastPointer = performance.now();
    }, { passive: true });
    window.addEventListener('pointerleave', () => { mx = -9999; });
  }

  /* ─── 6DOF robot arm — Three.js 3D, cursor-tracking IK, click to cycle mode ─── */
  const robot = document.querySelector('.robot');
  const stage = document.getElementById('robotStage');
  if (robot && stage && typeof THREE !== 'undefined'
      && !reduceMotion
      && window.matchMedia('(min-width: 1101px)').matches) {

    const hudJ1   = document.getElementById('robotJ1');
    const hudJ2   = document.getElementById('robotJ2');
    const hudJ3   = document.getElementById('robotJ3');
    const hudJ6   = document.getElementById('robotJ6');
    const hudMode = document.getElementById('robotMode');

    // ───── Three.js setup ─────
    const scene = new THREE.Scene();

    const aspect = () => stage.clientWidth / Math.max(1, stage.clientHeight);
    const camera = new THREE.PerspectiveCamera(32, aspect(), 0.01, 50);
    camera.position.set(0.9, 0.7, 1.5);
    camera.lookAt(0, 0.45, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(stage.clientWidth, stage.clientHeight, false);
    renderer.outputEncoding = THREE.sRGBEncoding;
    stage.appendChild(renderer.domElement);

    // lighting — cool key, warm amber accent
    scene.add(new THREE.AmbientLight(0xffffff, 0.22));
    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(2.5, 3, 2);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x6688aa, 0.35);
    fill.position.set(-2, 1.5, -1);
    scene.add(fill);
    const amberPoint = new THREE.PointLight(0xff6b2b, 0.85, 1.8, 1.5);
    amberPoint.position.set(0, 0.6, 0.25);
    scene.add(amberPoint);

    // materials
    const matLink  = new THREE.MeshStandardMaterial({ color: 0x242424, metalness: 0.55, roughness: 0.45 });
    const matLinkB = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.55, roughness: 0.55 });
    const matJoint = new THREE.MeshStandardMaterial({ color: 0x2e2e2e, metalness: 0.55, roughness: 0.4 });
    const matAmber = new THREE.MeshStandardMaterial({
      color: 0xff6b2b, emissive: 0xff6b2b, emissiveIntensity: 1.8,
      metalness: 0.2, roughness: 0.5
    });
    const matAccent = new THREE.MeshStandardMaterial({
      color: 0xff6b2b, emissive: 0xff6b2b, emissiveIntensity: 0.6,
      metalness: 0.3, roughness: 0.55
    });

    // ───── build robot ─────
    // Floor pad
    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.42, 0.008, 48),
      new THREE.MeshStandardMaterial({ color: 0x0e0e0e, metalness: 0.1, roughness: 0.9 })
    );
    pad.position.y = 0;
    scene.add(pad);

    // Radial ticks on the pad (decorative)
    const tickRingGeom = new THREE.RingGeometry(0.32, 0.33, 60);
    const tickRingMat = new THREE.MeshBasicMaterial({ color: 0x444444, side: THREE.DoubleSide, transparent: true, opacity: 0.35 });
    const tickRing = new THREE.Mesh(tickRingGeom, tickRingMat);
    tickRing.rotation.x = -Math.PI / 2;
    tickRing.position.y = 0.006;
    scene.add(tickRing);

    // Base mount (short truncated cone)
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.19, 0.22, 0.06, 32),
      matLinkB
    );
    base.position.y = 0.04;
    scene.add(base);

    // Amber stripe ring on the base
    const stripe = new THREE.Mesh(
      new THREE.TorusGeometry(0.205, 0.006, 8, 48),
      matAccent
    );
    stripe.rotation.x = Math.PI / 2;
    stripe.position.y = 0.065;
    scene.add(stripe);

    // J1 — waist rotation around Y
    const J1 = new THREE.Group();
    J1.position.y = 0.07;
    scene.add(J1);

    const waist = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.14, 0.13, 24),
      matLink
    );
    waist.position.y = 0.065;
    J1.add(waist);
    // J1 LED
    const j1Led = new THREE.Mesh(new THREE.SphereGeometry(0.012, 16, 12), matAmber);
    j1Led.position.set(0.12, 0.065, 0.05);
    J1.add(j1Led);

    // J2 — shoulder rotation around X (at top of waist column)
    const J2 = new THREE.Group();
    J2.position.y = 0.13;
    J1.add(J2);

    // shoulder yoke (two flanges)
    const yokeGeom = new THREE.CylinderGeometry(0.07, 0.07, 0.035, 24);
    const yokeL = new THREE.Mesh(yokeGeom, matJoint); yokeL.rotation.z = Math.PI / 2; yokeL.position.x = -0.05; J2.add(yokeL);
    const yokeR = new THREE.Mesh(yokeGeom, matJoint); yokeR.rotation.z = Math.PI / 2; yokeR.position.x =  0.05; J2.add(yokeR);
    const shoulderPivot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.028, 0.028, 0.135, 16),
      matAmber
    );
    shoulderPivot.rotation.z = Math.PI / 2;
    J2.add(shoulderPivot);

    // Upper arm (L1 = 0.34)
    const UPPER_LEN = 0.34;
    const upperArm = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, UPPER_LEN, 0.09),
      matLink
    );
    upperArm.position.y = UPPER_LEN / 2;
    J2.add(upperArm);
    // subtle amber spine running up the arm
    const spine1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.012, UPPER_LEN - 0.06, 0.005),
      matAccent
    );
    spine1.position.set(0.047, UPPER_LEN / 2, 0);
    J2.add(spine1);

    // J3 — elbow at top of upper arm
    const J3 = new THREE.Group();
    J3.position.y = UPPER_LEN;
    J2.add(J3);

    const elbowPivot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.055, 0.105, 24),
      matJoint
    );
    elbowPivot.rotation.z = Math.PI / 2;
    J3.add(elbowPivot);
    const elbowHub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.022, 0.11, 16),
      matAmber
    );
    elbowHub.rotation.z = Math.PI / 2;
    J3.add(elbowHub);

    // Forearm (L2 = 0.26)
    const FORE_LEN = 0.26;
    const forearm = new THREE.Mesh(
      new THREE.BoxGeometry(0.07, FORE_LEN, 0.07),
      matLink
    );
    forearm.position.y = FORE_LEN / 2;
    J3.add(forearm);
    // forearm amber stripe
    const spine2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.01, FORE_LEN - 0.05, 0.004),
      matAccent
    );
    spine2.position.set(0.037, FORE_LEN / 2, 0);
    J3.add(spine2);

    // J4 — wrist, combined into one pitch for this view
    const J4 = new THREE.Group();
    J4.position.y = FORE_LEN;
    J3.add(J4);

    const wristPivot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.038, 0.038, 0.07, 16),
      matJoint
    );
    wristPivot.rotation.z = Math.PI / 2;
    J4.add(wristPivot);
    const wristHub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.016, 0.016, 0.074, 16),
      matAmber
    );
    wristHub.rotation.z = Math.PI / 2;
    J4.add(wristHub);

    // Tool flange (cylinder)
    const flange = new THREE.Mesh(
      new THREE.CylinderGeometry(0.038, 0.03, 0.05, 18),
      matLink
    );
    flange.position.y = 0.045;
    J4.add(flange);
    const flangeRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.038, 0.003, 8, 28),
      matAccent
    );
    flangeRing.rotation.x = Math.PI / 2;
    flangeRing.position.y = 0.068;
    J4.add(flangeRing);

    // Gripper fingers
    const fingerGeom = new THREE.BoxGeometry(0.012, 0.055, 0.02);
    const finger1 = new THREE.Mesh(fingerGeom, matLink);
    finger1.position.set( 0.024, 0.115, 0);
    J4.add(finger1);
    const finger2 = new THREE.Mesh(fingerGeom, matLink);
    finger2.position.set(-0.024, 0.115, 0);
    J4.add(finger2);
    // inner gripper pad
    const pad1 = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.035, 0.015), matAccent);
    pad1.position.set( 0.018, 0.11, 0); J4.add(pad1);
    const pad2 = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.035, 0.015), matAccent);
    pad2.position.set(-0.018, 0.11, 0); J4.add(pad2);

    // TCP marker
    const tcp = new THREE.Mesh(new THREE.SphereGeometry(0.012, 18, 14), matAmber);
    tcp.position.y = 0.16;
    J4.add(tcp);

    // ───── IK ─────
    const L1 = UPPER_LEN;
    const L2 = FORE_LEN;
    const SHOULDER_WORLD_Y = 0.07 + 0.13;  // J1.position.y + J2.position.y (approx)
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

    // IK returns angles for J1 (waist yaw), J2 (shoulder pitch), J3 (elbow pitch),
    // and J4 (wrist pitch compensation to keep flange vertical-up).
    const solveIK = (target /* THREE.Vector3 world coords */) => {
      const j1 = Math.atan2(target.x, target.z);      // yaw toward target
      // horizontal distance from base axis
      const horiz = Math.hypot(target.x, target.z);
      // in the arm plane: +X=horizontal, +Y=vertical; shoulder at (0, SHOULDER_WORLD_Y)
      const tx = horiz;
      const ty = target.y - SHOULDER_WORLD_Y;

      let d = Math.hypot(tx, ty);
      const maxR = L1 + L2 - 0.01;
      const minR = Math.abs(L1 - L2) + 0.04;
      let rx = tx, ry = ty;
      if (d > maxR) { const k = maxR / d; rx = tx * k; ry = ty * k; d = maxR; }
      if (d < minR) { const k = minR / d; rx = tx * k; ry = ty * k; d = minR; }

      const cos3 = clamp((d*d - L1*L1 - L2*L2) / (2*L1*L2), -1, 1);
      const theta3 = Math.acos(cos3);  // elbow bend (always ≥ 0)
      const alpha  = Math.atan2(ry, rx);
      const beta   = Math.atan2(L2 * Math.sin(theta3), L1 + L2 * Math.cos(theta3));
      const theta2_plane = alpha - beta;  // upper-arm angle from horizontal, in plane

      // convert to joint rotations in local frames:
      //  - When J2.rotation.x = 0, upper arm points up (+Y). Tilting -X rotates it forward.
      //  - We want arm angle θ from horizontal → rotation.x = θ - π/2 (but Three.js sign flip)
      //  - After testing: rotation.x = Math.PI/2 - theta2_plane works
      const j2 = Math.PI / 2 - theta2_plane;
      const j3 = -theta3;     // bend the elbow "back" (forearm rotates CCW vs upper arm when viewed from -X side)
      const j4 = -(j2 + j3);  // keep flange vertical-up in world frame (approx)
      return { j1, j2, j3, j4 };
    };

    // ───── interaction ─────
    let cursorX = 0, cursorY = 0, cursorActive = false, lastCursor = 0;
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    // plane at z = 0 in world space (faces camera)
    const reachPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    window.addEventListener('pointermove', (e) => {
      cursorX = e.clientX; cursorY = e.clientY;
      cursorActive = true; lastCursor = performance.now();
    }, { passive: true });
    window.addEventListener('pointerleave', () => { cursorActive = false; });

    // modes
    const MODES = ['tracking', 'idle · sweep', 'paused'];
    let modeIdx = 0;

    const cycleMode = () => {
      modeIdx = (modeIdx + 1) % MODES.length;
      hudMode.textContent = MODES[modeIdx];
      hudMode.classList.toggle('amber', MODES[modeIdx] !== 'paused');
    };
    robot.addEventListener('click', cycleMode);
    robot.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cycleMode(); }
    });

    // current/target IK angles
    let j1c=0, j2c=-0.3, j3c=-1.2, j4c=0;

    const fmtDeg = (rad) => {
      const d = rad * 180 / Math.PI;
      return (d >= 0 ? '+' : '−') + Math.abs(d).toFixed(1).padStart(5, '0') + '°';
    };

    const worldTarget = new THREE.Vector3();

    const resize = () => {
      if (!stage.clientWidth) return;
      renderer.setSize(stage.clientWidth, stage.clientHeight, false);
      camera.aspect = aspect();
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', resize, { passive: true });

    const tickRobot = (t) => {
      const now = performance.now();
      const mode = MODES[modeIdx];

      let tX, tY, tZ;
      if (mode === 'tracking') {
        // auto-idle after inactivity is just a visual — don't change mode
        if (cursorActive) {
          const rect = stage.getBoundingClientRect();
          // NDC (-1..1) from cursor over the stage
          ndc.x = ((cursorX - rect.left) / rect.width) * 2 - 1;
          ndc.y = -((cursorY - rect.top) / rect.height) * 2 + 1;
          // extend the NDC range so the arm reaches a bit beyond the stage
          ndc.x *= 2.2;
          ndc.y *= 1.6;
          raycaster.setFromCamera(ndc, camera);
          const hit = new THREE.Vector3();
          if (raycaster.ray.intersectPlane(reachPlane, hit)) {
            tX = hit.x; tY = hit.y; tZ = hit.z + 0.25;  // bring target slightly in front
          } else {
            tX = 0.3; tY = 0.6; tZ = 0.25;
          }
        } else {
          tX = 0.3; tY = 0.55; tZ = 0.25;
        }
      } else if (mode === 'idle · sweep') {
        const p = t * 0.00055;
        tX = Math.sin(p) * 0.35;
        tY = 0.55 + Math.cos(p * 1.5) * 0.15;
        tZ = 0.2 + Math.sin(p * 0.8) * 0.15;
      } else { // paused — hold last target
        tX = worldTarget.x; tY = worldTarget.y; tZ = worldTarget.z;
      }

      worldTarget.set(tX, tY, tZ);
      const { j1, j2, j3, j4 } = solveIK(worldTarget);

      // smoothing
      const s = 0.12;
      j1c += (j1 - j1c) * s;
      j2c += (j2 - j2c) * s;
      j3c += (j3 - j3c) * s;
      j4c += (j4 - j4c) * s;

      J1.rotation.y = j1c;
      J2.rotation.x = j2c;
      J3.rotation.x = j3c;
      J4.rotation.x = j4c;

      hudJ1.textContent = fmtDeg(j1c);
      hudJ2.textContent = fmtDeg(j2c);
      hudJ3.textContent = fmtDeg(j3c);
      hudJ6.textContent = fmtDeg(j4c);

      renderer.render(scene, camera);
      requestAnimationFrame(tickRobot);
    };

    // init HUD & start
    hudMode.textContent = MODES[modeIdx];
    hudMode.classList.add('amber');
    requestAnimationFrame(tickRobot);
  }

  /* ─── keyboard nav shortcut: g then h/l/s/r/c ─── */
  let gMode = false, gTimer = 0;
  const shortcutMap = {
    h: '#top', b: '#brief', l: '#log', a: '#lab', s: '#stack', r: '#repos', n: '#langs', c: '#contact'
  };
  window.addEventListener('keydown', (e) => {
    if (e.target.matches('input, textarea')) return;
    if (e.key === 'g' && !gMode) {
      gMode = true;
      gTimer = setTimeout(() => { gMode = false; }, 900);
      return;
    }
    if (gMode && shortcutMap[e.key]) {
      clearTimeout(gTimer);
      gMode = false;
      const target = document.querySelector(shortcutMap[e.key]);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

})();
