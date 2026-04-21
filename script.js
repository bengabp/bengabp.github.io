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
    // framed so the glass enclosure sits in comfortable negative space
    camera.position.set(1.55, 1.1, 2.55);
    camera.lookAt(0, 0.48, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(stage.clientWidth, stage.clientHeight, false);
    renderer.outputEncoding = THREE.sRGBEncoding;
    stage.appendChild(renderer.domElement);

    // lighting — neutral/cool only; no warm coloured light pollution
    scene.add(new THREE.AmbientLight(0xffffff, 0.26));
    const key = new THREE.DirectionalLight(0xffffff, 1.0);
    key.position.set(2.5, 3, 2);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x8fa3b8, 0.28);
    fill.position.set(-2.2, 1.2, -1.2);
    scene.add(fill);

    // materials — OLED-friendly gunmetal, amber reserved for TCP + one or two LEDs
    const matLink   = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.55, roughness: 0.48 });
    const matLinkB  = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.5,  roughness: 0.58 });
    const matJoint  = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.6,  roughness: 0.4 });
    const matHub    = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.7,  roughness: 0.3 });
    const matPanel  = new THREE.MeshStandardMaterial({ color: 0x0f0f0f, metalness: 0.35, roughness: 0.6 });
    // dim "amber accent" — a desaturated warm grey, not the full amber
    const matAccent = new THREE.MeshStandardMaterial({
      color: 0x3b2a22, metalness: 0.3, roughness: 0.55
    });
    const matAmber  = new THREE.MeshStandardMaterial({
      color: 0xff6b2b, emissive: 0xff6b2b, emissiveIntensity: 1.8,
      metalness: 0.2, roughness: 0.5
    });

    // ───── build robot ─────
    // ═══ Modern cobot-style arm — cylinders, spheres, capsules ═══

    // Floor plate (inside the glass case)
    const floor = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 0.004, 48),
      new THREE.MeshStandardMaterial({ color: 0x0a0a0a, metalness: 0.25, roughness: 0.55 })
    );
    floor.position.y = 0;
    scene.add(floor);

    // Amber tick ring on the floor
    const tickRing = new THREE.Mesh(
      new THREE.RingGeometry(0.188, 0.193, 80),
      new THREE.MeshBasicMaterial({
        color: 0xff6b2b, transparent: true, opacity: 0.35, side: THREE.DoubleSide
      })
    );
    tickRing.rotation.x = -Math.PI / 2;
    tickRing.position.y = 0.003;
    scene.add(tickRing);

    // Base pedestal (smooth truncated cone)
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.14, 0.05, 40),
      matLinkB
    );
    base.position.y = 0.028;
    scene.add(base);

    // J1 rotation cap (flat disc between base and waist)
    const j1Cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.098, 0.098, 0.015, 40),
      matJoint
    );
    j1Cap.position.y = 0.062;
    scene.add(j1Cap);

    // ── J1 — waist ──
    const J1 = new THREE.Group();
    J1.position.y = 0.075;
    scene.add(J1);

    // Waist cylinder
    const waist = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.07, 0.115, 32),
      matLink
    );
    waist.position.y = 0.06;
    J1.add(waist);
    // Rounded cap on top of waist
    const waistCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      matLink
    );
    waistCap.position.y = 0.117;
    J1.add(waistCap);
    // J1 LED (small indicator)
    const j1Led = new THREE.Mesh(new THREE.SphereGeometry(0.008, 16, 12), matAmber);
    j1Led.position.set(0.058, 0.095, 0);
    J1.add(j1Led);

    // ── J2 — shoulder ──
    const J2 = new THREE.Group();
    J2.position.y = 0.125;
    J1.add(J2);

    // Shoulder sphere (around the pivot)
    const shoulderSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 28, 20),
      matJoint
    );
    J2.add(shoulderSphere);
    // Subtle amber ring around the shoulder hub
    const shoulderRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.057, 0.0022, 8, 32),
      new THREE.MeshStandardMaterial({
        color: 0xff6b2b, emissive: 0xff6b2b, emissiveIntensity: 0.55,
        metalness: 0.3, roughness: 0.5
      })
    );
    shoulderRing.rotation.y = Math.PI / 2;
    J2.add(shoulderRing);

    // Upper arm — sleek cylinder
    const UPPER_LEN = 0.32;
    const upperArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.036, 0.042, UPPER_LEN, 28),
      matLink
    );
    upperArm.position.y = UPPER_LEN / 2;
    J2.add(upperArm);

    // ── J3 — elbow ──
    const J3 = new THREE.Group();
    J3.position.y = UPPER_LEN;
    J2.add(J3);

    // Elbow sphere
    const elbowSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.044, 26, 18),
      matJoint
    );
    J3.add(elbowSphere);
    const elbowRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.046, 0.0018, 8, 28),
      new THREE.MeshStandardMaterial({
        color: 0xff6b2b, emissive: 0xff6b2b, emissiveIntensity: 0.45,
        metalness: 0.3, roughness: 0.5
      })
    );
    elbowRing.rotation.y = Math.PI / 2;
    J3.add(elbowRing);

    // Forearm cylinder
    const FORE_LEN = 0.24;
    const forearm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.028, 0.034, FORE_LEN, 26),
      matLink
    );
    forearm.position.y = FORE_LEN / 2;
    J3.add(forearm);

    // ── J4 — wrist ──
    const J4 = new THREE.Group();
    J4.position.y = FORE_LEN;
    J3.add(J4);

    // Wrist sphere
    const wristSphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 24, 16),
      matJoint
    );
    J4.add(wristSphere);

    // Tool flange
    const flange = new THREE.Mesh(
      new THREE.CylinderGeometry(0.024, 0.022, 0.04, 22),
      matLink
    );
    flange.position.y = 0.032;
    J4.add(flange);
    // Flange ring — amber accent
    const flangeRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.024, 0.0015, 8, 28),
      new THREE.MeshStandardMaterial({
        color: 0xff6b2b, emissive: 0xff6b2b, emissiveIntensity: 0.5,
        metalness: 0.3, roughness: 0.5
      })
    );
    flangeRing.rotation.x = Math.PI / 2;
    flangeRing.position.y = 0.053;
    J4.add(flangeRing);

    // Modern gripper — two rounded capsule fingers
    const fingerGeom = new THREE.CapsuleGeometry(0.006, 0.04, 6, 12);
    const finger1 = new THREE.Mesh(fingerGeom, matLink);
    finger1.position.set( 0.014, 0.085, 0);
    J4.add(finger1);
    const finger2 = new THREE.Mesh(fingerGeom, matLink);
    finger2.position.set(-0.014, 0.085, 0);
    J4.add(finger2);

    // TCP marker — glowing amber sphere
    const tcp = new THREE.Mesh(new THREE.SphereGeometry(0.009, 16, 12), matAmber);
    tcp.position.y = 0.118;
    J4.add(tcp);

    // ═══ Glass enclosure ═══
    const GLASS_W = 0.62;
    const GLASS_D = 0.55;
    const GLASS_H = 0.92;
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xd8e4ef,
      metalness: 0,
      roughness: 0.08,
      transparent: true,
      opacity: 0.06,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const makeGlassWall = (w, h, x, y, z, ry) => {
      const wall = new THREE.Mesh(new THREE.PlaneGeometry(w, h), glassMat);
      wall.position.set(x, y, z);
      wall.rotation.y = ry;
      return wall;
    };
    scene.add(makeGlassWall(GLASS_W, GLASS_H, 0,            GLASS_H/2,  GLASS_D/2, 0));
    scene.add(makeGlassWall(GLASS_W, GLASS_H, 0,            GLASS_H/2, -GLASS_D/2, Math.PI));
    scene.add(makeGlassWall(GLASS_D, GLASS_H,  GLASS_W/2,  GLASS_H/2,  0,          -Math.PI/2));
    scene.add(makeGlassWall(GLASS_D, GLASS_H, -GLASS_W/2,  GLASS_H/2,  0,           Math.PI/2));
    // top plate
    const glassTop = new THREE.Mesh(
      new THREE.PlaneGeometry(GLASS_W, GLASS_D),
      glassMat
    );
    glassTop.rotation.x = Math.PI / 2;
    glassTop.position.y = GLASS_H;
    scene.add(glassTop);
    // Edge hairlines around the case for visual definition
    const edgeGeom = new THREE.EdgesGeometry(
      new THREE.BoxGeometry(GLASS_W, GLASS_H, GLASS_D)
    );
    const edgeLines = new THREE.LineSegments(
      edgeGeom,
      new THREE.LineBasicMaterial({ color: 0x5a5a5a, transparent: true, opacity: 0.55 })
    );
    edgeLines.position.y = GLASS_H / 2;
    scene.add(edgeLines);

    // Amber corner accents on the front bottom edges of the glass
    const accentGeom = new THREE.CylinderGeometry(0.003, 0.003, 0.04, 8);
    const accentMat = new THREE.MeshStandardMaterial({
      color: 0xff6b2b, emissive: 0xff6b2b, emissiveIntensity: 0.7
    });
    [-1, 1].forEach(sx => {
      const c = new THREE.Mesh(accentGeom, accentMat);
      c.position.set(sx * GLASS_W/2, 0.025, GLASS_D/2);
      scene.add(c);
    });

    // ───── IK ─────
    const L1 = UPPER_LEN;
    const L2 = FORE_LEN;
    const SHOULDER_WORLD_Y = 0.075 + 0.125;  // J1.position.y + J2.position.y
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

    // IK returns angles for J1 (waist yaw), J2 (shoulder pitch), J3 (elbow pitch),
    // and J4 (wrist pitch compensation to keep flange vertical-up).
    // Joint limits approximate a real industrial arm and prevent odd folding.
    const J2_MIN = -Math.PI / 3;   // -60° (arm can tilt back a bit)
    const J2_MAX =  Math.PI / 2;   // +90° (arm fully forward, not past horizontal-downward)
    const J3_MIN = -2.4;           // ~-138° (fully bent)
    const J3_MAX = -0.05;          // never fully straight; keeps a visible elbow bend
    const J4_MIN = -Math.PI / 2 * 0.9;
    const J4_MAX =  Math.PI / 2 * 0.9;

    const solveIK = (target /* THREE.Vector3 world coords */) => {
      // keep target above the pad — prevents arm diving into the floor
      const safeY = Math.max(SHOULDER_WORLD_Y - 0.08, target.y);

      const j1 = Math.atan2(target.x, target.z);
      const horiz = Math.hypot(target.x, target.z);
      // require target sit at least slightly in front of the base
      const safeHoriz = Math.max(0.12, horiz);

      const tx = safeHoriz;
      const ty = safeY - SHOULDER_WORLD_Y;

      let d = Math.hypot(tx, ty);
      const maxR = L1 + L2 - 0.01;
      const minR = Math.abs(L1 - L2) + 0.04;
      let rx = tx, ry = ty;
      if (d > maxR) { const k = maxR / d; rx = tx * k; ry = ty * k; d = maxR; }
      if (d < minR) { const k = minR / d; rx = tx * k; ry = ty * k; d = minR; }

      const cos3 = clamp((d*d - L1*L1 - L2*L2) / (2*L1*L2), -1, 1);
      const theta3 = Math.acos(cos3);
      const alpha  = Math.atan2(ry, rx);
      const beta   = Math.atan2(L2 * Math.sin(theta3), L1 + L2 * Math.cos(theta3));
      const theta2_plane = alpha - beta;

      let j2 = Math.PI / 2 - theta2_plane;
      let j3 = -theta3;
      // clamp to realistic joint ranges
      j2 = clamp(j2, J2_MIN, J2_MAX);
      j3 = clamp(j3, J3_MIN, J3_MAX);

      let j4 = -(j2 + j3);
      j4 = clamp(j4, J4_MIN, J4_MAX);
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

  /* ─── per-section accent theming + snappy arrow-key section nav ─── */
  const themed = [
    { el: document.querySelector('.hero'),      key: 'hero'    },
    { el: document.getElementById('brief'),     key: 'brief'   },
    { el: document.getElementById('log'),       key: 'log'     },
    { el: document.getElementById('lab'),       key: 'lab'     },
    { el: document.getElementById('stack'),     key: 'stack'   },
    { el: document.getElementById('langs'),     key: 'langs'   },
    { el: document.querySelector('.edu'),       key: 'edu'     },
    { el: document.getElementById('contact'),   key: 'contact' },
  ].filter(s => s.el);

  document.body.dataset.section = 'hero';
  if (themed.length) {
    /* Scroll-based detection: the "current" section is the last one
       whose top has crossed above a trigger line at 35% viewport.
       More reliable than intersectionRatio sorting for tall sections. */
    let themeRaf = 0;
    const updateSection = () => {
      themeRaf = 0;
      const triggerY = window.scrollY + window.innerHeight * 0.35;
      let current = themed[0].key;
      for (const s of themed) {
        const top = s.el.getBoundingClientRect().top + window.scrollY;
        if (top <= triggerY) current = s.key;
      }
      if (document.body.dataset.section !== current) {
        document.body.dataset.section = current;
      }
    };
    const scheduleUpdate = () => {
      if (!themeRaf) themeRaf = requestAnimationFrame(updateSection);
    };
    window.addEventListener('scroll',  scheduleUpdate, { passive: true });
    window.addEventListener('resize',  scheduleUpdate);
    window.addEventListener('load',    updateSection);
    updateSection();
  }

  /* Snappy scroll — custom rAF animation, bypasses scroll-behavior: smooth. */
  const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);
  let scrollAnim = 0;
  const snappyScrollTo = (targetY, duration = 420) => {
    if (reduceMotion) { window.scrollTo(0, targetY); return; }
    cancelAnimationFrame(scrollAnim);
    const startY = window.scrollY;
    const delta = targetY - startY;
    if (Math.abs(delta) < 2) return;
    const t0 = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - t0) / duration);
      window.scrollTo(0, startY + delta * easeOutQuart(t));
      if (t < 1) scrollAnim = requestAnimationFrame(step);
    };
    scrollAnim = requestAnimationFrame(step);
  };

  const sectionTops = () => themed.map(s =>
    s.el.getBoundingClientRect().top + window.scrollY
  );

  const jumpSection = (dir) => {
    const tops = sectionTops();
    const cur = window.scrollY;
    let targetY;
    if (dir > 0) {
      targetY = tops.find(t => t > cur + 12);
      if (targetY == null) {
        targetY = document.documentElement.scrollHeight - window.innerHeight;
      }
    } else {
      for (let i = tops.length - 1; i >= 0; i--) {
        if (tops[i] < cur - 12) { targetY = tops[i]; break; }
      }
      if (targetY == null) targetY = 0;
    }
    snappyScrollTo(targetY);
  };

  /* Snappy override for in-page anchor links (nav + anywhere else). */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href === '#' || href.length < 2) return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const y = target.getBoundingClientRect().top + window.scrollY;
    snappyScrollTo(y, 480);
    history.replaceState(null, '', href);
  });

  /* ─── keyboard nav: g+letter shortcuts, plus arrow / pageup-pagedown ─── */
  let gMode = false, gTimer = 0;
  const shortcutMap = {
    h: '#top', b: '#brief', l: '#log', a: '#lab', s: '#stack', n: '#langs', c: '#contact'
  };
  window.addEventListener('keydown', (e) => {
    if (e.target.matches('input, textarea, [contenteditable="true"]')) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      e.preventDefault();
      jumpSection(+1);
      return;
    }
    if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      jumpSection(-1);
      return;
    }
    if (e.key === 'Home') { e.preventDefault(); snappyScrollTo(0, 520); return; }
    if (e.key === 'End')  {
      e.preventDefault();
      snappyScrollTo(document.documentElement.scrollHeight - window.innerHeight, 520);
      return;
    }

    if (e.key === 'g' && !gMode) {
      gMode = true;
      gTimer = setTimeout(() => { gMode = false; }, 900);
      return;
    }
    if (gMode && shortcutMap[e.key]) {
      clearTimeout(gTimer);
      gMode = false;
      const target = document.querySelector(shortcutMap[e.key]);
      if (target) {
        const y = target.getBoundingClientRect().top + window.scrollY;
        snappyScrollTo(y, 480);
      }
    }
  });

})();
