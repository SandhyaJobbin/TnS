import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gear } from '@phosphor-icons/react'
import { useSession } from '../hooks/useSession'
import { useSound } from '../hooks/useSound'
import { shuffle } from '../utils/scoring'
import PinModal from '../components/PinModal'
import trust2030Questions from '../data/trust2030_questions.json'
import lostInContextQuestions from '../data/lost_in_context_questions.json'
import trust2030Video from '../assets/videos/Trust-And-Safety-2030.mp4'
import lostInContextVideo from '../assets/videos/Lost-in-context.mp4'

const HERO = {
  id: 'lostInContext',
  title: 'Decode GenZ Lingos',
  subtitle: 'Think you speak GenZ?',
  description: 'Same words. Very different meanings. Can AI tell the difference — and can you?',
  video: lostInContextVideo,
  accentColor: '#38bdf8',
  ctaLabel: 'Play Now →',
}

const SURVEY = {
  id: 'trust2030',
  title: 'Trust & Safety Survey',
  subtitle: 'Share your perspective',
  description: 'What do you think the next 4–5 years hold for Trust & Safety? Share your predictions in this 90-second challenge.',
  video: trust2030Video,
  accentColor: '#e53935',
  ctaLabel: 'Take Survey →',
}

const TICKER_MESSAGES = [
  'We\'ll publish the collective industry forecast after the event.',
  'Submit your prediction and receive the industry insights report.',
  'Optional incentive: Submit your prediction and receive the industry insights report.',
]

const STATION_ID = import.meta.env.VITE_STATION_ID || 'booth-07'
const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace"
const SHADOW = '0 2px 4px rgba(0,0,0,0.9), 0 4px 20px rgba(0,0,0,0.8)'

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
      <header className="flex items-center justify-between px-4 md:px-6 py-2 lg:px-10 xl:px-16 border-b border-primary/20 backdrop-blur-md sticky top-0 z-50 bg-[#0a0e1a]/80">
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
            <div className="overflow-hidden max-w-[280px] sm:max-w-xs md:max-w-[420px]">
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
        >
          <button onPointerDown={handleAdminGear} className="p-2.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all active:scale-95">
            <Gear size={20} />
          </button>
        </motion.div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 md:px-6 py-3 md:py-4 overflow-y-auto min-h-0">
        {/* Title */}
        <motion.div
          className="max-w-2xl w-full text-center mb-3 md:mb-4 shrink-0"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <h1
            className="font-black tracking-tighter text-white mb-1"
            style={{ fontSize: 'clamp(1.6rem, 4vw, 2.8rem)', lineHeight: 0.9, textShadow: SHADOW }}
          >
            Two ways to engage
          </h1>
          <p style={{ fontFamily: MONO, fontSize: '10px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
            Play the game · Take the survey
          </p>
        </motion.div>

        {/* Cards — equal 1×2 stack */}
        <div className="flex flex-col gap-3 md:gap-4 w-full max-w-2xl flex-1 min-h-0">

          {/* Card 1 — Decode GenZ Lingos */}
          <motion.div
            onPointerDown={() => handleSelect(HERO.id)}
            className="group relative rounded-2xl cursor-pointer overflow-hidden flex-1 min-h-[220px] transition-opacity duration-300 hover:opacity-90"
            style={{
              border: '2px solid rgba(56,189,248,0.35)',
              boxShadow: '0 0 32px rgba(56,189,248,0.08)',
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.45 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Video fills entire card */}
            <video
              src={HERO.video}
              autoPlay
              loop
              muted
              playsInline
              onCanPlayThrough={e => {
                e.currentTarget.style.filter = 'blur(0px) brightness(1)'
                e.currentTarget.style.transform = 'scale(1)'
              }}
              className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:opacity-95 transition-opacity duration-700"
              style={{
                filter: 'blur(12px) brightness(0.8)',
                transform: 'scale(1.05)',
                transition: 'opacity 0.7s, filter 0.8s ease, transform 0.8s ease',
              }}
            />

            {/* Base tint — ensures text legibility across the whole card */}
            <div className="absolute inset-0 bg-black/55 pointer-events-none" />
            {/* Gradient scrim — heavier at bottom for content area */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a]/98 via-[#0a0e1a]/60 to-transparent pointer-events-none" />

            {/* Type label — top left, monospace metadata style */}
            <div
              className="absolute top-3 left-3"
              style={{ fontFamily: MONO, fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#38bdf8', textShadow: SHADOW }}
            >
              Interactive Game
            </div>

            {/* Bottom content overlay */}
            <div className="absolute bottom-0 left-0 right-0 px-5 md:px-8 pb-4 text-center">
              {/* Headline + colored subline — attract pattern */}
              <h3
                className="font-black tracking-tighter text-white mb-2"
                style={{ fontSize: 'clamp(1.3rem, 2.8vw, 1.9rem)', lineHeight: 0.9, textShadow: SHADOW }}
              >
                {HERO.title}
                <br />
                <span style={{ color: '#38bdf8' }}>{HERO.subtitle}</span>
              </h3>
              {/* Description — attract stat style */}
              <p
                className="font-light mb-3"
                style={{ fontSize: 'clamp(0.68rem, 1.4vw, 0.82rem)', color: 'rgba(255,255,255,0.7)', textShadow: SHADOW, letterSpacing: '0.01em' }}
              >
                {HERO.description}
              </p>
              {/* CTA — solid filled with glow */}
              <span
                className="inline-block font-black uppercase rounded-lg px-6 py-2 border border-white/10"
                style={{ background: '#38bdf8', color: '#0a0e1a', fontSize: '11px', letterSpacing: '0.12em', boxShadow: '0 0 18px rgba(56,189,248,0.55)' }}
              >
                {HERO.ctaLabel}
              </span>
            </div>
          </motion.div>

          {/* Card 2 — Trust & Safety Survey */}
          <motion.div
            onPointerDown={() => handleSelect(SURVEY.id)}
            className="group relative rounded-2xl cursor-pointer overflow-hidden flex-1 min-h-[220px] transition-opacity duration-300 hover:opacity-90"
            style={{
              border: '2px solid rgba(229,57,53,0.3)',
              boxShadow: '0 0 32px rgba(229,57,53,0.06)',
            }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.45 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Video fills entire card */}
            <video
              src={SURVEY.video}
              autoPlay
              loop
              muted
              playsInline
              onCanPlayThrough={e => {
                e.currentTarget.style.filter = 'blur(0px) brightness(1)'
                e.currentTarget.style.transform = 'scale(1)'
              }}
              className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:opacity-95 transition-opacity duration-700"
              style={{
                filter: 'blur(12px) brightness(0.8)',
                transform: 'scale(1.05)',
                transition: 'opacity 0.7s, filter 0.8s ease, transform 0.8s ease',
              }}
            />

            {/* Base tint — ensures text legibility across the whole card */}
            <div className="absolute inset-0 bg-black/55 pointer-events-none" />
            {/* Gradient scrim — heavier at bottom for content area */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a]/98 via-[#0a0e1a]/60 to-transparent pointer-events-none" />

            {/* Type label — top left, monospace metadata style */}
            <div
              className="absolute top-3 left-3"
              style={{ fontFamily: MONO, fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#e53935', textShadow: SHADOW }}
            >
              Industry Survey
            </div>

            {/* Bottom content overlay */}
            <div className="absolute bottom-0 left-0 right-0 px-5 md:px-8 pb-4 text-center">
              {/* Headline + colored subline — attract pattern */}
              <h3
                className="font-black tracking-tighter text-white mb-2"
                style={{ fontSize: 'clamp(1.3rem, 2.8vw, 1.9rem)', lineHeight: 0.9, textShadow: SHADOW }}
              >
                {SURVEY.title}
                <br />
                <span style={{ color: '#e53935' }}>{SURVEY.subtitle}</span>
              </h3>
              {/* Description — attract stat style */}
              <p
                className="font-light mb-3"
                style={{ fontSize: 'clamp(0.68rem, 1.4vw, 0.82rem)', color: 'rgba(255,255,255,0.7)', textShadow: SHADOW, letterSpacing: '0.01em' }}
              >
                {SURVEY.description}
              </p>
              {/* CTA — solid filled with glow */}
              <span
                className="inline-block font-black uppercase rounded-lg px-6 py-2 border border-white/10"
                style={{ background: '#e53935', color: '#fff', fontSize: '11px', letterSpacing: '0.12em', boxShadow: '0 0 18px rgba(229,57,53,0.55)' }}
              >
                {SURVEY.ctaLabel}
              </span>
            </div>
          </motion.div>

        </div>
      </main>

      {/* Footer — status pill */}
      <footer className="px-6 py-2 border-t border-primary/10 bg-[#0a0e1a]/50 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-end">
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
