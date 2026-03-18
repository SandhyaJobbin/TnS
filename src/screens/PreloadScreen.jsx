import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { RED, MONO, DARK_BG } from '../theme'

// All videos that must be preloaded — public attract videos + bundled game videos
// Public videos are served from /public/, bundled ones are resolved by Vite at import time.
import trust2030Video    from '../assets/videos/Trust-And-Safety-2030.mp4'
import lostInContextVideo from '../assets/videos/Lost-in-context.mp4'
import gameIntro1Video   from '../assets/videos/gameintro1.mp4'
import gameIntro2Video   from '../assets/videos/gameintro2.mp4'

const BASE = import.meta.env.BASE_URL

const PUBLIC_VIDEOS = [
  `${BASE}videos/attract-loop-default.mp4`,
  `${BASE}videos/scene-global-scale.mp4`,
  `${BASE}videos/scene-pipeline.mp4`,
  `${BASE}videos/scene-ai-human.mp4`,
  `${BASE}videos/scene-threats.mp4`,
  `${BASE}videos/scene-collaboration.mp4`,
]

const BUNDLED_VIDEOS = [
  trust2030Video,
  lostInContextVideo,
  gameIntro1Video,
  gameIntro2Video,
]

const ALL_VIDEOS = [...PUBLIC_VIDEOS, ...BUNDLED_VIDEOS]
const TOTAL = ALL_VIDEOS.length          // 10
const TIMEOUT_MS = 10_000               // hard cap — always done in 10s

const STATUS_LINES = [
  'Initializing secure environment…',
  'Loading threat intelligence feeds…',
  'Calibrating AI moderation models…',
  'Syncing Trust & Safety data…',
  'Establishing global node connections…',
  'Priming decision engines…',
  'All systems nominal.',
]

/**
 * PreloadScreen — shown on first app load for up to 10 seconds.
 * Tracks canplaythrough events across all 10 videos and resolves
 * early if every video is buffered before the timeout.
 *
 * Props:
 *   onComplete () => void  — called once when preload finishes
 */
export default function PreloadScreen({ onComplete }) {
  const [loaded, setLoaded]     = useState(0)
  const [elapsed, setElapsed]   = useState(0)   // 0–100 (percent of 10s)
  const [statusIdx, setStatusIdx] = useState(0)
  const loadedRef   = useRef(0)
  const doneRef     = useRef(false)
  const videoRefs   = useRef([])

  // Deterministic 10s progress bar — ticks every 100 ms
  useEffect(() => {
    const start = Date.now()

    const tick = setInterval(() => {
      const pct = Math.min(((Date.now() - start) / TIMEOUT_MS) * 100, 100)
      setElapsed(pct)
      setStatusIdx(Math.floor((pct / 100) * (STATUS_LINES.length - 1)))
      if (pct >= 100) finish()
    }, 100)

    // Hard-cap safety net
    const cap = setTimeout(finish, TIMEOUT_MS + 200)

    return () => { clearInterval(tick); clearTimeout(cap) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleCanPlay() {
    loadedRef.current += 1
    setLoaded(loadedRef.current)
    if (loadedRef.current >= TOTAL) finish()
  }

  function finish() {
    if (doneRef.current) return
    doneRef.current = true
    onComplete()
  }

  const videoPercent = Math.round((loaded / TOTAL) * 100)

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center z-50"
      style={{ background: DARK_BG }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Hidden video elements — trigger canplaythrough as they buffer */}
      <div aria-hidden="true" style={{ position: 'absolute', width: 1, height: 1, opacity: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {ALL_VIDEOS.map((src, i) => (
          <video
            key={src}
            ref={el => { videoRefs.current[i] = el }}
            src={src}
            preload="auto"
            muted
            playsInline
            onCanPlayThrough={handleCanPlay}
          />
        ))}
      </div>

      {/* Branded UI */}
      <div className="w-full max-w-md px-8 flex flex-col items-center gap-8">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-3"
        >
          <img
            src={`${BASE}sutherland-logo.png`}
            alt="Sutherland"
            className="h-10 w-auto object-contain"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
          <p style={{ fontFamily: MONO, fontSize: '10px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
            Trust &amp; Safety Summit
          </p>
        </motion.div>

        {/* Pulsing dot + status */}
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: RED, boxShadow: `0 0 10px ${RED}`, animation: 'pulse 1.5s cubic-bezier(0.4,0,0.6,1) infinite' }}
          />
          <motion.p
            key={statusIdx}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            style={{ fontFamily: MONO, fontSize: '11px', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.5)' }}
          >
            {STATUS_LINES[statusIdx]}
          </motion.p>
        </motion.div>

        {/* Progress bar track */}
        <div className="w-full flex flex-col gap-2">
          <div className="w-full h-px rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: RED, boxShadow: `0 0 8px ${RED}`, width: `${elapsed}%` }}
              transition={{ ease: 'linear' }}
            />
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-between">
            <p style={{ fontFamily: MONO, fontSize: '10px', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.25)' }}>
              {loaded}/{TOTAL} assets ready
            </p>
            <p style={{ fontFamily: MONO, fontSize: '10px', letterSpacing: '0.15em', color: loaded === TOTAL ? RED : 'rgba(255,255,255,0.25)' }}>
              {videoPercent}%
            </p>
          </div>
        </div>

        {/* Data grid decoration */}
        <div className="absolute inset-0 data-grid opacity-20 pointer-events-none" />

        {/* Corner glow */}
        <div className="absolute -top-1/4 left-1/2 -translate-x-1/2 w-1/2 h-1/2 rounded-full pointer-events-none"
          style={{ background: `rgba(255,0,60,0.07)`, filter: 'blur(120px)' }} />
      </div>
    </motion.div>
  )
}
