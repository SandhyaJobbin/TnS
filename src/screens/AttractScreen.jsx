import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, Lock, Shield, Terminal } from '@phosphor-icons/react'
import { useSession } from '../hooks/useSession'
import AdminHotspot from '../components/AdminHotspot'

const BASE = import.meta.env.BASE_URL
const RED = '#FF0044'
const DARK_BG = '#05050A'
const MONO = "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace"

const SCENES = [
  {
    headline: 'Billions of users.',
    subline: 'Trillions of decisions.',
    stat: 'Global T&S spend projected to exceed $25B by 2030',
    video: `${BASE}videos/scene-global-scale.mp4`,
  },
  {
    headline: 'Every second,',
    subline: 'platforms must decide what stays and what goes.',
    stat: 'AI now handles 80–95% of detection tasks at scale',
    video: `${BASE}videos/scene-pipeline.mp4`,
  },
  {
    headline: 'AI scales moderation.',
    subline: 'Humans define the rules.',
    stat: 'Human oversight remains essential for appeals and context',
    video: `${BASE}videos/scene-ai-human.mp4`,
  },
  {
    headline: 'Scams. Manipulation.',
    subline: 'Synthetic media.',
    stat: 'GenAI has dramatically accelerated fraud and impersonation',
    video: `${BASE}videos/scene-threats.mp4`,
  },
  {
    headline: 'The future of Trust & Safety',
    subline: 'is collaboration.',
    stat: 'Stanford, WEF, and EU DSA all point the same direction',
    video: `${BASE}videos/scene-collaboration.mp4`,
  },
  {
    headline: 'Predict the Future',
    subline: 'of Trust & Safety.',
    stat: 'What does 2030 look like?',
    video: `${BASE}videos/attract-loop-default.mp4`,
  },
]

const variants = {
  odd:   { initial: { opacity: 0, x: -40 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 40 } },
  even:  { initial: { opacity: 0, scale: 0.94 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 1.04 } },
  final: { initial: { opacity: 0, scale: 0.85 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.9 } },
}
const getVariant = (i) => i === 5 ? variants.final : i % 2 === 0 ? variants.even : variants.odd

const SHADOW = '0 2px 4px rgba(0,0,0,0.9), 0 4px 20px rgba(0,0,0,0.8)'

const FLOATING_ICONS = [
  { Icon: Globe, size: 32, top: '20%', left: '10%' },
  { Icon: Lock,  size: 24, top: '35%', left: '45%' },
  { Icon: Globe, size: 28, top: '55%', left: '80%' },
  { Icon: Lock,  size: 20, top: '70%', left: '25%' },
  { Icon: Globe, size: 36, top: '15%', left: '70%' },
  { Icon: Lock,  size: 28, top: '65%', left: '58%' },
]


function VideoPool({ scenes, activeIndex }) {
  const refs = useRef([])
  const [readyMap, setReadyMap] = useState({})

  useEffect(() => {
    refs.current.forEach((el, i) => {
      if (!el) return
      if (i === activeIndex) {
        el.play().catch(() => {})
      } else {
        el.pause()
      }
    })
  }, [activeIndex])

  return (
    <>
      {scenes.map((scene, i) => (
        <video
          key={scene.video}
          ref={el => { refs.current[i] = el }}
          src={scene.video}
          loop
          muted
          playsInline
          preload="auto"
          onCanPlayThrough={() => setReadyMap(m => ({ ...m, [i]: true }))}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: i === activeIndex ? 1 : 0,
            transition: 'opacity 1.2s ease',
            filter: readyMap[i] ? 'blur(0px)' : 'blur(12px)',
            transform: readyMap[i] ? 'scale(1)' : 'scale(1.05)',
            pointerEvents: 'none',
          }}
        />
      ))}
    </>
  )
}

export default function AttractScreen() {
  const { startSession, navigate } = useSession()
  const [sceneIndex, setSceneIndex] = useState(0)
  const [systemTime, setSystemTime] = useState(new Date().toLocaleTimeString())
  const [showTerminal, setShowTerminal] = useState(false)
  const [loadProgress, setLoadProgress] = useState(0)
  const termTimerRef = useRef(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setSceneIndex(i => (i + 1) % SCENES.length)
    }, 10_000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setSystemTime(new Date().toLocaleTimeString()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => () => clearTimeout(termTimerRef.current), [])

  const handleStart = () => {
    setLoadProgress(0)
    setShowTerminal(true)
    const startTime = Date.now()
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const pct = Math.min(Math.round((elapsed / 900) * 100), 100)
      setLoadProgress(pct)
      if (pct >= 100) clearInterval(progressInterval)
    }, 30)
    termTimerRef.current = setTimeout(() => startSession(), 1000)
  }

  const handleAbort = () => {
    clearTimeout(termTimerRef.current)
    setShowTerminal(false)
  }

  const scene = SCENES[sceneIndex]

  return (
    <motion.div
      className="relative w-full h-full flex flex-col overflow-hidden"
      style={{ background: DARK_BG }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* ── Video layer — all videos stay mounted; only active one is visible ── */}
      <div className="absolute inset-0">
        <VideoPool scenes={SCENES} activeIndex={sceneIndex} />
      </div>

      {/* ── Overlay layers — light so video breathes through ── */}
      {/* Light film */}
      <div className="absolute inset-0 bg-black/25 z-10" />
      {/* Soft vignette */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.45) 100%)' }}
      />
      {/* White grid — very faint */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-grid opacity-25" />
      {/* Subtle red radial bloom */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 50%, rgba(255,0,68,0.04) 0%, transparent 65%)` }}
      />
      {/* Bottom gradient — enough to keep CTA readable */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10"
        style={{ height: '42%', background: `linear-gradient(to bottom, transparent 0%, rgba(5,5,10,0.88) 55%, rgba(5,5,10,0.98) 100%)` }}
      />


      {/* ── Floating icons ── */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 15 }}>
        {FLOATING_ICONS.map(({ Icon, size, top, left }, i) => (
          <motion.div
            key={i}
            className="absolute text-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.08, 0.22, 0.08], y: [0, -18, 0], x: [0, 8, 0] }}
            transition={{ duration: 5 + i, repeat: Infinity, delay: i * 0.6 }}
            style={{ top, left }}
          >
            <Icon size={size} weight="thin" />
          </motion.div>
        ))}
      </div>

      {/* ── Header bar ── */}
      <header className="relative z-20 w-full px-4 md:px-8 py-3 md:py-5 flex justify-between items-center">
        {/* Logo — tap is a staff shortcut to game select */}
        <div className="flex items-center gap-3 cursor-pointer" onPointerDown={() => navigate('gameSelect')}>
          <div
            className="p-1.5 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.95)', border: `1px solid rgba(255,0,68,0.30)`, boxShadow: `0 0 12px rgba(255,0,68,0.25)` }}
          >
            <img src={`${BASE}sutherland-logo.png`} alt="Sutherland" className="w-6 h-6 object-contain" />
          </div>
          <div>
            <div className="text-white text-sm font-bold tracking-widest uppercase" style={{ textShadow: SHADOW }}>Sutherland</div>
            <div className="text-white/50 text-xs tracking-wide" style={{ textShadow: SHADOW }}>Trust &amp; Safety Summit</div>
          </div>
        </div>

        {/* Center badge */}
        <div
          className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-sm"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}
        >
          <Shield size={12} weight="fill" style={{ color: RED }} />
          <span style={{ fontSize: '10px', fontFamily: MONO, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Trust &amp; Safety Summit 2025
          </span>
        </div>

        {/* System online */}
        <div className="flex items-center gap-2" style={{ color: `rgba(255,0,68,0.8)` }}>
          <span style={{ fontSize: '10px', fontFamily: MONO, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase' }}>
            System Online
          </span>
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: RED, animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite', boxShadow: `0 0 8px ${RED}` }}
          />
        </div>
      </header>

      {/* ── Admin hotspot ── */}
      <AdminHotspot />

      {/* ── Main headline ── */}
      <div className="flex-1 flex flex-col items-center justify-center z-20 px-6 md:px-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={sceneIndex}
            initial={getVariant(sceneIndex).initial}
            animate={getVariant(sceneIndex).animate}
            exit={getVariant(sceneIndex).exit}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-4 text-center max-w-4xl"
          >
            <div className="flex flex-col items-center gap-3 text-center">
              <h1
                className="font-black tracking-tighter text-white"
                style={{ fontSize: 'clamp(2.4rem, 7vw, 7rem)', lineHeight: 0.88, textShadow: SHADOW }}
              >
                {scene.headline}
                <br />
                <span style={{ color: RED }}>{scene.subline}</span>
              </h1>
              {scene.stat && (
                <p
                  className="font-light mt-3"
                  style={{ fontSize: 'clamp(1rem, 1.8vw, 1.4rem)', color: 'rgba(255,255,255,0.7)', textShadow: SHADOW, letterSpacing: '0.01em' }}
                >
                  {scene.stat}
                </p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Bottom zone ── */}
      <div className="relative z-20 flex flex-col items-center gap-3 md:gap-4 pb-4 md:pb-8 px-4 md:px-8">
        {/* Tagline */}
        <p
          className="text-center"
          style={{ fontFamily: MONO, fontSize: '11px', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}
        >
          95% of content decisions powered by AI &mdash; humans define what&rsquo;s right
        </p>

        {/* Scene progress dots */}
        <div className="flex gap-2">
          {SCENES.map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all duration-500"
              style={{
                width: i === sceneIndex ? '2rem' : '0.5rem',
                background: i === sceneIndex ? RED : 'rgba(255,255,255,0.25)',
                boxShadow: i === sceneIndex ? `0 0 8px rgba(255,0,68,0.7)` : 'none',
              }}
            />
          ))}
        </div>

        {/* CTA button */}
        <motion.div
          className="relative"
          whileTap={{ scale: 1 }}
          onPointerDown={() => {}}
        >
          <div
            className="absolute -inset-4 rounded-full"
            style={{ background: `rgba(255,0,68,0.20)`, filter: 'blur(24px)', opacity: 0.3 }}
          />
          <motion.button
            onPointerDown={handleStart}
            className="relative text-white font-black rounded-xl px-8 md:px-16 py-4 md:py-5 text-base md:text-xl uppercase tracking-[0.12em] border border-white/10"
            style={{ background: RED }}
            whileTap={{ scale: 0.97 }}
            animate={{
              boxShadow: [
                '0 0 20px rgba(255,0,68,0.4), 0 4px 24px rgba(255,0,68,0.3)',
                '0 0 40px rgba(255,0,68,0.7), 0 4px 40px rgba(255,0,68,0.5)',
                '0 0 20px rgba(255,0,68,0.4), 0 4px 24px rgba(255,0,68,0.3)',
              ],
            }}
            transition={{ repeat: Infinity, duration: 2.2 }}
          >
            Tap to Begin
          </motion.button>
        </motion.div>

        {/* Footer status bar */}
        <div className="flex justify-between items-center w-full max-w-xl px-2 opacity-30">
          <div className="flex items-center gap-1.5">
            <Terminal size={12} />
            <span style={{ fontSize: '10px', fontFamily: MONO, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Terminal Active</span>
          </div>
          <span style={{ fontSize: '10px', fontFamily: MONO, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            {systemTime}
          </span>
        </div>
      </div>

      {/* ── Terminal overlay ── */}
      <AnimatePresence>
        {showTerminal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex flex-col items-center justify-center p-12"
            style={{ zIndex: 50, background: 'rgba(5,5,10,0.95)', backdropFilter: 'blur(20px)' }}
          >
            <div className="w-full max-w-2xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: RED, animation: 'ping 1s cubic-bezier(0,0,0.2,1) infinite' }}
                  />
                  <span style={{ color: RED, fontFamily: MONO, fontSize: '13px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                    Initializing Neural Link...
                  </span>
                </div>
                <button
                  onPointerDown={handleAbort}
                  style={{ color: 'rgba(255,255,255,0.4)', fontFamily: MONO, fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  [ Abort ]
                </button>
              </div>

              <div className="space-y-4" style={{ fontFamily: MONO, fontSize: '13px' }}>
                <motion.p
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }}
                  className="text-white/80"
                >
                  {'>'} Loading Sutherland Core v4.2.0...
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                  className="text-white/80"
                >
                  {'>'} Establishing secure handshake with global nodes...
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}
                  style={{ color: RED }}
                >
                  {'>'} WARNING: High volume of decisions detected in Sector 7.
                </motion.p>
                <motion.div
                  initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.85, ease: 'easeInOut', delay: 0.1 }}
                  className="h-px w-full origin-left mt-8"
                  style={{ background: RED }}
                />
                <div className="flex justify-between opacity-40 mt-2" style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                  <span>Syncing Data</span>
                  <span>{loadProgress}% Complete</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
