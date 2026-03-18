import { motion } from 'framer-motion'
import { useSession } from '../hooks/useSession'
import { usePollAggregation } from '../hooks/usePollAggregation'
import PollChart from '../components/PollChart'

export default function LostInContextPollResult() {
  const { shuffledQuestions, currentQuestionIndex, answers, nextQuestion } = useSession()
  const question = shuffledQuestions[currentQuestionIndex]
  const userAnswer = answers[question?.id]

  const percentages = usePollAggregation(question?.id)
  const isLastQuestion = currentQuestionIndex >= shuffledQuestions.length - 1

  if (!question) return null

  const progress = ((currentQuestionIndex + 1) / shuffledQuestions.length) * 100

  // Derive correct % from aggregated data
  const correctPct = percentages[question.correct_human]
    ? Math.round(percentages[question.correct_human])
    : null

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
          <p className="text-white/30 text-[10px] uppercase tracking-widest">Term</p>
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
        <section className="flex-1 flex flex-col px-10 py-7 border-r" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>

          {/* Term + question context */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-5"
          >
            <p
              className="text-[10px] font-black uppercase tracking-[0.22em] mb-1"
              style={{ color: '#e53935' }}
            >
              Lost In Context
            </p>
            <p className="text-white/55 text-sm leading-snug">
              How did everyone decode <span className="text-white font-bold">&ldquo;{question.term}&rdquo;</span>?
            </p>
          </motion.div>

          {/* Your answer badge */}
          {userAnswer && (
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="text-white/35 text-xs">Your answer:</span>
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{
                  background: 'rgba(229,57,53,0.12)',
                  color: '#ff8099',
                  border: '1px solid rgba(229,57,53,0.25)',
                }}
              >
                {userAnswer}
              </span>
            </div>
          )}

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

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-3 mt-5">
            {[
              {
                label: 'Correct Answer',
                value: question.correct_human,
              },
              {
                label: 'Players Got It Right',
                value: correctPct !== null ? `~${correctPct}%` : '—',
              },
            ].map(stat => (
              <motion.div
                key={stat.label}
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
                  {stat.label}
                </p>
                <p className="text-white font-bold text-sm leading-snug">{stat.value}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Right: Trivia + Action */}
        <section
          className="w-72 flex flex-col px-7 py-7 shrink-0"
          style={{ background: 'rgba(229,57,53,0.02)' }}
        >
          <div className="flex-1 flex flex-col gap-5">

            {/* WORD TRIVIA badge */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest self-start"
              style={{ background: '#e53935', color: 'white' }}
            >
              {/* Book/sparkle icon */}
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Word Trivia
            </motion.div>

            {/* Term headline */}
            <motion.h3
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="font-black leading-tight"
              style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', color: 'white' }}
            >
              &ldquo;{question.term}&rdquo;
            </motion.h3>

            {/* Trivia body */}
            {question.trivia && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.45, delay: 0.2 }}
                className="text-sm leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.55)' }}
              >
                {question.trivia}
              </motion.p>
            )}

            {/* Divider label */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest pb-1.5"
              style={{
                color: '#e53935',
                borderBottom: '1px solid rgba(229,57,53,0.25)',
                width: 'fit-content',
              }}
            >
              AI read it literally
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </motion.div>

            {/* AI interpretation card */}
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
              {/* faint icon bg */}
              <div className="absolute top-0 right-0 p-3 opacity-5">
                <svg className="w-16 h-16 -rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: '#e53935' }}>
                AI Interpreted It As
              </p>
              <p className="text-white/70 text-sm leading-snug italic">
                &ldquo;{question.ai_interpretation}&rdquo;
              </p>
              {question.ai_was_wrong && (
                <p className="text-xs mt-2 font-bold" style={{ color: '#ff4d6b' }}>
                  Same word, different world — AI missed the meaning
                </p>
              )}
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
            <span>{isLastQuestion ? 'See Results' : 'Next Term'}</span>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </motion.button>
        </section>
      </main>

    </motion.div>
  )
}
