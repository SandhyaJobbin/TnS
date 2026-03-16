import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from '../hooks/useSession'

export default function LostInContextQuestion() {
  const { shuffledQuestions, currentQuestionIndex, answers, submitAnswer, nextQuestion, navigate } = useSession()
  const question = shuffledQuestions[currentQuestionIndex]
  const total = shuffledQuestions.length

  const [phase, setPhase] = useState('question') // 'question' | 'reveal'
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    setPhase('question')
    setSelected(null)
  }, [currentQuestionIndex])

  function handleAnswer(option) {
    if (phase !== 'question') return
    setSelected(option)
    submitAnswer(question.id, option)
    setTimeout(() => setPhase('reveal'), 800)
  }

  function handleNext() {
    nextQuestion()
  }

  if (!question) return null

  const isCorrect = selected === question.correct_human
  const isLastQuestion = currentQuestionIndex >= total - 1

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
        <span className="text-cyan-400 text-sm font-semibold tracking-widest uppercase">
          Lost in Context
        </span>
        <span className="text-white/40 text-sm">
          {currentQuestionIndex + 1} / {total}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full bg-white/10 rounded-full mb-8">
        <div
          className="h-1 bg-cyan-500 rounded-full transition-all duration-500"
          style={{ width: `${((currentQuestionIndex + 1) / total) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        {phase === 'question' && (
          <motion.div
            key="question"
            className="flex-1 flex flex-col justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <p className="text-white/40 text-sm mb-3">What does this term mean?</p>
            <h2
              className="text-white font-bold mb-10 leading-tight"
              style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}
            >
              "{question.term}"
            </h2>

            <div className="flex flex-col gap-4">
              {question.options.map((option, i) => (
                <motion.button
                  key={option}
                  onPointerDown={() => handleAnswer(option)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className={`w-full text-left rounded-2xl px-8 py-5 text-lg font-medium border-2 transition-all duration-300 ${
                    selected === option
                      ? 'bg-cyan-600 border-cyan-400 text-white'
                      : selected
                      ? 'bg-white/3 border-white/5 text-white/30'
                      : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-cyan-500/50 active:bg-cyan-600/20'
                  }`}
                  whileTap={!selected ? { scale: 0.98 } : {}}
                >
                  <span className="text-white/40 mr-4 text-sm">{String.fromCharCode(65 + i)}</span>
                  {option}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {phase === 'reveal' && (
          <motion.div
            key="reveal"
            className="flex-1 flex flex-col justify-center gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* User result */}
            <div className={`rounded-2xl px-6 py-5 border-2 ${
              isCorrect
                ? 'bg-green-900/30 border-green-500/40'
                : 'bg-red-900/30 border-red-500/40'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{isCorrect ? '✓' : '✗'}</span>
                <span className={`font-semibold text-sm ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                  {isCorrect ? 'You got it right!' : 'Not quite'}
                </span>
              </div>
              <p className="text-white/50 text-xs mb-1">You answered:</p>
              <p className="text-white font-medium">{selected}</p>
            </div>

            {/* Correct meaning */}
            <div className="rounded-2xl px-6 py-5 bg-white/5 border-2 border-white/10">
              <p className="text-white/50 text-xs mb-1 uppercase tracking-widest">Actual meaning</p>
              <p className="text-white font-semibold text-lg">"{question.term}" = {question.correct_human}</p>
            </div>

            {/* AI interpretation */}
            <div className="rounded-2xl px-6 py-5 bg-red-900/20 border-2 border-red-500/20">
              <p className="text-red-400 text-xs mb-1 uppercase tracking-widest">AI interpreted it as:</p>
              <p className="text-white/70 font-medium">"{question.ai_interpretation}"</p>
              {question.ai_was_wrong && (
                <p className="text-red-400 text-xs mt-2 font-medium">⚠ AI got this wrong — this is why context matters</p>
              )}
            </div>

            <motion.button
              onPointerDown={handleNext}
              className="w-full py-5 rounded-2xl bg-gradient-to-r from-accent-600 to-accent-800 text-white font-bold text-xl shadow-lg active:opacity-90 mt-2"
              whileTap={{ scale: 0.98 }}
            >
              {isLastQuestion ? 'See Your Score' : 'Next Term'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
