import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from '../hooks/useSession'
import { incrementPollAggregate } from '../hooks/useIndexedDB'
import { usePollAggregation } from '../hooks/usePollAggregation'
import { useSound } from '../hooks/useSound'
import PollChart from '../components/PollChart'

const FOCUS_AREA_DESCRIPTIONS = {
  'AI Adoption': 'How AI technology is reshaping the scale and speed of T&S operations',
  'Regulatory Stance': 'How governments and global policy will shape platform accountability',
  'Threat Landscape': 'The evolving ecosystem of bad actors, attack vectors, and platform risks that T&S teams face',
  'Human Oversight': 'The role of human judgment, expertise, and workforce wellbeing in an increasingly automated future',
}

function PollOverlay({ question, percentages, userAnswer, isLastQuestion, alwaysShowPollResults, setAlwaysShowPollResults, onContinue }) {
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
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {/* Bar-chart icon */}
              <svg className="w-4 h-4 shrink-0" style={{ color: '#e53935' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-white">Survey Consensus</span>
            </div>
            <span
              className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
              style={{ color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              responses
            </span>
          </div>

          {/* Question text */}
          <p className="text-white/60 text-sm mb-3 leading-snug line-clamp-2">{question.scenario}</p>

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
            </div>
          )}

          {/* Poll chart */}
          <div className="mb-4">
            {Object.keys(percentages).length > 0 ? (
              <PollChart data={percentages} userAnswer={userAnswer} />
            ) : (
              <div className="text-white/20 text-sm py-6 text-center">Loading poll data…</div>
            )}
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
              className="px-5 py-2.5 rounded-xl text-white font-black text-sm uppercase tracking-wider shrink-0 min-h-[44px] flex items-center justify-center"
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

export default function QuestionScreen() {
  const {
    shuffledQuestions, currentQuestionIndex, submitAnswer, nextQuestion,
    alwaysShowPollResults, setAlwaysShowPollResults, navigate,
  } = useSession()
  const question = shuffledQuestions[currentQuestionIndex]
  const total = shuffledQuestions.length

  const [selected, setSelected] = useState(null)
  const [locked, setLocked] = useState(false)
  const [dimTip, setDimTip] = useState(false)
  const [showPollOverlay, setShowPollOverlay] = useState(false)

  const percentages = usePollAggregation(question?.id)
  const playTap = useSound('tap.mp3', { volume: 0.3 })

  useEffect(() => {
    setSelected(null)
    setLocked(false)
    setShowPollOverlay(false)
  }, [currentQuestionIndex])

  const isLastQuestion = currentQuestionIndex >= total - 1

  async function handleSelect(option) {
    if (locked) return
    playTap()
    setSelected(option)
    setLocked(true)

    await incrementPollAggregate(question.id, option)
    submitAnswer(question.id, option)

    setTimeout(() => {
      setShowPollOverlay(true)
    }, 500)
  }

  function handleContinue() {
    setShowPollOverlay(false)
    nextQuestion()
  }

  if (!question) return null

  const progress = ((currentQuestionIndex + 1) / total) * 100

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
        className="relative z-10 flex items-center justify-between px-4 sm:px-6 md:px-10 py-3 md:py-4 lg:py-6 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(10,14,26,0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
      >
        <div className="relative">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Focus Area</p>
            <button
              onPointerDown={e => { e.stopPropagation(); setDimTip(t => !t) }}
              className="w-10 h-10 rounded-full flex items-center justify-center select-none"
              style={{ color: '#e53935' }}
              aria-label="Focus area info"
            >
              <span
                className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black leading-none"
                style={{ background: 'rgba(229,57,53,0.15)', border: '1px solid rgba(229,57,53,0.35)' }}
              >
                i
              </span>
            </button>
          </div>
          <h2 className="text-white font-black text-xl md:text-3xl tracking-tight leading-none">
            {question.dimension}
          </h2>
          <AnimatePresence>
            {dimTip && FOCUS_AREA_DESCRIPTIONS[question.dimension] && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="absolute top-full left-0 mt-2 z-50 max-w-xs rounded-xl p-3"
                style={{ background: '#131829', border: '1px solid rgba(229,57,53,0.3)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
              >
                <p className="text-white/70 text-xs leading-relaxed">{FOCUS_AREA_DESCRIPTIONS[question.dimension]}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-4">
          <button onPointerDown={() => { setShowPollOverlay(false); navigate('gameSelect') }} className="opacity-60 active:opacity-40 transition-opacity" aria-label="Home">
            <img src={`${import.meta.env.BASE_URL}sutherland-logo.png`} alt="Sutherland" className="h-7 w-auto object-contain" />
          </button>
          <div className="text-right">
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-1">Progress</p>
            <p className="text-white font-black text-lg md:text-2xl leading-none">
              {String(currentQuestionIndex + 1).padStart(2, '0')}
              <span style={{ color: '#e53935' }}>/</span>
              {String(total).padStart(2, '0')}
            </p>
          </div>
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
      <div className="relative z-10 flex-1 flex flex-col items-center px-4 sm:px-6 md:px-10 py-3 md:py-4 gap-3 md:gap-4 lg:gap-5 min-h-0 overflow-y-auto">

        {/* Question section */}
        <div className="flex flex-col items-center text-center w-full max-w-4xl mx-auto shrink-0">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="px-5 py-1.5 rounded-full mb-2 md:mb-4 text-[10px] font-black uppercase tracking-[0.35em]"
            style={{ color: '#e53935', background: 'rgba(229,57,53,0.08)', border: '1px solid rgba(229,57,53,0.25)' }}
          >
            Trust &amp; Safety 2030: Predict the Future
          </motion.div>

          <motion.h3
            key={question.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="text-white font-black leading-tight"
            style={{ fontSize: 'clamp(1.2rem, 4.5vh, 2.4rem)' }}
          >
            {question.scenario}
          </motion.h3>
        </div>

        {/* ── Options — horizontal survey tiles ── */}
        <motion.div
          key={`grid-${question.id}`}
          className="flex-1 min-h-0 w-full max-w-3xl mx-auto pb-2 flex flex-col gap-2 md:gap-2.5"
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
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                whileTap={!locked ? { scale: 0.99 } : {}}
                className="relative flex items-center rounded-xl px-5 py-3.5 md:py-4 transition-all duration-200 text-left w-full"
                style={{
                  background: isSelected ? 'rgba(229,57,53,0.07)' : 'rgba(255,255,255,0.025)',
                  border: isSelected
                    ? '1px solid rgba(229,57,53,0.45)'
                    : '1px solid rgba(255,255,255,0.07)',
                  boxShadow: isSelected ? '0 0 0 1px rgba(229,57,53,0.15), inset 0 0 30px rgba(229,57,53,0.03)' : 'none',
                  opacity: isDimmed ? 0.55 : 1,
                }}
              >
                {/* Option text */}
                <span
                  className="flex-1 font-semibold leading-snug transition-colors duration-200"
                  style={{
                    fontSize: 'clamp(0.88rem, 1.45vw, 1.1rem)',
                    color: isSelected ? 'white' : 'rgba(255,255,255,0.7)',
                  }}
                >
                  {option}
                </span>

                {/* Letter badge */}
                <div
                  className="shrink-0 w-7 h-7 rounded flex items-center justify-center text-[11px] font-black transition-all duration-200"
                  style={{
                    background: isSelected ? '#e53935' : 'rgba(255,255,255,0.06)',
                    color: isSelected ? 'white' : 'rgba(255,255,255,0.3)',
                  }}
                >
                  {String.fromCharCode(65 + i)}
                </div>
              </motion.button>
            )
          })}
        </motion.div>
      </div>

      {/* Poll overlay */}
      <AnimatePresence>
        {showPollOverlay && (
          <PollOverlay
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
