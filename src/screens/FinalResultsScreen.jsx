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

export default function FinalResultsScreen() {
  const { answers, shuffledQuestions, selectedGame, navigate, leadCaptureEnabled } = useSession()

  if (selectedGame === 'lostInContext') {
    return <LostInContextResults answers={answers} questions={shuffledQuestions} navigate={navigate} leadCaptureEnabled={leadCaptureEnabled} />
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
        colors: ['#6470d8', '#8b92e8', '#f8fafc'],
        disableForReducedMotion: true,
      })
    }
  }, [])

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

  const alignLabel =
    alignmentScore >= 80 ? 'Forward-thinking leader' :
    alignmentScore >= 60 ? 'Industry-aligned thinker' :
    alignmentScore >= 40 ? 'Emerging perspective' :
    'Independent thinker'

  return (
    <motion.div
      className="relative w-full h-full flex flex-col bg-[#080820] px-8 py-8 overflow-y-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-primary-900/20 blur-3xl rounded-full" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Score */}
        <motion.div
          className="text-center mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <p className="text-white/50 text-sm tracking-widest uppercase mb-2">Your Trust &amp; Safety Outlook</p>
          <div
            className="font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-primary-500"
            style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', fontFamily: "'Orbitron', sans-serif" }}
          >
            {displayScore}%
          </div>
          <p className="text-white font-semibold text-xl mt-1">
            aligned with industry leaders
          </p>
          <p className="text-primary-300 text-sm mt-2 font-medium">{alignLabel}</p>
        </motion.div>

        {/* Chart */}
        <motion.div
          className="w-full max-w-sm mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {useRadar ? (
            <RadarChart dimensionScores={dimensionScores} />
          ) : (
            <div className="space-y-3">
              {Object.entries(dimensionScores).map(([dim, score]) => (
                <div key={dim}>
                  <div className="flex justify-between text-sm text-white/60 mb-1">
                    <span>{dim}</span>
                    <span>{score}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full">
                    <motion.div
                      className="h-2 bg-gradient-to-r from-primary-400 to-primary-700 rounded-full"
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

        {/* Dimension breakdown */}
        <motion.div
          className="w-full max-w-lg bg-white/5 rounded-2xl p-6 mb-8 border border-white/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-white/50 text-xs tracking-widest uppercase mb-4">Dimension Breakdown</p>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(dimensionScores).map(([dim, score]) => (
              <div key={dim} className="text-center p-3 bg-white/5 rounded-xl">
                <div
                  className="font-bold text-primary-300"
                  style={{ fontSize: 'clamp(1.2rem, 2vw, 1.6rem)', fontFamily: "'Orbitron', sans-serif" }}
                >
                  {score}%
                </div>
                <div className="text-white/50 text-xs mt-1">{dim}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.button
          onPointerDown={() => navigate(leadCaptureEnabled ? 'emailCapture' : 'thankYou')}
          className="w-full max-w-lg py-5 rounded-2xl bg-primary-600 text-white font-bold text-xl shadow-lg shadow-primary-900/40 active:bg-primary-700 mb-3"
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Get your full report
        </motion.button>
      </div>
    </motion.div>
  )
}

function LostInContextResults({ answers, questions, navigate, leadCaptureEnabled }) {
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
        colors: ['#6470d8', '#8b92e8', '#f8fafc'],
        disableForReducedMotion: true,
      })
    }
  }, [])

  return (
    <motion.div
      className="relative w-full h-full flex flex-col bg-[#080820] px-8 py-8 overflow-y-auto items-center justify-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-cyan-900/20 blur-3xl rounded-full" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-lg w-full">
        <p className="text-white/50 text-sm tracking-widest uppercase mb-2">Lost in Context — Results</p>

        <motion.div
          className="text-center mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div
            className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-400 to-accent-600"
            style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', fontFamily: "'Orbitron', sans-serif" }}
          >
            {displayScore}/{questions.length}
          </div>
          <p className="text-white font-semibold text-xl mt-1">correct answers</p>
        </motion.div>

        <motion.div
          className="w-full bg-white/5 rounded-2xl p-6 mb-4 border border-white/10 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <p
            className="text-cyan-400 font-bold mb-1"
            style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontFamily: "'Orbitron', sans-serif" }}
          >
            {userBeatAI} / {aiErrors}
          </p>
          <p className="text-white/60 text-sm">
            You outperformed AI on <strong className="text-white">{userBeatAI}</strong> out of <strong className="text-white">{aiErrors}</strong> tricky terms
          </p>
          {userBeatAIPercent >= 70 && (
            <p className="text-green-400 text-sm mt-3 font-medium">
              You beat the AI — context is your superpower!
            </p>
          )}
        </motion.div>

        <motion.div
          className="w-full bg-red-900/20 rounded-2xl p-5 mb-8 border border-red-500/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-red-400 text-xs uppercase tracking-widest mb-2">Why this matters</p>
          <p className="text-white/60 text-sm leading-relaxed">
            AI moderation struggles with evolving slang and cultural context. Human moderators provide the nuance that algorithms miss — which is why human oversight remains essential in 2030.
          </p>
        </motion.div>

        <motion.button
          onPointerDown={() => navigate(leadCaptureEnabled ? 'emailCapture' : 'thankYou')}
          className="w-full py-5 rounded-2xl bg-gradient-to-r from-accent-600 to-accent-800 text-white font-bold text-xl shadow-lg active:opacity-90"
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Get your full report
        </motion.button>
      </div>
    </motion.div>
  )
}
