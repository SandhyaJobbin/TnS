import { createClient } from '@supabase/supabase-js'
import { getSyncQueue, removeSyncQueueItem, addLog, getAllSessions, writeSession } from '../hooks/useIndexedDB'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

function getClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('[Supabase] Missing credentials — VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not set')
    return null
  }
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}

export async function syncToSheets(record) {
  const supabase = getClient()
  if (!supabase) {
    await addLog({ type: 'sync_skipped', reason: 'No Supabase credentials configured' })
    return false
  }

  try {
    const pi = record.playerInfo || {}
    const answers = record.answers || {}
    const questionIds = record.questionIds || []

    // Compute summary stats
    let avgScore = null
    let correctCount = null
    if (record.game_played === 'trust2030') {
      const vals = Object.values(answers).map(a => Number(a.value) || 0).filter(Boolean)
      if (vals.length) avgScore = Math.round(vals.reduce((s, v) => s + v, 0) / vals.length)
    }
    if (record.game_played === 'lostInContext') {
      correctCount = Object.values(answers).filter(a => a.correct === true).length
    }

    // Insert session row
    const { error: sessionError } = await supabase.from('sessions').insert({
      session_id:    record.sessionId,
      timestamp:     record.timestamp ? new Date(record.timestamp).toISOString() : new Date().toISOString(),
      game_played:   record.game_played || null,
      name:          pi.name    || null,
      company:       pi.company || null,
      role:          pi.role    || null,
      email:         pi.email   || null,
      consent:       pi.consent ?? null,
      answer_count:  questionIds.length,
      avg_score:     avgScore,
      correct_count: correctCount,
    })

    if (sessionError) {
      console.error('[Supabase] sessions insert error:', sessionError)
      throw new Error(sessionError.message)
    }

    // Insert answer rows
    if (questionIds.length > 0) {
      const answerRows = questionIds.map((qId, idx) => {
        const ans = answers[qId] || answers[String(idx)] || {}
        return {
          session_id:    record.sessionId,
          timestamp:     record.timestamp ? new Date(record.timestamp).toISOString() : new Date().toISOString(),
          game_played:   record.game_played || null,
          question_id:   qId,
          question_num:  idx + 1,
          selected:      ans.selected ?? ans.answer ?? null,
          value:         ans.value    != null ? ans.value       : null,
          correct:       ans.correct  != null ? ans.correct     : null,
          dimension:     ans.dimension  || null,
          time_taken_ms: ans.timeTakenMs || null,
        }
      })

      const { error: answersError } = await supabase.from('answers').insert(answerRows)
      if (answersError) {
        console.error('[Supabase] answers insert error:', answersError)
        throw new Error(answersError.message)
      }
    }

    console.log('[Supabase] sync_success', record.sessionId)
    await addLog({ type: 'sync_success', sessionId: record.sessionId })
    return true
  } catch (err) {
    console.error('[Supabase] sync_error:', err.message, 'session:', record.sessionId)
    await addLog({ type: 'sync_error', error: err.message, sessionId: record.sessionId })
    return false
  }
}

// Fetch all sessions from Supabase and return them in local format.
// Returns null if offline or credentials missing.
export async function fetchSessionsFromSupabase() {
  const supabase = getClient()
  if (!supabase) return null
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('timestamp', { ascending: false })
    if (error) throw error
    return data.map(row => ({
      sessionId: row.session_id,
      timestamp: new Date(row.timestamp).getTime(),
      game_played: row.game_played,
      playerInfo: {
        name: row.name || '',
        company: row.company || '',
        role: row.role || '',
        email: row.email || '',
        consent: row.consent ?? false,
      },
      answers: {},
      questionIds: [],
    }))
  } catch (err) {
    console.error('[Supabase] fetchSessions error:', err.message)
    return null
  }
}

// Pull all Supabase sessions into IndexedDB (upsert — Supabase wins on conflict).
// Then push any local-only sessions up.
export async function pullFromSupabase() {
  const sessions = await fetchSessionsFromSupabase()
  if (!sessions) return { pulled: 0, error: true }
  for (const session of sessions) {
    await writeSession(session)
  }
  await addLog({ type: 'pull_sync', count: sessions.length })
  return { pulled: sessions.length, error: false }
}

export async function processSyncQueue() {
  const queue = await getSyncQueue()
  for (const item of queue) {
    const success = await syncToSheets(item)
    if (success) {
      await removeSyncQueueItem(item.id)
    }
  }
}

export async function forceFullSync(onProgress) {
  const supabase = getClient()
  if (!supabase) {
    await addLog({ type: 'sync_skipped', reason: 'No Supabase credentials configured' })
    return { total: 0, synced: 0, failed: 0, errors: [] }
  }

  const sessions = await getAllSessions()
  const total = sessions.length
  let synced = 0
  let failed = 0
  const errors = []

  for (let i = 0; i < sessions.length; i++) {
    const record = sessions[i]
    try {
      const pi = record.playerInfo || {}
      const answers = record.answers || {}
      const questionIds = record.questionIds || []

      let avgScore = null
      let correctCount = null
      if (record.game_played === 'trust2030') {
        const vals = Object.values(answers).map(a => Number(a.value) || 0).filter(Boolean)
        if (vals.length) avgScore = Math.round(vals.reduce((s, v) => s + v, 0) / vals.length)
      }
      if (record.game_played === 'lostInContext') {
        correctCount = Object.values(answers).filter(a => a.correct === true).length
      }

      const { error: sessionError } = await supabase.from('sessions').insert({
        session_id:    record.sessionId,
        timestamp:     record.timestamp ? new Date(record.timestamp).toISOString() : new Date().toISOString(),
        game_played:   record.game_played || null,
        name:          pi.name    || null,
        company:       pi.company || null,
        role:          pi.role    || null,
        email:         pi.email   || null,
        consent:       pi.consent ?? null,
        answer_count:  questionIds.length,
        avg_score:     avgScore,
        correct_count: correctCount,
      })

      // 23505 = unique_violation — session already exists in Supabase, treat as synced
      if (sessionError && sessionError.code !== '23505') throw new Error(sessionError.message)

      if (questionIds.length > 0) {
        const answerRows = questionIds.map((qId, idx) => {
          const ans = answers[qId] || answers[String(idx)] || {}
          return {
            session_id:    record.sessionId,
            timestamp:     record.timestamp ? new Date(record.timestamp).toISOString() : new Date().toISOString(),
            game_played:   record.game_played || null,
            question_id:   qId,
            question_num:  idx + 1,
            selected:      ans.selected ?? ans.answer ?? null,
            value:         ans.value    != null ? ans.value       : null,
            correct:       ans.correct  != null ? ans.correct     : null,
            dimension:     ans.dimension  || null,
            time_taken_ms: ans.timeTakenMs || null,
          }
        })

        const { error: answersError } = await supabase.from('answers').insert(answerRows)
        // 23505 on answers is fine too — rows already exist
        if (answersError && answersError.code !== '23505') throw new Error(answersError.message)
      }

      synced++
    } catch (err) {
      failed++
      errors.push({ sessionId: record.sessionId, error: err.message })
      console.error('[Supabase] forceFullSync error:', err.message, 'session:', record.sessionId)
    }

    if (onProgress) onProgress({ current: i + 1, total, synced, failed })
  }

  await addLog({ type: 'force_full_sync', total, synced, failed })
  return { total, synced, failed, errors }
}
