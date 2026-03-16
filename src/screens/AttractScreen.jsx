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
      key={src}
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
      className="relative w-full h-full flex flex-col items-center justify-between overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Video background with crossfade */}
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
          {/* Dark overlay so text stays readable */}
          <div className="absolute inset-0 bg-black/55" />
        </motion.div>
      </AnimatePresence>

      {/* Logo top-left */}
      <div className="absolute top-8 left-8 z-10">
        <div className="text-white/60 text-sm font-semibold tracking-widest uppercase">
          Sutherland
        </div>
        <div className="text-white/40 text-xs tracking-wider mt-0.5">Trust &amp; Safety Summit</div>
      </div>

      {/* Admin hotspot top-right */}
      <AdminHotspot />

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center z-10 px-16 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={sceneIndex}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-4"
          >
            <h1
              className="font-bold leading-tight text-white"
              style={{ fontSize: 'clamp(2.5rem, 5vw, 5rem)' }}
            >
              {scene.headline}
            </h1>
            <p
              className="text-white/70 font-light"
              style={{ fontSize: 'clamp(1.2rem, 2.5vw, 2rem)' }}
            >
              {scene.subline}
            </p>
            {scene.stat && (
              <p
                className="text-primary-400 font-medium mt-2"
                style={{ fontSize: 'clamp(1rem, 2vw, 1.5rem)' }}
              >
                {scene.stat}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Scene dots */}
      <div className="flex gap-2 mb-6 z-10">
        {SCENES.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === sceneIndex ? 'bg-primary-400 w-6' : 'bg-white/30'
            }`}
          />
        ))}
      </div>

      {/* CTA */}
      <div className="pb-16 z-10">
        <motion.button
          onPointerDown={startSession}
          className="bg-primary-600 hover:bg-primary-500 active:bg-primary-700 text-white font-bold rounded-2xl px-16 py-6 text-2xl shadow-2xl shadow-primary-900/50 border border-primary-400/30"
          whileTap={{ scale: 0.97 }}
          animate={{ boxShadow: ['0 0 20px rgba(124,58,237,0.4)', '0 0 40px rgba(124,58,237,0.8)', '0 0 20px rgba(124,58,237,0.4)'] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          Tap to start the game
        </motion.button>
      </div>
    </motion.div>
  )
}
