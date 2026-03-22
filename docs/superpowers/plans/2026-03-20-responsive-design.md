# Responsive Design Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Trust & Safety Kiosk fully responsive across Android phones, tablets, and desktop in both portrait and landscape orientations, with internal per-screen scrolling as the overflow strategy.

**Architecture:** Approach 1 — pure Tailwind/CSS targeted fixes only. No new components, no new files, no changes to the app shell or Framer Motion transition architecture. The `html/body/#root overflow: hidden` contract is preserved throughout. Each screen's `flex-1` main content area gets `overflow-y-auto` where needed; fixed headers stay pinned via the outer `flex-col` wrapper.

**Tech Stack:** React 18, Vite, Tailwind CSS v3, Framer Motion. No test runner is configured — verification is done via `npm run dev` + Chrome DevTools device simulation.

---

## File Map

| File | Change type | What changes |
|---|---|---|
| `index.html` | Modify | Remove landscape orientation lock (line 8) |
| `vite.config.js` | Modify | PWA manifest `orientation: 'any'` |
| `src/index.css` | Modify | Expand portrait media query; replace safe-area block |
| `src/screens/AttractScreen.jsx` | Modify | Hide center badge on xs screens |
| `src/screens/GameSelectScreen.jsx` | Modify | `overflow-y-auto` on main; card min-height floor |
| `src/screens/OnboardingScreen.jsx` | Modify | `justify-start` on main; tighter phone padding |
| `src/screens/QuestionScreen.jsx` | Modify | `overflow-y-auto` on content; clamp vw→vh |
| `src/screens/LostInContextQuestion.jsx` | Modify | `overflow-y-auto` on content; clamp vw→vh |
| `src/screens/FinalResultsScreen.jsx` | Modify | Grid breakpoint; score clamp |
| `src/admin/AdminPanel.jsx` | Modify | 4 grid breakpoints for tablet layout |

---

## Task 1: Global Foundations

**Files:**
- Modify: `index.html`
- Modify: `vite.config.js`
- Modify: `src/index.css`

- [ ] **Step 1: Remove the landscape orientation lock from `index.html`**

  Open `index.html`. Find and delete line 8:
  ```html
  <meta name="screen-orientation" content="landscape" />
  ```
  Leave all other lines untouched. The `viewport-fit=cover` meta stays.

- [ ] **Step 2: Update PWA manifest orientation in `vite.config.js`**

  Open `vite.config.js`. Inside the `manifest` object (around line 33), change:
  ```js
  orientation: 'landscape',
  ```
  to:
  ```js
  orientation: 'any',
  ```

- [ ] **Step 3: Expand the portrait media query in `src/index.css`**

  Find the existing portrait block (lines 33–38):
  ```css
  /* Portrait orientation support */
  @media (orientation: portrait) {
    .landscape-row {
      flex-direction: column !important;
    }
  }
  ```
  Replace it with:
  ```css
  /* Portrait orientation support */
  @media (orientation: portrait) {
    .landscape-row {
      flex-direction: column !important;
    }
    /* Slow down scan-line in portrait: shorter vertical distance makes
       the default 8s animation appear to flash rapidly on narrow screens */
    .scan-line, .scan-line-cyan {
      animation-duration: 10s;
    }
  }
  ```

- [ ] **Step 4: Replace the safe-area block in `src/index.css`**

  Find the existing safe-area block (lines 218–223):
  ```css
  /* ── Safe area insets for notched iPads ── */
  @supports (padding: env(safe-area-inset-bottom)) {
    .kiosk-footer {
      padding-bottom: calc(0.5rem + env(safe-area-inset-bottom));
    }
  }
  ```
  Replace it entirely with:
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

- [ ] **Step 5: Verify**

  Run: `npm run dev`
  Open Chrome DevTools → Toggle device toolbar → select "iPhone 12 Pro" (390×844).
  Navigate to `http://localhost:5173/TnS/`.
  Expected: App renders. No horizontal scroll bars. No content locked to landscape.

- [ ] **Step 6: Commit**

  ```bash
  git add index.html vite.config.js src/index.css
  git commit -m "fix(responsive): remove landscape lock, add portrait media query and Android safe-area"
  ```

---

## Task 2: AttractScreen — Hide Center Badge on Small Screens

**Files:**
- Modify: `src/screens/AttractScreen.jsx`

- [ ] **Step 1: Find the center header badge element**

  In `src/screens/AttractScreen.jsx`, find line 222 — the div with:
  ```jsx
  className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-sm"
  ```

- [ ] **Step 2: Replace `flex` with `hidden sm:flex`**

  The `flex` class must be **replaced** (not supplemented — `hidden flex` would cancel out):
  ```jsx
  className="absolute left-1/2 -translate-x-1/2 hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-sm"
  ```

- [ ] **Step 3: Verify**

  In DevTools at 390px width: badge should be invisible. Logo on left and "System Online" on right should remain fully visible with no overlap.
  At 640px+: badge reappears in the center. No regression.

- [ ] **Step 4: Commit**

  ```bash
  git add src/screens/AttractScreen.jsx
  git commit -m "fix(responsive): hide attract screen center badge below 640px"
  ```

---

## Task 3: GameSelectScreen — Scrollable Cards

**Files:**
- Modify: `src/screens/GameSelectScreen.jsx`

- [ ] **Step 1: Fix the `<main>` overflow**

  In `src/screens/GameSelectScreen.jsx`, find line 124:
  ```jsx
  className="flex-1 flex flex-col items-center justify-start px-4 md:px-6 py-3 md:py-4 overflow-hidden min-h-0"
  ```
  Change `overflow-hidden` → `overflow-y-auto`:
  ```jsx
  className="flex-1 flex flex-col items-center justify-start px-4 md:px-6 py-3 md:py-4 overflow-y-auto min-h-0"
  ```

- [ ] **Step 2: Add min-height floor to the first game card**

  Find the first game card `motion.div` (around line 148). It starts with something like:
  ```jsx
  className="group relative rounded-2xl cursor-pointer overflow-hidden flex-1 min-h-0 transition-opacity ..."
  ```
  Add `min-h-[220px]` to the className:
  ```jsx
  className="group relative rounded-2xl cursor-pointer overflow-hidden flex-1 min-h-[220px] transition-opacity ..."
  ```

- [ ] **Step 3: Add min-height floor to the second game card**

  Find the second game card `motion.div` (around line 235, same pattern as above). Apply the same `min-h-[220px]` addition.

- [ ] **Step 4: Verify**

  In DevTools at 390×844 (portrait phone): both cards should be visible and scrollable if needed. Cards must not collapse to less than 220px. Header stays pinned at top.
  At 1024px landscape: no visual change — cards still expand to fill available space.

- [ ] **Step 5: Commit**

  ```bash
  git add src/screens/GameSelectScreen.jsx
  git commit -m "fix(responsive): game select scrollable on portrait phone, card min-height floor"
  ```

---

## Task 4: OnboardingScreen — Scroll Fix + Mobile Padding

**Files:**
- Modify: `src/screens/OnboardingScreen.jsx`

- [ ] **Step 1: Fix `justify-center` scroll anchor bug on `<main>`**

  In `src/screens/OnboardingScreen.jsx`, find line 96:
  ```jsx
  className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 md:px-8 lg:px-12 py-4 md:py-6 min-h-0 overflow-y-auto"
  ```
  Change `justify-center` → `justify-start`:
  ```jsx
  className="relative z-10 flex-1 flex flex-col items-center justify-start px-4 md:px-8 lg:px-12 py-4 md:py-6 min-h-0 overflow-y-auto"
  ```
  Background: `justify-center` on `flex-col overflow-y-auto` places content in the middle of the scroll container — content above the midpoint becomes unreachable when scrolling.

- [ ] **Step 2: Reduce form card padding on phones**

  Find the form card `motion.div` at line 114. Its className starts with:
  ```jsx
  className="w-full max-w-3xl rounded-2xl p-5 md:p-7 lg:p-9 ..."
  ```
  Change `p-5` → `p-4`:
  ```jsx
  className="w-full max-w-3xl rounded-2xl p-4 md:p-7 lg:p-9 ..."
  ```

- [ ] **Step 3: Verify**

  In DevTools at 390×844: scroll down in the form — all fields (Name, Company, Role, Industry, consent checkbox, Continue button) must be reachable by scrolling. None should be cut off.
  At 768px tablet: form should appear centred with comfortable spacing. No regression.

- [ ] **Step 4: Commit**

  ```bash
  git add src/screens/OnboardingScreen.jsx
  git commit -m "fix(responsive): onboarding scroll anchor and phone padding"
  ```

---

## Task 5: QuestionScreen — Overflow + Font Clamp

**Files:**
- Modify: `src/screens/QuestionScreen.jsx`

- [ ] **Step 1: Fix overflow on the main content div**

  In `src/screens/QuestionScreen.jsx`, find line 292:
  ```jsx
  className="relative z-10 flex-1 flex flex-col items-center px-4 sm:px-6 md:px-10 py-3 md:py-4 gap-3 md:gap-4 lg:gap-5 min-h-0 overflow-hidden"
  ```
  Change `overflow-hidden` → `overflow-y-auto`:
  ```jsx
  className="relative z-10 flex-1 flex flex-col items-center px-4 sm:px-6 md:px-10 py-3 md:py-4 gap-3 md:gap-4 lg:gap-5 min-h-0 overflow-y-auto"
  ```

- [ ] **Step 2: Fix the question font clamp**

  Find the `motion.h3` question element at line 306. Its style is:
  ```jsx
  style={{ fontSize: 'clamp(1.4rem, 3vw, 2.4rem)' }}
  ```
  Change `3vw` → `4.5vh` and lower the floor slightly:
  ```jsx
  style={{ fontSize: 'clamp(1.2rem, 4.5vh, 2.4rem)' }}
  ```
  Why: In portrait, `3vw` on a 390px-wide phone = ~12px (too small). `4.5vh` uses viewport height instead: on a 844px portrait phone it resolves to ~38px (comfortable); on a 667px phone ~30px; floor of `1.2rem` handles landscape phones.

- [ ] **Step 3: Verify**

  In DevTools at 390×844 portrait: question text must be readable (~30-38px). All 4-5 answer tiles must be reachable by scrolling. Header (Focus Area + progress counter) must stay pinned at top.
  At 1280px desktop: no visible change — question text stays at the `2.4rem` ceiling.

- [ ] **Step 4: Commit**

  ```bash
  git add src/screens/QuestionScreen.jsx
  git commit -m "fix(responsive): question screen overflow and font clamp vw→vh"
  ```

---

## Task 6: LostInContextQuestion — Overflow + Font Clamp

**Files:**
- Modify: `src/screens/LostInContextQuestion.jsx`

- [ ] **Step 1: Fix overflow on the main content div**

  In `src/screens/LostInContextQuestion.jsx`, find line 326:
  ```jsx
  className="relative z-10 flex-1 flex flex-col min-h-0 px-4 md:px-10 pb-2 md:pb-3 lg:pb-4 overflow-hidden"
  ```
  Change `overflow-hidden` → `overflow-y-auto`:
  ```jsx
  className="relative z-10 flex-1 flex flex-col min-h-0 px-4 md:px-10 pb-2 md:pb-3 lg:pb-4 overflow-y-auto"
  ```

- [ ] **Step 2: Fix the question font clamp**

  Find the `motion.h3` question heading at lines 350–351. Its style is:
  ```jsx
  style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)' }}
  ```
  Change `4.5vw` → `4.5vh`:
  ```jsx
  style={{ fontSize: 'clamp(2rem, 4.5vh, 3.5rem)' }}
  ```

- [ ] **Step 3: Verify**

  In DevTools at 390×844 portrait: "What does X mean?" heading readable. Answer grid (2×2 or 4×1) must be reachable by scrolling. Header stays pinned.
  At 1280px desktop: no visible regression.

- [ ] **Step 4: Commit**

  ```bash
  git add src/screens/LostInContextQuestion.jsx
  git commit -m "fix(responsive): lost-in-context overflow and font clamp vw→vh"
  ```

---

## Task 7: FinalResultsScreen — Grid + Score Clamp (Both Game Paths)

**Files:**
- Modify: `src/screens/FinalResultsScreen.jsx`

This file contains two render paths: the Trust 2030 results (default export `FinalResultsScreen`) and the Lost in Context results (`LostInContextResults` subcomponent). Both have grid and clamp issues on portrait phones.

- [ ] **Step 1: Fix Trust 2030 dimension scorecard grid** (line 152)

  Find: `className="w-full max-w-2xl grid grid-cols-2 gap-3 mb-4"`
  Change `grid-cols-2` → `grid-cols-1 sm:grid-cols-2`:
  ```jsx
  className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4"
  ```

- [ ] **Step 2: Fix Trust 2030 score font clamp** (line 178)

  Find: `style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', color: RED }}`
  Change `4vw` → `5vh`:
  ```jsx
  style={{ fontSize: 'clamp(2rem, 5vh, 2.75rem)', color: RED }}
  ```

- [ ] **Step 3: Fix Lost in Context 2-col cards grid** (line 372)

  Find: `className="w-full max-w-2xl grid grid-cols-2 gap-4 mb-4"`
  Change `grid-cols-2` → `grid-cols-1 sm:grid-cols-2`:
  ```jsx
  className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4"
  ```

- [ ] **Step 4: Fix Lost in Context score font clamp** (line 383)

  Find: `style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: RED, ... }}`
  Change `5vw` → `5vh`:
  ```jsx
  style={{ fontSize: 'clamp(2rem, 5vh, 3rem)', color: RED, textShadow: '0 0 20px rgba(255,0,60,0.4)' }}
  ```

- [ ] **Step 5: Verify**

  At 390×844 portrait — Trust 2030 path: dimension tiles single-column, scores readable. Lost in Context path: Beat AI / Hero Term cards stack single-column, score readable.
  At 640px+: both paths return to 2-column. No regression.

- [ ] **Step 6: Commit**

  ```bash
  git add src/screens/FinalResultsScreen.jsx
  git commit -m "fix(responsive): final results grid and score font clamp vw→vh (both game paths)"
  ```

---

## Task 8: AdminPanel — Tablet-Responsive Grids

**Files:**
- Modify: `src/admin/AdminPanel.jsx`

- [ ] **Step 1: Fix the stat card grid (Dashboard)**

  Find line 534:
  ```jsx
  <div className="grid grid-cols-4 gap-4">
  ```
  Change to:
  ```jsx
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
  ```

- [ ] **Step 2: Fix the expanded session detail grid**

  Find line 625:
  ```jsx
  <div className="px-8 py-5 grid grid-cols-3 gap-6 text-sm">
  ```
  Change to:
  ```jsx
  <div className="px-8 py-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
  ```
  Note: gap intentionally reduced from 6→4 to avoid excessive whitespace between vertically stacked rows on tablet portrait.

- [ ] **Step 3: Fix the analytics summary grid**

  Find line 695:
  ```jsx
  <div className="grid grid-cols-2 gap-4">
  ```
  Change to:
  ```jsx
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  ```

- [ ] **Step 4: Fix the media/settings grid**

  Find line 809:
  ```jsx
  <div className="grid grid-cols-3 gap-4">
  ```
  Change to:
  ```jsx
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
  ```

- [ ] **Step 5: Verify**

  In DevTools at 768×1024 (iPad portrait): Admin panel should be fully usable. Stat cards stack 2×2. All grid content readable without horizontal scroll.
  At 1280px desktop: no visible change — grids return to their original column counts.

- [ ] **Step 6: Commit**

  ```bash
  git add src/admin/AdminPanel.jsx
  git commit -m "fix(responsive): admin panel grid breakpoints for tablet portrait"
  ```

---

## Final Verification Checklist

Run `npm run dev` and test each screen at these breakpoints in Chrome DevTools:

| Device | Width × Height | Orientation |
|---|---|---|
| iPhone SE | 375 × 667 | Portrait |
| iPhone 12 Pro | 390 × 844 | Portrait |
| iPhone 12 Pro | 844 × 390 | Landscape |
| Samsung Galaxy S8+ | 360 × 740 | Portrait |
| iPad Mini | 768 × 1024 | Portrait |
| iPad Pro 11" | 834 × 1194 | Portrait |
| Desktop | 1280 × 800 | Landscape |

For each device, walk through: AttractScreen → Onboarding → GameSelect → Question (Trust 2030) → FinalResults → EmailCapture → ThankYou. Also verify LostInContext game path.

**Key checks per screen:**
- No content clipped (scrollable to reach all interactive elements)
- No horizontal overflow / unwanted scrollbars
- Headers stay pinned when content scrolls
- Screen transitions (cross-fade) still work correctly
- Poll overlay and terminal overlay still appear centred and fullscreen
- Admin panel accessible and readable on iPad portrait
