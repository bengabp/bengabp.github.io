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

  /* ─── reactive background: circuit substrate + glyph field ─── */
  if (!reduceMotion) {
    const canvas = document.createElement('canvas');
    canvas.className = 'doodles';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d', { alpha: true });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const glyphs = ['·', '·', '·', '·', '·', '·', '+', '+', '○', '×', '◦', '∙'];

    let w = 0, h = 0;
    let points = [];     // glyph grid
    let traces = [];     // PCB-style polylines with traveling pulses
    let gears  = [];     // tiny rotating gears in corners
    let mx = -9999, my = -9999;
    let lastPointer = 0;

    const rand = (a, b) => a + Math.random() * (b - a);

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width  = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width  = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildGrid();
      buildTraces();
      buildGears();
    };

    /* ── glyph grid ── */
    const buildGrid = () => {
      points = [];
      const step = 76;
      let row = 0;
      for (let y = step * 0.5; y < h + step; y += step, row++) {
        const offset = row % 2 ? step * 0.5 : 0;
        for (let x = step * 0.5 + offset; x < w + step; x += step) {
          points.push({
            hx: x, hy: y, x, y,
            g: glyphs[Math.floor(Math.random() * glyphs.length)],
            phase: Math.random() * Math.PI * 2,
            spd:   0.6 + Math.random() * 0.8,
          });
        }
      }
    };

    /* ── circuit traces (Manhattan polylines with signal pulses) ── */
    const makeTrace = () => {
      const pts = [[rand(-100, w + 100), rand(-100, h + 100)]];
      const nSegs = 3 + Math.floor(Math.random() * 4);
      let horiz = Math.random() < 0.5;
      let [x, y] = pts[0];
      for (let i = 0; i < nSegs; i++) {
        const len = rand(80, 320);
        const dir = Math.random() < 0.5 ? 1 : -1;
        if (horiz) x += len * dir; else y += len * dir;
        x = Math.max(-200, Math.min(w + 200, x));
        y = Math.max(-200, Math.min(h + 200, y));
        pts.push([x, y]);
        horiz = !horiz;
      }
      const segLens = [];
      let total = 0;
      for (let i = 1; i < pts.length; i++) {
        const d = Math.abs(pts[i][0] - pts[i-1][0]) + Math.abs(pts[i][1] - pts[i-1][1]);
        segLens.push(d);
        total += d;
      }
      const pulseCount = 1 + (Math.random() < 0.45 ? 1 : 0);
      const pulses = [];
      for (let i = 0; i < pulseCount; i++) {
        pulses.push({ pos: Math.random() * total, speed: rand(0.7, 2.2) });
      }
      return { pts, segLens, total, pulses };
    };

    const buildTraces = () => {
      traces = [];
      const count = Math.min(11, Math.max(5, Math.floor((w * h) / 220000)));
      for (let i = 0; i < count; i++) traces.push(makeTrace());
    };

    const posAlong = (trace, pos) => {
      let p = ((pos % trace.total) + trace.total) % trace.total;
      let acc = 0;
      for (let i = 0; i < trace.segLens.length; i++) {
        const L = trace.segLens[i];
        if (acc + L >= p) {
          const t = L > 0 ? (p - acc) / L : 0;
          const [x1, y1] = trace.pts[i];
          const [x2, y2] = trace.pts[i+1];
          return { x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t };
        }
        acc += L;
      }
      const last = trace.pts[trace.pts.length - 1];
      return { x: last[0], y: last[1] };
    };

    /* ── corner gears ── */
    const buildGears = () => {
      gears = [
        { cx: 56,     cy: 56,     r: 26, teeth: 14, dir:  1, speed: 0.010 },
        { cx: w - 56, cy: h - 56, r: 34, teeth: 18, dir: -1, speed: 0.008 },
      ];
    };

    const drawGear = (g, t) => {
      const rot = t * g.speed * g.dir;
      ctx.save();
      ctx.translate(g.cx, g.cy);
      ctx.rotate(rot);
      ctx.strokeStyle = 'rgba(138,134,132,0.18)';
      ctx.lineWidth = 1;
      // inner & outer circles
      ctx.beginPath(); ctx.arc(0, 0, g.r, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, g.r - 6, 0, Math.PI * 2); ctx.stroke();
      // teeth
      for (let i = 0; i < g.teeth; i++) {
        const a = (Math.PI * 2 / g.teeth) * i;
        const x1 = Math.cos(a) * g.r;
        const y1 = Math.sin(a) * g.r;
        const x2 = Math.cos(a) * (g.r + 4);
        const y2 = Math.sin(a) * (g.r + 4);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      // hub
      ctx.fillStyle = 'rgba(255,107,43,0.28)';
      ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill();
      // registration mark
      ctx.strokeStyle = 'rgba(255,107,43,0.35)';
      ctx.beginPath(); ctx.moveTo(0, -g.r); ctx.lineTo(0, -g.r + 5); ctx.stroke();
      ctx.restore();
    };

    /* ── main draw loop ── */
    const tick = (t) => {
      if (document.hidden) { requestAnimationFrame(tick); return; }
      ctx.clearRect(0, 0, w, h);

      const hasCursor = (performance.now() - lastPointer) < 4000;

      // --- LAYER 1: circuit traces
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (const trace of traces) {
        ctx.strokeStyle = 'rgba(138,134,132,0.11)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < trace.pts.length; i++) {
          const [x, y] = trace.pts[i];
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        // junction nodes
        ctx.fillStyle = 'rgba(138,134,132,0.32)';
        for (let i = 0; i < trace.pts.length; i++) {
          const [x, y] = trace.pts[i];
          ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
        }
        // signal pulses with fading tails
        for (const p of trace.pulses) {
          p.pos = (p.pos + p.speed) % trace.total;
          for (let j = 0; j < 16; j++) {
            const tp = posAlong(trace, p.pos - j * 4);
            const a = (1 - j / 16) * 0.88;
            ctx.fillStyle = `rgba(255,107,43,${a.toFixed(3)})`;
            ctx.beginPath();
            ctx.arc(tp.x, tp.y, Math.max(0.35, 2.4 - j * 0.13), 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // --- LAYER 2: corner gears
      for (const g of gears) drawGear(g, t);

      // --- LAYER 3: glyph field
      ctx.font = '10px "JetBrains Mono", ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const R  = 180;
      const R2 = R * R;

      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const dx = mx - p.hx;
        const dy = my - p.hy;
        const d2 = dx * dx + dy * dy;
        const fade = (hasCursor && d2 < R2) ? (1 - Math.sqrt(d2) / R) : 0;

        const pull = fade * 0.32;
        p.x = p.hx + dx * pull;
        p.y = p.hy + dy * pull;

        const pulse = 0.5 + 0.5 * Math.sin(t * 0.0007 * p.spd + p.phase);
        const base  = 0.028 + pulse * 0.028;
        const alpha = base + fade * 0.7;

        if (fade > 0.22) {
          ctx.fillStyle = `rgba(255, 107, 43, ${alpha})`;
        } else {
          ctx.fillStyle = `rgba(138, 134, 132, ${alpha})`;
        }
        ctx.fillText(p.g, p.x, p.y);
      }

      // --- LAYER 4: cursor ring trace
      if (hasCursor) {
        const ringR = 26 + ((t * 0.08) % 48);
        const ringA = Math.max(0, 0.18 - (ringR - 26) / 48 * 0.18);
        ctx.strokeStyle = `rgba(255, 107, 43, ${ringA})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(mx, my, ringR, 0, Math.PI * 2);
        ctx.stroke();

        // small crosshair — servo targeting style
        ctx.strokeStyle = 'rgba(255, 107, 43, 0.4)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(mx - 14, my); ctx.lineTo(mx - 6, my);
        ctx.moveTo(mx + 6,  my); ctx.lineTo(mx + 14, my);
        ctx.moveTo(mx, my - 14); ctx.lineTo(mx, my - 6);
        ctx.moveTo(mx, my + 6);  ctx.lineTo(mx, my + 14);
        ctx.stroke();
      }

      requestAnimationFrame(tick);
    };

    resize();
    requestAnimationFrame(tick);

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      lastPointer = performance.now();
    }, { passive: true });
    window.addEventListener('pointerleave', () => {
      mx = my = -9999;
    });
  }

  /* ─── keyboard nav shortcut: g then h/l/s/r/c ─── */
  let gMode = false, gTimer = 0;
  const shortcutMap = {
    h: '#top', b: '#brief', l: '#log', a: '#lab', s: '#stack', r: '#repos', c: '#contact'
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
