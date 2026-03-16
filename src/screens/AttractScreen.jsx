import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from '../hooks/useSession'
import AdminHotspot from '../components/AdminHotspot'

const BASE = import.meta.env.BASE_URL

const SCENES = [
  {
    headline: 'Billions of users.',
    subline: 'Trillions of decisions.',
    stat: null,
    video: `${BASE}videos/scene-global-scale.mp4`,
  },
  {
    headline: 'Every second,',
    subline: 'platforms must decide what stays and what goes.',
    stat: null,
    video: `${BASE}videos/scene-pipeline.mp4`,
  },
  {
    headline: 'AI scales moderation.',
    subline: 'Humans define the rules.',
    stat: null,
    video: `${BASE}videos/scene-ai-human.mp4`,
  },
  {
    headline: 'Scams. Manipulation.',
    subline: 'Synthetic media.',
    stat: null,
    video: `${BASE}videos/scene-threats.mp4`,
  },
  {
    headline: 'The future of Trust & Safety',
    subline: 'is collaboration.',
    stat: null,
    video: `${BASE}videos/scene-collaboration.mp4`,
  },
  {
    headline: 'Predict the Future',
    subline: 'of Trust & Safety.',
    stat: 'What does 2030 look like?',
    video: `${BASE}videos/attract-loop-default.mp4`,
  },
]

const STRONG_SHADOW = '0 2px 4px rgba(0,0,0,0.9), 0 4px 20px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.6)'

function SceneVideo({ src }) {
  const ref = useRef(null)
  useEffect(() => {
    if (ref.current) {
      ref.current.load()
      ref.current.play().catch(() => {})
    }
  }, [src])
  return (
    <video
      ref={ref}
      src={src}
      autoPlay
      loop
      muted
      playsInline
      className="absolute inset-0 w-full h-full object-cover"
    />
  )
}

export default function AttractScreen() {
  const { startSession } = useSession()
  const [sceneIndex, setSceneIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setSceneIndex(i => (i + 1) % SCENES.length)
    }, 10_000)
    return () => clearInterval(interval)
  }, [])

  const scene = SCENES[sceneIndex]

  return (
    <motion.div
      className="relative w-full h-full flex flex-col overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* ── Video layer ── */}
      <AnimatePresence>
        <motion.div
          key={scene.video}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
        >
          <SceneVideo src={scene.video} />
        </motion.div>
      </AnimatePresence>

      {/* ── Overlay layers ── */}
      {/* Base tint */}
      <div className="absolute inset-0 bg-black/40 z-10" />
      {/* Vignette: dark edges */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.65) 100%)',
        }}
      />
      {/* Bottom band: solid dark for CTA */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10"
        style={{ height: '38%', background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.92) 55%, rgba(0,0,0,0.98) 100%)' }}
      />

      {/* ── Logo top-left ── */}
      <div className="absolute top-8 left-8 z-20">
        <div
          className="text-white text-sm font-semibold tracking-widest uppercase"
          style={{ textShadow: STRONG_SHADOW }}
        >
          Sutherland
        </div>
        <div
          className="text-white/70 text-xs tracking-wider mt-0.5"
          style={{ textShadow: STRONG_SHADOW }}
        >
          Trust &amp; Safety Summit
        </div>
      </div>

      {/* ── Admin hotspot top-right ── */}
      <AdminHotspot />

      {/* ── Main headline — center of screen ── */}
      <div className="flex-1 flex flex-col items-center justify-center z-20 px-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={sceneIndex}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-5 text-center max-w-4xl"
          >
            {/* Frosted backdrop card */}
            <div
              className="px-12 py-8 rounded-3xl flex flex-col items-center gap-4"
              style={{ background: 'rgba(0,0,0,0.52)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <h1
                className="font-bold leading-tight text-white"
                style={{ fontSize: 'clamp(2.6rem, 5.5vw, 5.2rem)', textShadow: STRONG_SHADOW }}
              >
                {scene.headline}
              </h1>
              <p
                className="text-white/90 font-light"
                style={{ fontSize: 'clamp(1.2rem, 2.4vw, 2rem)', textShadow: STRONG_SHADOW }}
              >
                {scene.subline}
              </p>
              {scene.stat && (
                <p
                  className="font-semibold mt-1"
                  style={{ fontSize: 'clamp(1rem, 1.8vw, 1.5rem)', color: '#c4b5fd', textShadow: STRONG_SHADOW }}
                >
                  {scene.stat}
                </p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Bottom zone: dots + CTA ── */}
      <div className="relative z-20 flex flex-col items-center gap-6 pb-14">
        {/* Scene progress dots */}
        <div className="flex gap-2">
          {SCENES.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === sceneIndex ? 'w-8 bg-white' : 'w-2 bg-white/35'
              }`}
            />
          ))}
        </div>

        {/* CTA button */}
        <motion.button
          onPointerDown={startSession}
          className="text-white font-bold rounded-2xl px-16 py-6 text-2xl border border-white/20"
          style={{
            background: 'rgba(124,58,237,0.85)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            boxShadow: '0 0 0 1px rgba(167,139,250,0.3), 0 8px 32px rgba(109,40,217,0.6)',
          }}
          whileTap={{ scale: 0.97 }}
          animate={{
            boxShadow: [
              '0 0 0 1px rgba(167,139,250,0.3), 0 8px 32px rgba(109,40,217,0.5)',
              '0 0 0 1px rgba(167,139,250,0.5), 0 8px 48px rgba(109,40,217,0.9)',
              '0 0 0 1px rgba(167,139,250,0.3), 0 8px 32px rgba(109,40,217,0.5)',
            ],
          }}
          transition={{ repeat: Infinity, duration: 2.2 }}
        >
          Tap to start the game
        </motion.button>
      </div>
    </motion.div>
  )
}
