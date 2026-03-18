import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useSession } from '../hooks/useSession'
import { useSound } from '../hooks/useSound'
import AnswerFlash from '../components/AnswerFlash'

// Numbers (≤12 chars, parseable as float) → 4×1 row; text → 2×2 grid
function isNumericOptions(options) {
  return options.every(o => !isNaN(parseFloat(o.trim())) && isFinite(o.trim()))
}

function Logo() {
  return (
    <img src={`${import.meta.env.BASE_URL}sutherland-logo.png`} alt="Sutherland" className="h-8 w-auto object-contain" />
  )
}

export default function LostInContextQuestion() {
  const { shuffledQuestions, currentQuestionIndex, submitAnswer, navigate } = useSession()
  const question = shuffledQuestions[currentQuestionIndex]
  const total = shuffledQuestions.length

  const [selected, setSelected] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [showFlash, setShowFlash] = useState(false)

  const playTap     = useSound('tap.mp3', { volume: 0.3 })
  const playCorrect = useSound('correct.mp3')
  const playWrong   = useSound('wrong.mp3')
  const playTerm    = useSound('term-reveal.mp3', { volume: 0.5 })

  useEffect(() => {
    setSelected(null)
    setSubmitted(false)
    setShowFlash(false)
    playTerm()
  }, [currentQuestionIndex])

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
      setTimeout(() => setShowFlash(false), 500)
      if (correct) {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.5 },
          colors: ['#e53935', '#ff8099', '#ff4d6b', '#ffffff'],
          disableForReducedMotion: true,
        })
      }
      navigate('licPollResult')
    }, 650)
  }

  if (!question) return null

  const isCorrect = selected === question.correct_human
  const progress = ((currentQuestionIndex + 1) / total) * 100
  const numeric = isNumericOptions(question.options)
  const gridCols = numeric ? 'grid-cols-4' : 'grid-cols-2'

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
        className="relative z-10 flex items-center justify-between px-10 py-5 border-b shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(10,14,26,0.8)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
      >
        <Logo />
        <div className="flex items-center gap-6">
          <span className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: '#e53935' }}>
            Lost In Context V2.4
          </span>
        </div>
      </header>

      {/* ── SCENARIO + PROGRESS ── */}
      <div className="relative z-10 px-10 pt-6 pb-4 shrink-0">
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-1" style={{ color: '#e53935' }}>
              Currently Playing
            </p>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Lost in Context: Round {currentQuestionIndex + 1}
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
      <div className="relative z-10 flex-1 flex flex-col min-h-0 px-10 pb-4 overflow-hidden">
        <motion.div
          className="flex-1 flex flex-col min-h-0"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Question text */}
          <div className="text-center mb-6 shrink-0">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="inline-block px-4 py-1.5 rounded-full mb-4 text-[10px] font-black uppercase tracking-[0.3em]"
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
              style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)' }}
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
                  className="relative group flex flex-col items-center justify-center rounded-2xl transition-all duration-300 overflow-hidden p-6"
                  style={{
                    background: isSelected
                      ? 'rgba(10,14,26,0.95)'
                      : 'rgba(255,255,255,0.025)',
                    border: isSelected
                      ? '2px solid #e53935'
                      : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: isSelected
                      ? '0 0 40px rgba(229,57,53,0.25), inset 0 0 60px rgba(229,57,53,0.04)'
                      : 'none',
                    opacity: isDimmed ? 0.35 : 1,
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                  }}
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
        className="relative z-10 flex items-center justify-between px-10 py-5 border-t shrink-0"
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
          <p className="text-xs font-medium text-white/50">Station {import.meta.env.VITE_STATION_ID || 'Alpha-01'}</p>
        </div>
      </footer>
    </motion.div>
  )
}
