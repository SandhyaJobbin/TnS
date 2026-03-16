import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from '../hooks/useSession'
import { usePollAggregation } from '../hooks/usePollAggregation'
import PollChart from '../components/PollChart'

export default function PollResultScreen() {
  const { shuffledQuestions, currentQuestionIndex, answers, nextQuestion } = useSession()
  const question = shuffledQuestions[currentQuestionIndex]
  const userAnswer = answers[question?.id]
  const [showInsight, setShowInsight] = useState(false)

  const percentages = usePollAggregation(question?.id)
  const isLastQuestion = currentQuestionIndex >= shuffledQuestions.length - 1

  if (!question) return null

  return (
    <motion.div
      className="relative w-full h-full flex flex-col bg-[#080820] px-8 py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-primary-400 text-sm font-semibold tracking-widest uppercase">
          {question.dimension}
        </span>
        <span className="text-white/40 text-sm">
          Question {currentQuestionIndex + 1} / {shuffledQuestions.length}
        </span>
      </div>

      {/* Title */}
      <h2
        className="text-white font-bold mb-2"
        style={{ fontSize: 'clamp(1.1rem, 2vw, 1.6rem)' }}
      >
        What leaders here predicted
      </h2>
      <p className="text-white/40 text-sm mb-6">{question.scenario}</p>

      {/* Your answer badge */}
      {userAnswer && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-white/50 text-sm">Your answer:</span>
          <span className="bg-primary-600/30 text-primary-300 text-sm font-medium px-3 py-1 rounded-full border border-primary-500/30">
            {userAnswer}
          </span>
          {userAnswer === question.industry_lean && (
            <span className="bg-green-600/20 text-green-400 text-xs font-medium px-2 py-1 rounded-full border border-green-500/20">
              ✓ Aligned with industry
            </span>
          )}
        </div>
      )}

      {/* Chart */}
      <div className="flex-1 min-h-0 flex flex-col">
        {Object.keys(percentages).length > 0 ? (
          <PollChart data={percentages} userAnswer={userAnswer} />
        ) : (
          <div className="flex items-center justify-center flex-1 text-white/30">
            Loading poll data...
          </div>
        )}
      </div>

      {/* Insight */}
      <div className="mt-4">
        <button
          onPointerDown={() => setShowInsight(v => !v)}
          className="text-primary-400 text-sm underline underline-offset-2 mb-2"
        >
          {showInsight ? 'Hide' : 'See why'} →
        </button>

        <AnimatePresence>
          {showInsight && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white/5 rounded-2xl px-5 py-4 text-white/70 text-sm leading-relaxed border border-white/10 mb-4"
            >
              {question.insight}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Next button */}
      <motion.button
        onPointerDown={nextQuestion}
        className="w-full py-5 rounded-2xl bg-primary-600 text-white font-bold text-xl shadow-lg shadow-primary-900/40 active:bg-primary-700"
        whileTap={{ scale: 0.98 }}
      >
        {isLastQuestion ? 'See Your Results' : 'Next Question'}
      </motion.button>
    </motion.div>
  )
}
