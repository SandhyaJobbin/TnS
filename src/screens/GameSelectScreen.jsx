import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Gear,
  Question,
} from '@phosphor-icons/react'
import { useSession } from '../hooks/useSession'
import { useSound } from '../hooks/useSound'
import { shuffle } from '../utils/scoring'
import trust2030Questions from '../data/trust2030_questions.json'
import lostInContextQuestions from '../data/lost_in_context_questions.json'
import trust2030Video from '../assets/videos/Trust-and-safety-2030.mp4'
import lostInContextVideo from '../assets/videos/Lost-in-context.mp4'

const GAMES = [
  {
    id: 'trust2030',
    title: 'Trust & Safety 2030',
    subtitle: 'Predict the future',
    description:
      'What do you think the next 4-5 years will bring for Trust & Safety? Share your predictions in this 90-second challenge.',
    video: trust2030Video,
    accent: '#e53935',
  },
  {
    id: 'lostInContext',
    title: 'Lost in Context',
    subtitle: 'Where AI moderation gets confused',
    description: 'Same words. Different vibes. What\'s the context?',
    video: lostInContextVideo,
    accent: '#e53935',
  },
]

const TICKER_MESSAGES = [
  'We\'ll publish the collective industry forecast after the event.',
  'Submit your prediction and receive the industry insights report.',
]

const PASSCODE = import.meta.env.VITE_ADMIN_PASSCODE || 'admin1234'
const STATION_ID = import.meta.env.VITE_STATION_ID || 'Alpha-01'

function PinModal({ onClose, onSuccess }) {
  const [value, setValue] = useState('')
  const [shake, setShake] = useState(false)
  const [error, setError] = useState(false)

  function handleSubmit() {
    if (value === PASSCODE) {
      onSuccess()
    } else {
      setShake(true)
      setError(true)
      setTimeout(() => { setShake(false); setError(false); setValue('') }, 700)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSubmit()
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
        animate={shake ? { x: [0, -12, 12, -8, 8, 0], scale: 1, opacity: 1 } : { scale: 1, opacity: 1 }}
        transition={shake ? { duration: 0.4 } : { duration: 0.2 }}
        className="w-80 rounded-2xl p-8 flex flex-col items-center gap-5"
        style={{ background: '#0a0e1a', border: '1px solid rgba(229,57,53,0.25)' }}
      >
        <p className="text-white font-black text-sm uppercase tracking-[0.2em]">Admin Access</p>

        {/* PIN input */}
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
            border: `1px solid ${error ? '#e53935' : 'rgba(229,57,53,0.3)'}`,
            color: error ? '#e53935' : 'white',
            boxShadow: error ? '0 0 12px rgba(229,57,53,0.3)' : 'none',
          }}
        />

        {error && (
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#e53935', marginTop: '-8px' }}>
            Incorrect PIN
          </p>
        )}

        <button
          onPointerDown={handleSubmit}
          className="w-full py-3 rounded-xl text-white font-black text-sm uppercase tracking-[0.2em] transition-all active:scale-95"
          style={{ background: '#e53935', boxShadow: '0 0 16px rgba(229,57,53,0.3)' }}
        >
          Unlock
        </button>

        <button
          onPointerDown={onClose}
          className="text-xs uppercase tracking-widest font-bold"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        >
          Cancel
        </button>
      </motion.div>
    </motion.div>
  )
}

export default function GameSelectScreen() {
  const { selectGame, goToAdmin } = useSession()
  const playTap = useSound('tap.mp3', { volume: 0.3 })
  const [showPinModal, setShowPinModal] = useState(false)
  const [tickerIdx, setTickerIdx] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTickerIdx(i => (i + 1) % TICKER_MESSAGES.length), 4000)
    return () => clearInterval(id)
  }, [])

  function handleAdminGear() {
    setShowPinModal(true)
  }

  function handleSelect(gameId) {
    playTap()
    const questions =
      gameId === 'trust2030'
        ? shuffle(trust2030Questions)
        : shuffle(lostInContextQuestions)
    selectGame(gameId, questions)
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
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-2 lg:px-20 border-b border-primary/20 backdrop-blur-md sticky top-0 z-50 bg-[#0a0e1a]/80">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <img src={`${import.meta.env.BASE_URL}sutherland-logo.png`} alt="Sutherland" className="h-8 w-auto object-contain" />
          <h2 className="text-xl font-bold tracking-tight text-white">
            Trust &amp; Safety Summit
          </h2>
        </motion.div>

        {/* Live feed ticker */}
        <div className="flex-1 mx-6 overflow-hidden flex items-center justify-center">
          <div className="flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: '#FF003C', boxShadow: '0 0 6px rgba(255,0,60,0.8)', animation: 'pulse 1.5s cubic-bezier(0.4,0,0.6,1) infinite' }}
            />
            <div className="overflow-hidden" style={{ maxWidth: '420px' }}>
              <AnimatePresence mode="wait">
                <motion.p
                  key={tickerIdx}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4 }}
                  className="text-white text-xs font-medium tracking-wide whitespace-nowrap"
                >
                  {TICKER_MESSAGES[tickerIdx]}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex gap-3"
        >
          <button onPointerDown={handleAdminGear} className="p-2.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all active:scale-95">
            <Gear size={20} />
          </button>
          <button className="p-2.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all active:scale-95">
            <Question size={20} />
          </button>
        </motion.div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-4 overflow-hidden">
        {/* Title */}
        <motion.div
          className="max-w-5xl w-full text-center mb-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2 leading-[1.1] text-white">
            Choose your{' '}
            <span className="text-primary relative inline-block">
              challenge
              <motion.span
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="absolute bottom-0 left-0 h-1 bg-primary/30 rounded-full"
              />
            </span>
          </h1>
        </motion.div>

        {/* Game cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-6xl w-full">
          {GAMES.map((game, i) => {
            return (
              <motion.div
                key={game.id}
                onPointerDown={() => handleSelect(game.id)}
                className="group relative flex flex-col items-center rounded-2xl cursor-pointer overflow-hidden"
                style={{
                  background: 'rgba(10, 14, 26, 0.6)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(229,57,53,0.2)',
                }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 + 0.2, duration: 0.45 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Video area */}
                <div className="w-full aspect-[16/7] relative bg-slate-900 overflow-hidden">
                  <video
                    src={game.video}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700"
                    style={{ transition: 'opacity 0.7s' }}
                  />
                  {/* Bottom gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a]/80 via-transparent to-transparent" />
                </div>

                {/* Content */}
                <div className="text-center relative z-10 px-8 py-3">
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 group-hover:text-primary/90 transition-colors">
                    {game.title}
                  </h3>
                  <p className="text-primary font-bold tracking-widest uppercase text-xs mb-2">
                    {game.subtitle}
                  </p>
                  <p className="text-white/50 text-sm leading-relaxed max-w-xs mx-auto mb-3">
                    {game.description}
                  </p>
                  <span
                    className="inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.15em]"
                    style={{ background: 'rgba(229,57,53,0.15)', border: '1px solid rgba(229,57,53,0.35)', color: '#e53935' }}
                  >
                    Tap to Play →
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>

      </main>

      {/* Footer — status pill only */}
      <footer className="px-6 py-2 border-t border-primary/10 bg-[#0a0e1a]/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-4 text-slate-500 text-xs font-bold bg-primary/5 px-4 py-2 rounded-full border border-primary/10"
          >
            <div className="flex items-center gap-2.5">
              <span
                className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(229,57,53,0.8)]"
                style={{ animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' }}
              />
              <span className="tracking-widest uppercase">Kiosk Mode Active</span>
            </div>
            <div className="w-px h-4 bg-primary/20" />
            <div className="tracking-widest uppercase">Station: {STATION_ID}</div>
          </motion.div>
        </div>
      </footer>

      {/* PIN modal */}
      <AnimatePresence>
        {showPinModal && (
          <PinModal
            onClose={() => setShowPinModal(false)}
            onSuccess={() => { setShowPinModal(false); goToAdmin() }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
