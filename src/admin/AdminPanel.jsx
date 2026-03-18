import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from '../hooks/useSession'
import {
  getAllSessions,
  getSyncQueue,
  getLogs,
  clearAllSessions,
  clearAllPollAggregates,
  clearSyncQueue,
  storeMediaBlob,
  getAllPollAggregates,
} from '../hooks/useIndexedDB'
import { processSyncQueue } from '../utils/api'
import trust2030Questions from '../data/trust2030_questions.json'
import licQuestions from '../data/lost_in_context_questions.json'

// ── helpers ──────────────────────────────────────────────────────────────────

function timeAgo(ts) {
  const diff = Date.now() - ts
  if (diff < 60_000) return 'Just now'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  return `${Math.floor(diff / 86_400_000)}d ago`
}

function shortId(sessionId, index) {
  if (!sessionId) return `#KS-${String(index + 1).padStart(4, '0')}`
  const num = parseInt(sessionId.replace(/-/g, '').slice(-4), 16) % 10000
  return `#KS-${String(num).padStart(4, '0')}`
}

function computeTrend(sessions, field) {
  const now = Date.now()
  const DAY = 86_400_000
  const today = sessions.filter(s => now - s.timestamp < DAY)
  const yesterday = sessions.filter(s => now - s.timestamp >= DAY && now - s.timestamp < 2 * DAY)
  const todayVal = field === 'leads'
    ? today.filter(s => s.playerInfo?.email).length
    : today.length
  const yestVal = field === 'leads'
    ? yesterday.filter(s => s.playerInfo?.email).length
    : yesterday.length
  if (yestVal === 0) return null
  const pct = Math.round(((todayVal - yestVal) / yestVal) * 100)
  return pct
}

function sessionResult(s) {
  if (!s.game_played) return '—'
  if (s.game_played === 'trust2030') return 'Trust 2030'
  if (s.game_played === 'lostInContext') return 'Lost in Context'
  return s.game_played
}

function sessionStatus(s) {
  return s.playerInfo?.email ? 'captured' : 'completed'
}

function computeSurveyStats(questionId, options, aggregates) {
  const liveRecord = aggregates.find(r => r.questionId === questionId)
  const liveOptions = liveRecord?.options || {}
  const liveTotal = Object.values(liveOptions).reduce((s, v) => s + v, 0)
  if (liveTotal === 0) return options.map(opt => ({ option: opt, pct: 0, kioskCount: 0 }))
  return options.map(opt => ({
    option: opt,
    pct: ((liveOptions[opt] || 0) / liveTotal) * 100,
    kioskCount: liveOptions[opt] || 0,
  }))
}

// ── sub-components ────────────────────────────────────────────────────────────

function SurveyQuestionCard({ questionId, title, options, correctOption, pollAggregates, cardStyle }) {
  const stats = computeSurveyStats(questionId, options, pollAggregates)
  const maxPct = Math.max(...stats.map(s => s.pct), 1)
  const totalKioskVotes = stats.reduce((s, v) => s + v.kioskCount, 0)
  return (
    <div className="rounded-2xl p-5" style={cardStyle}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="text-xs font-medium leading-snug flex-1" style={{ color: 'rgba(255,255,255,0.7)' }}>{title}</p>
        <span className="text-[9px] font-mono shrink-0 mt-0.5" style={{ color: 'rgba(255,0,60,0.5)' }}>{questionId.toUpperCase()}</span>
      </div>
      <div className="space-y-2">
        {stats.map(({ option, pct, kioskCount }) => {
          const isCorrect = correctOption && option === correctOption
          const isLeading = pct > 0 && pct === Math.max(...stats.map(s => s.pct))
          return (
            <div key={option}>
              <div className="flex justify-between text-[11px] mb-0.5 gap-1">
                <span className="leading-snug" style={{ color: isCorrect ? 'rgb(52,211,153)' : 'rgba(255,255,255,0.55)' }}>
                  {isCorrect && '✓ '}{option}
                </span>
                <span className="font-mono shrink-0" style={{ color: isCorrect ? 'rgb(52,211,153)' : 'rgba(255,255,255,0.35)' }}>
                  {pct.toFixed(1)}%{' '}
                  <span style={{ color: 'rgba(255,255,255,0.2)' }}>({kioskCount})</span>
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(pct / maxPct) * 100}%`,
                    background: isCorrect ? 'rgb(52,211,153)' : isLeading ? '#FF003C' : 'rgba(255,255,255,0.18)',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
      {totalKioskVotes === 0 && (
        <p className="text-[10px] mt-3" style={{ color: 'rgba(255,255,255,0.18)' }}>No kiosk votes yet</p>
      )}
    </div>
  )
}

function StatCard({ label, value, icon, trend, valueColor }) {
  const up = trend !== null && trend >= 0
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-2"
      style={{
        background: 'rgba(10,25,47,0.7)',
        border: '1px solid rgba(255,0,60,0.15)',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-widest font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</span>
        <span className="text-xl opacity-50">{icon}</span>
      </div>
      <div className="flex items-end gap-3">
        <span className={`text-3xl font-bold leading-none ${valueColor || 'text-white'}`}>{value}</span>
        {trend !== null && (
          <span className={`text-xs font-semibold pb-0.5 ${up ? 'text-emerald-400' : 'text-red-400'}`}>
            {up ? '↑' : '↓'}{Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    captured: { bg: 'rgba(20,184,166,0.12)', color: 'rgb(94,234,212)', border: 'rgba(20,184,166,0.3)' },
    completed: { bg: 'rgba(255,0,60,0.1)', color: '#FF003C', border: 'rgba(255,0,60,0.3)' },
    abandoned: { bg: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.25)', border: 'rgba(255,255,255,0.08)' },
  }
  const s = map[status] || map.abandoned
  return (
    <span
      className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {status}
    </span>
  )
}

function NavItem({ label, icon, active, onClick }) {
  return (
    <button
      onPointerDown={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
      style={active ? {
        background: 'rgba(255,0,60,0.15)',
        color: '#FF003C',
        border: '1px solid rgba(255,0,60,0.25)',
      } : {
        color: 'rgba(255,255,255,0.4)',
        border: '1px solid transparent',
      }}
    >
      <span className="text-base">{icon}</span>
      {label}
    </button>
  )
}

// ── main component ────────────────────────────────────────────────────────────

export default function AdminPanel() {
  const { exitAdmin, leadCaptureEnabled, setLeadCaptureEnabled } = useSession()
  const [nav, setNav] = useState('dashboard')
  const [sessions, setSessions] = useState([])
  const [logs, setLogs] = useState([])
  const [syncPending, setSyncPending] = useState(0)
  const [lastSync, setLastSync] = useState(null)
  const [resetPhase, setResetPhase] = useState(0)
  const [hardResetPhase, setHardResetPhase] = useState(0)
  const [syncing, setSyncing] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [actionMenu, setActionMenu] = useState(null)
  const [pollAggregates, setPollAggregates] = useState([])

  const loadData = useCallback(async () => {
    const [allSessions, queue, allLogs, aggregates] = await Promise.all([
      getAllSessions(),
      getSyncQueue(),
      getLogs(),
      getAllPollAggregates(),
    ])
    allSessions.sort((a, b) => b.timestamp - a.timestamp)
    setSessions(allSessions)
    setLogs(allLogs.reverse())
    setSyncPending(queue.length)
    setPollAggregates(aggregates)
    const syncLog = allLogs.find(l => l.type === 'sync_success')
    setLastSync(syncLog ? syncLog.timestamp : null)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const totalPlays = sessions.length
  const leadsCount = sessions.filter(s => s.playerInfo?.email).length
  const completionRate = totalPlays === 0 ? 0 : Math.round((leadsCount / totalPlays) * 100)
  const trust2030Count = sessions.filter(s => s.game_played === 'trust2030').length
  const licCount = sessions.filter(s => s.game_played === 'lostInContext').length
  const trendPlays = computeTrend(sessions, 'plays')
  const trendLeads = computeTrend(sessions, 'leads')

  async function handleForceSync() {
    setSyncing(true)
    await processSyncQueue()
    await loadData()
    setSyncing(false)
  }

  async function handleResetPoll() {
    if (resetPhase === 0) { setResetPhase(1); return }
    await clearAllPollAggregates()
    setResetPhase(2)
    await loadData()
    setTimeout(() => setResetPhase(0), 3000)
  }

  async function handleHardReset() {
    if (hardResetPhase === 0) { setHardResetPhase(1); return }
    await clearAllSessions()
    await clearAllPollAggregates()
    await clearSyncQueue()
    setHardResetPhase(2)
    setTimeout(() => window.location.reload(), 1500)
  }

  function downloadCSV() {
    let filtered = sessions
    if (dateFrom) filtered = filtered.filter(s => s.timestamp >= new Date(dateFrom).getTime())
    if (dateTo) filtered = filtered.filter(s => s.timestamp <= new Date(dateTo).getTime() + 86_400_000)
    if (filtered.length === 0) { alert('No sessions match the selected date range.'); return }
    const headers = ['sessionId', 'timestamp', 'game_played', 'name', 'company', 'role', 'email', 'consent', 'status', 'answers']
    const rows = filtered.map(s => [
      s.sessionId,
      new Date(s.timestamp).toISOString(),
      s.game_played,
      s.playerInfo?.name || '',
      s.playerInfo?.company || '',
      s.playerInfo?.role || '',
      s.playerInfo?.email || '',
      s.playerInfo?.consent ? 'yes' : 'no',
      sessionStatus(s),
      JSON.stringify(s.answers),
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kiosk_leads_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleMediaUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    await storeMediaBlob(file.name, file)
    alert(`"${file.name}" stored successfully.`)
  }

  function generateReport() {
    const now = new Date()
    const trust2030Stats = trust2030Questions.map(q => ({
      id: q.id, scenario: q.scenario, dimension: q.dimension,
      stats: computeSurveyStats(q.id, q.options, pollAggregates),
    }))
    const licStats = licQuestions.map(q => ({
      id: q.id, term: q.term, correct: q.correct_human,
      stats: computeSurveyStats(q.id, q.options, pollAggregates),
    }))

    function buildQRows(stats, correctOpt) {
      const maxPct = Math.max(...stats.map(s => s.pct), 1)
      return stats.map(({ option, pct, kioskCount }) => {
        const isCorrect = correctOpt && option === correctOpt
        const isLeading = pct > 0 && pct === maxPct
        const barColor = isCorrect ? '#10b981' : isLeading ? '#dc2626' : '#e5e7eb'
        const labelStyle = isCorrect ? 'color:#059669;font-weight:600' : 'color:#374151'
        return `<div style="margin-bottom:6px">
          <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px">
            <span style="${labelStyle}">${isCorrect ? '✓ ' : ''}${option}</span>
            <span style="color:#6b7280">${pct.toFixed(1)}% <span style="color:#9ca3af">(${kioskCount} votes)</span></span>
          </div>
          <div style="height:6px;background:#f3f4f6;border-radius:99px">
            <div style="height:6px;border-radius:99px;width:${(pct / maxPct) * 100}%;background:${barColor}"></div>
          </div>
        </div>`
      }).join('')
    }

    const t2030Sections = trust2030Stats.map(q => `
      <div style="background:white;border-radius:10px;padding:16px;margin-bottom:12px;box-shadow:0 1px 4px rgba(0,0,0,0.06)">
        <div style="font-size:10px;font-family:monospace;color:#dc2626;margin-bottom:4px">${q.id.toUpperCase()}</div>
        <span style="display:inline-block;font-size:10px;background:#fef2f2;color:#dc2626;padding:2px 8px;border-radius:99px;font-weight:600;margin-bottom:6px">${q.dimension}</span>
        <div style="font-size:13px;color:#374151;margin-bottom:10px;line-height:1.4">${q.scenario}</div>
        ${buildQRows(q.stats, null)}
      </div>`).join('')

    const licSections = licStats.map(q => `
      <div style="background:white;border-radius:10px;padding:16px;margin-bottom:12px;box-shadow:0 1px 4px rgba(0,0,0,0.06)">
        <div style="font-size:10px;font-family:monospace;color:#dc2626;margin-bottom:4px">${q.id.toUpperCase()}</div>
        <div style="font-size:13px;color:#374151;margin-bottom:10px">Term: <strong>${q.term}</strong> &nbsp;|&nbsp; Correct: <span style="color:#059669">${q.correct}</span></div>
        ${buildQRows(q.stats, q.correct)}
      </div>`).join('')

    const html = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/>
<title>Kiosk Report — ${now.toLocaleDateString()}</title>
<style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9fafb;color:#111;margin:0;padding:40px}h1{font-size:24px;font-weight:700;margin-bottom:4px}h2{font-size:14px;font-weight:600;color:#dc2626;margin:28px 0 12px;text-transform:uppercase;letter-spacing:.05em}.meta{font-size:13px;color:#6b7280;margin-bottom:28px}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:28px}.card{background:white;border-radius:10px;padding:14px;box-shadow:0 1px 4px rgba(0,0,0,.08)}.lbl{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#9ca3af;margin-bottom:3px}.val{font-size:26px;font-weight:700}hr{border:none;border-top:1px solid #e5e7eb;margin:24px 0}@media print{body{padding:20px}}</style>
</head><body>
<h1>Trust &amp; Safety Kiosk — Analytics Report</h1>
<p class="meta">Generated: ${now.toLocaleString()} &nbsp;|&nbsp; Sessions: ${totalPlays} &nbsp;|&nbsp; Leads: ${leadsCount} &nbsp;|&nbsp; Completion: ${completionRate}%</p>
<div class="grid">
  <div class="card"><div class="lbl">Total Plays</div><div class="val">${totalPlays}</div></div>
  <div class="card"><div class="lbl">Leads Captured</div><div class="val">${leadsCount}</div></div>
  <div class="card"><div class="lbl">Trust 2030 Plays</div><div class="val">${trust2030Count}</div></div>
  <div class="card"><div class="lbl">Lost in Context Plays</div><div class="val">${licCount}</div></div>
</div>
<hr/>
<h2>Trust 2030 — Survey Results</h2>${t2030Sections}
<hr/>
<h2>Lost in Context — Answer Distribution</h2>${licSections}
</body></html>`

    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kiosk_report_${now.toISOString().slice(0, 10)}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── card style ───────────────────────────────────────────────────────────────

  const cardStyle = {
    background: 'rgba(10,25,47,0.7)',
    border: '1px solid rgba(255,0,60,0.15)',
    backdropFilter: 'blur(16px)',
    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
  }

  // ── sidebar ──────────────────────────────────────────────────────────────────

  const sidebar = (
    <div
      className="w-56 flex-shrink-0 flex flex-col h-full"
      style={{ background: 'rgba(2,11,24,0.9)', borderRight: '1px solid rgba(255,0,60,0.1)' }}
    >
      {/* logo */}
      <div className="px-5 py-5" style={{ borderBottom: '1px solid rgba(255,0,60,0.1)' }}>
        <div className="flex items-center gap-2.5">
          <img src={`${import.meta.env.BASE_URL}sutherland-logo.png`} alt="Sutherland" className="h-6 w-auto object-contain" />
        </div>
        <p className="text-white/30 font-bold uppercase tracking-widest mt-1" style={{ fontSize: '9px' }}>Admin Panel</p>
      </div>

      {/* nav */}
      <div className="px-3 py-4 flex-1 flex flex-col gap-1">
        <p className="text-[10px] uppercase tracking-widest px-1 mb-2" style={{ color: 'rgba(255,0,60,0.4)' }}>Navigation</p>
        <NavItem label="Dashboard" icon="⊞" active={nav === 'dashboard'} onClick={() => setNav('dashboard')} />
        <NavItem label="Analytics" icon="⬡" active={nav === 'analytics'} onClick={() => setNav('analytics')} />
        <NavItem label="Leads" icon="◷" active={nav === 'leads'} onClick={() => setNav('leads')} />
        <NavItem label="Kiosk Logs" icon="▤" active={nav === 'logs'} onClick={() => setNav('logs')} />
        <NavItem label="Media" icon="⬡" active={nav === 'media'} onClick={() => setNav('media')} />

        <p className="text-[10px] uppercase tracking-widest px-1 mt-5 mb-2" style={{ color: 'rgba(255,0,60,0.4)' }}>Controls</p>
        <button
          onPointerDown={exitAdmin}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <span className="text-base">▶</span> Toggle Attract
        </button>
        <button
          onPointerDown={handleResetPoll}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all mt-1"
          style={
            resetPhase === 1
              ? { background: 'rgba(255,0,60,0.25)', border: '1px solid rgba(255,0,60,0.4)', color: '#FF003C' }
              : resetPhase === 2
              ? { background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: 'rgb(52,211,153)' }
              : { color: 'rgba(255,0,60,0.6)', background: 'rgba(255,0,60,0.08)', border: '1px solid rgba(255,0,60,0.15)' }
          }
        >
          <span className="text-base">↺</span>
          {resetPhase === 0 && 'Reset Poll Data'}
          {resetPhase === 1 && 'Confirm Reset?'}
          {resetPhase === 2 && '✓ Poll Cleared'}
        </button>
      </div>

      {/* system status */}
      <div className="px-4 py-4" style={{ borderTop: '1px solid rgba(255,0,60,0.1)' }}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 6px rgba(52,211,153,0.6)' }} />
          <span className="text-[11px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>System Online</span>
        </div>
        <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>v2.5.0 Stable</p>
        <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
          {lastSync ? `Last sync: ${timeAgo(lastSync)}` : `Sync pending: ${syncPending}`}
        </p>
      </div>
    </div>
  )

  // ── dashboard view ────────────────────────────────────────────────────────────

  const dashboardView = (
    <div className="flex-1 overflow-y-auto">
      <div
        className="flex items-center justify-between px-8 py-5"
        style={{ borderBottom: '1px solid rgba(255,0,60,0.1)', background: 'rgba(2,11,24,0.3)', backdropFilter: 'blur(12px)' }}
      >
        <div>
          <h1 className="text-xl font-bold text-white">Kiosk Performance Overview</h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Real-time engagement metrics and capture data.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onPointerDown={loadData}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
          >
            ↺ Refresh
          </button>
          <button
            onPointerDown={downloadCSV}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-white text-sm font-semibold transition-all active:scale-95"
            style={{ background: '#FF003C', boxShadow: '0 0 16px rgba(255,0,60,0.3)' }}
          >
            ↓ Download CSV
          </button>
          <button
            onPointerDown={exitAdmin}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
          >
            Exit ✕
          </button>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <StatCard label="Total Plays" value={totalPlays.toLocaleString()} icon="👆" trend={trendPlays} valueColor="text-white" />
          <StatCard label="Leads Captured" value={leadsCount.toLocaleString()} icon="👤" trend={trendLeads} valueColor="text-white" />
          <StatCard label="Trust 2030" value={trust2030Count.toLocaleString()} icon="🕐" trend={null} valueColor="text-[#FF003C]" />
          <StatCard label="Completion Rate" value={`${completionRate}%`} icon="✓" trend={null} valueColor="text-emerald-400" />
        </div>

        {/* recent entries */}
        <div className="rounded-2xl overflow-hidden" style={cardStyle}>
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: '1px solid rgba(255,0,60,0.1)' }}
          >
            <h2 className="font-semibold text-white text-sm">Recent Kiosk Entries</h2>
            <button
              onPointerDown={() => setNav('leads')}
              className="text-xs px-3 py-1.5 rounded-lg transition-all"
              style={{ color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              View All
            </button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,0,60,0.08)' }}>
                {['TIMESTAMP', 'USER ID', 'EMAIL', 'RESULT', 'STATUS', 'ACTIONS'].map(h => (
                  <th key={h} className="text-left text-[10px] uppercase tracking-widest font-medium px-6 py-3" style={{ color: 'rgba(255,255,255,0.25)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sessions.slice(0, 8).map((s, i) => {
                const status = sessionStatus(s)
                return (
                  <tr key={s.sessionId} className="transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td className="px-6 py-3.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{timeAgo(s.timestamp)}</td>
                    <td className="px-6 py-3.5">
                      <span className="font-mono text-xs" style={{ color: '#FF003C' }}>{shortId(s.sessionId, i)}</span>
                    </td>
                    <td className="px-6 py-3.5" style={{ color: 'rgba(255,255,255,0.55)' }}>{s.playerInfo?.email || '—'}</td>
                    <td className="px-6 py-3.5" style={{ color: 'rgba(255,255,255,0.65)' }}>{sessionResult(s)}</td>
                    <td className="px-6 py-3.5"><StatusBadge status={status} /></td>
                    <td className="px-6 py-3.5">
                      <div className="relative">
                        <button
                          onPointerDown={() => setActionMenu(actionMenu === s.sessionId ? null : s.sessionId)}
                          className="px-2 py-1 rounded-lg transition-all"
                          style={{ color: 'rgba(255,255,255,0.3)' }}
                        >
                          ⋮
                        </button>
                        <AnimatePresence>
                          {actionMenu === s.sessionId && (
                            <motion.div
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -4 }}
                              className="absolute right-0 top-8 rounded-xl shadow-xl z-10 min-w-[140px] overflow-hidden"
                              style={{ background: 'rgba(10,25,47,0.95)', border: '1px solid rgba(255,0,60,0.2)', backdropFilter: 'blur(16px)' }}
                            >
                              <button
                                onPointerDown={() => { setActionMenu(null) }}
                                className="w-full text-left px-4 py-2.5 text-sm transition-all"
                                style={{ color: 'rgba(255,255,255,0.6)' }}
                              >
                                View Details
                              </button>
                              <button
                                onPointerDown={() => { navigator.clipboard?.writeText(s.sessionId); setActionMenu(null) }}
                                className="w-full text-left px-4 py-2.5 text-sm transition-all"
                                style={{ color: 'rgba(255,255,255,0.6)', borderTop: '1px solid rgba(255,255,255,0.05)' }}
                              >
                                Copy ID
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {sessions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    No sessions recorded yet. Complete a game to see entries here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* bottom row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl p-6" style={cardStyle}>
            <h3 className="font-semibold text-white mb-1">Diagnostic Tools</h3>
            <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Run maintenance routines or reset the current kiosk state.
            </p>
            <div className="flex gap-3">
              <button
                onPointerDown={() => window.location.reload()}
                className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}
              >
                Refresh Device
              </button>
              <button
                onPointerDown={handleForceSync}
                disabled={syncing}
                className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 disabled:opacity-50"
                style={{ background: 'rgba(255,0,60,0.12)', border: '1px solid rgba(255,0,60,0.25)', color: '#FF003C' }}
              >
                {syncing ? 'Syncing…' : 'Force Sync'}
              </button>
            </div>
          </div>

          <div
            className="rounded-2xl p-6"
            style={{
              background: 'linear-gradient(135deg, rgba(255,0,60,0.08) 0%, rgba(10,25,47,0.7) 100%)',
              border: '1px solid rgba(255,0,60,0.25)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <div className="text-2xl mb-2" style={{ color: '#FF003C' }}>⚠</div>
            <h3 className="font-semibold text-white mb-1">Hard Reset</h3>
            <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.35)' }}>Clears all local cache and restarts the application.</p>
            <button
              onPointerDown={handleHardReset}
              className="w-full py-3 rounded-xl text-sm font-bold transition-all active:scale-95"
              style={
                hardResetPhase === 1
                  ? { background: '#FF003C', color: 'white', boxShadow: '0 0 20px rgba(255,0,60,0.4)', animation: 'pulse 1s infinite' }
                  : hardResetPhase === 2
                  ? { background: 'rgba(16,185,129,0.8)', color: 'white' }
                  : { background: '#FF003C', color: 'white', boxShadow: '0 0 16px rgba(255,0,60,0.3)' }
              }
            >
              {hardResetPhase === 0 && 'FORCE REBOOT'}
              {hardResetPhase === 1 && 'CONFIRM — WIPE EVERYTHING?'}
              {hardResetPhase === 2 && 'Clearing… Reloading'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // ── analytics view ────────────────────────────────────────────────────────────

  const analyticsView = (
    <div className="flex-1 overflow-y-auto">
      {/* header bar */}
      <div
        className="flex items-center justify-between px-8 py-5 sticky top-0 z-10"
        style={{ borderBottom: '1px solid rgba(255,0,60,0.1)', background: 'rgba(2,11,24,0.85)', backdropFilter: 'blur(12px)' }}
      >
        <div>
          <h1 className="text-xl font-bold text-white">Analytics</h1>
          <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Engagement metrics and survey response data.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onPointerDown={loadData}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
          >
            ↺ Refresh
          </button>
          <button
            onPointerDown={generateReport}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-white text-sm font-semibold transition-all active:scale-95"
            style={{ background: '#FF003C', boxShadow: '0 0 16px rgba(255,0,60,0.3)' }}
          >
            ↓ Generate Report
          </button>
        </div>
      </div>

      <div className="px-8 py-6 space-y-6">
        {/* engagement cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl p-5" style={cardStyle}>
            <p className="text-[11px] uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>Game Breakdown</p>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>Trust 2030</span>
                  <span className="font-medium" style={{ color: '#FF003C' }}>{trust2030Count}</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: totalPlays ? `${(trust2030Count / totalPlays) * 100}%` : '0%', background: '#FF003C' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>Lost in Context</span>
                  <span className="font-medium text-violet-400">{licCount}</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="h-full bg-violet-500 rounded-full transition-all duration-700" style={{ width: totalPlays ? `${(licCount / totalPlays) * 100}%` : '0%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-5" style={cardStyle}>
            <p className="text-[11px] uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>Lead Conversion</p>
            <div className="flex items-center justify-center py-2">
              <div className="relative w-28 h-28">
                <svg viewBox="0 0 36 36" className="w-28 h-28 -rotate-90">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,0,60,0.1)" strokeWidth="4" />
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray={`${completionRate * 87.96 / 100} 87.96`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-white">{completionRate}%</span>
                  <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>captured</span>
                </div>
              </div>
            </div>
            <p className="text-center text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{leadsCount} of {totalPlays} players left email</p>
          </div>

          <div className="rounded-2xl p-5" style={cardStyle}>
            <p className="text-[11px] uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>Sync Status</p>
            <div className="space-y-3 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>Pending sync</span>
                <span className={`text-sm font-semibold ${syncPending > 0 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                  {syncPending === 0 ? '✓ All synced' : `${syncPending} items`}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>Last sync</span>
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>{lastSync ? timeAgo(lastSync) : 'Never'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>Lead capture</span>
                <span className={`text-sm font-semibold ${leadCaptureEnabled ? 'text-emerald-400' : 'text-white/30'}`}>
                  {leadCaptureEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <button
                onPointerDown={() => setLeadCaptureEnabled(!leadCaptureEnabled)}
                className="w-full mt-2 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
                style={leadCaptureEnabled ? {
                  background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: 'rgb(52,211,153)',
                } : {
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)',
                }}
              >
                Lead Capture: {leadCaptureEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>

        {/* 7-day sessions bar chart */}
        <div className="rounded-2xl p-6" style={cardStyle}>
          <p className="text-[11px] uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>Sessions — Last 7 Days</p>
          {(() => {
            const days = []
            for (let i = 6; i >= 0; i--) {
              const start = new Date(); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - i)
              const end = new Date(start); end.setDate(end.getDate() + 1)
              const count = sessions.filter(s => s.timestamp >= start.getTime() && s.timestamp < end.getTime()).length
              days.push({ label: start.toLocaleDateString('en', { weekday: 'short' }), count })
            }
            const max = Math.max(...days.map(d => d.count), 1)
            return (
              <div className="flex items-end gap-2 h-24">
                {days.map(d => (
                  <div key={d.label} className="flex-1 flex flex-col items-center gap-1.5">
                    <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{d.count > 0 ? d.count : ''}</span>
                    <div className="w-full rounded-t-md transition-all duration-700" style={{ height: `${(d.count / max) * 64}px`, minHeight: d.count > 0 ? '4px' : '0', background: 'rgba(255,0,60,0.7)' }} />
                    <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.25)' }}>{d.label}</span>
                  </div>
                ))}
              </div>
            )
          })()}
        </div>

        {/* ── Trust 2030 survey results ─────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] uppercase tracking-widest font-medium" style={{ color: 'rgba(255,0,60,0.6)' }}>Trust 2030</p>
              <h2 className="text-base font-semibold text-white">Survey Results</h2>
            </div>
            <span className="text-xs px-3 py-1 rounded-lg" style={{ background: 'rgba(255,0,60,0.1)', color: 'rgba(255,0,60,0.7)', border: '1px solid rgba(255,0,60,0.15)' }}>
              {trust2030Count} plays
            </span>
          </div>

          {trust2030Count === 0 && (
            <div className="rounded-2xl p-8 text-center" style={cardStyle}>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>No Trust 2030 sessions recorded yet.</p>
            </div>
          )}

          {trust2030Count > 0 && (
            <>
              {/* dimension labels */}
              {['AI Adoption', 'Regulatory Stance', 'Threat Landscape', 'Human Oversight'].map(dim => {
                const qs = trust2030Questions.filter(q => q.dimension === dim)
                return (
                  <div key={dim} className="mb-5">
                    <p className="text-[10px] uppercase tracking-widest mb-3 px-1" style={{ color: 'rgba(255,255,255,0.25)' }}>{dim}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {qs.map(q => (
                        <SurveyQuestionCard
                          key={q.id}
                          questionId={q.id}
                          title={q.scenario}
                          options={q.options}
                          correctOption={null}
                          pollAggregates={pollAggregates}
                          cardStyle={cardStyle}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </div>

        {/* ── Lost in Context survey results ───────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] uppercase tracking-widest font-medium" style={{ color: 'rgba(139,92,246,0.7)' }}>Lost in Context</p>
              <h2 className="text-base font-semibold text-white">Answer Distribution</h2>
            </div>
            <span className="text-xs px-3 py-1 rounded-lg" style={{ background: 'rgba(139,92,246,0.1)', color: 'rgba(139,92,246,0.8)', border: '1px solid rgba(139,92,246,0.2)' }}>
              {licCount} plays
            </span>
          </div>

          {licCount === 0 && (
            <div className="rounded-2xl p-8 text-center" style={cardStyle}>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>No Lost in Context sessions recorded yet.</p>
            </div>
          )}

          {licCount > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {licQuestions.map(q => (
                <SurveyQuestionCard
                  key={q.id}
                  questionId={q.id}
                  title={`"${q.term}"`}
                  options={q.options}
                  correctOption={q.correct_human}
                  pollAggregates={pollAggregates}
                  cardStyle={cardStyle}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // ── leads view ────────────────────────────────────────────────────────────────

  const leadsView = (
    <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Leads ({sessions.length})</h1>
        <div className="flex gap-3">
          <div className="flex gap-2">
            <input
              type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="rounded-xl px-3 py-2 text-sm outline-none"
              style={{ background: 'rgba(10,25,47,0.7)', border: '1px solid rgba(255,0,60,0.2)', color: 'rgba(255,255,255,0.7)', userSelect: 'auto' }}
            />
            <input
              type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="rounded-xl px-3 py-2 text-sm outline-none"
              style={{ background: 'rgba(10,25,47,0.7)', border: '1px solid rgba(255,0,60,0.2)', color: 'rgba(255,255,255,0.7)', userSelect: 'auto' }}
            />
          </div>
          <button
            onPointerDown={downloadCSV}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-white text-sm font-semibold transition-all active:scale-95"
            style={{ background: '#FF003C', boxShadow: '0 0 16px rgba(255,0,60,0.3)' }}
          >
            ↓ Export CSV
          </button>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={cardStyle}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,0,60,0.1)' }}>
              {['TIMESTAMP', 'USER ID', 'NAME', 'EMAIL', 'COMPANY', 'GAME', 'STATUS'].map(h => (
                <th key={h} className="text-left text-[10px] uppercase tracking-widest font-medium px-5 py-3" style={{ color: 'rgba(255,255,255,0.25)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sessions.map((s, i) => (
              <tr key={s.sessionId} className="transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td className="px-5 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{new Date(s.timestamp).toLocaleDateString()}</td>
                <td className="px-5 py-3"><span className="font-mono text-xs" style={{ color: '#FF003C' }}>{shortId(s.sessionId, i)}</span></td>
                <td className="px-5 py-3" style={{ color: 'rgba(255,255,255,0.65)' }}>{s.playerInfo?.name || '—'}</td>
                <td className="px-5 py-3" style={{ color: 'rgba(255,255,255,0.55)' }}>{s.playerInfo?.email || '—'}</td>
                <td className="px-5 py-3" style={{ color: 'rgba(255,255,255,0.45)' }}>{s.playerInfo?.company || '—'}</td>
                <td className="px-5 py-3" style={{ color: 'rgba(255,255,255,0.45)' }}>{sessionResult(s)}</td>
                <td className="px-5 py-3"><StatusBadge status={sessionStatus(s)} /></td>
              </tr>
            ))}
            {sessions.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-12 text-center text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>No sessions recorded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )

  // ── logs view ─────────────────────────────────────────────────────────────────

  const logsView = (
    <div className="flex-1 overflow-y-auto px-8 py-6">
      <h1 className="text-xl font-bold text-white mb-5">Kiosk Logs</h1>
      <pre
        className="rounded-2xl p-5 text-xs font-mono overflow-x-auto max-h-[600px] overflow-y-auto whitespace-pre-wrap leading-relaxed"
        style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,0,60,0.15)', color: 'rgb(52,211,153)' }}
      >
        {logs.length === 0
          ? 'No events logged yet.'
          : logs.map(l =>
              `[${new Date(l.timestamp).toISOString()}] ${l.type}${l.sessionId ? ` (${l.sessionId.slice(0, 8)}…)` : ''}${l.reason ? ` — ${l.reason}` : ''}${l.error ? ` ERROR: ${l.error}` : ''}`
            ).join('\n')}
      </pre>
    </div>
  )

  // ── media view ────────────────────────────────────────────────────────────────

  const mediaView = (
    <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
      <h1 className="text-xl font-bold text-white">Media</h1>
      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>Upload images or videos to override attract screen scenes. Stored locally on this device via IndexedDB.</p>
      <label className="block cursor-pointer">
        <div
          className="w-full py-16 rounded-2xl text-center transition-all"
          style={{ border: '2px dashed rgba(255,0,60,0.2)' }}
        >
          <p className="text-4xl mb-3">📁</p>
          <p className="font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>Tap to select image or video</p>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>Stored in IndexedDB on this device</p>
        </div>
        <input type="file" accept="image/*,video/*" onChange={handleMediaUpload} className="hidden" style={{ userSelect: 'auto' }} />
      </label>
    </div>
  )

  // ── render ────────────────────────────────────────────────────────────────────

  return (
    <motion.div
      className="w-full h-full flex text-white overflow-hidden relative"
      style={{ background: '#020B18' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onPointerDown={() => setActionMenu(null)}
    >
      {/* Background decor */}
      <div className="absolute inset-0 data-grid opacity-20 pointer-events-none" />
      <div className="absolute -top-[20%] -left-[10%] w-1/2 h-1/2 rounded-full pointer-events-none" style={{ background: 'rgba(255,0,60,0.07)', filter: 'blur(140px)' }} />
      <div className="absolute -bottom-[10%] -right-[5%] w-[40%] h-[40%] rounded-full pointer-events-none" style={{ background: 'rgba(255,0,60,0.04)', filter: 'blur(120px)' }} />
      <div className="scan-line" />

      <div className="relative z-10 flex w-full h-full">
        {sidebar}
        <div className="flex-1 flex flex-col overflow-hidden">
          {nav === 'dashboard' && dashboardView}
          {nav === 'analytics' && analyticsView}
          {nav === 'leads' && leadsView}
          {nav === 'logs' && logsView}
          {nav === 'media' && mediaView}
        </div>
      </div>
    </motion.div>
  )
}
