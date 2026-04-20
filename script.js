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

  /* ─── 6DOF robot arm — cursor-tracking IK ─── */
  const robot = document.querySelector('.robot');
  if (robot && !reduceMotion && window.matchMedia('(min-width: 1101px)').matches) {
    const svg      = robot.querySelector('.robot__svg');
    const jShoulder = document.getElementById('robotShoulder');
    const jElbow    = document.getElementById('robotElbow');
    const jWrist    = document.getElementById('robotWrist');
    const hudJ1     = document.getElementById('robotJ1');
    const hudJ2     = document.getElementById('robotJ2');
    const hudJ3     = document.getElementById('robotJ3');
    const hudJ6     = document.getElementById('robotJ6');
    const hudMode   = document.getElementById('robotMode');

    // link lengths in SVG viewBox units — match the HTML geometry
    const L1 = 110;  // shoulder → elbow
    const L2 = 85;   // elbow → wrist
    const SHOULDER_VB = { x: 0, y: 0 };   // pivot in viewBox
    const ELBOW_VB_Y  = -110;
    const WRIST_VB_Y  = -195;

    let curT1 = 0, curT2 = 0, curT3 = 0;
    let curJ1 = 0;                   // fake J1 waist motion (decorative)
    let cursorX = 0, cursorY = 0;
    let cursorActive = false;
    let lastCursor = 0;

    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

    const ik = (tx, ty) => {
      let d = Math.hypot(tx, ty);
      const maxR = L1 + L2 - 3;
      const minR = Math.abs(L1 - L2) + 8;
      if (d > maxR) { tx *= maxR / d; ty *= maxR / d; d = maxR; }
      if (d < minR) { tx *= minR / d; ty *= minR / d; d = minR; }
      const c = clamp((d * d - L1 * L1 - L2 * L2) / (2 * L1 * L2), -1, 1);
      const theta2 = Math.acos(c);
      const alpha  = Math.atan2(tx, -ty);
      const beta   = Math.atan2(L2 * Math.sin(theta2), L1 + L2 * Math.cos(theta2));
      const theta1 = alpha - beta;
      return { theta1, theta2 };
    };

    window.addEventListener('pointermove', (e) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
      cursorActive = true;
      lastCursor = performance.now();
    }, { passive: true });
    window.addEventListener('pointerleave', () => { cursorActive = false; });

    const fmtDeg = (rad) => {
      const d = rad * 180 / Math.PI;
      const sign = d >= 0 ? '+' : '−';
      return sign + Math.abs(d).toFixed(1).padStart(5, '0') + '°';
    };

    const tickRobot = (t) => {
      const now = performance.now();
      const idle = !cursorActive || (now - lastCursor > 2500);

      let tx, ty;
      if (idle) {
        hudMode.textContent = 'idle · sweep';
        hudMode.classList.remove('amber');
        const p = t * 0.00045;
        tx = Math.sin(p) * 95;
        ty = -140 + Math.cos(p * 1.4) * 38;
      } else {
        hudMode.textContent = 'tracking';
        hudMode.classList.add('amber');
        const rect = svg.getBoundingClientRect();
        const vb = svg.viewBox.baseVal;
        // cursor → viewBox coords
        const sx = ((cursorX - rect.left) / rect.width)  * vb.width  + vb.x;
        const sy = ((cursorY - rect.top)  / rect.height) * vb.height + vb.y;
        tx = sx - SHOULDER_VB.x;
        ty = sy - SHOULDER_VB.y;
      }

      const { theta1, theta2 } = ik(tx, ty);
      const targetJ6 = -(theta1 + theta2);      // keep flange pointing "up" in world

      // decorative J1 waist sway
      const targetJ1 = Math.sin(t * 0.00025) * 0.18 + (idle ? 0 : (cursorX / window.innerWidth - 0.5) * 0.4);

      // critically-damped smoothing
      const s = 0.14;
      curT1 += (theta1  - curT1) * s;
      curT2 += (theta2  - curT2) * s;
      curT3 += (targetJ6 - curT3) * s;
      curJ1 += (targetJ1 - curJ1) * s;

      const d2r = 180 / Math.PI;
      jShoulder.setAttribute('transform', `rotate(${(curT1 * d2r).toFixed(2)} ${SHOULDER_VB.x} ${SHOULDER_VB.y})`);
      jElbow.setAttribute   ('transform', `rotate(${(curT2 * d2r).toFixed(2)} 0 ${ELBOW_VB_Y})`);
      jWrist.setAttribute   ('transform', `rotate(${(curT3 * d2r).toFixed(2)} 0 ${WRIST_VB_Y})`);

      hudJ1.textContent = fmtDeg(curJ1);
      hudJ2.textContent = fmtDeg(curT1);
      hudJ3.textContent = fmtDeg(curT2);
      hudJ6.textContent = fmtDeg(curT3);

      requestAnimationFrame(tickRobot);
    };

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
