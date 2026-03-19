import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { v4 as uuidv4 } from 'uuid'
import { useSession } from '../hooks/useSession'
import { writeSession, addToSyncQueue } from '../hooks/useIndexedDB'
import { processSyncQueue } from '../utils/api'

const AUTO_RESET_SECONDS = 15

function Background() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />
      <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full opacity-10"
        style={{ background: '#e53935', filter: 'blur(120px)' }} />
      <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full opacity-8"
        style={{ background: '#1a0a2e', filter: 'blur(120px)' }} />
    </div>
  )
}

export default function ThankYouScreen() {
  const { sessionId, playerInfo, selectedGame, answers, shuffledQuestions, resetSession, navigate } = useSession()
  const [countdown, setCountdown] = useState(AUTO_RESET_SECONDS)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function saveSession() {
      const record = {
        sessionId,
        timestamp: Date.now(),
        game_played: selectedGame,
        playerInfo,
        answers,
        questionIds: shuffledQuestions.map(q => q.id),
      }
      console.log('[ThankYou] saving session', record.sessionId, 'game:', record.game_played, 'answers:', Object.keys(record.answers || {}).length)
      await writeSession(record)
      await addToSyncQueue(record)
      setSaved(true)
      console.log('[ThankYou] queued — running processSyncQueue')
      processSyncQueue()
    }
    saveSession()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(interval)
          resetSession()
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [resetSession])

  const circumference = 2 * Math.PI * 16

  return (
    <motion.div
      className="relative w-full h-full flex flex-col overflow-hidden"
      style={{ background: '#0a0e1a' }}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Background />

      {/* Header */}
      <header
        className="relative z-10 w-full flex items-center justify-between px-8 py-5 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(10,14,26,0.8)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
      >
        <div className="flex items-center gap-3">
          <button onPointerDown={() => navigate('gameSelect')} className="opacity-90 active:opacity-60 transition-opacity" aria-label="Home">
            <img src={`${import.meta.env.BASE_URL}sutherland-logo.png`} alt="Sutherland" className="h-8 w-auto object-contain" />
          </button>
          <div>
            <h2 className="text-white text-sm font-black leading-none uppercase tracking-tight">Trust &amp; Safety Summit</h2>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold mt-0.5" style={{ color: '#e53935' }}>Session Complete</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>Thank You</p>
        </div>
      </header>

      {/* Main */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-10 py-8">
        <div className="w-full max-w-2xl flex flex-col items-center text-center">

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <span
              className="inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest"
              style={{ background: 'rgba(229,57,53,0.1)', border: '1px solid rgba(229,57,53,0.25)', color: '#e53935' }}
            >
              {playerInfo?.name ? `Thanks, ${playerInfo.name}` : 'Thank You'}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="font-black text-white leading-[1.05] mb-5"
            style={{ fontSize: 'clamp(2rem, 5vw, 3.4rem)', letterSpacing: '-0.02em' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            The Future of Trust &amp; Safety<br />
            <span style={{ color: '#e53935' }}>will be AI + Human Judgment</span>
          </motion.h1>

          {/* Question */}
          <motion.p
            className="font-bold text-white/60 mb-10"
            style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)' }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
          >
            Is your platform ready?
          </motion.p>

          {/* Primary CTA */}
          <motion.button
            className="w-full py-6 rounded-2xl text-white font-black flex items-center justify-center gap-3 mb-5 uppercase tracking-wider"
            style={{
              fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
              background: '#e53935',
              boxShadow: '0 4px 40px rgba(229,57,53,0.45)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.44 }}
          >
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Talk to our Trust &amp; Safety Experts
          </motion.button>

          {/* Secondary — restart + countdown */}
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.58 }}
          >
            <button
              onPointerDown={resetSession}
              className="text-white/35 text-xs font-bold uppercase tracking-widest hover:text-white/60 transition-colors"
            >
              Play again
            </button>
            <span className="text-white/15 text-xs">·</span>
            <div className="flex items-center gap-2 text-white/25 text-xs">
              <svg className="w-9 h-9 -rotate-90 shrink-0" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
                <circle
                  cx="20" cy="20" r="16"
                  fill="none"
                  stroke="#e53935"
                  strokeWidth="3"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - countdown / AUTO_RESET_SECONDS)}
                  style={{ transition: 'stroke-dashoffset 1s linear', filter: 'drop-shadow(0 0 4px rgba(229,57,53,0.5))' }}
                />
              </svg>
              <span>Returning to start in {countdown}s</span>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Footer */}
      <footer
        className="relative z-10 flex items-center justify-between px-8 py-4 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.05)', opacity: 0.4 }}
      >
        <div className="flex gap-6">
          <button className="text-[10px] font-bold uppercase tracking-widest text-white/50">Privacy Policy</button>
          <button className="text-[10px] font-bold uppercase tracking-widest text-white/50">Methodology</button>
        </div>
        <p className="text-[10px] font-medium uppercase tracking-widest text-white/40">© 2024 Trust &amp; Safety Summit | Kiosk-07</p>
      </footer>
    </motion.div>
  )
}
