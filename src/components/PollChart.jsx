import { motion } from 'framer-motion'

export default function PollChart({ data, userAnswer }) {
  if (!data || Object.keys(data).length === 0) return null

  const entries = Object.entries(data)
  const maxVal = Math.max(...entries.map(([, v]) => v), 1)

  return (
    <div className="flex flex-col gap-5 w-full">
      {entries.map(([label, value], idx) => {
        const isUser = label === userAnswer
        const pct = Math.round(value)

        return (
          <div key={label} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span
                className="text-sm font-bold tracking-wide"
                style={{ color: isUser ? '#fff' : 'rgba(255,255,255,0.55)' }}
              >
                {label}
              </span>
              <motion.span
                className="text-2xl font-black tabular-nums"
                style={{ color: isUser ? '#e53935' : 'rgba(255,255,255,0.35)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
              >
                {pct}%
              </motion.span>
            </div>

            <div
              className="h-3.5 rounded-full overflow-hidden relative"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: isUser
                    ? 'linear-gradient(90deg, #c62828, #e53935)'
                    : 'rgba(255,255,255,0.12)',
                  boxShadow: isUser ? '0 0 16px rgba(229,57,53,0.45)' : 'none',
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
