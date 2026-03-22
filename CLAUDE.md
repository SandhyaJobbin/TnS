# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (HMR on localhost:5173)
npm run build      # Production build → dist/
npm run preview    # Serve dist/ locally
npm run lint       # ESLint check
```

No test suite is configured. There is no test runner.

## Environment Variables

Create a `.env` file at the repo root:

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_ADMIN_PASSCODE=...   # baked at build time — changing requires rebuild
```

The app works offline without Supabase credentials; sync functions silently skip.

## Architecture

### State Machine (`src/App.jsx`)

All app state lives in a single React context (`AppContext`). Navigation is driven by a `currentScreen` string field — there is no router. `App.jsx` renders the appropriate screen component via conditional JSX inside `<AnimatePresence>`. All screen components call `useSession()` to read state and dispatch actions.

**Screen flow:** `attract` → `onboarding` → `gameSelect` → `gameIntro` → `question` → `pollResult` / `licPollResult` → `finalResults` → `surveyPrompt` → `emailCapture` → `thankYou`

Admin is a parallel overlay entered via `AdminHotspot` (hidden tap target) + passcode modal.

Idle reset (90 s, any touch/key) returns to `attract` and discards the incomplete session. Only complete sessions (reaching `thankYou`) are written to IndexedDB.

### Two Games

- **Trust 2030** (`QuestionScreen`, `PollResultScreen`, `FinalResultsScreen`): scenario questions with a 1–5 value slider. After each answer the user sees a bar chart of live + seeded poll results. Final screen shows a radar chart across trust dimensions.
- **Lost in Context** (`LostInContextQuestion`, `LostInContextPollResult`): multiple-choice AI-output classification. Each answer gets a poll result screen.

Questions live in `src/data/trust2030_questions.json` and `src/data/lost_in_context_questions.json`. Each question has a `dimension` field used as the radar chart axis label.

### Data Layer

**IndexedDB** (`src/hooks/useIndexedDB.js`, uses `idb` library) — single DB `trust-safety-kiosk` with five stores:

| Store | Key | Purpose |
|---|---|---|
| `sessions` | `sessionId` | Completed session records |
| `syncQueue` | auto-increment `id` | Sessions pending Supabase upload |
| `pollAggregates` | `questionId` | Live vote counts per option |
| `mediaBlobs` | `filename` | Admin-uploaded media (stored as Blob) |
| `logs` | auto-increment `id` | Rolling 100-entry event log |

**Poll formula** (`src/hooks/usePollAggregation.js`): weighted average of live votes and seeded baseline from `src/data/baseline.json`. Formula: `(baseline_fraction * seeding_count + live_votes) / (seeding_count + live_total) * 100`.

### Sync (`src/utils/api.js`)

Supabase client is a singleton (`getClient()`). On mount and on `online` events, the app:
1. Pulls all sessions from Supabase into IndexedDB (`pullFromSupabase`) — Supabase wins on conflict.
2. Pushes the local `syncQueue` to Supabase (`processSyncQueue`).

`forceFullSync` (admin-triggered) iterates all local sessions and inserts them, ignoring `23505` (duplicate) errors.

Supabase tables: `sessions` (one row per session) and `answers` (one row per question answered).

### Admin Panel (`src/admin/AdminPanel.jsx`)

Access: tap the hidden `AdminHotspot` in the top-right corner of `AttractScreen` → enter `VITE_ADMIN_PASSCODE`. Controls: session analytics, sync status, poll reset, media upload, lead capture toggle, `alwaysShowPollResults` flag.

### Key Patterns

- `useSession()` = `useContext(AppContext)` — used by every screen to access state and navigate.
- Screen transitions use Framer Motion `AnimatePresence mode="wait"` for cross-fade.
- All non-attract screens are lazy-loaded (`React.lazy`).
- Vite base path is `/TnS/` — asset URLs must be relative or use `import.meta.env.BASE_URL`.
- `assetsInlineLimit: 0` prevents video files from being inlined as base64.
