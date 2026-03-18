import { useState } from 'react'
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
    headline: ['Welcome to the world', 'of mixed signals.'],
    subheadline: null,
    body: [
      'Same words can mean very different things.',
      'Context shifts everything.',
    ],
    bodyLabel: null,
    isList: false,
    question: "Can you tell what's really meant?",
    cta: 'Start Playing',
  },
}

const ROLES = [
  'Trust & Safety',
  'Policy / Public Policy',
  'Product / Engineering',
  'Safety Technology Vendor',
  'Research / Academia',
  'Regulator / Government',
  'Other',
]

const INDUSTRIES = [
  'Social Media',
  'Gaming',
  'eCommerce / Marketplaces',
  'AI / Generative AI',
  'Dating',
  'Review Platform / Online Community',
  'Fintech / Payments',
  'Cloud / Infrastructure',
  'Consulting / Vendor',
  'Other',
]

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11, delayChildren: 0.25 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

const ACCENT = '#e53935'

const selectStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.12)',
  color: 'rgba(255,255,255,0.85)',
}

const selectStyleEmpty = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.12)',
  color: 'rgba(255,255,255,0.3)',
}

export default function GameIntroScreen() {
  const { selectedGame, navigate } = useSession()
  const playTap = useSound('tap.mp3', { volume: 0.3 })
  const content = CONTENT[selectedGame]
  const [role, setRole] = useState('')
  const [industry, setIndustry] = useState('')

  if (!content) return null

  function handleBegin() {
    playTap()
    navigate('question', { gameRole: role || null, gameIndustry: industry || null })
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
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-black/20 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

      {/* Scan line */}
      <div className="scan-line" />

      {/* Layout */}
      <div className="absolute inset-0 flex flex-col px-12 py-10 lg:px-20 lg:py-12">

        {/* Eyebrow */}
        <motion.div
          className="flex items-center gap-3 mb-auto"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          <div className="h-px w-8" style={{ background: ACCENT }} />
          <span className="text-xs font-black uppercase tracking-[0.25em]" style={{ color: ACCENT }}>
            {content.eyebrow}
          </span>
        </motion.div>

        {/* Two-column body */}
        <div className="flex-1 flex items-center gap-12 xl:gap-20 min-h-0 py-6">

          {/* ── Left: cinematic text ── */}
          <motion.div
            className="flex-1 flex flex-col justify-center min-w-0"
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
                <ul className="flex flex-col gap-2.5">
                  {content.body.map((item, i) => (
                    <motion.li
                      key={i}
                      variants={fadeUp}
                      className="flex items-center gap-3 text-white/70 font-medium"
                      style={{ fontSize: 'clamp(0.85rem, 1.5vw, 1.05rem)' }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: ACCENT }} />
                      {item}
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
            <motion.div variants={fadeUp} className="flex items-start gap-3 mt-1">
              <span
                className="text-[10px] font-black uppercase tracking-[0.2em] shrink-0 mt-1"
                style={{ color: ACCENT }}
              >
                Question:
              </span>
              <p className="font-black text-white leading-snug"
                style={{ fontSize: 'clamp(0.95rem, 1.8vw, 1.3rem)' }}>
                {content.question}
              </p>
            </motion.div>
          </motion.div>

          {/* ── Right: form card ── */}
          <motion.div
            className="w-80 xl:w-96 shrink-0 rounded-2xl flex flex-col gap-5 p-7"
            style={{
              background: 'rgba(10,14,26,0.72)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              boxShadow: '0 8px 48px rgba(0,0,0,0.5)',
            }}
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Card header */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] mb-1" style={{ color: ACCENT }}>
                Before you begin
              </p>
              <p className="text-white/40 text-xs leading-snug">
                Help us personalise the industry insights. Both fields are optional.
              </p>
            </div>

            {/* Divider */}
            <div className="h-px w-full" style={{ background: 'rgba(255,255,255,0.06)' }} />

            {/* Role */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-[0.18em] text-white/50">
                Your Role in the Ecosystem
              </label>
              <div className="relative">
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none appearance-none cursor-pointer transition-colors"
                  style={role ? selectStyle : selectStyleEmpty}
                >
                  <option value="" style={{ background: '#0a0e1a', color: 'rgba(255,255,255,0.4)' }}>
                    Select your role
                  </option>
                  {ROLES.map(r => (
                    <option key={r} value={r} style={{ background: '#0a0e1a', color: 'white' }}>{r}</option>
                  ))}
                </select>
                <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  fill="none" viewBox="0 0 24 24" stroke="rgba(229,57,53,0.5)" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Industry */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-[0.18em] text-white/50">
                Your Industry
              </label>
              <div className="relative">
                <select
                  value={industry}
                  onChange={e => setIndustry(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none appearance-none cursor-pointer transition-colors"
                  style={industry ? selectStyle : selectStyleEmpty}
                >
                  <option value="" style={{ background: '#0a0e1a', color: 'rgba(255,255,255,0.4)' }}>
                    Select your industry
                  </option>
                  {INDUSTRIES.map(ind => (
                    <option key={ind} value={ind} style={{ background: '#0a0e1a', color: 'white' }}>{ind}</option>
                  ))}
                </select>
                <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  fill="none" viewBox="0 0 24 24" stroke="rgba(229,57,53,0.5)" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* CTA */}
            <motion.button
              onPointerDown={handleBegin}
              className="w-full flex items-center justify-between px-5 py-4 rounded-xl text-white font-black text-sm uppercase tracking-[0.16em]"
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

            <p className="text-center text-white/20 text-[10px]">
              Tap the button to skip and play immediately
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
