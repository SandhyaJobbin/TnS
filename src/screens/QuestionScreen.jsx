import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSession } from '../hooks/useSession'
import { incrementPollAggregate } from '../hooks/useIndexedDB'

export default function QuestionScreen() {
  const { shuffledQuestions, currentQuestionIndex, submitAnswer, navigate } = useSession()
  const question = shuffledQuestions[currentQuestionIndex]
  const total = shuffledQuestions.length

  const [selected, setSelected] = useState(null)
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    setSelected(null)
    setLocked(false)
  }, [currentQuestionIndex])

  async function handleAnswer(option) {
    if (locked) return
    setSelected(option)
    setLocked(true)

    await incrementPollAggregate(question.id, option)
    submitAnswer(question.id, option)

    setTimeout(() => {
      navigate('pollResult')
    }, 1800)
  }

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
          Question {currentQuestionIndex + 1} / {total}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full bg-white/10 rounded-full mb-8">
        <div
          className="h-1 bg-primary-500 rounded-full transition-all duration-500"
          style={{ width: `${((currentQuestionIndex + 1) / total) * 100}%` }}
        />
      </div>

      {/* Scenario */}
      <div className="flex-1 flex flex-col justify-center">
        <h2
          className="text-white font-bold leading-snug mb-10"
          style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2.2rem)' }}
        >
          {question.scenario}
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {question.options.map((option, i) => {
            const isSelected = selected === option
            const isOther = selected && !isSelected

            return (
              <motion.button
                key={option}
                onPointerDown={() => handleAnswer(option)}
                disabled={locked}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className={`w-full text-left rounded-2xl px-8 py-5 text-lg font-medium border-2 transition-all duration-300 ${
                  isSelected
                    ? 'bg-primary-600 border-primary-400 text-white scale-[1.02]'
                    : isOther
                    ? 'bg-white/3 border-white/5 text-white/30'
                    : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-primary-500/50 active:bg-primary-600/20'
                }`}
                whileTap={!locked ? { scale: 0.98 } : {}}
              >
                <span className="text-white/40 mr-4 text-sm">
                  {String.fromCharCode(65 + i)}
                </span>
                {option}
              </motion.button>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
