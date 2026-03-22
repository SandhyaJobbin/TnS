# Security & PWA Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden the kiosk against the audit findings and add PWA offline caching so the app works fully offline after one WiFi load.

**Architecture:** All fixes are client-side only (no backend). Security hardening targets the admin access flow, form inputs, and media upload. PWA caching uses `vite-plugin-pwa` (Workbox) to pre-cache all build assets plus `public/videos/` at install time. No design or theme changes.

**Tech Stack:** React 19, Vite 8, Tailwind CSS 3, `vite-plugin-pwa` (new), Workbox (bundled with plugin), `idb`, Supabase JS client.

---

## File Map

| File | Action | What changes |
|---|---|---|
| `package.json` | Modify | Add `vite-plugin-pwa` dev dependency |
| `vite.config.js` | Modify | Register PWA plugin with Workbox config |
| `index.html` | Modify | Add orientation meta, theme-color meta, manifest link |
| `src/components/AdminHotspot.jsx` | Modify | Remove `\|\| 'admin1234'` fallback |
| `src/components/PinModal.jsx` | Modify | Remove `\|\| 'admin1234'` fallback; add localStorage rate-limiting |
| `src/App.jsx` | Modify | Remove `!== 'admin'` condition from idle timer |
| `src/screens/OnboardingScreen.jsx` | Modify | Add `maxLength` + `trim()` on name and company inputs |
| `src/screens/EmailCaptureScreen.jsx` | Modify | Add `maxLength={254}` + `trim()` before validation |
| `src/admin/AdminPanel.jsx` | Modify | Add file size check + filename sanitization before `storeMediaBlob` |

---

## Task 1: Fix Dependency Vulnerability (flatted)

**Files:**
- Modify: `package.json` (auto-updated by npm)

- [ ] **Step 1: Run audit fix**

```bash
npm audit fix
```

Expected output ends with: `0 vulnerabilities` or reduced count.

- [ ] **Step 2: Verify no breaking changes**

```bash
npm run build 2>&1 | tail -10
```

Expected: build succeeds, no errors.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "fix: patch flatted prototype pollution vulnerability via npm audit fix"
```

---

## Task 2: Remove Hardcoded Passcode Fallback

**Files:**
- Modify: `src/components/AdminHotspot.jsx:4`
- Modify: `src/components/PinModal.jsx:5`

- [ ] **Step 1: Edit AdminHotspot.jsx**

Replace line 4:
```js
// REMOVE:
const PASSCODE = import.meta.env.VITE_ADMIN_PASSCODE || 'admin1234'

// REPLACE WITH:
const PASSCODE = import.meta.env.VITE_ADMIN_PASSCODE ?? ''
```

The empty string means if the env var is not set, no code will ever match — admin is inaccessible rather than trivially accessible.

- [ ] **Step 2: Edit PinModal.jsx**

Replace line 5:
```js
// REMOVE:
const PASSCODE = import.meta.env.VITE_ADMIN_PASSCODE || 'admin1234'

// REPLACE WITH:
const PASSCODE = import.meta.env.VITE_ADMIN_PASSCODE ?? ''
```

- [ ] **Step 3: Verify in dev**

```bash
npm run dev
```

Open app, triple-tap the bottom-right corner. When prompted, enter `admin1234` — it must fail. Enter the value from your `.env.local` `VITE_ADMIN_PASSCODE` — it must succeed.

- [ ] **Step 4: Commit**

```bash
git add src/components/AdminHotspot.jsx src/components/PinModal.jsx
git commit -m "fix(security): remove hardcoded admin passcode fallback"
```

---

## Task 3: Rate-Limit Passcode Attempts

**Files:**
- Modify: `src/components/PinModal.jsx`

No new dependencies. Uses `localStorage` keys:
- `admin_fail_count` — integer, number of consecutive failures
- `admin_lockout_until` — timestamp ms, lockout expiry

- [ ] **Step 1: Add rate-limit helpers at top of PinModal.jsx**

After the `PASSCODE` line (line 5), add:

```js
const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 15 * 60 * 1000 // 15 minutes

function getRateLimit() {
  const until = parseInt(localStorage.getItem('admin_lockout_until') || '0', 10)
  const count = parseInt(localStorage.getItem('admin_fail_count') || '0', 10)
  return { until, count }
}

function recordFailure() {
  const { count } = getRateLimit()
  const next = count + 1
  localStorage.setItem('admin_fail_count', String(next))
  if (next >= MAX_ATTEMPTS) {
    localStorage.setItem('admin_lockout_until', String(Date.now() + LOCKOUT_MS))
    localStorage.setItem('admin_fail_count', '0')
  }
}

function recordSuccess() {
  localStorage.removeItem('admin_fail_count')
  localStorage.removeItem('admin_lockout_until')
}

function isLockedOut() {
  const { until } = getRateLimit()
  return Date.now() < until
}

function lockoutMinutesLeft() {
  const { until } = getRateLimit()
  return Math.ceil((until - Date.now()) / 60_000)
}
```

- [ ] **Step 2: Update the component to use rate limiting**

Replace the existing `PinModal` function body with:

```jsx
export default function PinModal({ onClose, onSuccess }) {
  const [value, setValue]   = useState('')
  const [shake, setShake]   = useState(false)
  const [error, setError]   = useState(false)
  const [locked, setLocked] = useState(() => isLockedOut())

  function handleSubmit() {
    if (isLockedOut()) { setLocked(true); return }

    if (value === PASSCODE) {
      recordSuccess()
      onSuccess()
    } else {
      recordFailure()
      setLocked(isLockedOut())
      setShake(true)
      setError(true)
      setTimeout(() => { setShake(false); setError(false); setValue('') }, 700)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSubmit()
  }

  if (locked) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: 'rgba(5,5,10,0.85)', backdropFilter: 'blur(20px)' }}
        onPointerDown={e => { if (e.target === e.currentTarget) onClose() }}
      >
        <div
          className="w-80 rounded-2xl p-8 flex flex-col items-center gap-5"
          style={{ background: MID_BG, border: `1px solid rgba(255,0,60,0.25)` }}
        >
          <p className="text-white font-black text-sm uppercase tracking-[0.2em]" style={{ fontFamily: MONO }}>
            Too Many Attempts
          </p>
          <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: MONO }}>
            Try again in {lockoutMinutesLeft()} minute{lockoutMinutesLeft() !== 1 ? 's' : ''}
          </p>
          <button
            onPointerDown={onClose}
            className="text-xs uppercase tracking-widest font-bold"
            style={{ color: 'rgba(255,255,255,0.3)', fontFamily: MONO }}
          >
            Close
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    // ... existing JSX unchanged — just ensure handleSubmit is wired as before
  )
}
```

> **Implementation note:** First read `src/components/PinModal.jsx` to locate the existing `return (...)` JSX block. Then insert the helper functions after line 5 (`PASSCODE` line) and replace only the `handleSubmit` function and the state declarations above `return`. Do NOT overwrite or delete the existing `return (...)` JSX — it stays exactly as it is. The locked-state early `return` (the "Too Many Attempts" block above) should be inserted just before the existing `return`.

- [ ] **Step 3: Verify in dev**

Open app, enter the wrong PIN 5 times. On the 5th failure the modal must show the lockout message. Reload — lockout must persist (localStorage survives reload). Wait for timeout or clear `admin_lockout_until` from DevTools → Application → Local Storage to reset.

- [ ] **Step 4: Commit**

```bash
git add src/components/PinModal.jsx
git commit -m "feat(security): add rate-limiting to admin passcode — 5 attempts then 15-min lockout"
```

---

## Task 4: Fix Idle Timer on Admin Screen

**Files:**
- Modify: `src/App.jsx:68-71`

- [ ] **Step 1: Remove the admin exception**

Find this block in `resetIdleTimer` (around line 68):
```js
if (state.currentScreen !== 'admin') {
  idleTimer.current = setTimeout(resetSession, IDLE_TIMEOUT)
}
```

Replace with:
```js
idleTimer.current = setTimeout(resetSession, IDLE_TIMEOUT)
```

- [ ] **Step 2: Verify in dev**

Open admin panel. Wait 90 seconds without touching anything. App must return to the attract screen automatically.

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "fix(security): enable idle timeout on admin screen — 90s inactivity resets to attract"
```

---

## Task 5: Input Validation on Forms

**Files:**
- Modify: `src/screens/OnboardingScreen.jsx`
- Modify: `src/screens/EmailCaptureScreen.jsx`

- [ ] **Step 1: Add maxLength to OnboardingScreen inputs**

In `OnboardingScreen.jsx`, find the name and company `<input>` elements and add `maxLength`:

```jsx
// Name input — add maxLength={100}
<input
  maxLength={100}
  value={form.name}
  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
  ...
/>

// Company input — add maxLength={150}
<input
  maxLength={150}
  value={form.company}
  onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
  ...
/>
```

Also trim on submit in `handleContinue`:
```js
function handleContinue() {
  if (!canContinue) return
  setPlayerInfo({
    name: form.name.trim().slice(0, 100),
    company: form.company.trim().slice(0, 150),
    role: form.role || '',
    industry: form.industry || '',
    consent: form.consent,
  })
  navigate('gameSelect')
}
```

- [ ] **Step 2: Add maxLength to EmailCaptureScreen**

In `EmailCaptureScreen.jsx`, find the email `<input>` and add `maxLength={254}`. Update `handleSubmit` to trim before validation:

```js
function handleSubmit() {
  const trimmed = email.trim().slice(0, 254)
  if (!EMAIL_RE.test(trimmed)) {
    setError('Please enter a valid email address')
    return
  }
  setPlayerInfo({ ...playerInfo, email: trimmed })
  navigate('thankYou')
}
```

Also update the `email` state setter to use the trimmed input:
```jsx
<input
  maxLength={254}
  value={email}
  onChange={e => { setEmail(e.target.value); setError('') }}
  ...
/>
```

- [ ] **Step 3: Verify in dev**

Try pasting 200 characters into the name field — it should stop at 100. Try submitting a very long email — it should be capped and validated correctly.

- [ ] **Step 4: Commit**

```bash
git add src/screens/OnboardingScreen.jsx src/screens/EmailCaptureScreen.jsx
git commit -m "fix(security): add input length limits and trim to onboarding and email forms"
```

---

## Task 6: Media Upload Hardening

**Files:**
- Modify: `src/admin/AdminPanel.jsx:312-317`

- [ ] **Step 1: Replace handleMediaUpload with hardened version**

Find the existing function (around line 312):
```js
async function handleMediaUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  await storeMediaBlob(file.name, file)
  alert(`"${file.name}" stored successfully.`)
}
```

Replace with:
```js
const ALLOWED_MEDIA_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'webm', 'mov']
const MAX_MEDIA_SIZE_BYTES = 500 * 1024 * 1024 // 500 MB

async function handleMediaUpload(e) {
  const file = e.target.files[0]
  if (!file) return

  // File size check
  if (file.size > MAX_MEDIA_SIZE_BYTES) {
    alert(`File too large. Maximum allowed size is 500 MB. This file is ${(file.size / 1024 / 1024).toFixed(1)} MB.`)
    return
  }

  // Filename sanitization — strip path separators, null bytes, non-safe chars, limit length
  const rawName = file.name
  const ext = rawName.split('.').pop().toLowerCase()
  if (!ALLOWED_MEDIA_EXTENSIONS.includes(ext)) {
    alert(`File type ".${ext}" is not allowed. Allowed types: ${ALLOWED_MEDIA_EXTENSIONS.join(', ')}`)
    return
  }
  const safeName = rawName
    .replace(/[/\\]/g, '')         // no path separators
    .replace(/\x00/g, '')          // no null bytes
    .replace(/[^a-zA-Z0-9._\-]/g, '_') // only safe chars
    .slice(0, 255)

  await storeMediaBlob(safeName, file)
  alert(`"${safeName}" stored successfully.`)
}
```

- [ ] **Step 2: Verify in dev**

Open admin panel → Media Upload. Try uploading a file larger than 500 MB — should show error. Try a file named `../../attack.js` — name becomes `______attack.js` and is rejected (`.js` not in allowed list). Note: a file named `malware.exe.jpg` **will be accepted** as `.jpg` — this is intentional, only the final extension is checked. Try a `.mp4` — it should succeed and show the success alert.

- [ ] **Step 3: Commit**

```bash
git add src/admin/AdminPanel.jsx
git commit -m "fix(security): add file size limit and filename sanitization to media upload"
```

---

## Task 7: PWA Offline Caching

**Files:**
- Modify: `package.json`
- Modify: `vite.config.js`
- Modify: `index.html`

- [ ] **Step 1: Install vite-plugin-pwa**

```bash
npm install -D vite-plugin-pwa
```

Expected: package added to `devDependencies` in `package.json`.

- [ ] **Step 2: Update vite.config.js**

> **Preflight:** Confirm the existing `vite.config.js` has `base: '/TnS/'`. The manifest `start_url`, `scope`, and the `<link rel="manifest">` href in `index.html` must all use the same base path. If your deployment path is different, replace every `/TnS/` in this step with your actual path.

Replace entire file content with:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // Pre-cache everything in dist/ including hashed JS/CSS chunks
        globPatterns: ['**/*.{js,css,html,ico,svg,png,jpg,webp,woff2}'],
        // Also pre-cache public/videos/ (not hashed, served by URL)
        additionalManifestEntries: [
          { url: 'videos/attract-loop-default.mp4',  revision: '1' },
          { url: 'videos/scene-ai-human.mp4',        revision: '1' },
          { url: 'videos/scene-collaboration.mp4',   revision: '1' },
          { url: 'videos/scene-global-scale.mp4',    revision: '1' },
          { url: 'videos/scene-pipeline.mp4',        revision: '1' },
          { url: 'videos/scene-threats.mp4',         revision: '1' },
        ],
        // Cache mp4 files with CacheFirst strategy
        runtimeCaching: [
          {
            urlPattern: /\.mp4$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'videos',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
        // Don't cache Supabase API calls — let them fail gracefully offline
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/rest\/v1\//],
      },
      manifest: {
        name: 'Trust & Safety Kiosk',
        short_name: 'T&S Kiosk',
        description: 'Sutherland Trust & Safety Conference Kiosk',
        theme_color: '#0a0e1a',
        background_color: '#0a0e1a',
        display: 'fullscreen',
        orientation: 'landscape',
        start_url: '/TnS/',
        scope: '/TnS/',
        icons: [
          { src: 'icons.svg', sizes: 'any', type: 'image/svg+xml' },
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
    }),
  ],
  base: '/TnS/',
  optimizeDeps: {
    include: ['matter-js'],
  },
  build: {
    assetsInlineLimit: 0,
  },
})
```

> **Important:** The `revision: '1'` values in `additionalManifestEntries` are static. When you add or update a video file, increment the revision number for that entry so Workbox knows to re-cache it.

- [ ] **Step 3: Update index.html**

Add these lines inside `<head>`, after the existing `<meta name="viewport">` line:

```html
<!-- PWA / Kiosk display -->
<meta name="theme-color" content="#0a0e1a" />
<meta name="screen-orientation" content="landscape" />
<link rel="manifest" href="/TnS/manifest.webmanifest" />
```

- [ ] **Step 4: Build and inspect**

```bash
npm run build
ls dist/
```

Expected: `dist/sw.js` and `dist/manifest.webmanifest` are present.

```bash
npm run preview
```

Open `http://localhost:4173/TnS/` in Chrome. Open DevTools → Application → Service Workers. The service worker should be registered and active. Check Application → Cache Storage — you should see cached assets including video URLs.

- [ ] **Step 5: Test offline**

In DevTools → Network tab, check "Offline". Refresh the page. The app must still load fully.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vite.config.js index.html
git commit -m "feat(pwa): add offline caching via vite-plugin-pwa — pre-caches all assets and videos on first load"
```

---

## Task 8: iPad & Desktop Polish

**Files:**
- Modify: `index.html`
- Spot-check: one or two screen components if tap targets are found to be undersized

- [ ] **Step 1: Add viewport-fit and safe-area to index.html**

The viewport meta already has `viewport-fit=cover` — confirm it reads:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```
No change needed if already present.

- [ ] **Step 2: Audit tap targets visually on iPad**

Open the built app on an iPad (or Safari with iPad simulation in DevTools → Responsive). Check these critical interactive elements are ≥ 44px tall:
- Game option cards on GameSelectScreen
- Answer buttons on QuestionScreen / LostInContextQuestion
- Continue / Submit buttons on OnboardingScreen, EmailCaptureScreen
- Admin Hotspot (already 80×80px — fine)

If any button is under 44px, add `min-h-[44px]` Tailwind class to the element. Do NOT change padding, color, or layout.

- [ ] **Step 3: Verify hover states exist for desktop**

Open in Chrome on desktop. Hover over primary buttons — they should visually respond. The existing `active:scale-95` on most buttons handles this. If any button has no hover state, add `hover:opacity-80` only.

- [ ] **Step 4: Verify content max-width on large screens**

Open in a 27" monitor simulation (DevTools → Responsive → 2560×1440). Check that content doesn't stretch awkwardly. The app uses `w-full h-full` on the root — acceptable for a kiosk that fills the screen intentionally.

- [ ] **Step 5: Commit (only if changes were needed)**

```bash
git add src/screens/*.jsx
git commit -m "fix(ux): improve tap target sizes for iPad touch accuracy"
```

If no changes were needed, skip this commit.

---

## Task 9: Deploy & Verify

- [ ] **Step 1: Final build**

```bash
npm run build
```

Expected: no errors, `dist/sw.js` present.

- [ ] **Step 2: Push to GitHub Pages**

```bash
git push origin main
```

Wait for GitHub Actions deployment (or manual deploy if set up that way).

- [ ] **Step 3: First-load test on target device**

On the iPad or kiosk desktop:
1. Clear browser data (Settings → Clear browsing data)
2. Open `https://ak22021990-jpg.github.io/TnS/` on WiFi
3. Wait for full load including videos
4. Turn off WiFi
5. Reload — app must load fully offline ✓

- [ ] **Step 4: Admin access test**

1. Triple-tap bottom-right corner
2. Enter wrong PIN 5 times → lockout message must appear ✓
3. Clear localStorage in DevTools → reset lockout
4. Enter correct PIN → admin panel opens ✓
5. Wait 90 seconds without touching → returns to attract screen ✓

- [ ] **Step 5: Final commit if any last fixes**

```bash
git add -A
git commit -m "chore: post-deploy verification fixes"
```

---

## Post-Deploy: Deferred Items (Do Later)

These were explicitly deferred by the user — not in scope for this plan:

1. **Supabase RLS** — Enable INSERT-only policy on `sessions` and `answers` tables in the Supabase dashboard. Test with `curl` using anon key only — response should be `[]`.

2. **Stronger admin passcode** — Change `VITE_ADMIN_PASSCODE` in `.env.local` from `1234` to something stronger (e.g., `TnS@2026!`). Rebuild and redeploy after changing.
