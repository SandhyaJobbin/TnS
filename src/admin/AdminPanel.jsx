import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSession } from '../hooks/useSession'

import {
  getAllSessions,
  getSyncQueue,
  getLogs,
  clearAllSessions,
  clearAllPollAggregates,
  clearSyncQueue,
  storeMediaBlob,
} from '../hooks/useIndexedDB'
import { processSyncQueue } from '../utils/api'

export default function AdminPanel() {
  const { exitAdmin, leadCaptureEnabled, setLeadCaptureEnabled } = useSession()
  const [tab, setTab] = useState('stats')
  const [stats, setStats] = useState({ total: 0, trust2030: 0, lostInContext: 0, syncPending: 0 })
  const [sessions, setSessions] = useState([])
  const [logs, setLogs] = useState([])
  const [resetPhase, setResetPhase] = useState(0) // 0=idle, 1=confirm, 2=done
  const [syncing, setSyncing] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const allSessions = await getAllSessions()
    const queue = await getSyncQueue()
    const allLogs = await getLogs()
    setSessions(allSessions)
    setLogs(allLogs.reverse())
    setStats({
      total: allSessions.length,
      trust2030: allSessions.filter(s => s.game_played === 'trust2030').length,
      lostInContext: allSessions.filter(s => s.game_played === 'lostInContext').length,
      syncPending: queue.length,
    })
  }

  async function handleForceSync() {
    setSyncing(true)
    await processSyncQueue()
    await loadData()
    setSyncing(false)
  }

  async function handleResetPoll() {
    if (resetPhase === 0) { setResetPhase(1); return }
    await clearAllSessions()
    await clearAllPollAggregates()
    await clearSyncQueue()
    setResetPhase(2)
    await loadData()
    setTimeout(() => setResetPhase(0), 3000)
  }

  function downloadCSV() {
    let filtered = sessions
    if (dateFrom) filtered = filtered.filter(s => s.timestamp >= new Date(dateFrom).getTime())
    if (dateTo) filtered = filtered.filter(s => s.timestamp <= new Date(dateTo).getTime() + 86400000)

    if (filtered.length === 0) { alert('No sessions match the selected date range.'); return }

    const headers = ['sessionId', 'timestamp', 'game_played', 'name', 'company', 'role', 'email', 'consent', 'answers']
    const rows = filtered.map(s => [
      s.sessionId,
      new Date(s.timestamp).toISOString(),
      s.game_played,
      s.playerInfo?.name || '',
      s.playerInfo?.company || '',
      s.playerInfo?.role || '',
      s.playerInfo?.email || '',
      s.playerInfo?.consent ? 'yes' : 'no',
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
    alert(`Media "${file.name}" stored successfully.`)
  }

  const TABS = [
    { id: 'stats', label: 'Stats' },
    { id: 'data', label: 'Data' },
    { id: 'media', label: 'Media' },
    { id: 'logs', label: 'Logs' },
  ]

  return (
    <motion.div
      className="w-full h-full flex flex-col bg-[#060618] text-white overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-white/10 bg-[#090930]">
        <div>
          <h1 className="text-lg font-bold">Admin Panel</h1>
          <p className="text-white/40 text-xs">Trust &amp; Safety Kiosk</p>
        </div>
        <button
          onPointerDown={exitAdmin}
          className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-5 py-2 text-sm text-white/70 active:bg-white/15"
        >
          Exit Admin
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 px-8">
        {TABS.map(t => (
          <button
            key={t.id}
            onPointerDown={() => setTab(t.id)}
            className={`px-5 py-3 text-sm font-medium transition ${
              tab === t.id ? 'text-primary-400 border-b-2 border-primary-500' : 'text-white/40 hover:text-white/70'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">

        {tab === 'stats' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Total plays', value: stats.total, color: 'text-primary-300' },
                { label: 'Trust 2030', value: stats.trust2030, color: 'text-primary-300' },
                { label: 'Lost in Context', value: stats.lostInContext, color: 'text-cyan-300' },
                { label: 'Sync pending', value: stats.syncPending, color: stats.syncPending > 0 ? 'text-yellow-400' : 'text-green-400' },
              ].map(item => (
                <div key={item.label} className="bg-white/5 rounded-2xl p-5 border border-white/10">
                  <p className="text-white/50 text-xs mb-1">{item.label}</p>
                  <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onPointerDown={handleForceSync}
                disabled={syncing}
                className="flex-1 py-3 rounded-xl bg-primary-600/20 border border-primary-500/30 text-primary-300 text-sm font-medium hover:bg-primary-600/30 active:bg-primary-600/40 disabled:opacity-50"
              >
                {syncing ? 'Syncing...' : 'Force Sync to Sheets'}
              </button>
              <button
                onPointerDown={loadData}
                className="px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm hover:bg-white/10"
              >
                Refresh
              </button>
            </div>

            {/* Attract Mode + Lead Capture */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onPointerDown={exitAdmin}
                className="py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm font-medium hover:bg-white/10 active:bg-white/15"
              >
                Switch to Attract Mode
              </button>
              <button
                onPointerDown={() => setLeadCaptureEnabled(!leadCaptureEnabled)}
                className={`py-3 rounded-xl border text-sm font-medium transition ${
                  leadCaptureEnabled
                    ? 'bg-green-600/20 border-green-500/30 text-green-300 hover:bg-green-600/30'
                    : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                }`}
              >
                Lead Capture: {leadCaptureEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Reset Poll */}
            <div className="bg-red-900/20 rounded-2xl p-5 border border-red-500/20">
              <h3 className="text-red-400 font-semibold mb-2">Reset All Poll Data</h3>
              {resetPhase === 0 && (
                <p className="text-white/50 text-sm mb-4">This will permanently delete all local session data and reset poll charts. This cannot be undone.</p>
              )}
              {resetPhase === 1 && (
                <p className="text-yellow-400 text-sm mb-4 font-medium">⚠️ Are you absolutely sure? This deletes ALL data permanently and cannot be undone.</p>
              )}
              {resetPhase === 2 && (
                <p className="text-green-400 text-sm mb-4">✓ All data cleared successfully.</p>
              )}
              {resetPhase < 2 && (
                <button
                  onPointerDown={handleResetPoll}
                  className={`py-3 px-6 rounded-xl text-sm font-bold ${
                    resetPhase === 1
                      ? 'bg-red-600 text-white active:bg-red-700'
                      : 'bg-red-900/40 border border-red-500/30 text-red-400 hover:bg-red-900/60'
                  }`}
                >
                  {resetPhase === 0 ? 'Reset Poll Data' : 'Confirm — Delete Everything'}
                </button>
              )}
            </div>
          </div>
        )}

        {tab === 'data' && (
          <div className="space-y-6">
            <h2 className="text-white font-semibold">Download Leads CSV</h2>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-white/50 text-xs mb-1 block">From date</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary-500"
                  style={{ userSelect: 'auto' }}
                />
              </div>
              <div className="flex-1">
                <label className="text-white/50 text-xs mb-1 block">To date</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary-500"
                  style={{ userSelect: 'auto' }}
                />
              </div>
            </div>

            <button
              onPointerDown={downloadCSV}
              className="w-full py-4 rounded-xl bg-green-600/20 border border-green-500/30 text-green-300 font-semibold hover:bg-green-600/30"
            >
              ↓ Download CSV ({sessions.length} sessions)
            </button>

            {/* Sessions list */}
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {sessions.slice().reverse().map(s => (
                <div key={s.sessionId} className="bg-white/5 rounded-xl px-4 py-3 border border-white/5 text-sm">
                  <div className="flex justify-between text-white/60">
                    <span>{s.game_played === 'trust2030' ? 'Trust 2030' : 'Lost in Context'}</span>
                    <span>{new Date(s.timestamp).toLocaleDateString()}</span>
                  </div>
                  <div className="text-white/40 text-xs mt-1">
                    {s.playerInfo?.name || 'Anonymous'} · {s.playerInfo?.role || 'No role'}
                    {s.playerInfo?.email ? ` · ${s.playerInfo.email}` : ''}
                  </div>
                </div>
              ))}
              {sessions.length === 0 && (
                <p className="text-white/30 text-sm text-center py-8">No sessions recorded yet</p>
              )}
            </div>
          </div>
        )}

        {tab === 'media' && (
          <div className="space-y-6">
            <h2 className="text-white font-semibold">Upload Media</h2>
            <p className="text-white/50 text-sm">Upload images or videos to override attract screen scenes. Files are stored locally on this device.</p>
            <label className="block">
              <div className="w-full py-12 rounded-2xl border-2 border-dashed border-white/20 text-center cursor-pointer hover:border-primary-500/50 transition">
                <p className="text-4xl mb-3">📁</p>
                <p className="text-white/60 font-medium">Tap to select image or video</p>
                <p className="text-white/30 text-sm mt-1">Stored in IndexedDB on this device</p>
              </div>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={handleMediaUpload}
                className="hidden"
                style={{ userSelect: 'auto' }}
              />
            </label>
          </div>
        )}

        {tab === 'logs' && (
          <div>
            <h2 className="text-white font-semibold mb-4">Event Log (last 100)</h2>
            <pre className="bg-black/40 rounded-xl p-4 text-xs text-green-400 font-mono overflow-x-auto max-h-[500px] overflow-y-auto whitespace-pre-wrap">
              {logs.length === 0
                ? 'No events logged yet.'
                : logs.map(l => `[${new Date(l.timestamp).toISOString()}] ${l.type}${l.sessionId ? ` (${l.sessionId.slice(0, 8)}...)` : ''}${l.reason ? ` — ${l.reason}` : ''}${l.error ? ` ERROR: ${l.error}` : ''}`).join('\n')}
            </pre>
          </div>
        )}
      </div>
    </motion.div>
  )
}
