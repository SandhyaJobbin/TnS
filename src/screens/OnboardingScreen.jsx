import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSession } from '../hooks/useSession'
import { writeSession, addToSyncQueue } from '../hooks/useIndexedDB'
import { processSyncQueue } from '../utils/api'

const ROLES = [
  'Trust and Safety OPS',
  'Trust and Safety Wellness',
  'Risk & Compliance / Legal',
  'Public Policy / Government Relations',
  'Policy / Public Policy',
  'Product / Engineering',
  'Safety Technology Vendor',
  'Research / Academia',
  'Regulator / Government',
  'Other',
]

const INDUSTRIES = [
  'Social Media',
  'Gaming',
  'eCommerce / Marketplaces',
  'AI / Generative AI',
  'Dating',
  'Review Platform / Online Community',
  'Fintech / Payments',
  'Cloud / Infrastructure',
  'Consulting / Vendor',
  'Other',
]

const selectStyle = {
  background: 'rgba(2,11,24,0.5)',
  border: '1px solid rgba(255,0,60,0.2)',
  color: 'rgb(226,232,240)',
}

const selectStyleEmpty = {
  background: 'rgba(2,11,24,0.5)',
  border: '1px solid rgba(255,0,60,0.2)',
  color: 'rgb(71,85,105)',
}

// Format digits into international phone: CC-NNN-NNN-NNNN
function formatPhone(raw) {
  // Strip leading + and all non-digits
  const digits = raw.replace(/^\+/, '').replace(/\D/g, '')
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  // 11+ digits: treat leading digits as country code, then 3-3-4
  const cc = digits.slice(0, digits.length - 10)
  const rest = digits.slice(digits.length - 10)
  return `${cc}-${rest.slice(0, 3)}-${rest.slice(3, 6)}-${rest.slice(6)}`
}

export default function OnboardingScreen() {
  const { sessionId, setPlayerInfo, navigate } = useSession()
  const [form, setForm] = useState({ name: '', company: '', role: '', industry: '', email: '', phone: '', consent: false })

  const canContinue = form.consent

  async function handleContinue() {
    if (!canContinue) return
    const playerInfo = {
      name:     form.name.trim().slice(0, 100),
      company:  form.company.trim().slice(0, 150),
      role:     form.role || '',
      industry: form.industry || '',
      email:    form.email.trim().slice(0, 254),
      phone:    form.phone.trim() ? `+${form.phone.trim()}`.slice(0, 30) : '',
      consent:  form.consent,
    }
    setPlayerInfo(playerInfo)

    // Save a partial session immediately so lead details aren't lost if user walks away
    const partialRecord = {
      sessionId,
      timestamp: Date.now(),
      game_played: null,
      playerInfo,
      answers: {},
      questionIds: [],
      partial: true,
    }
    await writeSession(partialRecord)
    await addToSyncQueue(partialRecord)
    processSyncQueue()

    navigate('gameSelect')
  }

  return (
    <motion.div
      className="relative w-full h-full flex flex-col overflow-hidden"
      style={{ background: '#020B18' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      {/* Background decor */}
      <div className="absolute inset-0 data-grid opacity-30 pointer-events-none" />
      <div className="absolute -top-[15%] -left-[10%] w-1/2 h-1/2 rounded-full pointer-events-none" style={{ background: 'rgba(255,0,60,0.10)', filter: 'blur(140px)' }} />
      <div className="absolute -bottom-[10%] -right-[5%] w-[45%] h-[45%] rounded-full pointer-events-none" style={{ background: 'rgba(255,0,60,0.05)', filter: 'blur(120px)' }} />
      <div className="scan-line" />

      {/* Header */}
      <header
        className="relative z-10 flex-shrink-0 flex items-center justify-between px-4 md:px-6 py-2 md:py-3 lg:px-10"
        style={{ borderBottom: '1px solid rgba(255,0,60,0.1)', background: 'rgba(2,11,24,0.3)', backdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-center gap-3">
          <button onPointerDown={() => navigate('gameSelect')} className="opacity-90 active:opacity-60 transition-opacity" aria-label="Home">
            <img src={`${import.meta.env.BASE_URL}sutherland-logo.png`} alt="Sutherland" className="h-8 w-auto object-contain" />
          </button>
          <div>
            <h2 className="text-slate-100 text-base font-bold leading-tight tracking-tight">Trust &amp; Safety Summit</h2>
            <p className="text-slate-400 font-semibold uppercase tracking-widest" style={{ fontSize: '9px' }}>About You</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-slate-500 font-bold uppercase tracking-widest" style={{ fontSize: '9px' }}>Kiosk Station</p>
            <p className="text-slate-100 text-sm font-medium">{import.meta.env.VITE_STATION_ID || 'Booth-07'}</p>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-start px-4 md:px-8 lg:px-12 py-4 md:py-6 min-h-0 overflow-y-auto">

        {/* Title */}
        <motion.div
          className="w-full max-w-3xl text-center mb-4 md:mb-6 shrink-0"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-slate-100 font-black leading-tight tracking-tight" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.6rem)' }}>
            Tell us who you are in the{' '}
            <span style={{ color: '#FF003C' }}>T&amp;S Ecosystem</span>
          </h1>
        </motion.div>

        {/* Form card */}
        <motion.div
          className="w-full max-w-3xl rounded-2xl p-4 md:p-7 lg:p-9 relative overflow-hidden shrink-0"
          style={{
            background: 'rgba(10,25,47,0.85)',
            border: '1px solid rgba(255,0,60,0.15)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(20px)',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          {/* Card glow */}
          <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full pointer-events-none" style={{ background: 'rgba(255,0,60,0.07)', filter: 'blur(48px)' }} />

          <div className="relative z-10 flex flex-col gap-5">

            {/* Row 1: Name + Company */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="flex flex-col gap-2">
                <label className="text-slate-400 font-black tracking-[0.18em] uppercase text-[10px]">Full Name</label>
                <div className="relative">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="rgba(255,0,60,0.5)" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Enter your name"
                    maxLength={100}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-slate-100 outline-none transition-all placeholder:text-slate-600 text-sm"
                    style={{ background: 'rgba(2,11,24,0.5)', border: '1px solid rgba(255,0,60,0.2)' }}
                  />
                </div>
              </div>

              {/* Company */}
              <div className="flex flex-col gap-2">
                <label className="text-slate-400 font-black tracking-[0.18em] uppercase text-[10px]">Company</label>
                <div className="relative">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="rgba(255,0,60,0.5)" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <input
                    type="text"
                    value={form.company}
                    onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                    placeholder="Enter company name"
                    maxLength={150}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-slate-100 outline-none transition-all placeholder:text-slate-600 text-sm"
                    style={{ background: 'rgba(2,11,24,0.5)', border: '1px solid rgba(255,0,60,0.2)' }}
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px w-full" style={{ background: 'rgba(255,255,255,0.06)' }} />

            {/* Row 2: Role + Industry */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Role */}
              <div className="flex flex-col gap-2">
                <label className="text-slate-400 font-black tracking-[0.18em] uppercase text-[10px]">Your Role in the Ecosystem</label>
                <div className="relative">
                  <select
                    value={form.role}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    className="w-full px-4 py-4 rounded-xl text-base outline-none appearance-none cursor-pointer transition-colors"
                    style={form.role ? selectStyle : selectStyleEmpty}
                  >
                    <option value="" style={{ background: '#020B18', color: 'rgba(255,255,255,0.4)' }}>Select your role</option>
                    {ROLES.map(r => (
                      <option key={r} value={r} style={{ background: '#020B18', color: 'white' }}>{r}</option>
                    ))}
                  </select>
                  <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="rgba(255,0,60,0.5)" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Industry */}
              <div className="flex flex-col gap-2">
                <label className="text-slate-400 font-black tracking-[0.18em] uppercase text-[10px]">Your Industry</label>
                <div className="relative">
                  <select
                    value={form.industry}
                    onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}
                    className="w-full px-4 py-4 rounded-xl text-base outline-none appearance-none cursor-pointer transition-colors"
                    style={form.industry ? selectStyle : selectStyleEmpty}
                  >
                    <option value="" style={{ background: '#020B18', color: 'rgba(255,255,255,0.4)' }}>Select your industry</option>
                    {INDUSTRIES.map(ind => (
                      <option key={ind} value={ind} style={{ background: '#020B18', color: 'white' }}>{ind}</option>
                    ))}
                  </select>
                  <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="rgba(255,0,60,0.5)" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px w-full" style={{ background: 'rgba(255,255,255,0.06)' }} />

            {/* Row 3: Email + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email */}
              <div className="flex flex-col gap-2">
                <label className="text-slate-400 font-black tracking-[0.18em] uppercase text-[10px]">Email Address</label>
                <div className="relative">
                  <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="rgba(255,0,60,0.5)" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="your@email.com"
                    maxLength={254}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-slate-100 outline-none transition-all placeholder:text-slate-600 text-sm"
                    style={{ background: 'rgba(2,11,24,0.5)', border: '1px solid rgba(255,0,60,0.2)' }}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-2">
                <label className="text-slate-400 font-black tracking-[0.18em] uppercase text-[10px]">Phone Number</label>
                <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,0,60,0.2)' }}>
                  {/* + prefix badge */}
                  <div
                    className="flex items-center justify-center px-3 flex-shrink-0 text-sm font-bold select-none"
                    style={{ background: 'rgba(255,0,60,0.12)', color: 'rgba(255,0,60,0.8)', borderRight: '1px solid rgba(255,0,60,0.2)' }}
                  >
                    +
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: formatPhone(e.target.value) }))}
                    placeholder="1-555-123-4567"
                    maxLength={20}
                    className="flex-1 px-3 py-3 text-slate-100 outline-none text-sm"
                    style={{ background: 'rgba(2,11,24,0.5)' }}
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px w-full" style={{ background: 'rgba(255,255,255,0.06)' }} />

            {/* Consent */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="flex-shrink-0 mt-0.5">
                <div className="relative w-6 h-6">
                  <input
                    type="checkbox"
                    checked={form.consent}
                    onChange={e => setForm(f => ({ ...f, consent: e.target.checked }))}
                    className="w-6 h-6 rounded cursor-pointer outline-none appearance-none transition-all"
                    style={{
                      background: form.consent ? '#FF003C' : 'rgba(2,11,24,0.5)',
                      border: `1px solid ${form.consent ? '#FF003C' : 'rgba(255,0,60,0.3)'}`,
                      boxShadow: form.consent ? '0 0 10px rgba(255,0,60,0.4)' : 'none',
                    }}
                  />
                  {form.consent && (
                    <svg className="absolute inset-0 w-6 h-6 text-white pointer-events-none p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors">
                I consent to my responses being used by{' '}
                <span style={{ color: '#FF003C' }} className="font-semibold">Sutherland</span>{' '}
                for summit coordination and follow-up.
              </span>
            </label>

            {/* CTA */}
            <motion.button
              onPointerDown={handleContinue}
              disabled={!canContinue}
              className="w-full py-3.5 rounded-xl text-white font-black text-base uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all"
              style={canContinue ? {
                background: '#FF003C',
                boxShadow: '0 0 24px rgba(255,0,60,0.35)',
                border: '1px solid rgba(255,255,255,0.1)',
              } : {
                background: 'rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
              whileHover={canContinue ? { scale: 1.02 } : {}}
              whileTap={canContinue ? { scale: 0.98 } : {}}
            >
              Continue
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </motion.button>

          </div>
        </motion.div>

      </main>
    </motion.div>
  )
}
