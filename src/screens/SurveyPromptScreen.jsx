import { motion } from 'framer-motion'
import { useSession } from '../hooks/useSession'
import { shuffle } from '../utils/scoring'
import trust2030Questions from '../data/trust2030_questions.json'
import { MONO, RED, GLOW_RED_LG } from '../theme'

export default function SurveyPromptScreen() {
  const { navigate, leadCaptureEnabled } = useSession()

  function handleYes() {
    const questions = shuffle(trust2030Questions)
    navigate('question', {
      selectedGame: 'trust2030',
      shuffledQuestions: questions,
      currentQuestionIndex: 0,
      answers: {},
    })
  }

  function handleSkip() {
    navigate(leadCaptureEnabled ? 'emailCapture' : 'thankYou')
  }

  return (
    <motion.div
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden px-4"
      style={{ background: '#0a0e1a' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-1/2 h-1/2 rounded-full" style={{ background: 'rgba(255,0,60,0.07)', filter: 'blur(140px)' }} />
        <div className="absolute bottom-[-10%] right-[-5%] w-[45%] h-[45%] rounded-full" style={{ background: 'rgba(255,0,60,0.04)', filter: 'blur(120px)' }} />
        <div className="scan-line" />
      </div>

      {/* Card */}
      <motion.div
        className="relative z-10 w-full max-w-lg rounded-3xl p-8 md:p-10"
        style={{
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          background: 'rgba(10,14,26,0.85)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 48px rgba(0,0,0,0.5)',
        }}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.35 }}
      >
        {/* Icon */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
          style={{ background: 'rgba(229,57,53,0.1)', border: '1px solid rgba(229,57,53,0.25)' }}
        >
          <svg className="w-7 h-7" style={{ color: RED }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
          </svg>
        </div>

        {/* Heading */}
        <h2 className="text-white font-black text-2xl md:text-3xl leading-tight mb-3">
          Want to share your views?
        </h2>

        {/* Body */}
        <p className="text-white/55 text-base leading-relaxed mb-8">
          Take our 5-minute Trust &amp; Safety Survey and see how your perspective compares to industry leaders.
        </p>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <motion.button
            onPointerDown={handleYes}
            className="w-full py-4 rounded-2xl text-white font-black text-base uppercase tracking-wider"
            style={{
              background: RED,
              boxShadow: GLOW_RED_LG,
              border: '1px solid rgba(255,255,255,0.1)',
            }}
            whileTap={{ scale: 0.98 }}
          >
            Yes, Take the Survey
          </motion.button>

          <button
            onPointerDown={handleSkip}
            className="w-full py-3 text-white/40 font-bold text-sm uppercase tracking-widest hover:text-white/60 transition-colors"
            style={{ fontFamily: MONO }}
          >
            Skip →
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
