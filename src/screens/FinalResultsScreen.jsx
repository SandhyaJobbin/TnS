import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useSession } from '../hooks/useSession'
import { useSound } from '../hooks/useSound'
import { computeTrust2030Score, computeLostInContextScore } from '../utils/scoring'
import RadarChart from '../components/RadarChart'

function useCountUp(target, duration = 1400) {
  const [value, setValue] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    const start = performance.now()
    const easeOut = t => 1 - Math.pow(1 - t, 3)

    function tick(now) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      setValue(Math.round(easeOut(progress) * target))
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target, duration])

  return value
}

function Background() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />
      {/* Glow blobs */}
      <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full opacity-10"
        style={{ background: '#e53935', filter: 'blur(120px)' }} />
      <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full opacity-8"
        style={{ background: '#1a0a2e', filter: 'blur(120px)' }} />
    </div>
  )
}

export default function FinalResultsScreen() {
  const { answers, shuffledQuestions, selectedGame, navigate, leadCaptureEnabled, sessionId } = useSession()

  if (selectedGame === 'lostInContext') {
    return <LostInContextResults answers={answers} questions={shuffledQuestions} navigate={navigate} leadCaptureEnabled={leadCaptureEnabled} sessionId={sessionId} />
  }

  const { alignmentScore, dimensionScores } = computeTrust2030Score(answers, shuffledQuestions)
  const displayScore = useCountUp(alignmentScore, 1400)

  const playScore = useSound('score-reveal.mp3')
  useEffect(() => { playScore() }, [])

  useEffect(() => {
    if (alignmentScore >= 70) {
      confetti({
        particleCount: 100,
        spread: 120,
        origin: { y: 0.6 },
        colors: ['#e53935', '#ff8099', '#ff4d6b', '#ffffff'],
        disableForReducedMotion: true,
      })
    }
  }, [])

  // Find the most educational insight: from the dimension where user scored lowest
  const lowestDim = Object.entries(dimensionScores).sort(([, a], [, b]) => a - b)[0]?.[0]
  const insightQuestion = shuffledQuestions.find(q => q.dimension === lowestDim) || shuffledQuestions[0]
  const expertInsight = insightQuestion?.insight || ''
  const expertDimLabel = insightQuestion?.dimension || 'Industry'

  // Trend label based on score bracket
  const alignTrend =
    alignmentScore >= 80 ? 'Forward-thinking leader' :
    alignmentScore >= 60 ? 'Industry-aligned thinker' :
    alignmentScore >= 40 ? 'Emerging perspective' :
    'Independent thinker'

  const hasDimensions = Object.keys(dimensionScores).length > 0
  const minDimensionCount = hasDimensions
    ? Math.min(...Object.values(
        shuffledQuestions.reduce((acc, q) => {
          acc[q.dimension] = (acc[q.dimension] || 0) + 1
          return acc
        }, {})
      ))
    : 0
  const useRadar = hasDimensions && minDimensionCount >= 2

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
          <img src={`${import.meta.env.BASE_URL}sutherland-logo.png`} alt="Sutherland" className="h-8 w-auto object-contain" />
          <div>
            <h2 className="text-white text-sm font-black leading-none uppercase tracking-tight">Trust &amp; Safety Summit</h2>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold mt-0.5" style={{ color: '#e53935' }}>Intelligence Report</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>Session ID</p>
            <p className="text-xs font-mono" style={{ color: '#e53935' }}>TS-{sessionId ? sessionId.slice(-6).toUpperCase() : '------'}</p>
          </div>
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <svg className="w-4 h-4" style={{ color: '#e53935' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
      </header>

      <div className="relative z-10 flex flex-col items-center px-4 md:px-8 py-4 md:py-6 flex-1 overflow-y-auto">

        {/* Title */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <span
            className="inline-block px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3"
            style={{ background: 'rgba(229,57,53,0.1)', border: '1px solid rgba(229,57,53,0.25)', color: '#e53935' }}
          >
            Analysis Complete
          </span>
          <h1 className="text-white font-black leading-none mb-2" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
            Your Strategic Outlook
          </h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Here's how your predictions compare to industry experts
          </p>
        </motion.div>

        {/* Radar chart */}
        <motion.div
          className="w-full max-w-xs md:max-w-sm mb-3 md:mb-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, type: 'spring', damping: 14, stiffness: 100 }}
        >
          {useRadar ? (
            <RadarChart dimensionScores={dimensionScores} />
          ) : (
            <div className="space-y-3">
              {Object.entries(dimensionScores).map(([dim, score]) => (
                <div key={dim}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/50">{dim}</span>
                    <span className="text-white/70 font-semibold">{score}%</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(to right, #ff8099, #e53935)', boxShadow: '0 0 8px rgba(229,57,53,0.4)' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Info cards — 2-col */}
        <motion.div
          className="w-full max-w-2xl grid grid-cols-2 gap-4 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {/* Alignment % */}
          <div
            className="rounded-2xl p-6 flex flex-col items-center justify-center text-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
          >
            <p className="text-xs text-white/40 mb-2">Alignment with industry</p>
            <div
              className="font-black leading-none mb-2"
              style={{
                fontSize: 'clamp(2.5rem, 6vw, 4rem)',
                color: '#e53935',
                textShadow: '0 0 24px rgba(229,57,53,0.4)',
              }}
            >
              {displayScore}%
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: '#4ade80' }}>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              {alignTrend}
            </div>
          </div>

          {/* Expert Insight */}
          <div
            className="rounded-2xl p-6 flex flex-col justify-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
          >
            <p className="text-[10px] font-black uppercase tracking-widest italic mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {expertDimLabel} Insight
            </p>
            <p className="text-white/75 text-xs leading-relaxed line-clamp-5">
              {expertInsight}
            </p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="w-full max-w-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
        >
          <motion.button
            onPointerDown={() => navigate(leadCaptureEnabled ? 'emailCapture' : 'thankYou')}
            className="w-full py-4 rounded-2xl text-white font-black text-base flex items-center justify-center gap-3 mb-3 uppercase tracking-wider"
            style={{
              background: '#e53935',
              boxShadow: '0 4px 32px rgba(229,57,53,0.35)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
            whileTap={{ scale: 0.98 }}
          >
            {leadCaptureEnabled ? 'Receive the Industry Outlook →' : 'See Your Summary →'}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </motion.button>
          <p className="text-center text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Personalized report will be sent to your registered email.
          </p>
        </motion.div>

      </div>

      {/* Footer */}
      <footer
        className="relative z-10 flex items-center justify-between px-4 md:px-8 py-3 md:py-4 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.05)', opacity: 0.4 }}
      >
        <div className="flex gap-6">
          <button className="text-[10px] font-bold uppercase tracking-widest text-white/50">Privacy Policy</button>
          <button className="text-[10px] font-bold uppercase tracking-widest text-white/50">Methodology</button>
        </div>
        <p className="text-[10px] font-medium uppercase tracking-widest text-white/40">© 2025 Trust &amp; Safety Summit | {import.meta.env.VITE_STATION_ID || 'Alpha-01'}</p>
      </footer>
    </motion.div>
  )
}

function LostInContextResults({ answers, questions, navigate, leadCaptureEnabled, sessionId }) {
  const { userScore, aiErrors, userBeatAI, userBeatAIPercent } = computeLostInContextScore(answers, questions)
  const displayScore = useCountUp(userScore, 800)

  const playScore = useSound('score-reveal.mp3')
  useEffect(() => { playScore() }, [])

  useEffect(() => {
    if (userBeatAIPercent >= 60) {
      confetti({
        particleCount: 100,
        spread: 120,
        origin: { y: 0.6 },
        colors: ['#e53935', '#ff8099', '#ff4d6b', '#ffffff'],
        disableForReducedMotion: true,
      })
    }
  }, [])

  // Find the most interesting term the user got right where AI got it wrong
  const heroTerm = questions.find(q => q.ai_was_wrong && answers[q.id] === q.correct_human)
    || questions.find(q => q.ai_was_wrong)

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
          <img src={`${import.meta.env.BASE_URL}sutherland-logo.png`} alt="Sutherland" className="h-8 w-auto object-contain" />
          <div>
            <h2 className="text-white text-sm font-black leading-none uppercase tracking-tight">Lost in Context</h2>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold mt-0.5" style={{ color: '#e53935' }}>Results</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)' }}>Session Complete</p>
        </div>
      </header>

      <div className="relative z-10 flex flex-col items-center px-4 md:px-8 py-4 md:py-6 flex-1 overflow-y-auto">

        {/* Title + Score */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <span
            className="inline-block px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3"
            style={{ background: 'rgba(229,57,53,0.1)', border: '1px solid rgba(229,57,53,0.25)', color: '#e53935' }}
          >
            Analysis Complete
          </span>
          <h1 className="text-white font-black leading-none mb-2" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
            Your Context Score
          </h1>
          <div
            className="font-black leading-none mt-3"
            style={{
              fontSize: 'clamp(3.5rem, 9vw, 6rem)',
              color: '#e53935',
              textShadow: '0 0 32px rgba(229,57,53,0.5)',
            }}
          >
            {displayScore}<span className="text-white/30" style={{ fontSize: '0.45em' }}>/{questions.length}</span>
          </div>
          <p className="text-white/50 text-sm mt-1">correct answers</p>
        </motion.div>

        {/* 2-col cards */}
        <motion.div
          className="w-full max-w-2xl grid grid-cols-2 gap-4 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {/* Beat AI card */}
          <div
            className="rounded-2xl p-6 flex flex-col items-center justify-center text-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
          >
            <p className="text-xs text-white/40 mb-2">You outperformed AI on</p>
            <div className="font-black leading-none mb-1" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#e53935', textShadow: '0 0 20px rgba(229,57,53,0.4)' }}>
              {userBeatAI}<span className="text-white/30 text-2xl">/{aiErrors}</span>
            </div>
            <p className="text-xs text-white/40">tricky terms</p>
            {userBeatAIPercent >= 70 && (
              <p className="text-xs mt-2 font-black" style={{ color: '#4ade80' }}>
                Context is your superpower!
              </p>
            )}
          </div>

          {/* Hero term card */}
          {heroTerm ? (
            <div
              className="rounded-2xl p-6 flex flex-col justify-center"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
            >
              <p className="text-[10px] font-black uppercase tracking-widest italic mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                AI Got This Wrong
              </p>
              <p className="text-white font-black text-sm mb-1">
                &ldquo;{heroTerm.term}&rdquo;
              </p>
              <p className="text-white/50 text-xs leading-relaxed">
                AI interpreted it as &ldquo;{heroTerm.ai_interpretation}&rdquo; — humans understood the context.
              </p>
            </div>
          ) : (
            <div
              className="rounded-2xl p-6 flex flex-col justify-center"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
            >
              <p className="text-[10px] font-black uppercase tracking-widest italic mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Why It Matters
              </p>
              <p className="text-white/60 text-xs leading-relaxed">
                AI moderation struggles with evolving slang and cultural nuance — human oversight remains essential in 2030.
              </p>
            </div>
          )}
        </motion.div>

        {/* Why this matters — full width */}
        <motion.div
          className="w-full max-w-2xl rounded-2xl p-5 mb-5"
          style={{ background: 'rgba(229,57,53,0.05)', border: '1px solid rgba(229,57,53,0.15)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          <p className="text-[10px] uppercase tracking-widest mb-2 font-black" style={{ color: 'rgba(229,57,53,0.7)' }}>Why context is everything</p>
          <p className="text-white/55 text-sm leading-relaxed">
            AI moderation struggles with evolving slang and cultural context. Human moderators provide the nuance that algorithms miss — which is why human oversight remains essential in 2030.
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          className="w-full max-w-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
        >
          <motion.button
            onPointerDown={() => navigate(leadCaptureEnabled ? 'emailCapture' : 'thankYou')}
            className="w-full py-4 rounded-2xl text-white font-black text-base flex items-center justify-center gap-3 mb-3 uppercase tracking-wider"
            style={{
              background: '#e53935',
              boxShadow: '0 4px 32px rgba(229,57,53,0.35)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
            whileTap={{ scale: 0.98 }}
          >
            {leadCaptureEnabled ? 'Receive the Industry Outlook →' : 'See Your Summary →'}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </motion.button>
          <p className="text-center text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Personalized report will be sent to your registered email.
          </p>
        </motion.div>

      </div>

      {/* Footer */}
      <footer
        className="relative z-10 flex items-center justify-between px-4 md:px-8 py-3 md:py-4 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.05)', opacity: 0.4 }}
      >
        <div className="flex gap-6">
          <button className="text-[10px] font-bold uppercase tracking-widest text-white/50">Privacy Policy</button>
          <button className="text-[10px] font-bold uppercase tracking-widest text-white/50">Methodology</button>
        </div>
        <p className="text-[10px] font-medium uppercase tracking-widest text-white/40">© 2025 Trust &amp; Safety Summit | {import.meta.env.VITE_STATION_ID || 'Alpha-01'}</p>
      </footer>
    </motion.div>
  )
}
