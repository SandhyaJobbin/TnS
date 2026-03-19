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

**Problem:** `Background` (dot-grid + dual blur orbs) is copy-pasted identically in `EmailCaptureScreen.jsx` and `ThankYouScreen.jsx`.

**Fix:** Extract to `src/components/Background.jsx`. Both screens import and use it.

---

## Section 2 — Critical Bugs

### 2.1 AttractScreen (`src/screens/AttractScreen.jsx`)
- `[ Abort ]` button uses `onClick` → change to `onPointerDown` (consistent with all other interactive elements; faster on touch)
- Remove dead `MetricCard` component (defined but never rendered)
- Add `Shield` and `Terminal` icons to `FLOATING_ICONS` array (currently only `Globe` and `Lock` are used despite both being imported)

### 2.2 GameSelectScreen (`src/screens/GameSelectScreen.jsx`)
- Remove the bottom "Admin" text button — duplicate of the gear icon already in the header

### 2.3 EmailCaptureScreen (`src/screens/EmailCaptureScreen.jsx`)
- Remove dead Privacy Policy and Methodology footer buttons (no `onPointerDown` handler, no navigation — confusing on a kiosk)
- Replace inline `Background` function with shared `src/components/Background.jsx`

### 2.4 ThankYouScreen (`src/screens/ThankYouScreen.jsx`)
- Fix hardcoded `© 2024` → `© {new Date().getFullYear()}`
- Fix hardcoded `Kiosk-07` station ID in footer → `import.meta.env.VITE_STATION_ID || 'booth-07'`
- Replace inline `Background` function with shared `src/components/Background.jsx`

### 2.5 OnboardingScreen (`src/screens/OnboardingScreen.jsx`)
- Remove decorative user avatar icon in top-right header (non-functional, no purpose)
- Change "Identity Portal" subtitle → "About You"

---

## Section 3 — Kiosk Touch UX

### 3.1 OnboardingScreen — Select Dropdowns
- Increase both `<select>` elements: `py-3` → `py-4`, `text-sm` → `text-base`
- Result: ~52px tap target height, easier to hit on iPad without mis-tapping

### 3.2 QuestionScreen (`src/screens/QuestionScreen.jsx`)
- **Remove radio circle indicators** from answer tiles — the letter badge (A/B/C/D) already communicates selection state; both indicators are redundant
- **Expand info button tap target:** `w-4 h-4` → `w-10 h-10` wrapper with the `i` icon centered inside via flex. Current 16px target is too small for reliable touchscreen tapping
- **Reduce dimming on non-selected options:** `opacity: 0.3` → `opacity: 0.55` so unselected answers remain readable after a choice is made

---

## Section 4 — In-Game Feedback Loop

### 4.1 LostInContextQuestion (`src/screens/LostInContextQuestion.jsx`)
- **Immediate card coloring on selection:** On tap, before the poll overlay appears, color the selected card:
  - Correct: border and background shift to green (`rgba(74,222,128,…)`)
  - Wrong: border and background shift to a dimmed red/grey
  - This makes the result feel instant rather than deferred to the overlay
- **AnswerFlash duration:** Increase from 500ms → 800ms (currently blink-and-miss)
- **Confetti timing:** On a correct answer, delay the poll overlay from 650ms → 1450ms so confetti has 800ms to land before the card is covered. Wrong answer keeps existing 650ms delay.

### 4.2 Poll Overlay Countdown (both `QuestionScreen.jsx` and `LostInContextQuestion.jsx`)
- **Taller countdown bar:** `h-1` → `h-2`
- **Countdown label:** Add a small text label above the bar: `"Auto-advancing in {n}s…"` that counts down from 5. Label disappears (and bar stops) when `alwaysShowPollResults` is toggled on.

---

## Section 5 — Copy & Content Polish

### 5.1 ThankYouScreen (`src/screens/ThankYouScreen.jsx`)
- **Adapt headline to game played:**
  - `trust2030`: keep existing "The Future of Trust & Safety / will be AI + Human Judgment"
  - `lostInContext`: show "Nice work decoding Gen Z / How well do you read the room?"

### 5.2 SurveyPromptScreen (`src/screens/SurveyPromptScreen.jsx`)
- Change "5-minute Trust & Safety Survey" → "90-second Trust & Safety Survey" (more accurate)
- Change `Skip →` text arrow → SVG arrow icon (consistent with all other secondary buttons in the app)

### 5.3 LostInContextQuestion (`src/screens/LostInContextQuestion.jsx`)
- Remove "Decode GenZ Lingos:" prefix from the round heading — show just "Round {n}" to avoid duplicating the header title

### 5.4 GameIntroScreen (`src/screens/GameIntroScreen.jsx`)
- **Fix "Question:" label reading order:** Currently the label appears to the right of the question text in a right-aligned layout, making it read backwards. Move the label inline before the question text, or remove it.
- **Add back navigation:** Add a small back chevron button in the top-left corner that navigates to `gameSelect`. Currently the only escape from GameIntro is the idle timeout.

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
