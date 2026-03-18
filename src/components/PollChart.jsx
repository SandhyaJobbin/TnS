import { motion } from 'framer-motion'

/**
 * PollChart — horizontal bar chart for poll results.
 *
 * Props:
 *   data         Object<label, pct>  — poll percentages
 *   userAnswer   string              — user's selected option (highlighted in RED)
 *   correctAnswer string (optional)  — correct answer for LIC game (highlighted in GREEN if different from user)
 *
 * Color logic:
 *   - user's pick                  → RED bar + "Your pick" badge
 *   - highest-voted (not user)     → white/bright bar + "Most popular" badge
 *   - user's pick AND highest      → RED bar + "Your pick · Most popular" badge
 *   - correct answer (LIC only)    → GREEN bar if not user
 */
export default function PollChart({ data, userAnswer, correctAnswer }) {
  if (!data || Object.keys(data).length === 0) return null

  const entries = Object.entries(data)
  const maxVal = Math.max(...entries.map(([, v]) => v), 1)

  // Highest-voted option
  const highestLabel = entries.reduce(
    (max, curr) => (curr[1] > max[1] ? curr : max),
    entries[0]
  )[0]

  return (
    <div className="flex flex-col gap-3 w-full">
      {entries.map(([label, value], idx) => {
        const isUser = label === userAnswer
        const isHighest = label === highestLabel
        const isCorrect = correctAnswer && label === correctAnswer
        const pct = Math.round(value)

        const barBg = isUser
          ? 'linear-gradient(90deg, #c62828, #e53935)'
          : isCorrect
          ? '#4ade80'
          : isHighest
          ? 'rgba(255,255,255,0.38)'
          : 'rgba(255,255,255,0.1)'

        const labelColor = isUser ? '#fff' : isHighest ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.5)'
        const pctColor = isUser ? '#e53935' : isHighest ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.25)'

        return (
          <div key={label} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span
                  className="text-sm font-bold tracking-wide truncate"
                  style={{ color: labelColor }}
                >
                  {label}
                </span>
                {isUser && isHighest && (
                  <span
                    className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0"
                    style={{ background: 'rgba(229,57,53,0.15)', color: '#ff8099', border: '1px solid rgba(229,57,53,0.3)' }}
                  >
                    Your pick · Most popular
                  </span>
                )}
                {isUser && !isHighest && (
                  <span
                    className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0"
                    style={{ background: 'rgba(229,57,53,0.12)', color: '#e53935', border: '1px solid rgba(229,57,53,0.25)' }}
                  >
                    Your pick
                  </span>
                )}
                {isHighest && !isUser && (
                  <span
                    className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0"
                    style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.15)' }}
                  >
                    Most popular
                  </span>
                )}
              </div>
              <motion.span
                className="text-xl font-black tabular-nums shrink-0"
                style={{ color: pctColor }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
              >
                {pct}%
              </motion.span>
            </div>

            <div
              className="h-3 rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: barBg,
                  boxShadow: isUser ? '0 0 12px rgba(229,57,53,0.4)' : 'none',
                }}
                initial={{ width: 0 }}
                animate={{ width: `${(pct / maxVal) * 100}%` }}
                transition={{ duration: 1, ease: 'circOut', delay: 0.2 + idx * 0.08 }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
