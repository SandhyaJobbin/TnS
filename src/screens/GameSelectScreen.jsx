import { motion } from 'framer-motion'
import { useSession } from '../hooks/useSession'
import { shuffle } from '../utils/scoring'
import trust2030Questions from '../data/trust2030_questions.json'
import lostInContextQuestions from '../data/lost_in_context_questions.json'

const GAMES = [
  {
    id: 'trust2030',
    title: 'Trust & Safety 2030',
    subtitle: 'Predict the future',
    description: 'Answer 8 questions about where Trust & Safety is headed. See how your predictions compare to industry leaders.',
    icon: '🔮',
    color: 'from-primary-500 to-primary-800',
    glow: 'shadow-primary-900/50',
  },
  {
    id: 'lostInContext',
    title: 'Lost in Context',
    subtitle: 'Where AI moderation gets confused',
    description: 'Decode internet slang that trips up AI moderation systems. Can you outperform the algorithm?',
    icon: '🤖',
    color: 'from-accent-600 to-accent-800',
    glow: 'shadow-accent-900/50',
  },
]

export default function GameSelectScreen() {
  const { selectGame } = useSession()

  function handleSelect(gameId) {
    const questions = gameId === 'trust2030'
      ? shuffle(trust2030Questions)
      : shuffle(lostInContextQuestions)
    selectGame(gameId, questions)
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
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-primary-900/20 blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-primary-900/15 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-3xl">
        <h1
          className="text-white font-bold text-center mb-2"
          style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}
        >
          Choose your challenge
        </h1>
        <p className="text-white/40 text-center mb-12" style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)' }}>
          Pick a game to explore the future of Trust &amp; Safety
        </p>

        <div className="flex flex-col gap-6 @md:flex-row">
          {GAMES.map((game, i) => (
            <motion.button
              key={game.id}
              onPointerDown={() => handleSelect(game.id)}
              className={`flex-1 p-8 rounded-3xl bg-gradient-to-br ${game.color} shadow-2xl ${game.glow} text-left border border-white/10 active:scale-95`}
              initial={{ opacity: 0, x: i === 0 ? -30 : 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 + 0.2, duration: 0.4 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="text-5xl mb-4">{game.icon}</div>
              <h2 className="text-white font-bold mb-1" style={{ fontSize: 'clamp(1.2rem, 2vw, 1.6rem)' }}>
                {game.title}
              </h2>
              <p className="text-white/70 text-sm font-medium mb-3">{game.subtitle}</p>
              <p className="text-white/50 text-sm leading-relaxed">{game.description}</p>
              <div className="mt-6 flex items-center gap-2 text-white font-semibold">
                Play now
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
