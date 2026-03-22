# Spec: Onboarding Form + Sync Reliability Improvements

**Date:** 2026-03-22
**Status:** Approved

---

## Overview

Two related improvements:
1. Update the onboarding form — new role options, remove optional-fields subtitle, add email and phone fields
2. Fix data capture reliability — add `industry` and `phone_number` to Supabase sync, add a 5-minute background sync interval, rename the legacy `syncToSheets` function

---

## 1. Onboarding Form Changes

### 1.1 Role List

**Replace the entire `ROLES` array** with the following (do not append — replacing prevents duplicates):

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

### 1.2 Remove Subtitle

Remove the line:
> "All fields are optional — fill in what you're comfortable sharing."

The `<p>` tag on line 109 of `OnboardingScreen.jsx` is deleted entirely.

### 1.3 Email + Phone Fields

Add a new row below the Role/Industry row, before the consent checkbox. Two inputs side-by-side (same `grid-cols-1 sm:grid-cols-2` pattern as Name/Company):

| Field | Type | Placeholder | Max length | Validation |
|---|---|---|---|---|
| Email Address | `email` input | `your@email.com` | 254 | None — optional (use `type="email"` to trigger email keyboard on touchscreen) |
| Phone Number | `text` input | `+1 555 123 4567` | 30 | None — optional |

Both fields are optional. No gate on the Continue button.

Also add `email` and `phone` to the local `form` useState initialiser in `OnboardingScreen.jsx`:
```js
const [form, setForm] = useState({ name: '', company: '', role: '', industry: '', email: '', phone: '', consent: false })
```

### 1.4 State Changes (`App.jsx`)

Add `email` and `phone` to `initialState.playerInfo`:
```js
playerInfo: { name: '', company: '', role: '', industry: '', email: '', phone: '', consent: false }
```

Update the `setPlayerInfo(...)` call inside `handleContinue` in `OnboardingScreen.jsx` to include the two new fields with trim+slice bounds:
```js
setPlayerInfo({
  name:     form.name.trim().slice(0, 100),
  company:  form.company.trim().slice(0, 150),
  role:     form.role || '',
  industry: form.industry || '',
  email:    form.email.trim().slice(0, 254),   // ← new
  phone:    form.phone.trim().slice(0, 30),    // ← new
  consent:  form.consent,
})
```

---

## 2. EmailCaptureScreen Pre-fill

`EmailCaptureScreen` initialises its local `email` state from `playerInfo.email` if present:
```js
const [email, setEmail] = useState(playerInfo?.email || '')
```

If the user already entered an email on onboarding, it appears pre-filled. They can change it or submit as-is. If they skip, the email from onboarding remains on the session (no overwrite on skip).

**Validation edge case:** The onboarding email field has no validation. If a user enters a malformed email on onboarding and it pre-fills into EmailCaptureScreen, clicking "Send me the report" will show a validation error (the existing `EMAIL_RE` check still runs). This is acceptable — the user can correct it or skip. No change to EmailCaptureScreen validation logic is required.

---

## 3. Supabase Sync Fixes (`api.js`)

### 3.1 Rename `syncToSheets` → `syncToSupabase`

The function was named after the original Google Sheets plan. Two changes in `api.js`:
1. Rename the function declaration from `syncToSheets` to `syncToSupabase`
2. Update the internal call site on line 145 inside `processSyncQueue` from `syncToSheets(item)` to `syncToSupabase(item)`

No other files import `syncToSheets` directly — no external interface changes needed.

### 3.2 Add Missing Fields to Session Inserts

Both `syncToSupabase` (formerly `syncToSheets`) and `forceFullSync` session inserts gain two new fields:

```js
industry:      pi.industry     || null,
phone_number:  pi.phone        || null,
```

Supabase columns required (both already added by user):
- `industry text`
- `phone_number text`

### 3.3 Fix `fetchSessionsFromSupabase` Mapping

The function that maps Supabase rows back to local session format currently omits `industry` and `phone_number`. Fix the `playerInfo` mapping:

```js
playerInfo: {
  name:     row.name     || '',
  company:  row.company  || '',
  role:     row.role     || '',
  industry: row.industry || '',
  email:    row.email    || '',
  phone:    row.phone_number || '',  // maps Supabase column → local field
  consent:  row.consent  ?? false,
},
```

---

## 4. 5-Minute Background Sync Interval (`App.jsx`)

Add a `setInterval` alongside the existing mount/online sync:

```js
useEffect(() => {
  const id = setInterval(() => {
    if (navigator.onLine) processSyncQueue()
  }, 5 * 60 * 1000) // 5 minutes
  return () => clearInterval(id)
}, [])
```

- Only runs when online
- Processes the syncQueue (pushes any pending sessions to Supabase)
- Does not pull from Supabase on the interval (pull only on mount/online event to avoid unnecessary reads)
- Admin panel refreshes manually via its existing Refresh / Force Sync buttons

---

## 5. Admin Panel Updates (`AdminPanel.jsx`)

### 5.1 Session Detail Expanded Row

Add `Industry` and `Phone` to the **Identity panel** of the existing 3-column expanded row layout (the panel that currently shows Name, Company, Role, Email, Consent). Insert in this order: Name → Company → Role → Industry → Email → Phone → Consent.

### 5.2 CSV Export

Replace the entire `headers` array and `rows` mapping in `downloadCSV()`:

```js
const headers = [
  'sessionId', 'timestamp', 'game_played',
  'name', 'company', 'role', 'industry',
  'email', 'phone_number',   // header label is phone_number; value comes from playerInfo.phone (local field name)
  'consent', 'status', 'answers'
]
const rows = filtered.map(s => [
  s.sessionId,
  new Date(s.timestamp).toISOString(),
  s.game_played,
  s.playerInfo?.name     || '',
  s.playerInfo?.company  || '',
  s.playerInfo?.role     || '',
  s.playerInfo?.industry || '',   // ← new
  s.playerInfo?.email    || '',
  s.playerInfo?.phone    || '',   // ← new (local field `phone` → CSV column `phone_number`)
  s.playerInfo?.consent ? 'yes' : 'no',
  sessionStatus(s),
  JSON.stringify(s.answers),
])
```

Note: the local `playerInfo` field is named `phone` (set in `initialState`), while the Supabase column and CSV header are named `phone_number`. This is intentional — keep the mapping explicit as shown above.

---

## 6. Files Changed

| File | Changes |
|---|---|
| `src/screens/OnboardingScreen.jsx` | New ROLES list; remove subtitle; add email + phone inputs; pass all fields through `setPlayerInfo` |
| `src/screens/EmailCaptureScreen.jsx` | Pre-fill email state from `playerInfo.email` |
| `src/App.jsx` | Add `email`, `phone` to `initialState.playerInfo`; add 5-min `setInterval` for sync |
| `src/utils/api.js` | Rename `syncToSheets` → `syncToSupabase`; add `industry` + `phone_number` to inserts; fix `fetchSessionsFromSupabase` mapping |
| `src/admin/AdminPanel.jsx` | Add phone to expanded row; add `industry` + `phone_number` to CSV export |

---

## 7. Supabase Schema (already applied)

| Column | Type | Notes |
|---|---|---|
| `industry` | `text` | Already added |
| `phone_number` | `text` | Already added |

No other schema changes required.
