# BEN·01 — Field Report

> Personal site / resume for **Benedict Onyebuchi**.
> Backend · data agents · cloud & scalable systems · robotics after hours.

**Live:** [bengabp.github.io](https://bengabp.github.io/)

---

## About

A single-page, OLED-black interactive resume styled as an engineering dossier.
Serif-italic grace notes against a JetBrains Mono backbone, one amber accent
(the same orange as the 3D-printed planetary gearbox that sits in the Lab
section). Everything ships as plain HTML / CSS / JS — no frameworks,
no build step, no runtime dependencies beyond Google Fonts and the Simple
Icons CDN.

Sections:

- `/ 01` — Subject brief
- `/ 02` — Transmission log (work history, 5 entries, reverse-chronological)
- `/ 03` — Lab (featured 41 : 1 planetary gearbox + specimen cards)
- `/ 04` — Stack manifest (animated tech toolbelt + chip grid)
- `/ 05` — Currently learning (Moscow Polytechnic · Russian · Math · Robotics)
- `/ 06` — End of transmission (contact)

## Stack

| area         | choice                                                                 |
| ------------ | ---------------------------------------------------------------------- |
| markup       | hand-written HTML                                                      |
| styles       | CSS custom properties · grid · clamp()-driven responsive typography    |
| motion       | CSS `@keyframes` · `IntersectionObserver` for reveal · `rAF` throttled |
| typography   | [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif) + [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) |
| tech icons   | [Simple Icons CDN](https://simpleicons.org/)                           |
| host         | GitHub Pages                                                           |

## Layout

```
.
├── index.html      # structure + content
├── styles.css      # all styling, ~1000 lines
├── script.js       # live clock · cursor spotlight · scroll reveals · gear teeth
└── README.md
```

## Run locally

```bash
# no build step; just open it
open index.html
```

Or serve it for nicer DX:

```bash
python3 -m http.server 8000
```

…then visit <http://localhost:8000>.

## Niceties

- `prefers-reduced-motion: reduce` disables entrance animations, gear rotation,
  the grain shift, and the toolbelt marquee.
- Keyboard shortcut: press **`g`** then one of **`b` / `l` / `a` / `s` / `n` / `c`**
  to jump to brief / log / lab / stack / langs / contact.
- Live Lagos clock in the topbar.
- Cursor-following amber spotlight (disabled on touch & reduced-motion).
- Active-section highlighting in the top nav via `IntersectionObserver`.

## Contact

- email — bengabdev4@gmail.com
- telegram — [@russianben](https://t.me/russianben)
- github — [@bengabp](https://github.com/bengabp)
- x / twitter — [@bengabp](https://x.com/bengabp) (robotics build log)
- linkedin — [in/bengabp](https://linkedin.com/in/bengabp)

---

<sub>© 2026 Benedict Onyebuchi. Hand-built, no template. OLED-safe.</sub>
