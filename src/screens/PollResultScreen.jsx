import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from '../hooks/useSession'
import { usePollAggregation } from '../hooks/usePollAggregation'
import PollChart from '../components/PollChart'

const FOCUS_AREA_DESCRIPTIONS = {
  'AI Adoption': 'How AI technology is reshaping the scale and speed of T&S operations',
  'Regulatory Stance': 'How governments and global policy will shape platform accountability',
  'Threat Landscape': 'The evolving ecosystem of bad actors, attack vectors, and platform risks that T&S teams face',
  'Human Oversight': 'The role of human judgment, expertise, and workforce wellbeing in an increasingly automated future',
}

export default function PollResultScreen() {
  const { shuffledQuestions, currentQuestionIndex, answers, nextQuestion } = useSession()
  const [insightExpanded, setInsightExpanded] = useState(false)
  const [dimTip, setDimTip] = useState(false)
  const question = shuffledQuestions[currentQuestionIndex]
  const userAnswer = answers[question?.id]

  const percentages = usePollAggregation(question?.id)
  const isLastQuestion = currentQuestionIndex >= shuffledQuestions.length - 1

  if (!question) return null

  const progress = ((currentQuestionIndex + 1) / shuffledQuestions.length) * 100

  // Split insight into headline + body (first sentence vs rest)
  const insightFull = question.insight || ''
  const dotIdx = insightFull.indexOf('. ')
  const insightTitle = dotIdx > 0 ? insightFull.slice(0, dotIdx + 1) : insightFull
  const insightBody = dotIdx > 0 ? insightFull.slice(dotIdx + 2) : ''

  const userAligned = userAnswer === question.industry_lean

  return (
    <motion.div
      className="relative w-full h-full flex flex-col overflow-hidden"
      style={{ background: '#0a0e1a' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.35 }}
    >
      {/* Background dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: 'radial-gradient(rgba(229,57,53,0.6) 0.5px, transparent 0.5px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Red orbs */}
      <div className="absolute -top-28 -right-20 w-80 h-80 rounded-full pointer-events-none" style={{ background: '#e53935', filter: 'blur(100px)', opacity: 0.08 }} />
      <div className="absolute -bottom-28 -left-20 w-64 h-64 rounded-full pointer-events-none" style={{ background: '#e53935', filter: 'blur(80px)', opacity: 0.06 }} />

      {/* Scan line */}
      <div className="scan-line" />

      {/* ── Header ── */}
      <header
        className="relative z-10 flex items-center justify-between px-8 py-4 border-b"
        style={{
          borderColor: 'rgba(255,255,255,0.05)',
          background: 'rgba(10,14,26,0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-white">
            Live Consensus
          </span>
          <span
            className="text-[10px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded animate-pulse"
            style={{ color: '#e53935', border: '1px solid rgba(229,57,53,0.35)' }}
          >
            [LIVE FEED]
          </span>
        </div>
        <div className="text-right">
          <p className="text-white/30 text-[10px] uppercase tracking-widest">Question</p>
          <p className="text-white font-black text-sm leading-none">
            {currentQuestionIndex + 1}
            <span style={{ color: '#e53935' }}>/</span>
            {shuffledQuestions.length}
          </p>
        </div>
      </header>

      {/* Progress bar */}
      <div className="relative z-10 h-0.5 w-full" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <motion.div
          className="h-full"
          style={{ background: '#e53935', boxShadow: '0 0 10px rgba(229,57,53,0.6)' }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* ── Main two-column layout ── */}
      <main className="relative z-10 flex-1 flex overflow-hidden">

        {/* Left: Chart */}
        <section className="flex-1 flex flex-col px-4 sm:px-6 md:px-8 lg:px-10 py-4 md:py-5 lg:py-7 border-r" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>

          {/* Question context */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-3 md:mb-5"
          >
            <div className="flex items-center gap-1.5 mb-1 relative">
              <p
                className="text-[10px] font-black uppercase tracking-[0.22em]"
                style={{ color: '#e53935' }}
              >
                {question.dimension}
              </p>
              <button
                onPointerDown={e => { e.stopPropagation(); setDimTip(t => !t) }}
                className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-black leading-none select-none"
                style={{ background: 'rgba(229,57,53,0.15)', border: '1px solid rgba(229,57,53,0.35)', color: '#e53935' }}
              >
                i
              </button>
              <AnimatePresence>
                {dimTip && FOCUS_AREA_DESCRIPTIONS[question.dimension] && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                    className="absolute top-full left-0 mt-1.5 z-50 max-w-[240px] rounded-xl p-3"
                    style={{ background: '#131829', border: '1px solid rgba(229,57,53,0.3)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
                  >
                    <p className="text-white/70 text-xs leading-relaxed">{FOCUS_AREA_DESCRIPTIONS[question.dimension]}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <p className="text-white/55 text-sm leading-snug">{question.scenario}</p>
          </motion.div>

          {/* Your answer badge */}
          {userAligned && (
            <div className="flex flex-wrap items-center gap-2 mb-3 md:mb-5">
              <span
                className="text-xs font-semibold px-2 py-1 rounded-full"
                style={{
                  background: 'rgba(16,185,129,0.12)',
                  color: '#4ade80',
                  border: '1px solid rgba(16,185,129,0.2)',
                }}
              >
                ✓ Aligned with industry
              </span>
            </div>
          )}

          {/* Majority verdict — instant executive takeaway */}
          {Object.keys(percentages).length > 0 && (() => {
            const top = Object.entries(percentages).sort(([,a],[,b]) => b - a)[0]
            if (!top) return null
            const [topLabel, topPct] = top
            const isUserTop = topLabel === userAnswer
            return (
              <motion.div
                className="mb-3 md:mb-4 rounded-xl px-4 py-3 flex items-center gap-3"
                style={{
                  background: 'rgba(229,57,53,0.07)',
                  border: '1px solid rgba(229,57,53,0.2)',
                }}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <span className="font-black tabular-nums shrink-0" style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)', color: '#e53935' }}>
                  {Math.round(topPct)}%
                </span>
                <div className="min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-0.5" style={{ color: 'rgba(229,57,53,0.7)' }}>What other executives predicted</p>
                  <p className="text-white font-bold text-sm leading-tight truncate">{topLabel}</p>
                </div>
                {isUserTop && (
                  <span className="ml-auto shrink-0 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full" style={{ background: 'rgba(74,222,128,0.12)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.25)' }}>
                    You agreed
                  </span>
                )}
              </motion.div>
            )
          })()}

          {/* Chart */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1">
            {Object.keys(percentages).length > 0 ? (
              <PollChart data={percentages} userAnswer={userAnswer} />
            ) : (
              <div className="flex items-center justify-center h-full text-white/20 text-sm">
                Loading poll data…
              </div>
            )}
          </div>

          {/* Stats row — real data only */}
          <div className="grid grid-cols-2 gap-3 mt-3 md:mt-5">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="p-3 rounded-xl"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            >
              <p
                className="text-[10px] font-black uppercase tracking-[0.15em] mb-1"
                style={{ color: 'rgba(229,57,53,0.75)' }}
              >
                Focus Area
              </p>
              <p className="text-white font-bold text-sm leading-snug">{question.dimension}</p>
              {FOCUS_AREA_DESCRIPTIONS[question.dimension] && (
                <p className="text-white/35 text-[10px] leading-snug mt-1">
                  {FOCUS_AREA_DESCRIPTIONS[question.dimension]}
                </p>
              )}
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="p-3 rounded-xl"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
              }}
            >
              <p
                className="text-[10px] font-black uppercase tracking-[0.15em] mb-1"
                style={{ color: 'rgba(229,57,53,0.75)' }}
              >
                Most Experts Believe
              </p>
              <p className="text-white font-bold text-sm leading-snug">{question.industry_lean}</p>
            </motion.div>
          </div>
        </section>

        {/* Right: Insight + Action */}
        <section
          className="w-48 sm:w-56 md:w-64 lg:w-72 flex flex-col px-3 sm:px-4 md:px-5 lg:px-7 py-4 md:py-5 lg:py-7 shrink-0 overflow-y-auto"
          style={{ background: 'rgba(229,57,53,0.02)' }}
        >
          <div className="flex-1 flex flex-col gap-5">

            {/* KEY INSIGHT badge */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest self-start"
              style={{ background: '#e53935', color: 'white' }}
            >
              {/* Trending-up icon */}
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Key Insight
            </motion.div>

            {/* Insight headline */}
            <motion.h3
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="text-white font-bold text-base leading-snug"
            >
              {insightTitle}
            </motion.h3>

            {/* SEE WHY THIS MATTERS */}
            {insightBody && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                onPointerDown={() => setInsightExpanded(e => !e)}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest pb-1.5 text-left"
                style={{
                  color: '#e53935',
                  borderBottom: '1px solid rgba(229,57,53,0.25)',
                  width: 'fit-content',
                  background: 'none',
                  border: 'none',
                  borderBottom: '1px solid rgba(229,57,53,0.25)',
                  cursor: 'pointer',
                  paddingBottom: '6px',
                }}
              >
                See why this matters
                <motion.svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  animate={{ rotate: insightExpanded ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </motion.svg>
              </motion.button>
            )}
            <AnimatePresence>
              {insightExpanded && insightBody && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="text-sm leading-relaxed overflow-hidden"
                  style={{ color: 'rgba(255,255,255,0.45)' }}
                >
                  {insightBody}
                </motion.p>
              )}
            </AnimatePresence>

            {/* NEXT UP card */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-auto rounded-2xl p-5 relative overflow-hidden"
              style={{
                background: '#0a0e1a',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: '#e53935' }}>
                Next Focus Area
              </p>
              <p className="text-white font-bold text-sm">
                {isLastQuestion
                  ? 'Final Results'
                  : shuffledQuestions[currentQuestionIndex + 1]?.dimension || 'Final Results'}
              </p>
            </motion.div>
          </div>

          {/* Progress pills */}
          <div className="flex flex-wrap gap-1.5 mt-5 mb-4">
            {shuffledQuestions.map((_, i) => (
              <div
                key={i}
                className="h-1 rounded-full transition-all duration-300"
                style={{
                  width: i === currentQuestionIndex ? '2rem' : '0.625rem',
                  background: i <= currentQuestionIndex ? '#e53935' : 'rgba(255,255,255,0.1)',
                  boxShadow: i === currentQuestionIndex ? '0 0 8px rgba(229,57,53,0.6)' : 'none',
                }}
              />
            ))}
          </div>

          {/* Next button */}
          <motion.button
            onPointerDown={nextQuestion}
            className="w-full py-4 rounded-xl text-white font-black text-sm flex items-center justify-between px-5 uppercase tracking-[0.15em]"
            style={{
              background: '#e53935',
              boxShadow: '0 4px 24px rgba(229,57,53,0.35)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            whileTap={{ scale: 0.97 }}
            whileHover={{ background: '#ef5350' }}
          >
            <span>{isLastQuestion ? 'See Results' : 'Next Question'}</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </motion.button>
        </section>
      </main>

    </motion.div>
  )
}
