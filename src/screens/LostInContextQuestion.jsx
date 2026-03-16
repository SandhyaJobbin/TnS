import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useSession } from '../hooks/useSession'
import { useSound } from '../hooks/useSound'
import AnswerFlash from '../components/AnswerFlash'

export default function LostInContextQuestion() {
  const { shuffledQuestions, currentQuestionIndex, submitAnswer, nextQuestion } = useSession()
  const question = shuffledQuestions[currentQuestionIndex]
  const total = shuffledQuestions.length

  const [phase, setPhase] = useState('question') // 'question' | 'reveal'
  const [selected, setSelected] = useState(null)
  const [showFlash, setShowFlash] = useState(false)

  const playTap     = useSound('tap.mp3', { volume: 0.3 })
  const playCorrect = useSound('correct.mp3')
  const playWrong   = useSound('wrong.mp3')
  const playTerm    = useSound('term-reveal.mp3', { volume: 0.5 })

  // Play term-reveal sound whenever a new term appears
  useEffect(() => {
    setPhase('question')
    setSelected(null)
    setShowFlash(false)
    playTerm()
  }, [currentQuestionIndex])

  function handleAnswer(option) {
    if (phase !== 'question') return
    playTap()
    setSelected(option)
    submitAnswer(question.id, option)

    setTimeout(() => {
      const correct = option === question.correct_human
      correct ? playCorrect() : playWrong()
      setShowFlash(true)
      setTimeout(() => setShowFlash(false), 600)
      setPhase('reveal')
    }, 800)
  }

  function handleNext() {
    playTap()
    nextQuestion()
  }

  if (!question) return null

  const isCorrect = selected === question.correct_human
  const isLastQuestion = currentQuestionIndex >= total - 1

  // Confetti on correct reveal
  useEffect(() => {
    if (phase === 'reveal' && isCorrect) {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.5 },
        colors: ['#6470d8', '#8b92e8', '#ffffff', '#4ade80'],
        disableForReducedMotion: true,
      })
    }
  }, [phase, isCorrect])

  return (
    <motion.div
      className="relative w-full h-full flex flex-col bg-lost-in-context px-8 py-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35 }}
    >
      <AnswerFlash show={showFlash} correct={isCorrect} />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-cyan-400 text-sm font-semibold tracking-widest uppercase">
          Lost in Context
        </span>
        <span className="text-white/40 text-sm">
          {currentQuestionIndex + 1} / {total}
        </span>
      </div>

      {/* Progress bar — h-2 */}
      <div className="h-2 w-full bg-white/10 rounded-full mb-8">
        <div
          className="h-2 bg-cyan-500 rounded-full transition-all duration-500"
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
              className="font-display text-white font-bold mb-10 leading-tight"
              style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', fontFamily: "'Orbitron', monospace" }}
            >
              "{question.term}"
            </h2>

            <div className="flex flex-col gap-3">
              {question.options.map((option, i) => (
                <motion.button
                  key={option}
                  onPointerDown={() => handleAnswer(option)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className={`w-full text-left px-8 py-5 text-lg font-mono border rounded-lg transition-all duration-200 ${
                    selected === option
                      ? 'border-cyan-400 bg-cyan-900/40 text-white'
                      : selected
                      ? 'border-cyan-900/10 bg-cyan-950/10 text-white/25'
                      : 'border-cyan-900/30 bg-cyan-950/20 text-white/80 hover:border-cyan-500/50 hover:bg-cyan-950/40'
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
            className="flex-1 flex flex-col justify-center gap-5"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
          >
            {/* User result */}
            <div className={`rounded-2xl px-6 py-5 border-2 ${
              isCorrect
                ? 'bg-green-900/30 border-green-500/40'
                : 'bg-red-900/30 border-red-500/40'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-2xl font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                  {isCorrect ? '✓' : '✗'}
                </span>
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
                <p className="text-red-400 text-xs mt-2 font-medium">AI got this wrong — context matters</p>
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
