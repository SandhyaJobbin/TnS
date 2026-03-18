import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSession } from '../hooks/useSession'

const ROLES = [
  'C-Level Executive',
  'Head of T&S',
  'Partner',
  'Policy Manager',
  'Operations Lead',
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
      <header className="relative z-10 flex-shrink-0 flex items-center justify-between px-4 md:px-6 py-2 md:py-3 lg:px-10"
        style={{ borderBottom: '1px solid rgba(255,0,60,0.1)', background: 'rgba(2,11,24,0.3)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-3">
          <img src={`${import.meta.env.BASE_URL}sutherland-logo.png`} alt="Sutherland" className="h-8 w-auto object-contain" />
          <div>
            <h2 className="text-slate-100 text-base font-bold leading-tight tracking-tight">Trust &amp; Safety Summit</h2>
            <p className="text-slate-400 font-semibold uppercase tracking-widest" style={{ fontSize: '9px' }}>Identity Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-slate-500 font-bold uppercase tracking-widest" style={{ fontSize: '9px' }}>Kiosk Station</p>
            <p className="text-slate-100 text-sm font-medium">TX-Alpha-09</p>
          </div>
          <div className="p-0.5 rounded-full" style={{ background: 'rgba(255,0,60,0.2)', border: '1px solid rgba(255,0,60,0.3)' }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(2,11,24,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.5)" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </div>
      </header>

      {/* Main content — upper 60% to avoid virtual keyboard overlap */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-start pt-2 md:pt-4 px-4 md:px-6 pb-4 min-h-0 overflow-y-auto">

        {/* Title */}
        <motion.div
          className="w-full max-w-2xl text-center mb-2 md:mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-slate-100 font-black leading-tight tracking-tight" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 3rem)' }}>
            Tell us who you are in the{' '}
            <span style={{ color: '#FF003C' }}>T&amp;S Ecosystem</span>
          </h1>
        </motion.div>

        {/* Form card — dark navy, not purple */}
        <motion.div
          className="w-full max-w-xl rounded-2xl p-3 md:p-6 lg:p-8 relative overflow-hidden"
          style={{
            background: 'rgba(10,25,47,0.85)',
            border: '1px solid rgba(255,0,60,0.15)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(20px)',
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Internal card glow */}
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full pointer-events-none" style={{ background: 'rgba(255,0,60,0.08)', filter: 'blur(40px)' }} />

          <div className="relative z-10 flex flex-col gap-3 md:gap-4">

            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-300 font-bold tracking-[0.2em] uppercase text-[11px] md:text-xs">Full Name</label>
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="rgba(255,0,60,0.6)" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Enter your name"
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-slate-100 outline-none transition-all placeholder:text-slate-600 text-sm"
                  style={{ background: 'rgba(2,11,24,0.5)', border: '1px solid rgba(255,0,60,0.2)' }}
                />
              </div>
            </div>

            {/* Company */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-300 font-bold tracking-[0.2em] uppercase text-[11px] md:text-xs">Company</label>
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="rgba(255,0,60,0.6)" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <input
                  type="text"
                  value={form.company}
                  onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                  placeholder="Enter company name"
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-slate-100 outline-none transition-all placeholder:text-slate-600 text-sm"
                  style={{ background: 'rgba(2,11,24,0.5)', border: '1px solid rgba(255,0,60,0.2)' }}
                />
              </div>
            </div>

            {/* Role */}
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-300 font-bold tracking-[0.2em] uppercase text-[11px] md:text-xs">Role</label>
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="rgba(255,0,60,0.6)" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <select
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  className="w-full pl-11 pr-10 py-3 rounded-xl outline-none transition-all appearance-none cursor-pointer text-sm"
                  style={{
                    background: 'rgba(2,11,24,0.5)',
                    border: '1px solid rgba(255,0,60,0.2)',
                    color: form.role ? 'rgb(226,232,240)' : 'rgb(71,85,105)',
                  }}
                >
                  <option value="" disabled style={{ background: '#020B18' }}>Select your role</option>
                  {ROLES.map(r => (
                    <option key={r} value={r} style={{ background: '#020B18', color: 'white' }}>{r}</option>
                  ))}
                </select>
                <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="rgba(255,0,60,0.4)" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Consent */}
            <label className="flex items-start gap-3 cursor-pointer group mt-1">
              <div className="flex-shrink-0 mt-0.5 -m-2 p-2">
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
              <span className="text-slate-400 text-base leading-relaxed group-hover:text-slate-300 transition-colors">
                I consent to my responses being used by{' '}
                <span style={{ color: '#FF003C' }} className="font-semibold">Sutherland</span>{' '}
                for summit coordination and follow-up.
              </span>
            </label>

            {/* Continue button */}
            <motion.button
              onPointerDown={handleContinue}
              disabled={!canContinue}
              className="w-full mt-2 py-3.5 rounded-xl text-white font-black text-base uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all"
              style={canContinue ? {
                background: '#FF003C',
                boxShadow: '0 0 20px rgba(255,0,60,0.3)',
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

        {/* Footer badges */}
        <motion.div
          className="mt-3 md:mt-6 hidden md:flex flex-wrap justify-center gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="#FF003C" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-white font-bold uppercase tracking-[0.2em]" style={{ fontSize: '10px' }}>Secure Entry Protocol</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="#FF003C" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-white font-bold uppercase tracking-[0.2em]" style={{ fontSize: '10px' }}>Verified Attendee Access</span>
          </div>
        </motion.div>
      </main>
    </motion.div>
  )
}
