# Responsive Design — Trust & Safety Kiosk
**Date:** 2026-03-20
**Approach:** Approach 1 — Pure Tailwind/CSS targeted fixes (no new components, no architecture change)

---

## Context

The app was originally built for a landscape touchscreen kiosk. The team now needs it to work on Android phones and tablets in both portrait and landscape orientations, and on desktop. Screens that overflow on small viewports should scroll internally (Option C) — the app shell (`html/body/#root overflow: hidden`) and Framer Motion screen transitions remain unchanged.

**Orientation scope:** Portrait phones, landscape phones, portrait tablets, landscape tablets, desktop. Landscape phone is the smallest-viewport case (≈375px tall); the `clamp` floors defined below handle it.

---

## Section 1 — Global Foundations

### 1.1 `index.html`
Remove this exact line (line 8):
```html
<meta name="screen-orientation" content="landscape" />
```
No other viewport changes. The existing `<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />` is correct and stays.

### 1.2 `vite.config.js` — PWA Manifest
In the `manifest` object inside `VitePWA({...})`, change:
```js
orientation: 'landscape',
```
to:
```js
orientation: 'any',
```

### 1.3 `index.css` — Portrait Media Query & Android Safe-Area

**Step A — Replace** the existing portrait block (lines 33–38):
```css
/* Portrait orientation support */
@media (orientation: portrait) {
  .landscape-row {
    flex-direction: column !important;
  }
}
```
**With:**
```css
/* Portrait orientation support */
@media (orientation: portrait) {
  .landscape-row {
    flex-direction: column !important;
  }
  /* Slow down scan-line in portrait: the shorter vertical distance makes
     the default 8s animation appear to flash rapidly on narrow screens */
  .scan-line, .scan-line-cyan {
    animation-duration: 10s;
  }
}
```

**Step B — Replace** the existing safe-area block (lines 218–223):
```css
/* ── Safe area insets for notched iPads ── */
@supports (padding: env(safe-area-inset-bottom)) {
  .kiosk-footer {
    padding-bottom: calc(0.5rem + env(safe-area-inset-bottom));
  }
}
```
**With:**
```css
/* ── Safe area insets — covers notched iPads and Android devices ── */
@supports (padding: env(safe-area-inset-top)) {
  #root {
    padding-top: env(safe-area-inset-top);
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
  }
  .kiosk-footer {
    padding-bottom: calc(0.5rem + env(safe-area-inset-bottom));
  }
}
```
Note: The old `.kiosk-footer` block contained only a single `padding-bottom` declaration (verified). The new block duplicates that declaration and adds `#root` insets — the old block is fully superseded and safe to remove.

---

## Section 2 — Per-Screen Changes

### 2.1 `GameSelectScreen.jsx`

**Fix 1 — `<main>` element** (line 124):
Current className: `"flex-1 flex flex-col items-center justify-start px-4 md:px-6 py-3 md:py-4 overflow-hidden min-h-0"`
Change `overflow-hidden` → `overflow-y-auto`. Result:
```
"flex-1 flex flex-col items-center justify-start px-4 md:px-6 py-3 md:py-4 overflow-y-auto min-h-0"
```

**Fix 2 — each game card** (the two `motion.div` cards at lines ~148 and ~235):
Add `min-h-[220px]` to each card's className so they never collapse below 220px regardless of available flex share.

The outer screen `motion.div` (`w-full h-full flex flex-col overflow-hidden`) keeps the header pinned. Only `<main>` scrolls. No structural change needed.

### 2.2 `OnboardingScreen.jsx`

**Problem:** `<main>` at line 96 already has `min-h-0 overflow-y-auto` (verified). However, `justify-center` on a `flex-col overflow-y-auto` container causes a CSS flexbox quirk — when content overflows, the flex algorithm places it centred within the scroll container and content above the midpoint becomes unreachable by scrolling.

**Fix — `<main>` element** (line 96):
Current className: `"relative z-10 flex-1 flex flex-col items-center justify-center px-4 md:px-8 lg:px-12 py-4 md:py-6 min-h-0 overflow-y-auto"`
Change `justify-center` → `justify-start`. Result:
```
"relative z-10 flex-1 flex flex-col items-center justify-start px-4 md:px-8 lg:px-12 py-4 md:py-6 min-h-0 overflow-y-auto"
```

**Fix — form card** (line 114):
Current className starts with `"w-full max-w-3xl rounded-2xl p-5 md:p-7 lg:p-9 ..."`
Change `p-5` → `p-4`. Result starts with:
```
"w-full max-w-3xl rounded-2xl p-4 md:p-7 lg:p-9 ..."
```

### 2.3 `QuestionScreen.jsx`

**Fix 1 — main content div** (line 292):
Current className: `"relative z-10 flex-1 flex flex-col items-center px-4 sm:px-6 md:px-10 py-3 md:py-4 gap-3 md:gap-4 lg:gap-5 min-h-0 overflow-hidden"`
Change `overflow-hidden` → `overflow-y-auto`. Result:
```
"relative z-10 flex-1 flex flex-col items-center px-4 sm:px-6 md:px-10 py-3 md:py-4 gap-3 md:gap-4 lg:gap-5 min-h-0 overflow-y-auto"
```

**Fix 2 — question `h3`** (line 306, the `motion.h3` element):
Current style: `style={{ fontSize: 'clamp(1.4rem, 3vw, 2.4rem)' }}`
Change to: `style={{ fontSize: 'clamp(1.2rem, 4.5vh, 2.4rem)' }}`

Rationale: In portrait, `3vw` on a 390px-wide phone = 11.7px (below floor — floor saves it, but the floor of 1.4rem ≈ 22px is also small). Switching to `4.5vh` uses portrait height instead: 844px tall → 38px ≈ 2.375rem (near ceiling, comfortable); 667px → 30px = 1.875rem; 375px landscape → floor of 1.2rem applies.

### 2.4 `LostInContextQuestion.jsx`

**Fix 1 — main content div** (line 326):
Current className: `"relative z-10 flex-1 flex flex-col min-h-0 px-4 md:px-10 pb-2 md:pb-3 lg:pb-4 overflow-hidden"`
Change `overflow-hidden` → `overflow-y-auto`. Result:
```
"relative z-10 flex-1 flex flex-col min-h-0 px-4 md:px-10 pb-2 md:pb-3 lg:pb-4 overflow-y-auto"
```

**Fix 2 — question `h3`** (line 350–351, the `motion.h3` "What does X mean?" heading):
Current style: `style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)' }}`
Change to: `style={{ fontSize: 'clamp(2rem, 4.5vh, 3.5rem)' }}`
(Same vw→vh swap; floor and ceiling unchanged.)

### 2.5 `FinalResultsScreen.jsx`

**Verified:** Content div at line 127 has `overflow-y-auto` — confirmed in source, no change needed.

**Fix 1 — dimension grid** (line 152):
Current className: `"w-full max-w-2xl grid grid-cols-2 gap-3 mb-4"`
Change `grid-cols-2` → `grid-cols-1 sm:grid-cols-2`. Result:
```
"w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4"
```

**Fix 2 — score font in dimension tiles** (line 178):
Current style: `style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)' }}`
Change to: `style={{ fontSize: 'clamp(2rem, 5vh, 2.75rem)' }}`

### 2.6 `AttractScreen.jsx`

**Fix — center header badge** (line 222–230):
Current className: `"absolute left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-sm"`

The existing `flex` class must be **replaced** (not supplemented) — adding `hidden` alongside `flex` would have no effect since `flex` wins. Full replacement className:
```
"absolute left-1/2 -translate-x-1/2 hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-sm"
```
This hides the badge on viewports < 640px. Logo and "System Online" remain visible on all widths.

### Screens with no changes needed
- `EmailCaptureScreen`, `ThankYouScreen`, `SurveyPromptScreen`, `GameIntroScreen` — lightweight, no overflow risk
- `PollResultScreen` / `LostInContextPollResult` — `fixed inset-0` overlay modals, internally scroll already; `fixed` positioning is unaffected by the per-screen scroll changes

---

## Section 3 — Components & Admin

### 3.1 `AdminPanel.jsx`

Primary target: tablets in portrait (768px+). The `w-56` (224px) sidebar stays as-is — at 768px it leaves 544px for content, which is workable.

**Specific grid fixes — change only these lines:**

| Line | Current | New |
|---|---|---|
| 534 | `grid grid-cols-4 gap-4` | `grid grid-cols-2 sm:grid-cols-4 gap-4` |
| 625 | `grid grid-cols-3 gap-6` | `grid grid-cols-1 sm:grid-cols-3 gap-4` |
| 695 | `grid grid-cols-2 gap-4` | `grid grid-cols-1 sm:grid-cols-2 gap-4` |
| 809 | `grid grid-cols-3 gap-4` | `grid grid-cols-1 sm:grid-cols-3 gap-4` |
| 937 | `grid grid-cols-2 gap-3` | no change |
| 976 | `grid grid-cols-2 gap-3` | no change |

Note on line 625: `gap-6` is intentionally reduced to `gap-4` when stacked to `grid-cols-1` — 24px gaps between vertically stacked rows reads as excessive whitespace on tablets.

### 3.3 Touch Targets
Already handled by existing `min-height: 44px` rule for `pointer: coarse` in `index.css` — no change needed.

---

## Change Summary

| File | Change |
|---|---|
| `index.html` | Remove `screen-orientation: landscape` meta tag (line 8) |
| `vite.config.js` | PWA manifest `orientation: 'any'` |
| `index.css` | Expand portrait media query (add scan-line slow); replace safe-area block to cover Android |
| `GameSelectScreen.jsx` | `overflow-y-auto` on `<main>` (line 124); `min-h-[220px]` on each game card |
| `OnboardingScreen.jsx` | `justify-center` → `justify-start` on `<main>` (line 96); `p-4` on form card (line 114) |
| `QuestionScreen.jsx` | `overflow-y-auto` on content div (line 292); clamp `3vw` → `4.5vh` on h3 (line 306) |
| `LostInContextQuestion.jsx` | `overflow-y-auto` on content div (line 326); clamp `4.5vw` → `4.5vh` on h3 (line 350) |
| `FinalResultsScreen.jsx` | `grid-cols-1 sm:grid-cols-2` on dimension grid (line 152); clamp `4vw` → `5vh` on score (line 178) |
| `AttractScreen.jsx` | `flex` → `hidden sm:flex` on center badge (line 222) |
| `AdminPanel.jsx` | Responsive grids on lines 534, 625, 695, 809 |

---

## What Does Not Change
- `html/body/#root overflow: hidden` — screen transitions stay intact
- Framer Motion `AnimatePresence` architecture — untouched
- All `fixed inset-0` overlays (poll overlay, terminal overlay, pin modal) — untouched
- Game logic, state machine, data layer — untouched
- `RadarChart.jsx` component file — not used in FinalResultsScreen, no changes needed
