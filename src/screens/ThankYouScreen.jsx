import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { v4 as uuidv4 } from 'uuid'
import { useSession } from '../hooks/useSession'
import { writeSession, addToSyncQueue } from '../hooks/useIndexedDB'
import { processSyncQueue } from '../utils/api'

const AUTO_RESET_SECONDS = 15

export default function ThankYouScreen() {
  const { sessionId, playerInfo, selectedGame, answers, shuffledQuestions, resetSession } = useSession()
  const [countdown, setCountdown] = useState(AUTO_RESET_SECONDS)
  const [saved, setSaved] = useState(false)

  // Write session to IndexedDB on mount, then attempt sync
  useEffect(() => {
    async function saveSession() {
      const record = {
        sessionId,
        timestamp: Date.now(),
        game_played: selectedGame,
        playerInfo,
        answers,
        questionIds: shuffledQuestions.map(q => q.id),
      }
      await writeSession(record)
      await addToSyncQueue({ ...record, id: undefined })
      setSaved(true)
      processSyncQueue()
    }
    saveSession()
  }, [])

  // Countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(interval)
          resetSession()
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [resetSession])

  return (
    <motion.div
      className="relative w-full h-full flex flex-col items-center justify-center px-8 bg-[#080820]"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-primary-900/20 blur-3xl rounded-full" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
        <motion.div
          className="text-7xl mb-6"
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', delay: 0.2 }}
        >
          🎉
        </motion.div>

        <motion.h1
          className="text-white font-bold mb-4"
          style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Thanks for playing!
        </motion.h1>

        <motion.p
          className="text-white/50 text-lg mb-6 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {playerInfo?.name ? `${playerInfo.name}, your` : 'Your'} responses have been recorded.
          {playerInfo?.email && ' Check your inbox for your personalised report.'}
        </motion.p>

        <motion.div
          className="bg-white/5 rounded-2xl px-8 py-5 mb-8 border border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-white/40 text-sm mb-1">Visit us at</p>
          <p className="text-primary-300 font-semibold text-lg">sutherland.com/trust-safety</p>
        </motion.div>

        <motion.button
          onPointerDown={resetSession}
          className="w-full py-5 rounded-2xl bg-primary-600 text-white font-bold text-xl shadow-lg shadow-primary-900/40 active:bg-primary-700 mb-4"
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Start Another Game
        </motion.button>

        {/* Countdown */}
        <motion.p
          className="text-white/30 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          Returning to attract screen in {countdown}s...
        </motion.p>

        {/* Countdown ring */}
        <svg className="w-12 h-12 mt-4 -rotate-90" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
          <circle
            cx="20" cy="20" r="16"
            fill="none"
            stroke="rgba(124, 58, 237, 0.7)"
            strokeWidth="3"
            strokeDasharray={`${2 * Math.PI * 16}`}
            strokeDashoffset={`${2 * Math.PI * 16 * (1 - countdown / AUTO_RESET_SECONDS)}`}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
      </div>
    </motion.div>
  )
}
