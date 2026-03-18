import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useSession } from '../hooks/useSession'
import { useSound } from '../hooks/useSound'
import { computeTrust2030Score, computeLostInContextScore } from '../utils/scoring'
import ScreenHeader from '../components/ScreenHeader'
import { MONO, RED, BORDER_RED, GLASS_BG, GLOW_RED_LG } from '../theme'

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
    <>
      {/* Red data grid */}
      <div className="absolute inset-0 data-grid opacity-30 pointer-events-none" />
      {/* Glow blobs */}
      <div className="absolute -top-[15%] -left-[10%] w-1/2 h-1/2 rounded-full pointer-events-none"
        style={{ background: 'rgba(255,0,60,0.10)', filter: 'blur(140px)' }} />
      <div className="absolute -bottom-[10%] -right-[5%] w-[45%] h-[45%] rounded-full pointer-events-none"
        style={{ background: 'rgba(255,0,60,0.06)', filter: 'blur(120px)' }} />
      {/* Scan line */}
      <div className="scan-line" />
    </>
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
    if (alignmentScore >= 50) {
      confetti({
        particleCount: 100,
        spread: 120,
        origin: { y: 0.6 },
        colors: [RED, '#ff8099', '#ff4d6b', '#ffffff'],
        disableForReducedMotion: true,
      })
    }
  }, [])

  // Sort dimensions best → weakest so strengths appear first
  const sortedDimensions = Object.entries(dimensionScores).sort(([, a], [, b]) => b - a)
  const topDim = sortedDimensions[0]?.[0]
  const topScore = sortedDimensions[0]?.[1] ?? 0

  // Insight from the TOP dimension — celebrate what they nailed
  const insightQuestion = shuffledQuestions.find(q => q.dimension === topDim) || shuffledQuestions[0]
  const expertInsight = insightQuestion?.insight || ''
  const expertDimLabel = insightQuestion?.dimension || 'Industry'

  // Personalized hero headline
  const heroHeadline =
    topScore >= 70 ? `You're leading on ${topDim}` :
    topScore >= 40 ? `You're on track with ${topDim}` :
    'You bring a unique perspective'

  // Trend label based on score bracket
  const alignTrend =
    alignmentScore >= 80 ? 'Forward-thinking leader' :
    alignmentScore >= 60 ? 'Industry-aligned thinker' :
    alignmentScore >= 40 ? 'Strategic contrarian' :
    'Bold independent voice'

  const hasDimensions = sortedDimensions.length > 0

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

      <ScreenHeader
        title="Trust &amp; Safety Summit"
        subtitle="Intelligence Report"
        right={
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: MONO }}>Session ID</p>
              <p className="text-xs" style={{ color: RED, fontFamily: MONO }}>TS-{sessionId ? sessionId.slice(-6).toUpperCase() : '------'}</p>
            </div>
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,0,60,0.08)', border: `1px solid ${BORDER_RED}` }}>
              <svg className="w-4 h-4" style={{ color: RED }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        }
      />

      <div className="relative z-10 flex flex-col items-center px-4 md:px-8 py-4 md:py-6 flex-1 overflow-y-auto">

        {/* Title */}
        <motion.div
          className="text-center mb-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <span
            className="inline-block px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3"
            style={{ background: 'rgba(255,0,60,0.08)', border: '1px solid rgba(255,0,60,0.2)', color: RED, fontFamily: MONO }}
          >
            ★ Your Strengths Identified
          </span>
          <h1 className="text-white font-black leading-tight mb-1" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.75rem)' }}>
            {heroHeadline}
          </h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: MONO }}>
            Here's how your outlook compares to industry leaders
          </p>
        </motion.div>

        {/* Dimension scorecard tiles — sorted best first */}
        {hasDimensions && (
          <div className="w-full max-w-2xl grid grid-cols-2 gap-3 mb-4">
            {sortedDimensions.map(([dim, score], i) => {
              const isTop = i === 0
              const tierLabel = score >= 70 ? 'Leading' : score >= 40 ? 'On Track' : 'Independent Take'
              return (
                <motion.div
                  key={dim}
                  className="rounded-2xl p-5 relative overflow-hidden"
                  style={{
                    background: isTop ? 'rgba(255,0,60,0.05)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isTop ? 'rgba(255,0,60,0.3)' : 'rgba(255,255,255,0.07)'}`,
                  }}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.08 }}
                >
                  {isTop && (
                    <div
                      className="absolute top-3 right-3 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1"
                      style={{ background: 'rgba(255,0,60,0.12)', color: RED, fontFamily: MONO }}
                    >
                      ★ Top Strength
                    </div>
                  )}
                  <p className="text-[10px] font-black uppercase tracking-widest mb-3 pr-20" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: MONO }}>{dim}</p>
                  <div className="flex items-end justify-between mb-3">
                    <span className="font-black leading-none" style={{ fontSize: 'clamp(2rem, 4vw, 2.75rem)', color: RED }}>
                      {score}%
                    </span>
                    <span
                      className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full mb-1"
                      style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)', fontFamily: MONO }}
                    >
                      {tierLabel}
                    </span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: RED }}
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.4 + i * 0.08 }}
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Where You Excelled — full width */}
        <motion.div
          className="w-full max-w-2xl mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div
            className="rounded-2xl p-6"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,0,60,0.15)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: RED, fontFamily: MONO }}>
                  Where You Excelled
                </p>
                <p className="text-[10px] uppercase tracking-wider mb-3" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: MONO }}>
                  {expertDimLabel}
                </p>
                <p className="text-white/75 text-sm leading-relaxed">
                  {expertInsight}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: MONO }}>{alignTrend}</p>
                <div
                  className="font-black leading-none"
                  style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: RED, textShadow: '0 0 20px rgba(255,0,60,0.35)' }}
                >
                  {displayScore}%
                </div>
                <p className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: MONO }}>industry aligned</p>
              </div>
            </div>
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
              background: RED,
              boxShadow: GLOW_RED_LG,
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
        style={{ borderColor: 'rgba(255,0,60,0.1)', opacity: 0.5 }}
      >
        <div className="flex gap-6">
          <button className="text-[10px] font-bold uppercase tracking-widest text-white/50" style={{ fontFamily: MONO }}>Privacy Policy</button>
          <button className="text-[10px] font-bold uppercase tracking-widest text-white/50" style={{ fontFamily: MONO }}>Methodology</button>
        </div>
        <p className="text-[10px] font-medium uppercase tracking-widest text-white/40" style={{ fontFamily: MONO }}>© 2025 Trust &amp; Safety Summit | {import.meta.env.VITE_STATION_ID || 'booth-07'}</p>
      </footer>
    </motion.div>
  )
}

function LostInContextResults({ answers, questions, navigate, leadCaptureEnabled, sessionId }) {
  const { userScore, aiErrors, userBeatAI, userBeatAIPercent } = computeLostInContextScore(answers, questions)
  const displayScore = useCountUp(userScore, 800)
  const accuracyPct = questions.length > 0 ? Math.round((userScore / questions.length) * 100) : 0

  // Personalized edge label
  const edgeLabel =
    accuracyPct >= 80 ? 'Context Expert' :
    accuracyPct >= 60 ? 'Sharp Interpreter' :
    accuracyPct >= 40 ? 'Contextual Thinker' :
    'Human in the Loop'

  const playScore = useSound('score-reveal.mp3')
  useEffect(() => { playScore() }, [])

  useEffect(() => {
    if (accuracyPct >= 40) {
      confetti({
        particleCount: 100,
        spread: 120,
        origin: { y: 0.6 },
        colors: [RED, '#ff8099', '#ff4d6b', '#ffffff'],
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

      <ScreenHeader
        title="Decode GenZ Lingos"
        subtitle="Results"
        right={
          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.3)', fontFamily: MONO }}>
            Session Complete
          </p>
        }
      />

      <div className="relative z-10 flex flex-col items-center px-4 md:px-8 py-4 md:py-6 flex-1 overflow-y-auto">

        {/* Title + Score */}
        <motion.div
          className="text-center mb-5"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <span
            className="inline-block px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3"
            style={{ background: 'rgba(255,0,60,0.08)', border: '1px solid rgba(255,0,60,0.2)', color: RED, fontFamily: MONO }}
          >
            ★ Your Human Edge
          </span>
          <h1 className="text-white font-black leading-tight mb-1" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.75rem)' }}>
            {edgeLabel}
          </h1>
          <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: MONO }}>
            You picked up nuance that AI missed
          </p>
          <div
            className="font-black leading-none"
            style={{
              fontSize: 'clamp(3rem, 8vw, 5rem)',
              color: RED,
              textShadow: '0 0 32px rgba(255,0,60,0.5)',
            }}
          >
            {displayScore}<span className="text-white/30" style={{ fontSize: '0.45em' }}>/{questions.length}</span>
          </div>
          <p className="text-white/40 text-sm mt-1">correct · {accuracyPct}% accuracy</p>
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
            <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: MONO }}>You beat AI on</p>
            <div className="font-black leading-none mb-1" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: RED, textShadow: '0 0 20px rgba(255,0,60,0.4)' }}>
              {userBeatAI}<span className="text-white/30 text-2xl">/{aiErrors}</span>
            </div>
            <p className="text-xs text-white/40 mb-2">tricky terms</p>
            <p className="text-xs font-black" style={{ color: userBeatAIPercent >= 50 ? RED : 'rgba(255,255,255,0.3)' }}>
              {userBeatAIPercent >= 70 ? 'Context is your superpower!' :
               userBeatAIPercent >= 50 ? 'Stronger than the algorithm' :
               'Keep questioning the machine'}
            </p>
          </div>

          {/* Hero term card — proof of human advantage */}
          {heroTerm ? (
            <div
              className="rounded-2xl p-6 flex flex-col justify-center"
              style={{ background: 'rgba(255,0,60,0.04)', border: '1px solid rgba(255,0,60,0.18)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
            >
              <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: RED, fontFamily: MONO }}>
                You Caught What AI Missed
              </p>
              <p className="text-white font-black text-sm mb-1 mt-1">
                &ldquo;{heroTerm.term}&rdquo;
              </p>
              <p className="text-white/50 text-xs leading-relaxed">
                AI read it as &ldquo;{heroTerm.ai_interpretation}&rdquo; — your human judgment got it right.
              </p>
            </div>
          ) : (
            <div
              className="rounded-2xl p-6 flex flex-col justify-center"
              style={{ background: 'rgba(255,0,60,0.04)', border: '1px solid rgba(255,0,60,0.18)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
            >
              <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: RED, fontFamily: MONO }}>
                Your Advantage
              </p>
              <p className="text-white/70 text-xs leading-relaxed">
                Human judgment catches evolving slang and cultural nuance that algorithms miss — that's irreplaceable in 2030.
              </p>
            </div>
          )}
        </motion.div>

        {/* Strength takeaway — full width */}
        <motion.div
          className="w-full max-w-2xl rounded-2xl p-5 mb-5"
          style={{ background: 'rgba(255,0,60,0.03)', border: '1px solid rgba(255,0,60,0.12)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          <p className="text-[10px] uppercase tracking-widest mb-2 font-black" style={{ color: 'rgba(255,0,60,0.7)', fontFamily: MONO }}>Why your judgment matters</p>
          <p className="text-white/60 text-sm leading-relaxed">
            Context is the superpower AI is still learning. Your ability to read between the lines — to feel tone, intent, and nuance — is exactly what makes human judgment so valuable in Trust &amp; Safety today.
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
            onPointerDown={() => navigate('surveyPrompt')}
            className="w-full py-4 rounded-2xl text-white font-black text-base flex items-center justify-center gap-3 mb-3 uppercase tracking-wider"
            style={{
              background: RED,
              boxShadow: GLOW_RED_LG,
              border: '1px solid rgba(255,255,255,0.1)',
            }}
            whileTap={{ scale: 0.98 }}
          >
            Continue →
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </motion.button>
          <p className="text-center text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.25)' }}>
            See how your results compare to industry experts.
          </p>
        </motion.div>

      </div>

      {/* Footer */}
      <footer
        className="relative z-10 flex items-center justify-between px-4 md:px-8 py-3 md:py-4 border-t"
        style={{ borderColor: 'rgba(255,0,60,0.1)', opacity: 0.5 }}
      >
        <div className="flex gap-6">
          <button className="text-[10px] font-bold uppercase tracking-widest text-white/50" style={{ fontFamily: MONO }}>Privacy Policy</button>
          <button className="text-[10px] font-bold uppercase tracking-widest text-white/50" style={{ fontFamily: MONO }}>Methodology</button>
        </div>
        <p className="text-[10px] font-medium uppercase tracking-widest text-white/40" style={{ fontFamily: MONO }}>© 2025 Trust &amp; Safety Summit | {import.meta.env.VITE_STATION_ID || 'booth-07'}</p>
      </footer>
    </motion.div>
  )
}
