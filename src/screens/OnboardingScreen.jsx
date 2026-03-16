import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSession } from '../hooks/useSession'

const ROLES = [
  'CMO',
  'CEO',
  'Head of Marketing',
  'Head of Trust & Safety',
  'Procurement',
  'Vendor / Partner',
  'Other',
]

export default function OnboardingScreen() {
  const { setPlayerInfo, navigate } = useSession()
  const [form, setForm] = useState({ name: '', company: '', role: '', consent: false })

  const canContinue = form.consent

  function handleContinue() {
    if (!canContinue) return
    setPlayerInfo({
      name: form.name || '',
      company: form.company || '',
      role: form.role || 'Not specified',
      consent: form.consent,
    })
    navigate('gameSelect')
  }

  return (
    <motion.div
      className="relative w-full h-full flex flex-col items-center justify-center px-8 bg-[#080820]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary-900/20 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-xl">
        <h1
          className="text-white font-bold mb-2 leading-tight"
          style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)' }}
        >
          Tell us who you are
        </h1>
        <p className="text-white/50 mb-10" style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)' }}>
          in the Trust &amp; Safety ecosystem
        </p>

        <div className="flex flex-col gap-5">
          <div>
            <label className="text-white/60 text-sm mb-1 block">Name <span className="text-white/30">(optional)</span></label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Your name"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-white/30 text-lg focus:outline-none focus:border-primary-500 transition"
            />
          </div>

          <div>
            <label className="text-white/60 text-sm mb-1 block">Company <span className="text-white/30">(optional)</span></label>
            <input
              type="text"
              value={form.company}
              onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
              placeholder="Your company"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white placeholder-white/30 text-lg focus:outline-none focus:border-primary-500 transition"
            />
          </div>

          <div>
            <label className="text-white/60 text-sm mb-1 block">Role</label>
            <select
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white text-lg focus:outline-none focus:border-primary-500 transition appearance-none"
              style={{ userSelect: 'auto' }}
            >
              <option value="" className="bg-[#0d0f50]">Select your role...</option>
              {ROLES.map(r => (
                <option key={r} value={r} className="bg-[#0d0f50]">{r}</option>
              ))}
            </select>
          </div>

          <label className="flex items-start gap-4 cursor-pointer mt-2">
            <div
              onPointerDown={() => setForm(f => ({ ...f, consent: !f.consent }))}
              className={`mt-0.5 w-7 h-7 rounded-lg border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                form.consent ? 'bg-primary-600 border-primary-500' : 'bg-white/5 border-white/20'
              }`}
            >
              {form.consent && (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-white/60 text-sm leading-relaxed">
              I consent to my responses and optional contact details being used by Sutherland for follow-up and research purposes.
              <span className="text-red-400 ml-1">*</span>
            </span>
          </label>
        </div>

        <motion.button
          onPointerDown={handleContinue}
          disabled={!canContinue}
          className={`w-full mt-10 py-5 rounded-2xl text-xl font-bold transition-all ${
            canContinue
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/40 active:bg-primary-700'
              : 'bg-white/5 text-white/30 cursor-not-allowed'
          }`}
          whileTap={canContinue ? { scale: 0.98 } : {}}
        >
          Continue
        </motion.button>
      </div>
    </motion.div>
  )
}
