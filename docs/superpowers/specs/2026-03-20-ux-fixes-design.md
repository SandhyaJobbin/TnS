# UX Fixes — Trust & Safety Kiosk
**Date:** 2026-03-20
**Deadline:** 2026-03-21 noon
**Approach:** Single sweep PR, changes ordered by risk (critical bugs → touch UX → feedback loop → copy polish)

---

## Context

A full UX audit of all kiosk screens surfaced ~30 issues across 4 categories. All fixes are targeted — no architectural rewrites. The conference is March 25; code freeze is tomorrow noon.

---

## Section 1 — Architecture

### 1.1 Shared Background Component

**Problem:** `Background` (dot-grid + dual blur orbs) is copy-pasted identically in `EmailCaptureScreen.jsx` and `ThankYouScreen.jsx`. Both functions are pixel-identical (same dot gradient, same two orb colors/sizes/positions).

**Fix:** Extract to `src/components/Background.jsx`. Both screens replace their inline function with an import.

---

## Section 2 — Critical Bugs

### 2.1 AttractScreen (`src/screens/AttractScreen.jsx`)
- `[ Abort ]` button uses `onClick` → change to `onPointerDown` (consistent with all other interactive elements; faster on touch)
- Remove dead `MetricCard` component (defined at line ~70 but never rendered anywhere in the file)
- Remove `Shield` and `Terminal` from the import — they are already used as static UI elements elsewhere on the same screen (`Shield` in the center header badge, `Terminal` in the footer status bar). Adding them to `FLOATING_ICONS` would duplicate icons already visible on screen. Simply remove them from the unused-import list if the linter flags them, otherwise leave the imports as-is.

### 2.2 GameSelectScreen (`src/screens/GameSelectScreen.jsx`)
- Remove the bottom "Admin" text button — exact duplicate of the gear icon already in the header

### 2.3 EmailCaptureScreen (`src/screens/EmailCaptureScreen.jsx`)
- Remove dead Privacy Policy and Methodology footer buttons (no handler, no navigation — confusing on a kiosk)
- Replace inline `Background` function with shared `src/components/Background.jsx`

### 2.4 ThankYouScreen (`src/screens/ThankYouScreen.jsx`)
- Fix hardcoded `© 2024` → `© {new Date().getFullYear()}`
- Fix hardcoded `Kiosk-07` station ID in footer → `import.meta.env.VITE_STATION_ID || 'booth-07'`
- Remove dead Privacy Policy and Methodology footer buttons (same rationale as §2.3 — identical no-handler buttons exist here too)
- Replace inline `Background` function with shared `src/components/Background.jsx`

### 2.5 OnboardingScreen (`src/screens/OnboardingScreen.jsx`)
- Remove decorative user avatar icon in top-right header (no function, no tap handler)
- Change "Identity Portal" subtitle → "About You"

---

## Section 3 — Kiosk Touch UX

### 3.1 OnboardingScreen — Select Dropdowns
- Increase both `<select>` elements: `py-3` → `py-4`, `text-sm` → `text-base`
- Result: ~52px tap target height, easier to hit on iPad without mis-tapping
- No structural change — keep native `<select>` element

### 3.2 QuestionScreen (`src/screens/QuestionScreen.jsx`)
- **Remove radio circle indicators** from answer tiles (lines 324–338 in current file). The letter badge (A/B/C/D) already communicates selection state. After removal, remove the `gap-4` and adjust padding so option text fills the tile naturally without leaving a gap where the circle was.
- **Expand info button tap target:** Replace `w-4 h-4` button with a `w-10 h-10` flex wrapper containing the same `i` text centered. Keeps the visual `i` size the same but increases the tappable area to 40px.
- **Reduce dimming on non-selected options:** `opacity: 0.3` → `opacity: 0.55`

---

## Section 4 — In-Game Feedback Loop

### 4.1 LostInContextQuestion (`src/screens/LostInContextQuestion.jsx`)

**Immediate card coloring on selection:**
On tap, immediately apply a color state to the selected card before any overlay appears:
- Correct answer: card border and background shift to green (`rgba(74,222,128,0.15)` background, `2px solid #4ade80` border)
- Wrong answer: card shifts to dimmed grey (`rgba(255,255,255,0.04)` background, `2px solid rgba(255,255,255,0.12)` border)
This is driven by the existing `selected` and `submitted` state — no new state needed.

**AnswerFlash timing:**
The flash duration is controlled by the `setTimeout(() => setShowFlash(false), 500)` call in `handleSelect` (inside the outer `setTimeout`). Change `500` → `800`.

**Confetti and poll overlay timing — structural refactor required:**
The current structure fires confetti and `setShowPollOverlay(true)` in the same callback:

```js
setTimeout(() => {
  // plays sound, fires confetti, then immediately:
  setShowPollOverlay(true)   // ← poll opens, covers confetti
}, 650)
```

Refactor to split `setShowPollOverlay` into a conditional nested setTimeout:

```js
setTimeout(() => {
  const correct = option === question.correct_human
  correct ? playCorrect() : playWrong()
  setShowFlash(true)
  setTimeout(() => setShowFlash(false), 800)
  if (correct) {
    confetti({ ... })
    setTimeout(() => setShowPollOverlay(true), 800)  // delay on correct: 650 + 800 = 1450ms total
  } else {
    setShowPollOverlay(true)  // wrong: no extra delay
  }
}, 650)
```

### 4.2 Poll Overlay Countdown (both `QuestionScreen.jsx` and `LostInContextQuestion.jsx`)
- **Taller countdown bar:** `h-1` → `h-2`
- **Countdown label:** Add a countdown state (integer, 5 → 0) that ticks via `setInterval` inside each overlay component. Render `"Auto-advancing in {n}s…"` as a small `text-[10px]` label above the bar. Both the label and interval are conditional on `!alwaysShowPollResults` — when the toggle is on, render nothing and clear the interval. The label animates out with the bar (same `AnimatePresence` wrapper or a simple conditional render).

---

## Section 5 — Copy & Content Polish

### 5.1 ThankYouScreen (`src/screens/ThankYouScreen.jsx`)
- **Adapt headline and subheadline to game played:**
  - `trust2030`: keep existing `<h1>` "The Future of Trust & Safety / will be AI + Human Judgment" and `<p>` "Is your platform ready?"
  - `lostInContext`: `<h1>` → "Nice work decoding Gen Z / How well do you read the room?" and hide the subheadline `<p>` (it is only relevant to Trust 2030)

### 5.2 SurveyPromptScreen (`src/screens/SurveyPromptScreen.jsx`)
- Change "5-minute Trust & Safety Survey" → "90-second Trust & Safety Survey"
- Change `Skip →` text arrow to SVG arrow (same `<path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />` used throughout the app)

### 5.3 LostInContextQuestion (`src/screens/LostInContextQuestion.jsx`)
- Remove "Decode GenZ Lingos:" prefix from the round heading — show just "Round {n}" to avoid duplicating the header title

### 5.4 GameIntroScreen (`src/screens/GameIntroScreen.jsx`)
- **Remove the "Question:" label** (lines 188–193). It is rendered to the right of the question text in a right-aligned flex layout, making it appear after the content it labels. Removing is a single-line delete and cleaner than restructuring the layout.
- **Add back navigation:** Add a `<button>` in the top-left corner (absolute positioned) with a left-chevron SVG that calls `navigate('gameSelect')`. Currently the only escape from GameIntro is the 90s idle timeout.

---

## Files Changed

| File | Section |
|---|---|
| `src/components/Background.jsx` | New — §1 |
| `src/screens/AttractScreen.jsx` | §2.1 |
| `src/screens/GameSelectScreen.jsx` | §2.2 |
| `src/screens/EmailCaptureScreen.jsx` | §2.3 |
| `src/screens/ThankYouScreen.jsx` | §2.4, §5.1 |
| `src/screens/OnboardingScreen.jsx` | §2.5, §3.1 |
| `src/screens/QuestionScreen.jsx` | §3.2, §4.2 |
| `src/screens/LostInContextQuestion.jsx` | §4.1, §4.2, §5.3 |
| `src/screens/SurveyPromptScreen.jsx` | §5.2 |
| `src/screens/GameIntroScreen.jsx` | §5.4 |

**Total: 9 existing files modified, 1 new file created.**

---

## Out of Scope

- ThankYou "Talk to our T&S Experts" CTA — deferred (no decision on target action)
- Poll overlay `alwaysShowPollResults` toggle placement — noted but not changed
- FinalResultsScreen radar chart or scoring changes
- Any admin panel changes beyond what was already implemented
