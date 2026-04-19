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

  /* ─── reactive background glyph field ─── */
  if (!reduceMotion) {
    const canvas = document.createElement('canvas');
    canvas.className = 'doodles';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d', { alpha: true });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const glyphs = ['·', '·', '·', '·', '·', '·', '+', '+', '○', '×', '◦', '∙'];

    let w = 0, h = 0;
    let points = [];
    let mx = -9999, my = -9999;
    let lastPointer = 0;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width  = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width  = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildGrid();
    };

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

    const tick = (t) => {
      if (document.hidden) { requestAnimationFrame(tick); return; }
      ctx.clearRect(0, 0, w, h);
      ctx.font = '10px "JetBrains Mono", ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const hasCursor = (performance.now() - lastPointer) < 4000;
      const R  = 180;
      const R2 = R * R;

      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const dx = mx - p.hx;
        const dy = my - p.hy;
        const d2 = dx * dx + dy * dy;
        const fade = (hasCursor && d2 < R2) ? (1 - Math.sqrt(d2) / R) : 0;

        // magnetic lean toward cursor
        const pull = fade * 0.32;
        p.x = p.hx + dx * pull;
        p.y = p.hy + dy * pull;

        // ambient breathing pulse
        const pulse = 0.5 + 0.5 * Math.sin(t * 0.0007 * p.spd + p.phase);
        const base  = 0.028 + pulse * 0.028;        // ~0.03–0.06
        const alpha = base + fade * 0.7;

        if (fade > 0.22) {
          ctx.fillStyle = `rgba(255, 107, 43, ${alpha})`;
        } else {
          ctx.fillStyle = `rgba(138, 134, 132, ${alpha})`;
        }
        ctx.fillText(p.g, p.x, p.y);
      }

      // small amber ring sweeping outward from cursor, always-on trace
      if (hasCursor) {
        const ringR = 26 + ((t * 0.08) % 48);
        const ringA = Math.max(0, 0.18 - (ringR - 26) / 48 * 0.18);
        ctx.strokeStyle = `rgba(255, 107, 43, ${ringA})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(mx, my, ringR, 0, Math.PI * 2);
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
