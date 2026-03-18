import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from '../hooks/useSession'
import { incrementPollAggregate } from '../hooks/useIndexedDB'
import { useSound } from '../hooks/useSound'

// Detect if all options are "numeric-ish" (short: ≤12 chars) → 4-column row layout
// Otherwise use 2×2 grid for text options
function isNumericOptions(options) {
  return options.every(o => o.length <= 12)
}

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

  async function handleSelect(option) {
    if (locked) return
    playTap()
    setSelected(option)
    setLocked(true)

    await incrementPollAggregate(question.id, option)
    submitAnswer(question.id, option)

    setTimeout(() => {
      navigate('pollResult')
    }, 500)
  }

  if (!question) return null

  const progress = ((currentQuestionIndex + 1) / total) * 100
  const numeric = isNumericOptions(question.options)
  const gridClass = numeric
    ? 'grid grid-cols-2 tablet:grid-cols-4 gap-3 md:gap-5'
    : 'grid grid-cols-2 gap-3 md:gap-5'

  return (
    <motion.div
      className="relative w-full h-full flex flex-col overflow-hidden"
      style={{ background: '#0a0e1a' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35 }}
    >
      {/* Background glow orbs */}
      <div className="absolute inset-0 pointer-events-none -z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full opacity-5" style={{ background: '#e53935', filter: 'blur(120px)' }} />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full opacity-5" style={{ background: '#1565c0', filter: 'blur(100px)' }} />
      </div>

      {/* ── Header ── */}
      <header
        className="relative z-10 flex items-center justify-between px-4 sm:px-6 md:px-10 py-4 md:py-6 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(10,14,26,0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
      >
        <div>
          <h2 className="text-white font-black text-xl md:text-3xl tracking-tight leading-none">
            Scenario: {question.dimension}
          </h2>
        </div>
        <div className="text-right">
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Mission Progress</p>
          <p className="text-white font-black text-lg md:text-2xl leading-none">
            {String(currentQuestionIndex + 1).padStart(2, '0')}
            <span style={{ color: '#e53935' }}>/</span>
            {String(total).padStart(2, '0')}
          </p>
        </div>
      </header>

      {/* Progress bar */}
      <div className="relative z-10 h-1.5 w-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <motion.div
          className="h-full"
          style={{ background: '#e53935', boxShadow: '0 0 14px rgba(229,57,53,0.8)' }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center px-4 sm:px-6 md:px-10 py-4 md:py-5 gap-4 md:gap-5 min-h-0 overflow-hidden">

        {/* Question section */}
        <div className="flex flex-col items-center text-center w-full max-w-4xl mx-auto shrink-0">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="px-5 py-1.5 rounded-full mb-4 text-[10px] font-black uppercase tracking-[0.35em]"
            style={{ color: '#e53935', background: 'rgba(229,57,53,0.08)', border: '1px solid rgba(229,57,53,0.25)' }}
          >
            Trust &amp; Safety 2030: Predict the Future
          </motion.div>

          {/* Question text */}
          <motion.h3
            key={question.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="text-white font-black leading-tight"
            style={{ fontSize: 'clamp(1.4rem, 3vw, 2.4rem)' }}
          >
            {question.scenario}
          </motion.h3>
        </div>

        {/* ── Options grid ── */}
        <motion.div
          key={`grid-${question.id}`}
          className={`flex-1 min-h-0 w-full max-w-5xl mx-auto ${gridClass}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          {question.options.map((option, i) => {
            const isSelected = selected === option
            const isDimmed = selected && !isSelected

            return (
              <motion.button
                key={option}
                onPointerDown={() => handleSelect(option)}
                disabled={locked}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                whileTap={!locked ? { scale: 0.97 } : {}}
                className="relative group flex flex-col items-center justify-center rounded-2xl transition-all duration-300 overflow-hidden min-h-[100px] max-h-[280px] p-4 md:p-6"
                style={{
                  background: isSelected
                    ? 'rgba(10,14,26,0.95)'
                    : isDimmed
                    ? 'rgba(255,255,255,0.02)'
                    : 'rgba(255,255,255,0.025)',
                  border: isSelected
                    ? '2px solid #e53935'
                    : isDimmed
                    ? '1px solid rgba(255,255,255,0.06)'
                    : '1px solid rgba(255,255,255,0.08)',
                  boxShadow: isSelected ? '0 0 40px rgba(229,57,53,0.25), inset 0 0 60px rgba(229,57,53,0.04)' : 'none',
                  opacity: isDimmed ? 0.35 : 1,
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                }}
              >
                {/* Letter badge — top left */}
                <div
                  className="absolute top-5 left-5 w-8 h-8 rounded flex items-center justify-center text-xs font-black transition-all duration-300"
                  style={{
                    background: isSelected ? '#e53935' : 'transparent',
                    border: isSelected ? 'none' : '1px solid rgba(255,255,255,0.12)',
                    color: isSelected ? 'white' : 'rgba(255,255,255,0.25)',
                  }}
                >
                  {String.fromCharCode(65 + i)}
                </div>

                {/* Option value */}
                <span
                  className="font-black transition-colors duration-200 leading-tight text-center px-2"
                  style={{
                    fontSize: numeric
                      ? 'clamp(1.8rem, 4vw, 3rem)'
                      : 'clamp(0.95rem, 1.6vw, 1.35rem)',
                    color: isSelected ? 'white' : 'rgba(255,255,255,0.75)',
                  }}
                >
                  {option}
                </span>

                {/* Bottom bar */}
                <div
                  className="mt-4 h-1 rounded-full transition-all duration-500"
                  style={{
                    width: isSelected ? '3.5rem' : '1.5rem',
                    background: isSelected ? '#e53935' : 'rgba(255,255,255,0.08)',
                  }}
                />

                {/* Checkmark — bottom right */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.4 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.4 }}
                      className="absolute bottom-5 right-5"
                    >
                      <svg className="w-7 h-7" fill="#e53935" viewBox="0 0 24 24">
                        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 14.414l-4.207-4.207 1.414-1.414L11 13.586l5.793-5.793 1.414 1.414L11 16.414z"/>
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            )
          })}
        </motion.div>
      </div>
    </motion.div>
  )
}
