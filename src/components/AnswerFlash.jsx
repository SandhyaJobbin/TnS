import { motion, AnimatePresence } from 'framer-motion'

export default function AnswerFlash({ show, correct }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-50"
          style={{ backgroundColor: correct ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </AnimatePresence>
  )
}
