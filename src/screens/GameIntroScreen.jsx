import { motion } from 'framer-motion'
import { useSession } from '../hooks/useSession'
import { useSound } from '../hooks/useSound'
import gameIntro1 from '../assets/videos/gameintro1.mp4'
import gameIntro2 from '../assets/videos/gameintro2.mp4'

const CONTENT = {
  trust2030: {
    video: gameIntro1,
    eyebrow: 'Trust & Safety 2030',
    headline: ['Welcome to 2030'],
    subheadline: 'Billions of Users. Trillions of Decisions.',
    body: [
      'AI-generated communities',
      'Virtual economies worth billions',
      'Autonomous agents interacting with users',
      '& More…',
    ],
    bodyLabel: 'Platforms host:',
    isList: true,
    question: 'What will Trust & Safety look like?',
    cta: 'Start Predicting',
  },
  lostInContext: {
    video: gameIntro2,
    eyebrow: 'Lost in Context',
    headline: ['The Gen Z Slang Quiz'],
    subheadline: null,
    body: [
      'Same words. Very different meanings.',
      'Can you tell what\'s really meant?',
    ],
    bodyLabel: null,
    isList: false,
    question: 'How well do you read the room?',
    cta: 'Start Playing',
  },
}

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11, delayChildren: 0.25 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

const ACCENT = '#e53935'

export default function GameIntroScreen() {
  const { selectedGame, navigate } = useSession()
  const playTap = useSound('tap.mp3', { volume: 0.3 })
  const content = CONTENT[selectedGame]

  if (!content) return null

  function handleBegin() {
    playTap()
    navigate('question')
  }

  return (
    <motion.div
      className="relative w-full h-full overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Fullscreen video */}
      <video
        src={content.video}
        autoPlay
        loop
        muted
        playsInline
        onCanPlayThrough={e => {
          e.currentTarget.style.filter = 'brightness(0.5) blur(0px)'
          e.currentTarget.style.transform = 'scale(1)'
        }}
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          filter: 'brightness(0.5) blur(12px)',
          transform: 'scale(1.05)',
          transition: 'filter 0.8s ease, transform 0.8s ease',
        }}
      />

      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-to-l from-black/90 via-black/55 to-black/20 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

      {/* Scan line */}
      <div className="scan-line" />

      {/* Layout */}
      <div className="absolute inset-0 flex flex-col px-12 py-10 lg:px-20 lg:py-12">

        {/* Eyebrow */}
        <motion.div
          className="flex items-center gap-3 mb-auto justify-end"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          <span className="text-xs font-black uppercase tracking-[0.25em]" style={{ color: ACCENT }}>
            {content.eyebrow}
          </span>
          <div className="h-px w-8" style={{ background: ACCENT }} />
        </motion.div>

        {/* Body */}
        <div className="flex-1 flex items-center justify-end min-h-0 py-6">

          {/* Cinematic text — right-aligned */}
          <motion.div
            className="max-w-2xl flex flex-col justify-center min-w-0 text-right"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            {content.headline.map((line, i) => (
              <motion.h1
                key={i}
                variants={fadeUp}
                className="font-black text-white leading-[1.0] mb-1"
                style={{ fontSize: 'clamp(2.2rem, 5vw, 4.2rem)' }}
              >
                {line}
              </motion.h1>
            ))}

            {content.subheadline && (
              <motion.p
                variants={fadeUp}
                className="font-semibold text-white/65 mt-3"
                style={{ fontSize: 'clamp(0.95rem, 1.8vw, 1.35rem)' }}
              >
                {content.subheadline}
              </motion.p>
            )}

            <motion.div variants={fadeUp} className="mt-6 mb-5">
              {content.bodyLabel && (
                <p className="text-[10px] font-black uppercase tracking-[0.22em] mb-3"
                  style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {content.bodyLabel}
                </p>
              )}
              {content.isList ? (
                <ul className="flex flex-col gap-2.5 items-end">
                  {content.body.map((item, i) => (
                    <motion.li
                      key={i}
                      variants={fadeUp}
                      className="flex items-center gap-3 text-white/70 font-medium"
                      style={{ fontSize: 'clamp(0.85rem, 1.5vw, 1.05rem)' }}
                    >
                      {item}
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: ACCENT }} />
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col gap-2">
                  {content.body.map((line, i) => (
                    <motion.p
                      key={i}
                      variants={fadeUp}
                      className="text-white/70 font-medium"
                      style={{ fontSize: 'clamp(0.9rem, 1.7vw, 1.2rem)' }}
                    >
                      {line}
                    </motion.p>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Question */}
            <motion.div variants={fadeUp} className="flex items-start gap-3 mt-1 justify-end">
              <p className="font-black text-white leading-snug"
                style={{ fontSize: 'clamp(0.95rem, 1.8vw, 1.3rem)' }}>
                {content.question}
              </p>
              <span
                className="text-[10px] font-black uppercase tracking-[0.2em] shrink-0 mt-1"
                style={{ color: ACCENT }}
              >
                Question:
              </span>
            </motion.div>

            {/* CTA */}
            <motion.div variants={fadeUp} className="mt-6 flex justify-end">
              <motion.button
                onPointerDown={handleBegin}
                className="flex items-center gap-3 px-7 py-4 rounded-xl text-white font-black text-sm uppercase tracking-[0.16em]"
                style={{
                  background: ACCENT,
                  boxShadow: '0 4px 28px rgba(229,57,53,0.4)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                whileHover={{ scale: 1.02, boxShadow: '0 6px 36px rgba(229,57,53,0.55)' }}
                whileTap={{ scale: 0.97 }}
              >
                <span>{content.cta}</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
