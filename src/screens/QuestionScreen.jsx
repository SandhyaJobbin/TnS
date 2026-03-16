import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSession } from '../hooks/useSession'
import { incrementPollAggregate } from '../hooks/useIndexedDB'
import { useSound } from '../hooks/useSound'

export default function QuestionScreen() {
  const { shuffledQuestions, currentQuestionIndex, submitAnswer, navigate } = useSession()
  const question = shuffledQuestions[currentQuestionIndex]
  const total = shuffledQuestions.length

  const [selected, setSelected] = useState(null)
  const [locked, setLocked] = useState(false)

  const playTap = useSound('tap.mp3', { volume: 0.3 })

  useEffect(() => {
    setSelected(null)
    setLocked(false)
  }, [currentQuestionIndex])

  async function handleAnswer(option) {
    if (locked) return
    playTap()
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
      className="relative w-full h-full flex flex-col bg-trust2030 px-8 py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-primary-400 text-sm font-semibold tracking-widest uppercase">
          {question.dimension}
        </span>
        <span className="text-white/40 text-sm">
          Question {currentQuestionIndex + 1} / {total}
        </span>
      </div>

      {/* Progress bar — h-2 for visibility */}
      <div className="h-2 w-full bg-white/10 rounded-full mb-8">
        <div
          className="h-2 bg-primary-400 rounded-full transition-all duration-500"
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

        <div className="grid grid-cols-1 gap-3">
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
                className={`w-full text-left px-8 py-5 text-lg font-medium border-l-4 rounded-r-xl transition-all duration-200 ${
                  isSelected
                    ? 'border-l-primary-400 bg-primary-900/60 text-white'
                    : isOther
                    ? 'border-l-white/5 bg-white/2 text-white/25'
                    : 'border-l-white/10 bg-white/3 text-white/70 hover:border-l-primary-400 hover:bg-white/8 hover:text-white'
                }`}
                whileTap={!locked ? { scale: 0.99 } : {}}
              >
                <span className="text-white/40 mr-4 text-sm font-display">
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
