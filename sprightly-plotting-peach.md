# Redesign v3: Fluid Background + Burst Menu + Smooth Transitions + Fixed ASCII + Looping Glitch

## Context

The Acid Chrome skin is built and verified. User now wants five refinements that go deeper into feel:

1. **Background**: "Fluid Distortion" — the liquid chrome blob must react to mouse: a "pressed down" displacement at the cursor, + continuous ambient liquid motion. Current blob is static filter + CSS drift only.
2. **Layout/Typography**: "Chữ kì" — VT323 on large/uppercase headings (hero title at `text-7xl`, `font-extrabold`, `uppercase`, `tracking-tight`) reads poorly. Need a type system: VT323 for UI chrome (index numbers, labels, buttons, nav, HUD), Be Vietnam Pro for reading text + **display headings**.
3. **Menu**: "Dạng box phun ra" — not a slide-from-right drawer. A centered/anchored panel that **bursts** from the trigger (scale + blur + opacity), with staggered content entry.
4. **Transitions**: "Chuyển tab mượt mà" — page transitions must be **crossfade + shared layout feel**, not one-sided fade-in. `AnimatePresence` + `mode="wait"`.
5. **ASCII Torus**: "Animation lỗi" — the 30fps throttle tied to display refresh + rewind-from-static-frame bug.
6. **Glitch**: "Hover thì loop animation" — `.glitch-rgb` currently only fades in on hover (200ms opacity). Needs a continuous RGB-split oscillation **while hovered**, stops cleanly on leave.

---

## 1. Fluid Background — Mouse-Reactive Liquid Chrome

### Approach
Replace the static SVG filter + CSS drift with a **GPU-backed fragment shader** (via `<canvas>` or WebGL) OR a **CSS-only approximation** that:
- Runs a noise field (turbulence) in a shader / `feTurbulence` SMIL (but SMIL was jank — avoid)
- **Better**: a small WebGL canvas (one full-screen quad, one fragment shader) that samples a noise texture, displaces UVs by a time-varying flow field, and adds a **radial "dent" at mouse position** (inward displacement).

**Why WebGL**: SVG `feTurbulence` + `feDisplacementMap` re-evaluates on CPU every frame; a fragment shader runs fully on GPU, 60fps trivial. A dent at mouse is one uniform (`uMouse`, `uDentRadius`, `uDentStrength`).

### Implementation

- **NEW** `components/background/FluidCanvas.tsx` (`"use client"`):
  - `<canvas className="fixed inset-0 -z-10" />` sized to `innerWidth` × `innerHeight` (devicePixelRatio-aware).
  - One `requestAnimationFrame` loop; uniforms: `uTime`, `uResolution`, `uMouse` (normalized 0–1, `(-1,-1)` when outside), `uDenting` (bool).
  - Fragment shader: 3 octaves of fbm noise → flow field UV offset → base gradient (chrome colors). At mouse: `dist < radius ? uv * (1 - strength * (1 - dist/radius)) : uv` (pushes UV inward = "pressed down").
  - Respects `prefers-reduced-motion` → static frame.
  - Pointer-events none; the canvas never blocks interaction.

- **REPLACE** `Background.tsx`: remove the SVG blob div, keep grid/scanlines/noise/corner-brackets, render `<FluidCanvas />` instead.

- **Performance**: One draw call/frame, ~30 instr fragment shader, trivial on any GPU. No allocation in loop.

### Alternative (if WebGL not desired)
CSS `mask-image` + `filter: url(#svg-filter)` with SMIL on `baseFrequency` **was** the jank source. WebGL is the right fix.

---

## 2. Layout / Typography System — Fix "Chữ Kì"

### Diagnosis
VT323 (pixel, 400 only) is forced onto `--font-mono` AND `--font-display`. Hero title at `text-7xl uppercase tracking-tight font-extrabold` on a pixel font:
- No bold weight → browser synthesizes faux-bold (blocked by CSS but still: glyph shapes are blocky at large size)
- `uppercase` + `tracking-tight` on pixel font = cramped, unreadable
- `font-extrabold` has no effect (weight 400 only) → misleading class

### New Token Strategy

| Token | Font | Use For |
|---|---|---|
| `--font-sans` | Be Vietnam Pro (400–800) | **All reading text**, body copy, **display headings** (h1, h2, section titles) |
| `--font-mono` | VT323 (400) | UI chrome: index numbers (01/02), labels, eyebrows, buttons, nav items, HUD, code |
| `--font-display` | **Be Vietnam Pro** (via `--font-sans`) | **Hero title, page headlines, large display text** |
| `--font-serif` | Source Serif 4 | About blockquote, long-form reading accents |
| `--font-pixel` | VT323 (internal) | Backing for `--font-mono` only |

**Changes**:
- `lib/fonts.ts`: keep `fontSans`, `fontSerif`, `fontPixel`. **Remove `--font-display` pointing to pixel**.
- `globals.css` `@theme`: `--font-display: var(--font-sans);` (Be Vietnam Pro). `--font-mono: var(--font-pixel), ...` stays.
- **Drop** the unlayered `.font-mono, .font-display { font-weight: 400; }` — VT323 only on mono now; display uses Be Vietnam Pro with real weights.
- **Audit** all `font-display` / `font-mono` usage:
  - Hero title (`Hero.tsx:72`) → `font-display` (now Be Vietnam Pro) ✓
  - Section headers (`SectionHeader.tsx`) → `font-display` ✓
  - Nav rows / buttons / eyebrows / index numbers → `font-mono` (VT323) ✓
  - Body copy → `font-sans` (default) ✓

### Specific File Fixes
- `components/home/Hero.tsx:72`: `font-display` → now Be Vietnam Pro, keep `text-7xl` but drop `uppercase` + `tracking-tight` → use `tracking-normal` or slight positive. Weight 700/800 available.
- `components/ui/SectionHeader.tsx` h2: `font-display text-3xl` → Be Vietnam Pro, remove aggressive tracking.
- `components/writeup/FeaturedWriteup.tsx` title: check.
- Any `font-extrabold` on `font-mono` elements → remove (no effect).

---

## 3. Menu — "Box Phun Ra" (Burst Panel)

### Current
Slide from right edge (`x: 56 → 0`), spring (stiffness 300, damping 28, mass 0.85), rows stagger `0.05 + i*0.045`.

### New Design
- Trigger: same right-edge `MenuButton`.
- Panel: **anchored near the button** (top-right), not full-height. `max-w-[420px]`, height auto/fit-content (`max-h-[80vh]` with scroll).
- **Entrance**: `scale: 0.85 → 1`, `opacity: 0 → 1`, `filter: blur(8px) → blur(0)`, spring (stiffness 350, damping 30). Transform-origin: `top right` (bursts from button).
- **Content stagger**: brand row 0ms, then nav rows cascade 35ms each, bottom stack last. Slightly faster than drawer.
- **Hover bridge**: keep the 300ms grace + hover-catch strip (works with new geometry).
- **Close**: reverse spring (stiffness 400, damping 35 → snappy), no stagger on exit (just fade+scale out).
- **Mobile**: keep modal drawer (full-screen, backdrop) — Hamburger still uses that.

### Files
- `components/layout/NavDrawer.tsx`: add `variant="burst"` (desktop), keep `peek` as fallback? Or replace `peek` with `burst`.
- `components/layout/MenuButton.tsx`: position panel relative to button (`getBoundingClientRect`) or fixed top-right with `right-4 top-16` (below button).

---

## 4. Page Transitions — Crossfade + Shared Layout

### Current
`PageTransition.tsx`: `key={pathname}`, single `motion.div` with `initial={opacity:0, y:10}` → `animate={opacity:1, y:0}`. No `AnimatePresence`, no exit.

### New Design
Wrap children in `AnimatePresence` with `mode="wait"`; each page gets its own `motion.div key={pathname}` with:
- **Enter**: fade + slight scale (0.98 → 1), 0.45s, `EASE`
- **Exit**: fade + slight scale (1 → 1.02), 0.35s, `EASE`
- `transition: { duration, ease: EASE }`
- `exitBeforeEnter` handled by `mode="wait"`.

### File
- **REWRITE** `components/layout/PageTransition.tsx`:
```tsx
export function PageTransition({ children }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={reduce ? false : { opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={reduce ? undefined : { opacity: 0, scale: 1.02 }}
        transition={{ duration: 0.45, ease: EASE }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

---

## 5. ASCII Torus — Fix Animation Bugs

### Bugs
1. `tick & 1` throttle: tied to display refresh → 30fps on 60Hz, 60fps on 120Hz, 15fps on 30Hz.
2. Static first frame at `elapsed=1.2`, then rAF starts at `elapsed=0` → visible rewind.
3. IntersectionObserver pauses correctly, but `elapsed` doesn't advance while paused (OK), on resume restarts from 0.

### Fixes
- **Time-based throttle**: accumulate `dt`, render when `accumulator >= 1/30` (33.33ms). Decouples from display refresh.
- **Single timeline**: don't render static frame at t=1.2. Instead, start `elapsed=0`, render immediately (first rAF), or render static at t=0. The rewind is because static frame ≠ animation start.
- **Preserve `elapsed` across pause**: don't reset `lastTime = null` on resume; keep `elapsed` and `lastTime = now` so it continues smoothly.

### File
- **REWRITE** the effect in `components/ascii/AsciiTorus.tsx` (lines 175–240).

---

## 6. Glitch Text — Loop While Hovered

### Current
`.glitch-rgb` (globals.css:364–390): two pseudo-elements with static transforms (`translate(2px,-1px)` / `translate(-2px,1px)`), opacity 0 → 0.75 on hover (200ms transition). No animation, no loop.

### New Design
Add a **CSS keyframe animation** that oscillates the RGB splits continuously:
- `::before` (cyan): `translateX` oscillates `2px → -2px → 2px`, `translateY` `-1px ↔ 1px`
- `::after` (magenta): opposite phase
- Opacity ramps in on hover (200ms), then **animation runs infinite** while hovered (`animation-play-state: running`), pauses on leave (`paused`).

### Implementation
**In `globals.css`**:
```css
@keyframes glitch-loop {
  0%, 100% { transform: translate( 2px, -1px); }
  25%      { transform: translate(-2px,  1px); }
  50%      { transform: translate( 2px,  1px); }
  75%      { transform: translate(-2px, -1px); }
}
.glitch-rgb::before,
.glitch-rgb::after {
  animation: glitch-loop 0.8s ease-in-out infinite;
  animation-play-state: paused;
}
.glitch-rgb:hover::before,
.glitch-rgb:hover::after,
.glitch-rgb[data-glitch="on"]::before,
.glitch-rgb[data-glitch="on"]::after {
  opacity: 0.75;
  animation-play-state: running;
}
```

Plus keep the existing static offset as the "base" (the animation now adds to it). Or make the animation the only motion.

---

## Verification Checklist

1. `npx tsc --noEmit` clean
2. `npx next build` passes
3. Kill stale server (`ss -ltnp | grep 3111 → kill PID`), `npx next start -p 3111`
4. **Curl 200**: `/`, `/en`, `/writeups`, `/writeups/need-for-speed`, `/research/adguard-home-on-mxq-s805`, `/stats`
5. **Headless Chrome** on `/`:
   - No `next-error` overlay
   - Fluid canvas renders, mouse dent visible (DOM: `<canvas>` present, no JS errors)
   - Hero title uses Be Vietnam Pro (check computed font-family), not pixelated
   - Menu button present, hover → burst panel opens, rows stagger in
   - Click nav link → crossfade transition (no flash)
6. **Headless Chrome** on writeup detail:
   - ASCII torus runs at ~30fps steady (no rewind on start, no jank on 120Hz)
   - Glitch text on nav rows loops while hovered (check `animation-play-state: running` in computed styles)
   - VT323 only on UI chrome (index, labels, buttons), not on headings/body
7. **Reduced motion**: all animations respect `prefers-reduced-motion` (fluid canvas static, torus static, transitions instant, glitch static)
8. **Build size**: JS bundle not significantly increased (FluidCanvas shader is tiny)

---

## File Touch Map (for review)

| Task | Files (create/modify/delete) |
|---|---|
| Fluid Background | **NEW** `components/background/FluidCanvas.tsx`, **MOD** `components/background/Background.tsx`, **DEL** SVG blob block |
| Typography | **MOD** `lib/fonts.ts`, **MOD** `app/globals.css` (@theme + unlayered rule), **MOD** `components/home/Hero.tsx`, **MOD** `components/ui/SectionHeader.tsx`, audit all `font-display`/`font-mono` |
| Burst Menu | **MOD** `components/layout/NavDrawer.tsx` (add `burst` variant), **MOD** `components/layout/MenuButton.tsx` (panel positioning) |
| Page Transitions | **REWRITE** `components/layout/PageTransition.tsx` |
| ASCII Torus Fix | **REWRITE** `components/ascii/AsciiTorus.tsx` effect (throttle, timeline, pause) |
| Glitch Loop | **MOD** `app/globals.css` (add `glitch-loop` keyframes + `animation-play-state`) |

---

## Clarifying Questions

1. **Fluid canvas**: WebGL fragment shader is the performant route. Any objection to adding a `<canvas>` + minimal shader (no Three.js, raw WebGL)? Alternatives: CSS `filter: url()` with SMIL (but that caused jank).
2. **Burst menu anchor**: Panel fixed top-right (`right-4 top-16`) or positioned relative to button via `getBoundingClientRect`? Fixed is simpler and more stable; relative feels more "attached".
3. **Hero title styling**: Drop `uppercase + tracking-tight` entirely? Keep `uppercase` but with positive `tracking`? What's the target feel — editorial (Be Vietnam Pro, mixed case, generous tracking) or terminal (pixel, uppercase, tight)?
4. **Glitch frequency**: 0.8s cycle OK, or slower/faster?