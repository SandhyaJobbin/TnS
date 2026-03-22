# Onboarding Form + Sync Reliability Improvements — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the onboarding form with new role options, add email and phone fields, fix Supabase sync to capture industry and phone, and add a 5-minute background sync interval.

**Architecture:** All changes are isolated to 5 files. Form state flows from OnboardingScreen → App context (playerInfo) → ThankYouScreen (IndexedDB + syncQueue) → api.js (Supabase). The 5-minute interval lives in App.jsx alongside the existing mount/online sync. No new files are created.

**Tech Stack:** React 18, Vite, Tailwind CSS, Framer Motion, Supabase JS client, idb (IndexedDB)

> **Note:** This project has no test runner. Verification steps are manual browser checks via `npm run dev` (localhost:5173).

---

## File Map

| File | What changes |
|---|---|
| `src/screens/OnboardingScreen.jsx` | Replace ROLES array; remove subtitle `<p>`; add email+phone inputs; update `form` useState; update `handleContinue` |
| `src/screens/EmailCaptureScreen.jsx` | Pre-fill local `email` state from `playerInfo.email` |
| `src/App.jsx` | Add `email`, `phone` to `initialState.playerInfo`; add 5-min `setInterval` useEffect |
| `src/utils/api.js` | Rename `syncToSheets`→`syncToSupabase`; add `industry`+`phone_number` to both insert blocks; fix `fetchSessionsFromSupabase` mapping |
| `src/admin/AdminPanel.jsx` | Add Industry+Phone to Identity panel in expanded row; replace `downloadCSV` headers+rows |

---

## Task 1: Update ROLES array and remove subtitle in OnboardingScreen

**Files:**
- Modify: `src/screens/OnboardingScreen.jsx:5-13` (ROLES array)
- Modify: `src/screens/OnboardingScreen.jsx:109` (subtitle `<p>`)

- [ ] **Step 1: Replace the ROLES array**

Open `src/screens/OnboardingScreen.jsx`. Replace lines 5–13:

```js
const ROLES = [
  'Trust and Safety OPS',
  'Trust and Safety Wellness',
  'Risk & Compliance / Legal',
  'Public Policy / Government Relations',
  'Policy / Public Policy',
  'Product / Engineering',
  'Safety Technology Vendor',
  'Research / Academia',
  'Regulator / Government',
  'Other',
]
```

- [ ] **Step 2: Remove the subtitle paragraph**

Delete this line entirely (line 109):
```jsx
<p className="text-slate-500 text-sm mt-1.5">All fields are optional — fill in what you&apos;re comfortable sharing.</p>
```

- [ ] **Step 3: Verify in browser**

Open `http://localhost:5173`, tap through to the onboarding screen. Confirm:
- Role dropdown shows new options (Trust and Safety OPS at top, Trust & Safety gone)
- No subtitle text below the heading

- [ ] **Step 4: Commit**

```bash
git add src/screens/OnboardingScreen.jsx
git commit -m "feat(onboarding): update roles list and remove optional-fields subtitle"
```

---

## Task 2: Add email and phone fields to OnboardingScreen

**Files:**
- Modify: `src/screens/OnboardingScreen.jsx` — form state, inputs, handleContinue

- [ ] **Step 1: Update the local form state initialiser**

Find line 42:
```js
const [form, setForm] = useState({ name: '', company: '', role: '', industry: '', consent: false })
```
Replace with:
```js
const [form, setForm] = useState({ name: '', company: '', role: '', industry: '', email: '', phone: '', consent: false })
```

- [ ] **Step 2: Update handleContinue to pass email and phone**

Find the `setPlayerInfo({...})` call inside `handleContinue` (lines 48–54). Replace it with:
```js
setPlayerInfo({
  name:     form.name.trim().slice(0, 100),
  company:  form.company.trim().slice(0, 150),
  role:     form.role || '',
  industry: form.industry || '',
  email:    form.email.trim().slice(0, 254),
  phone:    form.phone.trim().slice(0, 30),
  consent:  form.consent,
})
```

- [ ] **Step 3: Add email + phone input row to the JSX**

Find the divider after the Role/Industry row (around line 220 — the `<div className="h-px w-full".../>` before the consent label). Insert a new section **before** that second divider:

```jsx
{/* Divider */}
<div className="h-px w-full" style={{ background: 'rgba(255,255,255,0.06)' }} />

{/* Row 3: Email + Phone */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  {/* Email */}
  <div className="flex flex-col gap-2">
    <label className="text-slate-400 font-black tracking-[0.18em] uppercase text-[10px]">Email Address</label>
    <div className="relative">
      <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="rgba(255,0,60,0.5)" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
      <input
        type="email"
        value={form.email}
        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
        placeholder="your@email.com"
        maxLength={254}
        className="w-full pl-10 pr-4 py-3 rounded-xl text-slate-100 outline-none transition-all placeholder:text-slate-600 text-sm"
        style={{ background: 'rgba(2,11,24,0.5)', border: '1px solid rgba(255,0,60,0.2)' }}
      />
    </div>
  </div>

  {/* Phone */}
  <div className="flex flex-col gap-2">
    <label className="text-slate-400 font-black tracking-[0.18em] uppercase text-[10px]">Phone Number</label>
    <div className="relative">
      <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="rgba(255,0,60,0.5)" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
      <input
        type="text"
        value={form.phone}
        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
        placeholder="+1 555 123 4567"
        maxLength={30}
        className="w-full pl-10 pr-4 py-3 rounded-xl text-slate-100 outline-none transition-all placeholder:text-slate-600 text-sm"
        style={{ background: 'rgba(2,11,24,0.5)', border: '1px solid rgba(255,0,60,0.2)' }}
      />
    </div>
  </div>
</div>
```

- [ ] **Step 4: Verify in browser**

Navigate to onboarding screen. Confirm:
- Email and Phone fields appear between Role/Industry and the consent checkbox
- Typing in both fields works
- Tapping Email field on a touch device brings up the email keyboard
- Continue button still works; no console errors

- [ ] **Step 5: Commit**

```bash
git add src/screens/OnboardingScreen.jsx
git commit -m "feat(onboarding): add email and phone number fields"
```

---

## Task 3: Update App.jsx — initialState and 5-minute sync interval

**Files:**
- Modify: `src/App.jsx:34` (initialState)
- Modify: `src/App.jsx:81-90` (add new useEffect after existing sync useEffect)

- [ ] **Step 1: Add email and phone to initialState**

Find line 34 in `src/App.jsx`:
```js
playerInfo: { name: '', company: '', role: '', industry: '', consent: false },
```
Replace with:
```js
playerInfo: { name: '', company: '', role: '', industry: '', email: '', phone: '', consent: false },
```

- [ ] **Step 2: Add 5-minute sync interval**

Find the existing sync `useEffect` (lines 82–90). After its closing `}, [])`, add a new useEffect:

```js
// 5-minute background sync — flushes any pending syncQueue items to Supabase
useEffect(() => {
  const id = setInterval(() => {
    if (navigator.onLine) processSyncQueue()
  }, 5 * 60 * 1000)
  return () => clearInterval(id)
}, [])
```

`processSyncQueue` is already imported at line 5 — no new import needed.

- [ ] **Step 3: Verify in browser**

Open browser console. Wait or temporarily change the interval to `10 * 1000` (10 seconds), confirm you see `[Supabase] sync_success` or `[Supabase] sync_skipped` log in console after the interval fires. Revert to `5 * 60 * 1000` after confirming.

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "feat(sync): add email/phone to playerInfo state and 5-min background sync interval"
```

---

## Task 4: Pre-fill EmailCaptureScreen from playerInfo.email

**Files:**
- Modify: `src/screens/EmailCaptureScreen.jsx:10` (useState initialiser)

- [ ] **Step 1: Pre-fill email state from playerInfo**

Find line 10:
```js
const [email, setEmail] = useState('')
```
Replace with:
```js
const [email, setEmail] = useState(playerInfo?.email || '')
```

`playerInfo` is already destructured from `useSession()` on line 9 — no other changes needed.

- [ ] **Step 2: Verify in browser**

Run a full flow: enter an email on the onboarding screen → play a game → reach EmailCaptureScreen. Confirm the email field is pre-filled with what was entered on onboarding.

Also verify: if onboarding email is blank, the EmailCaptureScreen field is blank. If the user skips, the session saves with the onboarding email intact.

- [ ] **Step 3: Commit**

```bash
git add src/screens/EmailCaptureScreen.jsx
git commit -m "feat(email-capture): pre-fill email from onboarding playerInfo"
```

---

## Task 5: Fix api.js — rename syncToSheets, add missing fields, fix mapping

**Files:**
- Modify: `src/utils/api.js`

- [ ] **Step 1: Rename syncToSheets → syncToSupabase**

Two changes in `api.js`:

1. Line 17 — rename the function declaration:
```js
// Before:
export async function syncToSheets(record) {
// After:
export async function syncToSupabase(record) {
```

2. Line 145 — update the internal call inside `processSyncQueue`:
```js
// Before:
const success = await syncToSheets(item)
// After:
const success = await syncToSupabase(item)
```

- [ ] **Step 2: Add industry and phone_number to syncToSupabase insert**

Inside `syncToSupabase`, find the `supabase.from('sessions').insert({...})` block (around lines 41–53). Add two fields:
```js
industry:      pi.industry  || null,
phone_number:  pi.phone     || null,
```
Place them after `role: pi.role || null`.

- [ ] **Step 3: Add industry and phone_number to forceFullSync insert**

Inside `forceFullSync`, find the second `supabase.from('sessions').insert({...})` block (around lines 182–194). Add the same two fields in the same position:
```js
industry:      pi.industry  || null,
phone_number:  pi.phone     || null,
```

- [ ] **Step 4: Fix fetchSessionsFromSupabase playerInfo mapping**

Find the `.map(row => ({...}))` block inside `fetchSessionsFromSupabase` (around lines 110–123). Replace the `playerInfo:` object with:
```js
playerInfo: {
  name:     row.name     || '',
  company:  row.company  || '',
  role:     row.role     || '',
  industry: row.industry || '',
  email:    row.email    || '',
  phone:    row.phone_number || '',
  consent:  row.consent  ?? false,
},
```

- [ ] **Step 5: Verify no broken imports**

Run:
```bash
npm run build 2>&1 | head -40
```
Expected: build completes with no `syncToSheets is not defined` or import errors.

- [ ] **Step 6: Commit**

```bash
git add src/utils/api.js
git commit -m "fix(api): rename syncToSheets→syncToSupabase, sync industry+phone_number, fix session mapping"
```

---

## Task 6: Update AdminPanel — expanded row and CSV export

**Files:**
- Modify: `src/admin/AdminPanel.jsx` — Identity panel in expanded row, `downloadCSV`

- [ ] **Step 1: Find the Identity panel in the expanded row**

Search for the Identity panel section in `AdminPanel.jsx`. It renders fields like Name, Company, Role, Email, Consent as label/value pairs. It looks approximately like:

```jsx
<p style={...}>Name</p><p>{s.playerInfo?.name || '—'}</p>
<p style={...}>Company</p><p>{s.playerInfo?.company || '—'}</p>
<p style={...}>Role</p><p>{s.playerInfo?.role || '—'}</p>
<p style={...}>Email</p><p>{s.playerInfo?.email || '—'}</p>
<p style={...}>Consent</p><p>{...}</p>
```

- [ ] **Step 2: Insert Industry after Role, Phone after Email**

Add these two pairs in the positions specified:

After the Role row:
```jsx
<p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Industry</p>
<p className="text-xs text-slate-300">{s.playerInfo?.industry || '—'}</p>
```

After the Email row:
```jsx
<p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Phone</p>
<p className="text-xs text-slate-300">{s.playerInfo?.phone || '—'}</p>
```

Match the exact className/style pattern used by the existing rows in that panel.

- [ ] **Step 3: Replace downloadCSV headers and rows**

Find `function downloadCSV()` (around line 288). Replace the `headers` and `rows` variables:

```js
const headers = [
  'sessionId', 'timestamp', 'game_played',
  'name', 'company', 'role', 'industry',
  'email', 'phone_number',
  'consent', 'status', 'answers'
]
const rows = filtered.map(s => [
  s.sessionId,
  new Date(s.timestamp).toISOString(),
  s.game_played,
  s.playerInfo?.name     || '',
  s.playerInfo?.company  || '',
  s.playerInfo?.role     || '',
  s.playerInfo?.industry || '',
  s.playerInfo?.email    || '',
  s.playerInfo?.phone    || '',
  s.playerInfo?.consent ? 'yes' : 'no',
  sessionStatus(s),
  JSON.stringify(s.answers),
])
```

- [ ] **Step 4: Verify in browser**

Open the admin panel (tap hotspot top-right on AttractScreen, enter passcode). Complete a test session with email and phone filled in. Then:
- Open the session detail row → confirm Industry and Phone appear in the Identity panel
- Download CSV → open in Excel/Sheets → confirm 12 columns including `industry` and `phone_number`, with values populated

- [ ] **Step 5: Commit**

```bash
git add src/admin/AdminPanel.jsx
git commit -m "feat(admin): add industry and phone to session detail and CSV export"
```

---

## Task 7: End-to-end verification

- [ ] **Step 1: Run full kiosk flow**

Start dev server (`npm run dev`). Complete a full session:
1. Onboarding: fill in name, company, select a role (pick one of the new ones), select industry, enter email and phone, check consent → Continue
2. Play either game to completion
3. On EmailCaptureScreen: confirm email is pre-filled → submit
4. ThankYou screen appears

- [ ] **Step 2: Verify IndexedDB capture**

Open DevTools → Application → IndexedDB → `trust-safety-kiosk` → `sessions`. Find the session just completed. Confirm `playerInfo` contains `email`, `phone`, `industry`, and `role` with the values entered.

- [ ] **Step 3: Verify Supabase row**

Open Supabase dashboard → Table Editor → `sessions`. Confirm the new row has populated values in `industry` and `phone_number` columns.

- [ ] **Step 4: Verify admin panel display**

Open admin panel, find the session, expand its row. Confirm Industry and Phone fields are populated in the Identity panel.

- [ ] **Step 5: Verify CSV export**

Download CSV from admin panel. Open it and confirm 12 columns, all values correct.

- [ ] **Step 6: Final commit if any tweaks made**

```bash
git add -p
git commit -m "fix: end-to-end verification tweaks"
```

---

## Summary

| Task | File | Commit message |
|---|---|---|
| 1 | OnboardingScreen | feat(onboarding): update roles list and remove optional-fields subtitle |
| 2 | OnboardingScreen | feat(onboarding): add email and phone number fields |
| 3 | App.jsx | feat(sync): add email/phone to playerInfo state and 5-min background sync interval |
| 4 | EmailCaptureScreen | feat(email-capture): pre-fill email from onboarding playerInfo |
| 5 | api.js | fix(api): rename syncToSheets→syncToSupabase, sync industry+phone_number, fix session mapping |
| 6 | AdminPanel | feat(admin): add industry and phone to session detail and CSV export |
| 7 | — | End-to-end verification |
