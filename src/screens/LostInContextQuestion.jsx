import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useSession } from '../hooks/useSession'
import { useSound } from '../hooks/useSound'
import { usePollAggregation } from '../hooks/usePollAggregation'
import AnswerFlash from '../components/AnswerFlash'
import PollChart from '../components/PollChart'

// Numbers (≤12 chars, parseable as float) → 4×1 row; text → 2×2 grid
function isNumericOptions(options) {
  return options.every(o => !isNaN(parseFloat(o.trim())) && isFinite(o.trim()))
}

function Logo() {
  const { navigate } = useSession()
  return (
    <button onPointerDown={() => navigate('gameSelect')} className="opacity-90 active:opacity-60 transition-opacity" aria-label="Home">
      <img src={`${import.meta.env.BASE_URL}sutherland-logo.png`} alt="Sutherland" className="h-8 w-auto object-contain" />
    </button>
  )
}

function LICPollOverlay({ question, percentages, userAnswer, isLastQuestion, alwaysShowPollResults, setAlwaysShowPollResults, onContinue }) {
  const continueRef = useRef(onContinue)
  continueRef.current = onContinue
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (alwaysShowPollResults) return
    const t = setTimeout(() => continueRef.current(), 5000)
    return () => clearTimeout(t)
  }, [alwaysShowPollResults])

  useEffect(() => {
    if (alwaysShowPollResults) {
      setCountdown(5)
      return
    }
    setCountdown(5)
    const interval = setInterval(() => {
      setCountdown(n => Math.max(0, n - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [alwaysShowPollResults])

  const correctPct = percentages[question.correct_human]
    ? Math.round(percentages[question.correct_human])
    : null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', background: 'rgba(0,0,0,0.2)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full overflow-hidden"
        style={{
          maxWidth: 680,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          background: 'rgba(10,14,26,0.85)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
      >
        <div className="p-5 md:p-6">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-white">How others decoded it</span>
            <span
              className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded animate-pulse"
              style={{ color: '#e53935', border: '1px solid rgba(229,57,53,0.35)' }}
            >
              [LIVE]
            </span>
          </div>

          {/* Term */}
          <p className="text-white/60 text-sm mb-3 leading-snug">
            How did everyone decode <span className="text-white font-bold">&ldquo;{question.term}&rdquo;</span>?
          </p>

          {/* Your answer badge */}
          {userAnswer && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-white/35 text-xs">Your answer:</span>
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{ background: 'rgba(229,57,53,0.12)', color: '#ff8099', border: '1px solid rgba(229,57,53,0.25)' }}
              >
                {userAnswer}
              </span>
              {userAnswer === question.correct_human && (
                <span
                  className="text-xs font-semibold px-2 py-1 rounded-full"
                  style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }}
                >
                  ✓ Correct
                </span>
              )}
            </div>
          )}

          {/* Poll chart */}
          <div className="mb-3">
            {Object.keys(percentages).length > 0 ? (
              <PollChart data={percentages} userAnswer={userAnswer} />
            ) : (
              <div className="text-white/20 text-sm py-6 text-center">Loading poll data…</div>
            )}
          </div>

          {/* Correct answer + accuracy */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'rgba(229,57,53,0.75)' }}>Correct Answer</p>
              <p className="text-white font-bold text-sm">{question.correct_human}</p>
            </div>
            <div className="px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'rgba(229,57,53,0.75)' }}>Players Got It Right</p>
              <p className="text-white font-bold text-sm">{correctPct !== null ? `~${correctPct}%` : '—'}</p>
            </div>
          </div>

          {/* Footer: toggle + continue */}
          <div className="flex items-center justify-between gap-4">
            <button
              onPointerDown={() => setAlwaysShowPollResults(!alwaysShowPollResults)}
              className="flex items-center gap-2 shrink-0"
            >
              <div
                className="relative w-9 h-5 rounded-full transition-colors duration-200"
                style={{ background: alwaysShowPollResults ? '#e53935' : 'rgba(255,255,255,0.15)' }}
              >
                <div
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200"
                  style={{ transform: alwaysShowPollResults ? 'translateX(1.1rem)' : 'translateX(0.1rem)' }}
                />
              </div>
              <span className="text-xs text-white/45 select-none">Always show results</span>
            </button>
            <motion.button
              onPointerDown={onContinue}
              className="px-5 py-2.5 rounded-xl text-white font-black text-sm uppercase tracking-wider shrink-0"
              style={{ background: '#e53935', boxShadow: '0 4px 16px rgba(229,57,53,0.3)' }}
              whileTap={{ scale: 0.97 }}
            >
              {isLastQuestion ? 'See Results →' : 'Continue →'}
            </motion.button>
          </div>
        </div>

        {/* Countdown label */}
        {!alwaysShowPollResults && (
          <p className="text-[10px] text-white/35 text-right px-4 pb-1">
            Auto-advancing in {countdown}s…
          </p>
        )}

        {/* Countdown progress bar */}
        <div className="h-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <AnimatePresence>
            {!alwaysShowPollResults && (
              <motion.div
                key="bar"
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                exit={{ width: '0%' }}
                transition={{ duration: 5, ease: 'linear' }}
                className="h-full"
                style={{ background: '#e53935' }}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function LostInContextQuestion() {
  const {
    shuffledQuestions, currentQuestionIndex, submitAnswer, nextQuestion,
    alwaysShowPollResults, setAlwaysShowPollResults,
  } = useSession()
  const question = shuffledQuestions[currentQuestionIndex]
  const total = shuffledQuestions.length

  const [selected, setSelected] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [showFlash, setShowFlash] = useState(false)
  const [showPollOverlay, setShowPollOverlay] = useState(false)

  const percentages = usePollAggregation(question?.id)

  const playTap     = useSound('tap.mp3', { volume: 0.3 })
  const playCorrect = useSound('correct.mp3')
  const playWrong   = useSound('wrong.mp3')
  const playTerm    = useSound('term-reveal.mp3', { volume: 0.5 })

  useEffect(() => {
    setSelected(null)
    setSubmitted(false)
    setShowFlash(false)
    setShowPollOverlay(false)
    playTerm()
  }, [currentQuestionIndex])

  const isLastQuestion = currentQuestionIndex >= total - 1

  function handleSelect(option) {
    if (submitted) return
    playTap()
    setSelected(option)
    setSubmitted(true)
    submitAnswer(question.id, option)

    setTimeout(() => {
      const correct = option === question.correct_human
      correct ? playCorrect() : playWrong()
      setShowFlash(true)
      setTimeout(() => setShowFlash(false), 800)
      if (correct) {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.5 }, colors: ['#e53935', '#ff8099', '#ff4d6b', '#ffffff'], disableForReducedMotion: true })
        setTimeout(() => setShowPollOverlay(true), 800)
      } else {
        setShowPollOverlay(true)
      }
    }, 650)
  }

  function handleContinue() {
    setShowPollOverlay(false)
    nextQuestion()
  }

  if (!question) return null

  const isCorrect = selected === question.correct_human
  const progress = ((currentQuestionIndex + 1) / total) * 100
  const numeric = isNumericOptions(question.options)
  const gridCols = numeric ? 'grid-cols-2 tablet:grid-cols-4' : 'grid-cols-2'

  return (
    <motion.div
      className="relative w-full h-full flex flex-col overflow-hidden"
      style={{ background: '#0a0e1a' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <AnswerFlash show={showFlash} correct={isCorrect} />

      {/* Dot grid background */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#e53935 0.5px, transparent 0.5px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Glow orbs */}
      <div className="absolute -top-32 -right-20 w-80 h-80 rounded-full opacity-10 pointer-events-none"
        style={{ background: '#e53935', filter: 'blur(100px)' }} />
      <div className="absolute -bottom-32 -left-20 w-64 h-64 rounded-full opacity-6 pointer-events-none"
        style={{ background: '#e53935', filter: 'blur(90px)' }} />

      {/* ── HEADER ── */}
      <header
        className="relative z-10 flex items-center justify-between px-4 md:px-10 py-2 md:py-3 lg:py-5 border-b shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(10,14,26,0.8)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
      >
        <Logo />
        <div className="flex items-center gap-6">
          <span className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: '#e53935' }}>
            Decode GenZ Lingos
          </span>
        </div>
      </header>

      {/* ── SCENARIO + PROGRESS ── */}
      <div className="relative z-10 px-4 md:px-10 pt-3 md:pt-4 lg:pt-6 pb-2 md:pb-3 lg:pb-4 shrink-0">
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-1" style={{ color: '#e53935' }}>
              Currently Playing
            </p>
            <h2 className="text-lg md:text-2xl font-black tracking-tight text-white">
              Round {currentQuestionIndex + 1}
            </h2>
          </div>
          <div className="text-right">
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">Mission Progress</p>
            <p className="text-xl font-black text-white">
              {String(currentQuestionIndex + 1).padStart(2, '0')}
              <span style={{ color: '#e53935' }}>/</span>
              {String(total).padStart(2, '0')}
            </p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: '#e53935', boxShadow: '0 0 14px rgba(229,57,53,0.7)' }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="relative z-10 flex-1 flex flex-col min-h-0 px-4 md:px-10 pb-2 md:pb-3 lg:pb-4 overflow-y-auto">
        <motion.div
          className="flex-1 flex flex-col min-h-0"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Question text */}
          <div className="text-center mb-3 md:mb-5 shrink-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="inline-block px-4 py-1.5 rounded-full mb-2 md:mb-4 text-[10px] font-black uppercase tracking-[0.3em]"
              style={{ color: '#e53935', background: 'rgba(229,57,53,0.08)', border: '1px solid rgba(229,57,53,0.25)' }}
            >
              Dual Meaning Detected
            </motion.div>

            <motion.h3
              key={question.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="text-white font-black leading-tight mb-3"
              style={{ fontSize: 'clamp(2rem, 4.5vh, 3.5rem)' }}
            >
              What does <span style={{ color: '#e53935' }}>&ldquo;{question.term}&rdquo;</span> mean?
            </motion.h3>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-white/40 text-sm max-w-xl mx-auto leading-relaxed"
            >
              This word means something very different in Gen Z culture.{' '}
              <span className="text-white/60 underline decoration-[#e53935]/40 underline-offset-4">
                Pick the meaning that's actually in use — not the dictionary definition.
              </span>
            </motion.p>
          </div>

          {/* Options grid */}
          <motion.div
            className={`flex-1 min-h-0 grid ${gridCols} gap-5 max-w-5xl mx-auto w-full`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {question.options.map((option, i) => {
              const isSelected = selected === option
              const isDimmed = selected && !isSelected
              const label = String.fromCharCode(65 + i)

              return (
                <motion.button
                  key={option}
                  onPointerDown={() => handleSelect(option)}
                  disabled={submitted}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25 + i * 0.07 }}
                  whileTap={!submitted ? { scale: 0.97 } : {}}
                  className="relative group flex flex-col items-center justify-center rounded-2xl transition-all duration-300 overflow-hidden p-3 md:p-5 lg:p-6"
                  style={(() => {
                    if (submitted && isSelected) {
                      const correct = option === question.correct_human
                      return {
                        background: correct ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.04)',
                        border: correct ? '2px solid #4ade80' : '2px solid rgba(255,255,255,0.12)',
                        boxShadow: correct ? '0 0 40px rgba(74,222,128,0.2)' : 'none',
                        opacity: 1,
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                      }
                    }
                    return {
                      background: isSelected ? 'rgba(10,14,26,0.95)' : 'rgba(255,255,255,0.025)',
                      border: isSelected ? '2px solid #e53935' : '1px solid rgba(255,255,255,0.08)',
                      boxShadow: isSelected ? '0 0 40px rgba(229,57,53,0.25), inset 0 0 60px rgba(229,57,53,0.04)' : 'none',
                      opacity: isDimmed ? 0.35 : 1,
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                    }
                  })()}
                >
                  {/* Letter badge */}
                  <div
                    className="absolute top-5 left-5 w-8 h-8 rounded flex items-center justify-center text-xs font-black transition-all duration-300"
                    style={{
                      background: isSelected ? '#e53935' : 'transparent',
                      border: isSelected ? 'none' : '1px solid rgba(255,255,255,0.12)',
                      color: isSelected ? 'white' : 'rgba(255,255,255,0.25)',
                    }}
                  >
                    {label}
                  </div>

                  {/* Option text */}
                  <span
                    className="font-black text-center leading-tight transition-colors duration-200 px-2"
                    style={{
                      fontSize: numeric
                        ? 'clamp(2rem, 4vw, 3rem)'
                        : 'clamp(1rem, 2vw, 1.5rem)',
                      color: isSelected ? 'white' : 'rgba(255,255,255,0.75)',
                    }}
                  >
                    {option}
                  </span>

                  {/* Decorative line */}
                  <div
                    className="mt-5 h-1 rounded-full transition-all duration-500"
                    style={{
                      width: isSelected ? '3.5rem' : '1.5rem',
                      background: isSelected ? '#e53935' : 'rgba(255,255,255,0.08)',
                    }}
                  />

                  {/* Checkmark */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.4 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.4 }}
                        className="absolute bottom-5 right-5"
                      >
                        <svg className="w-7 h-7" viewBox="0 0 24 24" fill="#e53935">
                          <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 14.414l-4.207-4.207 1.414-1.414L11 13.586l5.793-5.793 1.414 1.414L11 16.414z" />
                        </svg>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              )
            })}
          </motion.div>
        </motion.div>
      </div>

      {/* ── FOOTER ── */}
      <footer
        className="relative z-10 flex items-center justify-between px-4 md:px-10 py-2 md:py-3 lg:py-5 border-t shrink-0"
        style={{
          borderColor: 'rgba(255,255,255,0.05)',
          background: 'rgba(0,0,0,0.25)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <div className="flex gap-10">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 8px rgba(52,211,153,0.7)' }} />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/35">System Online</span>
          </div>
          <div className="flex items-center gap-2.5">
            <svg className="w-3.5 h-3.5" style={{ color: '#e53935' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.14 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
            </svg>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/35">Global Lab Connection</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-bold uppercase tracking-widest text-white/25">Assigned Moderator</p>
          <p className="text-xs font-medium text-white/50">Station {import.meta.env.VITE_STATION_ID || 'booth-07'}</p>
        </div>
      </footer>

      {/* Poll overlay */}
      <AnimatePresence>
        {showPollOverlay && (
          <LICPollOverlay
            question={question}
            percentages={percentages}
            userAnswer={selected}
            isLastQuestion={isLastQuestion}
            alwaysShowPollResults={alwaysShowPollResults}
            setAlwaysShowPollResults={setAlwaysShowPollResults}
            onContinue={handleContinue}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
