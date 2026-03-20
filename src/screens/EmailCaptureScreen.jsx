import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSession } from '../hooks/useSession'
import Background from '../components/Background'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function EmailCaptureScreen() {
  const { navigate, playerInfo, setPlayerInfo } = useSession()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  function handleSubmit() {
    const trimmed = email.trim().slice(0, 254)
    if (!EMAIL_RE.test(trimmed)) {
      setError('Please enter a valid email address')
      return
    }
    setPlayerInfo({ ...playerInfo, email: trimmed })
    navigate('thankYou')
  }

  function handleSkip() {
    navigate('thankYou')
  }

  return (
    <motion.div
      className="relative w-full h-full flex flex-col overflow-hidden"
      style={{ background: '#0a0e1a' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <Background />

      {/* Header */}
      <header
        className="relative z-10 w-full flex items-center justify-between px-4 md:px-8 py-3 md:py-5 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(10,14,26,0.8)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
      >
        <div className="flex items-center gap-3">
          <button onPointerDown={() => navigate('gameSelect')} className="opacity-90 active:opacity-60 transition-opacity" aria-label="Home">
            <img src={`${import.meta.env.BASE_URL}sutherland-logo.png`} alt="Sutherland" className="h-8 w-auto object-contain" />
          </button>
          <div>
            <h2 className="text-white text-sm font-black leading-none uppercase tracking-tight">Trust &amp; Safety Summit</h2>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold mt-0.5" style={{ color: '#e53935' }}>Industry Report</p>
          </div>
        </div>
        <div className="text-right">
        </div>
      </header>

      {/* Main — upper 60% to avoid virtual keyboard overlap */}
      <div className="relative z-10 flex flex-col items-center justify-start flex-1 pt-6 md:pt-10 px-4 md:px-8 py-4 md:py-6 overflow-y-auto">
        <div className="w-full max-w-lg">

          {/* Badge + heading */}
          <motion.div
            className="text-center mb-5 md:mb-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <span
              className="inline-block px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4"
              style={{ background: 'rgba(229,57,53,0.1)', border: '1px solid rgba(229,57,53,0.25)', color: '#e53935' }}
            >
              One Last Step
            </span>
            <h1 className="text-white font-black leading-tight mb-2" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)' }}>
              Get Your Full Report
            </h1>
            <p className="text-white/40 leading-relaxed text-sm max-w-sm mx-auto">
              Enter your email and we&apos;ll send you a personalised Trust &amp; Safety outlook based on your predictions.
            </p>
          </motion.div>

          {/* Form card */}
          <motion.div
            className="rounded-2xl p-7"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex flex-col gap-1.5 mb-5">
              <label className="text-white/40 font-bold tracking-[0.2em] uppercase" style={{ fontSize: '10px' }}>
                Email Address
              </label>
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="rgba(229,57,53,0.6)" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  placeholder="your@email.com"
                  maxLength={254}
                  className="w-full pl-12 pr-4 py-4 rounded-xl text-white text-base outline-none transition-all placeholder:text-white/20"
                  style={{
                    background: 'rgba(10,14,26,0.6)',
                    border: error ? '1px solid rgba(229,57,53,0.6)' : '1px solid rgba(255,255,255,0.1)',
                  }}
                />
              </div>
              {error && (
                <p className="text-sm font-medium mt-1" style={{ color: '#ff8099' }}>{error}</p>
              )}
            </div>

            <p className="text-white/20 text-xs mb-6 leading-relaxed">
              Your data is collected in accordance with the consent you gave at the start. We will not share your email with third parties.
            </p>

            <motion.button
              onPointerDown={handleSubmit}
              className="w-full py-4 rounded-xl text-white font-black text-base uppercase tracking-[0.12em] flex items-center justify-center gap-2 mb-3"
              style={{
                background: '#e53935',
                boxShadow: '0 4px 24px rgba(229,57,53,0.35)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
              whileTap={{ scale: 0.98 }}
            >
              Send me the report
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </motion.button>

            <button
              onPointerDown={handleSkip}
              className="w-full py-4 rounded-xl text-sm font-bold text-center transition-colors uppercase tracking-[0.12em]"
              style={{
                color: 'rgba(255,255,255,0.5)',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'transparent',
              }}
            >
              Skip — continue without email
            </button>
          </motion.div>

        </div>
      </div>

      {/* Footer */}
      <footer
        className="relative z-10 flex items-center justify-end px-8 py-4 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.05)', opacity: 0.4 }}
      >
        <p className="text-[10px] font-medium uppercase tracking-widest text-white/40">© {new Date().getFullYear()} Trust &amp; Safety Summit | {import.meta.env.VITE_STATION_ID || 'booth-07'}</p>
      </footer>
    </motion.div>
  )
}
