import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSession } from '../hooks/useSession'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function EmailCaptureScreen() {
  const { navigate, playerInfo, setPlayerInfo } = useSession()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  function handleSubmit() {
    if (!EMAIL_RE.test(email)) {
      setError('Please enter a valid email address')
      return
    }
    setPlayerInfo({ ...playerInfo, email })
    navigate('thankYou')
  }

  function handleSkip() {
    navigate('thankYou')
  }

  return (
    <motion.div
      className="relative w-full h-full flex flex-col items-center justify-center px-8 bg-[#080820]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary-900/15 blur-3xl rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="text-4xl mb-6 text-center">📬</div>
        <h1
          className="text-white font-bold text-center mb-3"
          style={{ fontSize: 'clamp(1.6rem, 3vw, 2.4rem)' }}
        >
          Get your full report
        </h1>
        <p className="text-white/50 text-center mb-10 leading-relaxed">
          Enter your email and we'll send you a personalised Trust &amp; Safety outlook based on your predictions.
        </p>

        <div className="mb-2">
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError('') }}
            placeholder="your@email.com"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-white/30 text-lg focus:outline-none focus:border-primary-500 transition"
          />
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>

        <p className="text-white/30 text-xs mb-8 leading-relaxed">
          Your data is collected in accordance with the consent you gave at the start. We will not share your email with third parties.
        </p>

        <motion.button
          onPointerDown={handleSubmit}
          className="w-full py-5 rounded-2xl bg-primary-600 text-white font-bold text-xl shadow-lg shadow-primary-900/40 active:bg-primary-700 mb-4"
          whileTap={{ scale: 0.98 }}
        >
          Send me the report
        </motion.button>

        <button
          onPointerDown={handleSkip}
          className="w-full py-4 rounded-2xl text-white/40 text-lg font-medium hover:text-white/60 transition"
        >
          Skip — continue without email
        </button>
      </div>
    </motion.div>
  )
}
