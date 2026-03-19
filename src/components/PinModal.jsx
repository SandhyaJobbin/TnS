import { useState } from 'react'
import { motion } from 'framer-motion'
import { RED, MONO, MID_BG } from '../theme'

const PASSCODE = import.meta.env.VITE_ADMIN_PASSCODE ?? ''

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

/**
 * PinModal — numeric passcode entry overlay for Admin access.
 * Props:
 *   onClose   () => void   — called when user cancels or taps backdrop
 *   onSuccess () => void   — called when correct PIN is entered
 */
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(5,5,10,0.85)', backdropFilter: 'blur(20px)' }}
      onPointerDown={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={shake
          ? { x: [0, -12, 12, -8, 8, 0], scale: 1, opacity: 1 }
          : { scale: 1, opacity: 1 }
        }
        transition={shake ? { duration: 0.4 } : { duration: 0.2 }}
        className="w-80 rounded-2xl p-8 flex flex-col items-center gap-5"
        style={{ background: MID_BG, border: `1px solid rgba(255,0,60,0.25)` }}
      >
        <p
          className="text-white font-black text-sm uppercase tracking-[0.2em]"
          style={{ fontFamily: MONO }}
        >
          Admin Access
        </p>

        <input
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onChange={e => { setValue(e.target.value.replace(/\D/g, '')); setError(false) }}
          onKeyDown={handleKeyDown}
          autoFocus
          placeholder="Enter PIN"
          className="w-full text-center text-2xl font-black tracking-[0.4em] rounded-xl px-4 py-3 outline-none transition-all placeholder:text-slate-700 placeholder:text-base placeholder:tracking-widest"
          style={{
            background: 'rgba(2,11,24,0.6)',
            border: `1px solid ${error ? RED : 'rgba(255,0,60,0.3)'}`,
            color: error ? RED : 'white',
            boxShadow: error ? `0 0 12px rgba(255,0,60,0.3)` : 'none',
            fontFamily: MONO,
          }}
        />

        {error && (
          <p
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: RED, marginTop: '-8px', fontFamily: MONO }}
          >
            Incorrect PIN
          </p>
        )}

        <button
          onPointerDown={handleSubmit}
          className="w-full py-3 rounded-xl text-white font-black text-sm uppercase tracking-[0.2em] transition-all active:scale-95"
          style={{ background: RED, boxShadow: `0 0 16px rgba(255,0,60,0.3)`, fontFamily: MONO }}
        >
          Unlock
        </button>

        <button
          onPointerDown={onClose}
          className="text-xs uppercase tracking-widest font-bold"
          style={{ color: 'rgba(255,255,255,0.3)', fontFamily: MONO }}
        >
          Cancel
        </button>
      </motion.div>
    </motion.div>
  )
}
